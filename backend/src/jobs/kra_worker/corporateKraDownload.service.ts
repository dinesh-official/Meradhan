/**
 * Stand-alone "download" service for the corporate KRA flow.
 *
 * The full worker (`CorporateKraWorkerService`) does the enquiry → register →
 * download → modify → CBRICS loop. This service exposes just the *download*
 * step so the CRM "KRA preview" page can trigger an ad-hoc fetch, persist the
 * response in `kraDataLogs`, and surface the latest snapshot to operators.
 *
 * It is intentionally side-effect-light:
 *   - Does not mutate `customerProfileDataModel.kraStatus`.
 *   - Does not enqueue any BullMQ job.
 *   - Writes a `kraDataLogs` row with `stage = "CORPORATE_MANUAL_DOWNLOAD"`.
 */

import { db } from "@core/database/database";
import { env } from "@packages/config/env";
import { KraSDK, type T_NON_INDIVIDUAL_PAN_DOWNLOAD } from "kyc-providers";
import { isAxiosError, type AxiosError } from "axios";
import { AppError, HttpStatus } from "@utils/error/AppError";
import {
  decodeKycStatus,
  decodeRejectionReason,
  NDML_COMP_STATUS,
} from "./kraCodes";

const MANUAL_DOWNLOAD_STAGE = "CORPORATE_MANUAL_DOWNLOAD" as const;
const MANUAL_DOWNLOAD_FAIL_STAGE = "CORPORATE_MANUAL_DOWNLOAD_FAILED" as const;
const AUTOFILL_DOWNLOAD_STAGE = "CORPORATE_AUTOFILL_DOWNLOAD" as const;
const AUTOFILL_DOWNLOAD_FAIL_STAGE = "CORPORATE_AUTOFILL_DOWNLOAD_FAILED" as const;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** NDML's "panDownloadDetailsComplete" expects the DOI as `DDMMYYYY` with no separators. */
function formatDdmmyyyy(date: Date): string {
  return `${pad2(date.getDate())}${pad2(date.getMonth() + 1)}${date.getFullYear()}`;
}

/**
 * Accepts a flexible date string (ISO `YYYY-MM-DD`, NDML `DD-MM-YYYY`, etc.)
 * and returns a `Date` at midnight local time. Returns `null` for blank /
 * un-parseable input.
 */
function parseFlexibleDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const s = value.trim();
  if (!s) return null;
  // DD-MM-YYYY or DD/MM/YYYY
  const dmy = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dmy) {
    const [, dd, mm, yyyy] = dmy;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Convert NDML's `DD-MM-YYYY` (or `DD-MM-YYYY HH:MM:SS`) into ISO `YYYY-MM-DD` for form inputs. */
function ndmlDateToIso(value: string | null | undefined): string {
  if (!value) return "";
  const s = String(value).trim();
  if (!s) return "";
  const dmy = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return "";
}

export interface ManualDownloadResult {
  /** New `kraDataLogs.id` for the row that was inserted. */
  logId: number;
  /** Parsed NDML response. */
  download: T_NON_INDIVIDUAL_PAN_DOWNLOAD;
  /** Convenience copy of the time the row was persisted (ISO). */
  storedAt: string;
  /** Headline NDML fields decoded for the UI. */
  summary: ManualDownloadSummary;
}

export interface ManualDownloadSummary {
  pan: string | null;
  entityName: string | null;
  status: { code: string | null; label?: string };
  errorDesc: { code: string | null; label?: string };
  downloadDate: string | null;
  kraInfo: string | null;
  fatcaApplicable: string | null;
  registeredAddress: string | null;
  correspondenceAddress: string | null;
  doi: string | null;
  commencement: string | null;
  compStatus: string | null;
  registrationNo: string | null;
  ipvFlag: string | null;
  ipvDate: string | null;
  additionalRecords: number;
  fatcaRecords: number;
}

/**
 * Reduce the bulky NDML response into the handful of fields the CRM card
 * needs to render. Pure function — easy to test, easy to evolve.
 */
export function summariseCorporateKraDownload(
  download: T_NON_INDIVIDUAL_PAN_DOWNLOAD,
): ManualDownloadSummary {
  const inq = download?.APP_RES_ROOT?.APP_PAN_INQ;
  const summ = download?.APP_RES_ROOT?.APP_SUMM_REC as
    | undefined
    | {
        APP_ADDLDATA_RECORDS?: string | number;
        NO_OF_FATCA_ADDL_DTLS_RECORDS?: string | number;
      };

  const join = (...parts: Array<string | undefined | null>) =>
    parts.filter((s) => typeof s === "string" && s.trim().length > 0).join(", ") || null;

  const statusCode = (inq?.APP_STATUS ?? "").trim() || null;
  const errCode = (inq?.APP_ERROR_DESC ?? "").trim() || null;

  return {
    pan: inq?.APP_PAN_NO?.trim() || null,
    entityName: inq?.APP_NAME?.trim() || null,
    status: { code: statusCode, label: decodeKycStatus(statusCode) },
    errorDesc: { code: errCode, label: decodeRejectionReason(errCode) },
    downloadDate: inq?.APP_DNLDDT?.trim() || null,
    kraInfo: inq?.APP_KRA_INFO?.trim() || null,
    fatcaApplicable: inq?.APP_FATCA_APPLICABLE_FLAG?.trim() || null,
    registeredAddress: join(
      inq?.APP_PER_ADD1,
      inq?.APP_PER_ADD2,
      inq?.APP_PER_ADD3,
      inq?.APP_PER_CITY,
      inq?.APP_PER_PINCD,
    ),
    correspondenceAddress: join(
      inq?.APP_COR_ADD1,
      inq?.APP_COR_ADD2,
      inq?.APP_COR_ADD3,
      inq?.APP_COR_CITY,
      inq?.APP_COR_PINCD,
    ),
    doi: inq?.APP_DOI_DT?.trim() || null,
    commencement: inq?.APP_COMMENCE_DT?.trim() || null,
    compStatus: inq?.APP_COMP_STATUS?.trim() || null,
    registrationNo: inq?.APP_REGNO?.trim() || null,
    ipvFlag: inq?.APP_IPV_FLAG?.trim() || null,
    ipvDate: inq?.APP_IPV_DATE?.trim() || null,
    additionalRecords: Number(summ?.APP_ADDLDATA_RECORDS ?? 0) || 0,
    fatcaRecords: Number(summ?.NO_OF_FATCA_ADDL_DTLS_RECORDS ?? 0) || 0,
  };
}

/**
 * Reverse-lookup an NDML state code (zero-padded or unpadded) to the
 * canonical state name the CRM frontend stores. Returns "" when unknown.
 *
 * NOTE on Telangana — NDML's master list (and live KRA download responses)
 * uses code `37` for Telangana since the state was created post-split in
 * 2014. The repo's `kraState` master in `constent.ts` historically keeps
 * Telangana at code `36`, so we accept *both* codes here to stay robust.
 */
function stateCodeToName(code: string | null | undefined): string {
  if (!code) return "";
  const n = Number(String(code).trim());
  if (!Number.isFinite(n)) return "";
  const table: Record<number, string> = {
    1: "Andaman & Nicobar Islands",
    2: "Andhra Pradesh",
    3: "Arunachal Pradesh",
    4: "Assam",
    5: "Bihar",
    6: "Chandigarh",
    7: "Dadra & Nagar Haveli",
    8: "Daman & Diu",
    9: "Delhi",
    10: "Goa",
    11: "Gujarat",
    12: "Haryana",
    13: "Himachal Pradesh",
    14: "Jammu & Kashmir",
    15: "Karnataka",
    16: "Kerala",
    17: "Lakshadweep",
    18: "Madhya Pradesh",
    19: "Maharashtra",
    20: "Manipur",
    21: "Meghalaya",
    22: "Mizoram",
    23: "Nagaland",
    24: "Odisha",
    25: "Puducherry",
    26: "Punjab",
    27: "Rajasthan",
    28: "Sikkim",
    29: "Tamil Nadu",
    30: "Tripura",
    31: "Uttar Pradesh",
    32: "West Bengal",
    33: "Chhattisgarh",
    34: "Uttarakhand",
    35: "Jharkhand",
    36: "Telangana",
    37: "Telangana",
  };
  return table[n] ?? "";
}

/** Reverse-lookup an NDML country code → human-readable country name. */
function countryCodeToName(code: string | null | undefined): string {
  if (!code) return "";
  const s = String(code).trim().replace(/^0+/, "");
  if (!s) return "";
  // Most corporates are India (code "101"). Keep the table tiny — the common
  // path; anything else falls through to "" so the operator can fill it
  // explicitly.
  const table: Record<string, string> = {
    "101": "India",
    "1": "Afghanistan",
    "102": "Indonesia",
    "239": "United States",
    "238": "United Kingdom",
  };
  return table[s] ?? "";
}

/**
 * Maps the NDML download's `APP_COMP_STATUS` code to the CRM form's
 * entityConstitutionType enum value (PRIVATE_LIMITED, LLP, TRUST, …).
 * Returns `undefined` when there's no clean mapping.
 */
function compStatusCodeToEnum(code: string | null | undefined):
  | "PRIVATE_LIMITED"
  | "PUBLIC_LIMITED"
  | "OPC"
  | "LLP"
  | "PARTNERSHIP"
  | "TRUST"
  | "OTHER"
  | undefined {
  if (!code) return undefined;
  const c = String(code).trim();
  const entry = NDML_COMP_STATUS.find((e) => e.code === c);
  if (!entry) return undefined;
  // Map NDML company-status codes → the corporate-KYC enum values used by
  // the frontend `EntityDetailsSection` dropdown.
  switch (entry.code) {
    case "01":
      return "PRIVATE_LIMITED";
    case "02":
      return "PUBLIC_LIMITED";
    case "04":
      return "PARTNERSHIP";
    case "05":
      return "TRUST";
    case "16":
      return "LLP";
    default:
      return "OTHER";
  }
}

/**
 * Patch shape returned by the autofill action — every field is optional so
 * the frontend can spread it into the open form via `setField` without
 * clobbering data the operator entered locally.
 */
export interface CorporateKycAutofillFormPatch {
  entityName?: string;
  panNumber?: string;
  cinOrRegistrationNumber?: string;
  dateOfIncorporation?: string;
  dateOfCommencementOfBusiness?: string;
  placeOfIncorporation?: string;
  countryOfIncorporation?: string;
  entityConstitutionType?:
    | "PRIVATE_LIMITED"
    | "PUBLIC_LIMITED"
    | "OPC"
    | "LLP"
    | "PARTNERSHIP"
    | "TRUST"
    | "OTHER";
  annualIncome?: string;

  correspondenceLine1?: string;
  correspondenceLine2?: string;
  correspondenceLine3?: string;
  correspondenceCity?: string;
  correspondencePinCode?: string;
  correspondenceState?: string;
  correspondenceAddressProofType?: string;

  registeredLine1?: string;
  registeredLine2?: string;
  registeredLine3?: string;
  registeredCity?: string;
  registeredPinCode?: string;
  registeredState?: string;
  registeredAddressProofType?: string;

  fatcaApplicable?: boolean;

  directors?: Array<{
    fullName: string;
    pan: string;
    din?: string;
    designation?: string;
  }>;
  partners?: Array<{
    fullName: string;
    pan: string;
    din?: string;
    designation?: string;
  }>;
  trustees?: Array<{
    fullName: string;
    pan: string;
    din?: string;
    designation?: string;
  }>;
  authorisedSignatories?: Array<{
    fullName: string;
    pan: string;
    din?: string;
    designation?: string;
  }>;
}

/**
 * Translates an NDML Non-Individual download payload into the form-patch
 * shape the CRM corporate-KYC form expects. Only fills fields where NDML
 * supplied a meaningful value — empty NDML fields stay `undefined` so the
 * frontend's merge leaves any operator-typed data untouched.
 */
export function downloadToCorporateKycFormPatch(
  download: T_NON_INDIVIDUAL_PAN_DOWNLOAD,
): CorporateKycAutofillFormPatch {
  const inq = download?.APP_RES_ROOT?.APP_PAN_INQ;
  if (!inq) return {};

  const txt = (v: string | undefined | null): string | undefined => {
    if (v == null) return undefined;
    const t = String(v).trim();
    return t ? t : undefined;
  };

  const date = (v: string | undefined | null): string | undefined => {
    const iso = ndmlDateToIso(v);
    return iso || undefined;
  };

  const stateName = stateCodeToName(inq.APP_COR_STATE);
  const perStateName = stateCodeToName(inq.APP_PER_STATE);
  const countryName = countryCodeToName(inq.APP_COR_CTRY);
  const perCountryName = countryCodeToName(
    (inq as { APP_PER_CTRY?: string }).APP_PER_CTRY,
  );

  // Date of Incorporation is the worst-populated NDML field — CAMSKRA in
  // particular often returns it blank and stuffs the same date into
  // `APP_DOB_DT` (entity DOB) and `APP_COMMENCE_DT` instead. Fall back so
  // the form still gets a value.
  const incorporationDate =
    date(inq.APP_DOI_DT) ?? date(inq.APP_COMMENCE_DT) ?? date(inq.APP_DOB_DT);

  // APP_ADDL_DATA is documented as an array but NDML often emits a single
  // object when only one related person exists. Normalise to an array.
  type AddlRow = NonNullable<NonNullable<typeof inq.APP_ADDL_DATA>[number]>;
  const rawAddl = inq.APP_ADDL_DATA as AddlRow | AddlRow[] | undefined;
  const addl: AddlRow[] = Array.isArray(rawAddl)
    ? rawAddl
    : rawAddl && typeof rawAddl === "object"
      ? [rawAddl]
      : [];

  // FATCA_ADDL_DTLS carries the per-director FATCA tax records (entity PAN,
  // country of residency, TIN, etc). NDML's response always emits 4
  // placeholder rows in this array irrespective of the real record count —
  // so we **must** use `APP_SUMM_REC.NO_OF_FATCA_ADDL_DTLS_RECORDS` as the
  // gate. When that count is 0, the section is ignored entirely; otherwise
  // we keep only rows with a real PAN populated.
  const summRec = (download?.APP_RES_ROOT?.APP_SUMM_REC ?? {}) as {
    NO_OF_FATCA_ADDL_DTLS_RECORDS?: string | number;
  };
  const fatcaRecordsCount = Number(summRec.NO_OF_FATCA_ADDL_DTLS_RECORDS ?? 0) || 0;
  const fatcaRowsRaw = Array.isArray(download?.APP_RES_ROOT?.FATCA_ADDL_DTLS)
    ? download.APP_RES_ROOT.FATCA_ADDL_DTLS
    : [];
  const fatcaRows =
    fatcaRecordsCount > 0
      ? fatcaRowsRaw.filter((r) =>
          Boolean(String(r?.APP_FATCA_ENTITY_PAN ?? "").trim()),
        )
      : [];

  /**
   * Convert one APP_ADDL_DATA row into the form's person shape. When
   * `fatcaRows` has a matching PAN, splice in the FATCA tax info (so far
   * just `taxResidencyOfEntity` if we later add per-director FATCA fields
   * to the form — the field is plumbed but unused today).
   */
  const toPerson = (row: AddlRow) => {
    const pan = (txt(row.APP_ADDLDATA_PAN) ?? "").toUpperCase();
    const fatca = pan
      ? fatcaRows.find(
          (r) => String(r?.APP_FATCA_ENTITY_PAN ?? "").trim().toUpperCase() === pan,
        )
      : undefined;
    void fatca; // reserved for future per-director FATCA fields.
    return {
      fullName: txt(row.APP_ADDLDATA_NAME) ?? "",
      pan,
      din: txt(row.APP_ADDLDATA_DIN_UID ?? row.APP_ADDLDATA_DIN) ?? "",
      designation: "",
    };
  };

  // NDML relationship codes:
  //   01 = Promoter, 02 = Whole-time Director, 03 = Karta (HUF),
  //   04 = Trustee, 05 = Authorised Signatory, 06 = Partner (LLP / firm)
  // Authorised signatories, Partners and Trustees get their own buckets; every
  // other governance-related code (promoter, karta, beneficial-owner variants…)
  // maps to the form's "directors" array.
  const relCode = (r: AddlRow) =>
    String(r.APP_ADDLDATA_RELATIONSHIP ?? "").trim();
  const directors = addl
    .filter((r) => {
      const c = relCode(r);
      return c !== "04" && c !== "05" && c !== "06";
    })
    .map(toPerson)
    .filter((p) => p.fullName || p.pan);
  const partners = addl
    .filter((r) => relCode(r) === "06")
    .map(toPerson)
    .filter((p) => p.fullName || p.pan);
  const trustees = addl
    .filter((r) => relCode(r) === "04")
    .map(toPerson)
    .filter((p) => p.fullName || p.pan);
  const authorisedSignatories = addl
    .filter((r) => relCode(r) === "05")
    .map(toPerson)
    .filter((p) => p.fullName || p.pan);

  const patch: CorporateKycAutofillFormPatch = {
    entityName: txt(inq.APP_NAME),
    panNumber: txt(inq.APP_PAN_NO),
    cinOrRegistrationNumber: txt(inq.APP_REGNO),
    dateOfIncorporation: incorporationDate,
    dateOfCommencementOfBusiness: date(inq.APP_COMMENCE_DT),
    placeOfIncorporation: txt(inq.APP_INCORP_PLC),
    countryOfIncorporation: countryName || perCountryName || undefined,
    entityConstitutionType: compStatusCodeToEnum(inq.APP_COMP_STATUS),
    annualIncome: txt(inq.APP_INCOME),

    correspondenceLine1: txt(inq.APP_COR_ADD1),
    correspondenceLine2: txt(inq.APP_COR_ADD2),
    correspondenceLine3: txt(inq.APP_COR_ADD3),
    correspondenceCity: txt(inq.APP_COR_CITY),
    correspondencePinCode: txt(inq.APP_COR_PINCD),
    correspondenceState: stateName || undefined,
    correspondenceAddressProofType: txt(inq.APP_COR_ADD_PROOF),

    registeredLine1: txt(inq.APP_PER_ADD1),
    registeredLine2: txt(inq.APP_PER_ADD2),
    registeredLine3: txt(inq.APP_PER_ADD3),
    registeredCity: txt(inq.APP_PER_CITY),
    registeredPinCode: txt(inq.APP_PER_PINCD),
    registeredState: perStateName || undefined,
    registeredAddressProofType: txt(inq.APP_PER_ADD_PROOF),

    fatcaApplicable:
      String(inq.APP_FATCA_APPLICABLE_FLAG ?? "").trim().toUpperCase() === "Y"
        ? true
        : String(inq.APP_FATCA_APPLICABLE_FLAG ?? "").trim().toUpperCase() === "N"
          ? false
          : undefined,

    directors: directors.length ? directors : undefined,
    partners: partners.length ? partners : undefined,
    trustees: trustees.length ? trustees : undefined,
    authorisedSignatories: authorisedSignatories.length ? authorisedSignatories : undefined,
  };

  // Strip `undefined` keys so the wire payload is compact and React-Query
  // diffs stay clean.
  return Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  ) as CorporateKycAutofillFormPatch;
}

