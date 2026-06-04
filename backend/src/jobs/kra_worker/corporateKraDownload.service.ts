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
import { decodeKycStatus, decodeRejectionReason } from "./kraCodes";

const MANUAL_DOWNLOAD_STAGE = "CORPORATE_MANUAL_DOWNLOAD" as const;
const MANUAL_DOWNLOAD_FAIL_STAGE = "CORPORATE_MANUAL_DOWNLOAD_FAILED" as const;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** NDML's "panDownloadDetailsComplete" expects the DOI as `DDMMYYYY` with no separators. */
function formatDdmmyyyy(date: Date): string {
  return `${pad2(date.getDate())}${pad2(date.getMonth() + 1)}${date.getFullYear()}`;
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