export class CorporateKraDownloadService {
  private kra = new KraSDK({
    okraCdOrMiId: env.KRA_OKRA_CD_MI_ID,
    passKey: env.KRA_PASS_KEY,
    password: env.KRA_PASSWORD,
    userName: env.KRA_USERNAME,
    env: env.KRA_ENV,
  });

  /**
   * Trigger a one-off Non-Individual KRA download for the corporate customer
   * and persist the response in `kraDataLogs`.
   */
  async downloadOnce(customerId: number): Promise<ManualDownloadResult> {
    const corporateKyc = await db.dataBase.corporateKycModel.findUnique({
      where: { customerProfileDataModelId: customerId },
      select: {
        id: true,
        panNumber: true,
        dateOfIncorporation: true,
        dateOfCommencementOfBusiness: true,
      },
    });

    if (!corporateKyc) {
      throw new AppError("Corporate KYC not found for this customer", {
        statusCode: HttpStatus.NOT_FOUND,
      });
    }

    const pan = (corporateKyc.panNumber ?? "").trim().toUpperCase();
    if (!pan) {
      throw new AppError("Corporate PAN is missing — set it before downloading from KRA", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const doi = corporateKyc.dateOfIncorporation ?? corporateKyc.dateOfCommencementOfBusiness;
    if (!doi) {
      throw new AppError(
        "Date of incorporation (or commencement) is required to download KRA records",
        { statusCode: HttpStatus.BAD_REQUEST },
      );
    }

    const requestData = {
      pan,
      dob: formatDdmmyyyy(new Date(doi)),
      mobile: env.KRA_MOB_NO,
    };

    try {
      const download = await this.kra.nonIndividualPanDownloadDetailsComplete(requestData);

      const now = new Date();
      const row = await db.dataBase.kraDataLogs.create({
        data: {
          userId: customerId,
          kycId: corporateKyc.id,
          stage: MANUAL_DOWNLOAD_STAGE,
          requestData: requestData as unknown as object,
          responseData: download as unknown as object,
          reqTime: now,
          resTime: now,
        },
        select: { id: true, resTime: true },
      });

      return {
        logId: row.id,
        download,
        storedAt: (row.resTime ?? now).toISOString(),
        summary: summariseCorporateKraDownload(download),
      };
    } catch (err) {
      const e = err as AxiosError;
      await db.dataBase.kraDataLogs.create({
        data: {
          userId: customerId,
          kycId: corporateKyc.id,
          stage: MANUAL_DOWNLOAD_FAIL_STAGE,
          requestData: requestData as unknown as object,
          responseData: {
            message: e?.message ?? String(err),
            status: isAxiosError(e) ? e.response?.status : undefined,
            data: isAxiosError(e) ? e.response?.data : undefined,
          } as unknown as object,
          reqTime: new Date(),
          resTime: new Date(),
        },
      });
      throw new AppError(`KRA download failed: ${e?.message ?? "unknown error"}`, {
        statusCode: HttpStatus.BAD_GATEWAY,
      });
    }
  }

  /**
   * Ad-hoc KRA download keyed by an *input* PAN + DOI, used by the CRM
   * "Autofill from KRA" action. Unlike `downloadOnce`, this method does NOT
   * require an existing corporate KYC row — the operator can pull KRA data
   * even on a brand-new customer record.
   *
   * When the customer already has a corporate KYC row, a `kraDataLogs` row
   * is written with stage `CORPORATE_AUTOFILL_DOWNLOAD` so the action is
   * audit-traceable. When there's no KYC row yet (first-time fill before
   * Save), the audit row is skipped (kraDataLogs.kycId is non-nullable).
   */
  async downloadByPanAndDoi(
    customerId: number,
    panRaw: string,
    doiRaw: string,
  ): Promise<{
    logId: number | null;
    storedAt: string;
    download: T_NON_INDIVIDUAL_PAN_DOWNLOAD;
    summary: ManualDownloadSummary;
    formPatch: CorporateKycAutofillFormPatch;
  }> {
    const pan = panRaw.trim().toUpperCase();
    if (!pan) {
      throw new AppError("PAN is required", { statusCode: HttpStatus.BAD_REQUEST });
    }

    const doi = parseFlexibleDate(doiRaw);
    if (!doi) {
      throw new AppError("Date of incorporation must be a valid date", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const corporateKyc = await db.dataBase.corporateKycModel.findUnique({
      where: { customerProfileDataModelId: customerId },
      select: { id: true },
    });

    const requestData = {
      pan,
      dob: formatDdmmyyyy(doi),
      mobile: env.KRA_MOB_NO,
    };

    try {
      const download = await this.kra.nonIndividualPanDownloadDetailsComplete(requestData);

      const now = new Date();
      let logId: number | null = null;
      if (corporateKyc) {
        const row = await db.dataBase.kraDataLogs.create({
          data: {
            userId: customerId,
            kycId: corporateKyc.id,
            stage: AUTOFILL_DOWNLOAD_STAGE,
            requestData: requestData as unknown as object,
            responseData: download as unknown as object,
            reqTime: now,
            resTime: now,
          },
          select: { id: true },
        });
        logId = row.id;
      }

      return {
        logId,
        storedAt: now.toISOString(),
        download,
        summary: summariseCorporateKraDownload(download),
        formPatch: downloadToCorporateKycFormPatch(download),
      };
    } catch (err) {
      const e = err as AxiosError;
      if (corporateKyc) {
        await db.dataBase.kraDataLogs.create({
          data: {
            userId: customerId,
            kycId: corporateKyc.id,
            stage: AUTOFILL_DOWNLOAD_FAIL_STAGE,
            requestData: requestData as unknown as object,
            responseData: {
              message: e?.message ?? String(err),
              status: isAxiosError(e) ? e.response?.status : undefined,
              data: isAxiosError(e) ? e.response?.data : undefined,
            } as unknown as object,
            reqTime: new Date(),
            resTime: new Date(),
          },
        });
      }
      throw new AppError(`KRA download failed: ${e?.message ?? "unknown error"}`, {
        statusCode: HttpStatus.BAD_GATEWAY,
      });
    }
  }

  /** Fetch the most recent successful manual download for this customer. */
  async getLastManualDownload(customerId: number): Promise<
    null | (Pick<{ id: number }, "id"> & {
      id: number;
      kycId: number;
      reqTime: Date | null;
      resTime: Date | null;
      requestData: unknown;
      responseData: unknown;
      summary: ManualDownloadSummary;
    })
  > {
    const row = await db.dataBase.kraDataLogs.findFirst({
      where: { userId: customerId, stage: MANUAL_DOWNLOAD_STAGE },
      orderBy: { id: "desc" },
    });
    if (!row) return null;
    return {
      id: row.id,
      kycId: row.kycId,
      reqTime: row.reqTime,
      resTime: row.resTime,
      requestData: row.requestData,
      responseData: row.responseData,
      summary: summariseCorporateKraDownload(row.responseData as T_NON_INDIVIDUAL_PAN_DOWNLOAD),
    };
  }
}

export const corporateKraManualDownloadStages = {
  ok: MANUAL_DOWNLOAD_STAGE,
  failed: MANUAL_DOWNLOAD_FAIL_STAGE,
} as const;
