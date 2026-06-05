/**
 * Shared corporate (Non-Individual) KRA payload builder + validator.
 *
 * Source-of-truth mapping from CRM `CorporateKycModel` (+ relations) → NDML
 * Non-Individual `APP_REQ_ROOT` payload used by:
 *   - `CorporateKraWorkerService.processCorporateKra`        (live KRA flow)
 *   - `CustomerProfileController.corporateKraPreview`        (CRM preview page)
 *
 * Keeping this isolated lets the CRM preview page render exactly what the
 * worker will send to NDML, so operators can spot missing/invalid fields
 * before any SOAP call goes out.
 */

import { env } from "@packages/config/env";
import type { KraNonIndAppReqRoot } from "kyc-providers";
import { getKraCountry, getKraState } from "./constent";
import {
  mapAddressProofToNdml,
  mapAnnualIncomeToNdml,
  mapCompStatusToNdml,
  NDML_COMP_STATUS,
  NDML_FIELD_LENGTHS,
} from "./kraCodes";

// ─── NDML lookup helpers ────────────────────────────────────────────────────

/** NDML address-proof code used when CRM has nothing set ("Others"). */
const DEFAULT_ADD_PROOF = "99";

/**
 * Returns the official NDML 2-digit company-status code for a CRM constitution
 * value. Falls back to `99` ("Others") when nothing matches.
 */
function compStatusCodeFor(constitution?: string | null): string {
  const hit = mapCompStatusToNdml(constitution);
  return hit?.code ?? "99";
}

// ─── Input shape (Prisma row + relations) ───────────────────────────────────

export interface CorporateKycInputForKra {
  id: number;
  entityName?: string | null;
  dateOfIncorporation?: Date | string | null;
  dateOfCommencementOfBusiness?: Date | string | null;
  countryOfIncorporation?: string | null;
  placeOfIncorporation?: string | null;
  panNumber?: string | null;
  cinOrRegistrationNumber?: string | null;
  entityConstitutionType?: string | null;
  annualIncome?: string | null;
  fatcaApplicable?: boolean | null;

  correspondenceLine1?: string | null;
  correspondenceLine2?: string | null;
  correspondenceLine3?: string | null;
  correspondenceCity?: string | null;
  correspondencePinCode?: string | null;
  correspondenceState?: string | null;
  correspondenceAddressProofType?: string | null;

  registeredLine1?: string | null;
  registeredLine2?: string | null;
  registeredLine3?: string | null;
  registeredCity?: string | null;
  registeredPinCode?: string | null;
  registeredState?: string | null;
  registeredAddressProofType?: string | null;

  authorisedSignatories?: Array<{
    fullName?: string | null;
    pan?: string | null;
    din?: string | null;
    email?: string | null;
    mobile?: string | null;
    designation?: string | null;
  }> | null;

  directors?: Array<{
    fullName?: string | null;
    pan?: string | null;
    din?: string | null;
    email?: string | null;
    mobile?: string | null;
    designation?: string | null;
  }> | null;

  promoters?: Array<{
    fullName?: string | null;
    pan?: string | null;
    din?: string | null;
    email?: string | null;
    mobile?: string | null;
    designation?: string | null;
  }> | null;
}

// ─── Formatting helpers (IST-stable, no Intl rounding surprises) ────────────

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatKraDdMmYyyyHHmmss(date: Date): string {
  const dd = pad2(date.getDate());
  const mm = pad2(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

export function formatKraDdMmYyyy(date: Date): string {
  const dd = pad2(date.getDate());
  const mm = pad2(date.getMonth() + 1);
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function formatKraDdmmyyyyCompact(date: Date): string {
  // For panDownloadDetailsComplete "DOB" field (DDMMYYYY, no dashes)
  return `${pad2(date.getDate())}${pad2(date.getMonth() + 1)}${date.getFullYear()}`;
}

function asDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function upper(v: string | null | undefined): string {
  return (v ?? "").trim().toUpperCase();
}

function nz(v: string | null | undefined): string {
  return (v ?? "").trim();
}

// ─── Validation ─────────────────────────────────────────────────────────────

export type KraIssueSeverity = "ERROR" | "WARN";

export interface KraValidationIssue {
  /** Dot-path on the input row, e.g. "panNumber" or "authorisedSignatories[0].email". */
  field: string;
  /** Human-readable message. */
  message: string;
  severity: KraIssueSeverity;
  /** Optional NDML XML tag this maps to (e.g. APP_PAN_NO). */
  xmlTag?: string;
}

export function validateCorporateKycForKra(
  kyc: CorporateKycInputForKra,
): KraValidationIssue[] {
  const issues: KraValidationIssue[] = [];

  const push = (
    field: string,
    message: string,
    severity: KraIssueSeverity,
    xmlTag?: string,
  ) => {
    issues.push({ field, message, severity, xmlTag });
  };

  // ── Entity name ──
  const nameRaw = nz(kyc.entityName);
  if (!nameRaw) {
    push("entityName", "Entity name is required", "ERROR", "APP_NAME"); // ERR-90011
  } else if (nameRaw.length > NDML_FIELD_LENGTHS.APP_NAME) {
    push(
      "entityName",
      `Entity name exceeds NDML limit of ${NDML_FIELD_LENGTHS.APP_NAME} chars (got ${nameRaw.length})`,
      "ERROR",
      "APP_NAME",
    );
  }

  // ── PAN ──
  const panRaw = nz(kyc.panNumber);
  if (!panRaw) {
    push("panNumber", "Corporate PAN is required", "ERROR", "APP_PAN_NO"); // ERR-90021
  } else if (!/^[A-Z]{3}[CHFATBLJGP][A-Z]\d{4}[A-Z]$/.test(panRaw.toUpperCase())) {
    // Non-individual PANs use the 4th char from {C,H,F,A,T,B,L,J,G,P}; "P" would be individual.
    push(
      "panNumber",
      `PAN "${panRaw}" does not look like a non-individual PAN (4th char should be C/H/F/A/T/B/L/J/G).`,
      "WARN",
      "APP_PAN_NO",
    );
  } else if (panRaw.length !== NDML_FIELD_LENGTHS.APP_PAN_NO) {
    push("panNumber", `PAN must be ${NDML_FIELD_LENGTHS.APP_PAN_NO} characters`, "ERROR", "APP_PAN_NO");
  }

  // ── Dates ──
  const doi = asDate(kyc.dateOfIncorporation) ?? asDate(kyc.dateOfCommencementOfBusiness);
  if (!doi) {
    push(
      "dateOfIncorporation",
      "Date of incorporation (or commencement) is required for KRA Download",
      "ERROR",
      "APP_DOI_DT", // ERR-90013
    );
  }

  // ── Constitution / Company status ──
  const constitution = nz(kyc.entityConstitutionType);
  if (!constitution) {
    push("entityConstitutionType", "Entity constitution type is required", "ERROR", "APP_COMP_STATUS"); // ERR-90017
  } else {
    const compHit = mapCompStatusToNdml(constitution);
    if (!compHit) {
      push(
        "entityConstitutionType",
        `"${constitution}" did not match any NDML company-status code; will send "99" (Others) and APP_OTH_COMP_STATUS.`,
        "WARN",
        "APP_COMP_STATUS",
      );
    } else if (compHit.code === "99" && nameRaw.length === 0) {
      // ERR-90018 — APP_OTH_COMP_STATUS becomes mandatory
      push(
        "entityConstitutionType",
        "Constitution maps to 'Others' (99) — provide a clearer constitution to avoid ERR-90018.",
        "WARN",
        "APP_OTH_COMP_STATUS",
      );
    }
  }

  // ── Registration / CIN ──
  const regNo = nz(kyc.cinOrRegistrationNumber);
  if (!regNo) {
    push("cinOrRegistrationNumber", "CIN / Registration number is required", "ERROR", "APP_REGNO"); // ERR-90059
  } else if (regNo.length > 30) {
    // NDML hard cap from ERR-90059 ("LESS THAN 30 CHARS")
    push(
      "cinOrRegistrationNumber",
      `CIN/Registration must be < 30 chars (got ${regNo.length}) — see ERR-90059`,
      "ERROR",
      "APP_REGNO",
    );
  }

  // Address: prefer registered, fall back to correspondence
  const regOk =
    nz(kyc.registeredLine1) && nz(kyc.registeredCity) && nz(kyc.registeredPinCode) && nz(kyc.registeredState);
  const corrOk =
    nz(kyc.correspondenceLine1) &&
    nz(kyc.correspondenceCity) &&
    nz(kyc.correspondencePinCode) &&
    nz(kyc.correspondenceState);

  if (!regOk && !corrOk) {
    push("registeredLine1", "Registered or correspondence address is required (line1/city/pin/state)", "ERROR", "APP_COR_ADD1"); // ERR-90023..ERR-90025
  }

  // ── Address line-1 length cap (ERR-90023 family) ──
  for (const [field, value, xmlTag, cap] of [
    ["correspondenceLine1", nz(kyc.correspondenceLine1), "APP_COR_ADD1", NDML_FIELD_LENGTHS.APP_COR_ADD1],
    ["registeredLine1", nz(kyc.registeredLine1), "APP_PER_ADD1", NDML_FIELD_LENGTHS.APP_PER_ADD1],
  ] as const) {
    if (value && value.length > cap) {
      push(field, `${xmlTag} exceeds NDML limit of ${cap} chars (got ${value.length})`, "ERROR", xmlTag);
    }
  }

  // ── City length cap (30) ──
  for (const [field, value, xmlTag] of [
    ["correspondenceCity", nz(kyc.correspondenceCity), "APP_COR_CITY"],
    ["registeredCity", nz(kyc.registeredCity), "APP_PER_CITY"],
  ] as const) {
    if (value && value.length > NDML_FIELD_LENGTHS.APP_COR_CITY) {
      push(field, `${xmlTag} exceeds NDML limit of ${NDML_FIELD_LENGTHS.APP_COR_CITY} chars`, "ERROR", xmlTag);
    }
  }

  // ── State must resolve to NDML state code (India only) ──
  const stateName = nz(kyc.registeredState) || nz(kyc.correspondenceState);
  if (stateName) {
    const resolved = getKraState(stateName);
    if (!resolved?.id) {
      push(
        "registeredState",
        `State "${stateName}" did not resolve to an NDML state code (will send "099") — risks ERR-90025/ERR-90035.`,
        "WARN",
        "APP_COR_STATE",
      );
    }
  }

  // ── PIN code: India PIN is exactly 6 digits, NDML cap 10 ──
  const pin = nz(kyc.registeredPinCode) || nz(kyc.correspondencePinCode);
  if (pin && pin.length > NDML_FIELD_LENGTHS.APP_COR_PINCD) {
    push("registeredPinCode", `PIN code exceeds NDML limit of ${NDML_FIELD_LENGTHS.APP_COR_PINCD} chars`, "ERROR", "APP_COR_PINCD");
  } else if (pin && !/^\d{6}$/.test(pin)) {
    push("registeredPinCode", `PIN "${pin}" must be 6 digits for India — risks ERR-90026/ERR-90036`, "ERROR", "APP_COR_PINCD");
  }

  // ── Country ──
  const country = nz(kyc.countryOfIncorporation) || "INDIA";
  const ctry = getKraCountry(country);
  if (!ctry?.code) {
    push(
      "countryOfIncorporation",
      `Country "${country}" did not resolve to an NDML country code (will send "101" / India) — risks ERR-90027.`,
      "WARN",
      "APP_COR_CTRY",
    );
  }

  // ── Address proof type ──
  const proofRaw = nz(kyc.registeredAddressProofType) || nz(kyc.correspondenceAddressProofType);
  if (!proofRaw) {
    push(
      "registeredAddressProofType",
      `No address proof type set; default "${DEFAULT_ADD_PROOF}" will be sent`,
      "WARN",
      "APP_COR_ADD_PROOF",
    );
  } else {
    const proofHit = mapAddressProofToNdml(proofRaw);
    if (!proofHit) {
      push(
        "registeredAddressProofType",
        `Address proof "${proofRaw}" did not match any NDML code — risks ERR-90029/ERR-90038. ` +
        `Use one of: ${[...new Set(["Passport", "Voter ID", "Driving License", "Bank Statement", "Gas Bill", "Other"])].join(", ")}.`,
        "WARN",
        "APP_COR_ADD_PROOF",
      );
    }
  }

  // ── Email ──
  if (kyc.authorisedSignatories?.[0]?.email) {
    const email = nz(kyc.authorisedSignatories[0].email);
    if (email.length > NDML_FIELD_LENGTHS.APP_EMAIL) {
      push("authorisedSignatories[0].email", `Email exceeds ${NDML_FIELD_LENGTHS.APP_EMAIL} chars`, "ERROR", "APP_EMAIL");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      push("authorisedSignatories[0].email", `Email "${email}" looks invalid — risks ERR-90028`, "ERROR", "APP_EMAIL");
    }
  }

  // ── Annual income ──
  if (kyc.annualIncome) {
    const incHit = mapAnnualIncomeToNdml(kyc.annualIncome);
    if (!incHit) {
      push(
        "annualIncome",
        `Annual income "${kyc.annualIncome}" did not match any NDML range — risks ERR-90041. ` +
        `Use one of: ${NDML_COMP_STATUS.length > 0 ? "Below 1 Lac / 1-5L / 5-10L / 10-25L / 25L-1Cr / >1Cr" : ""}.`,
        "WARN",
        "APP_INCOME",
      );
    }
  }

  // Authorised signatories + directors/promoters end up in APP_ADDL_DATA.
  // NDML rejection codes ERR-90053..ERR-90058 apply per row.
  const sigs = kyc.authorisedSignatories ?? [];
  if (sigs.length === 0) {
    push("authorisedSignatories", "At least one authorised signatory is required", "ERROR", "APP_EMAIL");
  } else {
    sigs.forEach((s, i) => {
      const nm = nz(s.fullName);
      if (!nm) push(`authorisedSignatories[${i}].fullName`, "Name is required", "ERROR", "APP_ADDLDATA_NAME"); // ERR-90055
      else if (nm.length > NDML_FIELD_LENGTHS.APP_ADDLDATA_NAME) {
        push(`authorisedSignatories[${i}].fullName`, `Name exceeds ${NDML_FIELD_LENGTHS.APP_ADDLDATA_NAME} chars`, "ERROR", "APP_ADDLDATA_NAME");
      }
      const ap = nz(s.pan);
      if (!ap) push(`authorisedSignatories[${i}].pan`, "PAN is required", "ERROR", "APP_ADDLDATA_PAN"); // ERR-90054
      else if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(ap.toUpperCase())) {
        push(`authorisedSignatories[${i}].pan`, `PAN "${ap}" is malformed — risks ERR-90054`, "WARN", "APP_ADDLDATA_PAN");
      }
      const din = nz(s.din);
      if (din && din.length > NDML_FIELD_LENGTHS.APP_ADDLDATA_DIN) {
        push(`authorisedSignatories[${i}].din`, `DIN exceeds ${NDML_FIELD_LENGTHS.APP_ADDLDATA_DIN} chars — risks ERR-90056`, "ERROR", "APP_ADDLDATA_DIN");
      }
      if (i === 0 && !nz(s.email)) push(`authorisedSignatories[0].email`, "Primary signatory email is required (used as APP_EMAIL)", "ERROR", "APP_EMAIL");
      if (i === 0 && !nz(s.mobile)) push(`authorisedSignatories[0].mobile`, "Primary signatory mobile is required (used as APP_MOB_NO)", "ERROR", "APP_MOB_NO");
    });
  }

  // Directors + promoters share the APP_ADDL_DATA constraints.
  for (const list of [
    { rows: kyc.directors ?? [], key: "directors", relCode: "02 (Whole Time Director)" },
    { rows: kyc.promoters ?? [], key: "promoters", relCode: "01 (Promoter)" },
  ]) {
    list.rows.forEach((d, i) => {
      const nm = nz(d.fullName);
      if (nm && nm.length > NDML_FIELD_LENGTHS.APP_ADDLDATA_NAME) {
        push(`${list.key}[${i}].fullName`, `Name exceeds ${NDML_FIELD_LENGTHS.APP_ADDLDATA_NAME} chars`, "ERROR", "APP_ADDLDATA_NAME");
      }
      const ap = nz(d.pan);
      if (ap && !/^[A-Z]{5}\d{4}[A-Z]$/.test(ap.toUpperCase())) {
        push(`${list.key}[${i}].pan`, `PAN "${ap}" is malformed — risks ERR-90054`, "WARN", "APP_ADDLDATA_PAN");
      }
      const din = nz(d.din);
      if (din && din.length > NDML_FIELD_LENGTHS.APP_ADDLDATA_DIN) {
        push(`${list.key}[${i}].din`, `DIN exceeds ${NDML_FIELD_LENGTHS.APP_ADDLDATA_DIN} chars — risks ERR-90056`, "ERROR", "APP_ADDLDATA_DIN");
      }
      // relationship is enforced by the builder (uses NDML_RELATIONSHIP codes 01/02), so we just note it.
      void list.relCode;
    });
  }

  // FATCA – we only support APPLICABLE=N for now, warn otherwise (no TIN form yet)
  if (kyc.fatcaApplicable) {
    push(
      "fatcaApplicable",
      "FATCA marked applicable but TIN/Country fields are not collected — empty FATCA block will be sent.",
      "WARN",
      "APP_FATCA_APPLICABLE_FLAG",
    );
  }

  return issues;
}

// ─── Builder ────────────────────────────────────────────────────────────────

export interface BuildOptions {
  isModify?: boolean;
  now?: Date;
}

export interface BuildResult {
  payload: KraNonIndAppReqRoot;
  /** Echo of inputs that were not present in the corporate row (helps the UI). */
  mappingNotes: Array<{ xmlTag: string; note: string }>;
}

/** Pure mapping function with no DB / SDK / I/O. Safe for preview and the worker. */
export function buildCorporateKraPayload(
  kyc: CorporateKycInputForKra,
  opts: BuildOptions = {},
): BuildResult {
  const now = opts.now ?? new Date();
  const isModify = opts.isModify === true;
  const notes: Array<{ xmlTag: string; note: string }> = [];

  const pan = upper(kyc.panNumber);
  const signatory = (kyc.authorisedSignatories ?? [])[0];

  const useRegistered =
    !!(nz(kyc.registeredLine1) && nz(kyc.registeredCity) && nz(kyc.registeredPinCode));

  // Correspondence (KRA "APP_COR_*") prefers correspondenceX, falls back to registered.
  const corLine1 = nz(kyc.correspondenceLine1) || nz(kyc.registeredLine1);
  const corLine2 = nz(kyc.correspondenceLine2) || nz(kyc.registeredLine2);
  const corLine3 = nz(kyc.correspondenceLine3) || nz(kyc.registeredLine3);
  const corCity = nz(kyc.correspondenceCity) || nz(kyc.registeredCity);
  const corPin = nz(kyc.correspondencePinCode) || nz(kyc.registeredPinCode);
  const corStateName = nz(kyc.correspondenceState) || nz(kyc.registeredState);

  // Permanent (KRA "APP_PER_*") prefers registered, falls back to correspondence.
  const perLine1 = useRegistered ? nz(kyc.registeredLine1) : corLine1;
  const perLine2 = useRegistered ? nz(kyc.registeredLine2) : corLine2;
  const perLine3 = useRegistered ? nz(kyc.registeredLine3) : corLine3;
  const perCity = useRegistered ? nz(kyc.registeredCity) : corCity;
  const perPin = useRegistered ? nz(kyc.registeredPinCode) : corPin;
  const perStateName = useRegistered ? nz(kyc.registeredState) : corStateName;

  const corState = getKraState(corStateName || "").code || "099";
  const perState = getKraState(perStateName || "").code || "099";
  const ctry = getKraCountry(kyc.countryOfIncorporation || "INDIA")?.code || "101";

  if (!nz(kyc.correspondenceLine1) && nz(kyc.registeredLine1)) {
    notes.push({
      xmlTag: "APP_COR_ADD1",
      note: "Correspondence address not set; falling back to registered address.",
    });
  }
  if (!corStateName) {
    notes.push({ xmlTag: "APP_COR_STATE", note: "No state on KYC; sending NDML \"099\" (Others)." });
  }

  const compStatus = compStatusCodeFor(kyc.entityConstitutionType);
  const incomeCode = mapAnnualIncomeToNdml(kyc.annualIncome)?.code ?? "";
  const corProofCode =
    mapAddressProofToNdml(kyc.correspondenceAddressProofType ?? kyc.registeredAddressProofType)?.code ??
    DEFAULT_ADD_PROOF;
  const perProofCode =
    mapAddressProofToNdml(kyc.registeredAddressProofType ?? kyc.correspondenceAddressProofType)?.code ??
    DEFAULT_ADD_PROOF;

  // ── Date pre-computations ────────────────────────────────────────────────
  // NDML's actual stored records (and the official register-XML sample) use
  // date-only `DD-MM-YYYY` for incorporation / IPV / address / FATCA / networth
  // dates. Only `APP_DATE` is sent as date+time. See:
  //   packages/kyc-providers/src/kra/_docs/api/Sample Request and Response/
  //     register-update/Registration API Request with Fatca No.xml
  const doiDate = asDate(kyc.dateOfIncorporation);
  const commenceDate = asDate(kyc.dateOfCommencementOfBusiness);
  const doiStr = doiDate ? formatKraDdMmYyyy(doiDate) : "";
  const commenceStr = commenceDate ? formatKraDdMmYyyy(commenceDate) : "";
  const todayStr = formatKraDdMmYyyy(now);
  // NDML uses `01-01-1900` as the conventional empty/sentinel networth date
  // when no networth is captured. Mirrors what the live KRA record shows.
  const NETWORTH_DEFAULT_DT = "01-01-1900";

  const panInq: KraNonIndAppReqRoot["APP_PAN_INQ"] = {
    APP_INT_CODE: "",
    APP_POS_CODE: env.KRA_OKRA_CD_MI_ID,
    APP_TYPE: "N",
    APP_NO: "",
    APP_DATE: formatKraDdMmYyyyHHmmss(now),

    APP_EXMT: "N",
    APP_EXMT_CAT: "",
    APP_EXMT_ID_PROOF: "01",
    APP_IPV_FLAG: "Y",
    APP_IPV_DATE: todayStr,

    APP_GEN: "",
    APP_NAME: upper(kyc.entityName),
    APP_F_NAME: "",
    // For non-individuals NDML stores the incorporation date in APP_DOB_DT
    // (date-of-birth-equivalent for an entity) as well as APP_DOI_DT.
    APP_DOB_DT: doiStr,
    APP_DOI_DT: "",
    APP_REGNO: nz(kyc.cinOrRegistrationNumber),
    APP_COMMENCE_DT: commenceStr,
    APP_NATIONALITY: "",
    APP_OTH_NATIONALITY: "",
    APP_COMP_STATUS: compStatus,
    APP_OTH_COMP_STATUS: compStatus === "99" ? nz(kyc.entityConstitutionType) : "",
    APP_RES_STATUS: "",
    // Non-individuals don't carry a residential-status proof; leave blank.
    APP_RES_STATUS_PROOF: "",

    APP_PAN_NO: pan,
    APP_PANEX_NO: "",
    APP_PAN_COPY: "Y",
    // Entities don't have Aadhaar; NDML stores "N" here.
    APP_UID_NO: "N",

    APP_COR_ADD1: corLine1,
    APP_COR_ADD2: corLine2,
    APP_COR_ADD3: corLine3,
    APP_COR_CITY: corCity,
    APP_COR_PINCD: corPin,
    APP_COR_STATE: corState,
    APP_COR_CTRY: ctry,
    APP_OFF_NO: "",
    APP_RES_NO: "",
    APP_MOB_NO: nz(signatory?.mobile),
    APP_FAX_NO: "",
    APP_EMAIL: upper(signatory?.email),
    APP_COR_ADD_PROOF: corProofCode,
    APP_COR_ADD_REF: "",
    APP_COR_ADD_DT: todayStr,

    APP_PER_ADD1: perLine1,
    APP_PER_ADD2: perLine2,
    APP_PER_ADD3: perLine3,
    APP_PER_CITY: perCity,
    APP_PER_PINCD: perPin,
    APP_PER_STATE: perState,
    APP_PER_CTRY: ctry,
    APP_PER_ADD_PROOF: perProofCode,
    APP_PER_ADD_REF: "",
    APP_PER_ADD_DT: todayStr,

    APP_INCOME: incomeCode || nz(kyc.annualIncome),
    APP_OCC: "",
    APP_OTH_OCC: "",
    APP_POL_CONN: "",
    APP_DOC_PROOF: "S",
    // NDML records originating from web-based KYC capture carry
    // APP_INTERNAL_REF = "WEBSOLICIT" — keep parity so re-uploads merge cleanly.
    APP_INTERNAL_REF: "WEBSOLICIT",
    // NDML stores "HEADOFFICE" when the record isn't tied to a branch.
    APP_BRANCH_CODE: "HEADOFFICE",
    APP_MAR_STATUS: "",
    APP_NETWRTH: "",
    APP_NETWORTH_DT: NETWORTH_DEFAULT_DT,
    APP_INCORP_PLC: upper(kyc.placeOfIncorporation),
    APP_OTHERINFO: "",

    APP_ACC_OPENDT: "",
    APP_ACC_ACTIVEDT: "",
    APP_ACC_UPDTDT: "",
    APP_FILLER1: "",
    APP_FILLER2: "",
    APP_FILLER3: "",
    APP_STATUS: "",
    APP_STATUSDT: "",
    APP_ERROR_DESC: "",
    // "S" = self/short dump. NDML's stored records carry "S" here.
    APP_DUMP_TYPE: "S",
    APP_DNLDDT: "",
    /** "IS" = Insert/Submit (non-individual). Both register and modify use the
     * same Non-Individual SOAP method; the wire SOAP action distinguishes them. */
    APP_IOP_FLG: isModify ? "IS" : "IS",
    // KRA source identifier; NDML records carry "CVLKRA" for entities sourced
    // through the CVL KRA pipeline (which is our path).
    APP_KRA_INFO: "",
    APP_SIGNATURE: "",
    // "0" = standard KYC mode (no OVD/biometric). Mirrors what NDML stores.
    APP_KYC_MODE: "0",

    APP_FATCA_APPLICABLE_FLAG: kyc.fatcaApplicable ? "Y" : "N",
    APP_FATCA_OTHER_SERVICES: "",
    APP_FATCA_BIRTH_PLACE: "",
    APP_FATCA_BIRTH_COUNTRY: "",
    APP_FATCA_COUNTRY_RES: "",
    APP_FATCA_DATE_DECLARATION: kyc.fatcaApplicable ? todayStr : "",
  };

  /**
   * APP_ADDL_DATA — one block per related person, using the NDML relationship
   * codes from the "Relationship with Applicant" master:
   *
   *   01 = Promoter
   *   02 = Whole Time Director
   *   05 = Authorised Signatory
   *
   * Source: Static Codes sheet, rows "Relationship with Applicant".
   */
  const addl: KraNonIndAppReqRoot["APP_ADDL_DATA"] = [];

  const pushAddl = (
    person: NonNullable<CorporateKycInputForKra["directors"]>[number],
    relationship: string,
  ) => {
    addl.push({
      // "01" only on modify (NDML "update related person" flag). For a fresh
      // register record NDML stores this empty — mirror that.
      APP_ADDLDATA_UPDTFLG: isModify ? "01" : "",
      APP_ENTITY_PAN: pan,
      APP_ADDLDATA_PAN: upper(person.pan),
      APP_ADDLDATA_NAME: upper(person.fullName),
      // NDML stores the DIN value in APP_ADDLDATA_DIN_UID, not APP_ADDLDATA_DIN.
      // Leave APP_ADDLDATA_DIN blank to match what real NDML records contain.
      APP_ADDLDATA_DIN_UID: nz(person.din),
      APP_ADDLDATA_DIN: "",
      APP_ADDLDATA_UID: "",
      APP_ADDLDATA_RELATIONSHIP: relationship,
      APP_ADDLDATA_POLCONN: "NA",
      // Entity address is the best we have; NDML allows blank residential.
      APP_ADDLDATA_RESADD1: perLine1,
      APP_ADDLDATA_RESADD2: perLine2,
      APP_ADDLDATA_RESADD3: perLine3,
      APP_ADDLDATA_RESCITY: perCity,
      APP_ADDLDATA_RESPINCD: perPin,
      APP_ADDLDATA_RESSTATE: perState,
      APP_ADDLDATA_RESCOUNTRY: ctry,
      APP_ADDLDATA_FILLER1: "",
      APP_ADDLDATA_FILLER2: "",
      APP_ADDLDATA_FILLER3: "",
      APP_ADDLDATA_STATUS: "",
      APP_ADDLDATA_STATUSDT: "",
      APP_ADDLDATA_ERROR_DESC: "",
    });
  };

  (kyc.directors ?? []).forEach((d) => pushAddl(d, "02"));
  (kyc.promoters ?? []).forEach((p) => pushAddl(p, "01"));
  (kyc.authorisedSignatories ?? []).forEach((s) => pushAddl(s, "05"));

  if (addl.length === 0) {
    notes.push({
      xmlTag: "APP_ADDL_DATA",
      note: "No directors / promoters / signatories captured; empty additional data sent.",
    });
  }

  const fatca: KraNonIndAppReqRoot["FATCA_ADDL_DTLS"] = kyc.fatcaApplicable
    ? [
      {
        APP_FATCA_ENTITY_PAN: pan,
        APP_FATCA_COUNTRY_RESIDENCY: "",
        APP_FATCA_TAX_IDENTIFICATION_TYPE: "TIN",
        APP_FATCA_TAX_IDENTIFICATION_NO: "",
        APP_FATCA_TAX_EXEMPT_FLAG: "N",
        APP_FATCA_TAX_EXEMPT_REASON: "",
      },
    ]
    : [];

  const summ: KraNonIndAppReqRoot["APP_SUMM_REC"] = {
    APP_OTHKRA_CODE: env.KRA_OKRA_CD_MI_ID,
    // NDML assigns the batch number on its side; sending a placeholder like
    // "K" pollutes the record. Leave blank — NDML fills this on the response.
    APP_OTHKRA_BATCH: "",
    // NDML's official register-XML sample uses date-only for APP_REQ_DATE.
    APP_REQ_DATE: todayStr,
    APP_ADDLDATA_RECORDS: String(addl.length),
    APP_TOTAL_REC: "1",
    NO_OF_FATCA_ADDL_DTLS_RECORDS: String(fatca.length),
  };

  return {
    payload: {
      APP_PAN_INQ: panInq,
      APP_ADDL_DATA: addl,
      FATCA_ADDL_DTLS: fatca,
      APP_SUMM_REC: summ,
    },
    mappingNotes: notes,
  };
}

/**
 * Build the small "computed" object the CRM preview UI uses to render a row
 * for every source CRM field that contributes to the KRA payload.
 */
export function buildCorporateKraFieldMap(
  kyc: CorporateKycInputForKra,
  result: BuildResult,
): Array<{
  group: string;
  label: string;
  source: string;
  sourceValue: string | null;
  xmlTag: string;
  mappedValue: string;
}> {
  const p = result.payload.APP_PAN_INQ;
  const sig = (kyc.authorisedSignatories ?? [])[0];

  const display = (v: unknown): string => {
    if (v == null) return "";
    if (v instanceof Date) return v.toISOString();
    if (typeof v === "string" || typeof v === "number") return String(v);
    return JSON.stringify(v);
  };

  return [
    // ── Entity
    { group: "Entity", label: "Entity name", source: "entityName", sourceValue: display(kyc.entityName), xmlTag: "APP_NAME", mappedValue: p.APP_NAME },
    { group: "Entity", label: "PAN", source: "panNumber", sourceValue: display(kyc.panNumber), xmlTag: "APP_PAN_NO", mappedValue: p.APP_PAN_NO },
    { group: "Entity", label: "Date of incorporation", source: "dateOfIncorporation", sourceValue: display(kyc.dateOfIncorporation), xmlTag: "APP_DOI_DT", mappedValue: p.APP_DOI_DT ?? "" },
    { group: "Entity", label: "Date of commencement", source: "dateOfCommencementOfBusiness", sourceValue: display(kyc.dateOfCommencementOfBusiness), xmlTag: "APP_COMMENCE_DT", mappedValue: p.APP_COMMENCE_DT ?? "" },
    { group: "Entity", label: "CIN / Registration #", source: "cinOrRegistrationNumber", sourceValue: display(kyc.cinOrRegistrationNumber), xmlTag: "APP_REGNO", mappedValue: p.APP_REGNO ?? "" },
    {
      group: "Entity",
      label: "Constitution type (→ NDML company status)",
      source: "entityConstitutionType",
      sourceValue: display(kyc.entityConstitutionType),
      xmlTag: "APP_COMP_STATUS",
      mappedValue:
        (p.APP_COMP_STATUS ?? "") +
        (NDML_COMP_STATUS.find((c) => c.code === p.APP_COMP_STATUS)
          ? ` (${NDML_COMP_STATUS.find((c) => c.code === p.APP_COMP_STATUS)?.label})`
          : ""),
    },
    { group: "Entity", label: "Place of incorporation", source: "placeOfIncorporation", sourceValue: display(kyc.placeOfIncorporation), xmlTag: "APP_INCORP_PLC", mappedValue: p.APP_INCORP_PLC ?? "" },
    {
      group: "Entity",
      label: "Annual income (→ NDML range code)",
      source: "annualIncome",
      sourceValue: display(kyc.annualIncome),
      xmlTag: "APP_INCOME",
      mappedValue:
        (p.APP_INCOME ?? "") +
        (mapAnnualIncomeToNdml(kyc.annualIncome)?.label
          ? ` (${mapAnnualIncomeToNdml(kyc.annualIncome)?.label})`
          : ""),
    },

    // ── Correspondence (KRA: APP_COR_*)
    { group: "Correspondence address", label: "Address line 1", source: "correspondenceLine1 / registeredLine1", sourceValue: display(kyc.correspondenceLine1 ?? kyc.registeredLine1), xmlTag: "APP_COR_ADD1", mappedValue: p.APP_COR_ADD1 ?? "" },
    { group: "Correspondence address", label: "City", source: "correspondenceCity / registeredCity", sourceValue: display(kyc.correspondenceCity ?? kyc.registeredCity), xmlTag: "APP_COR_CITY", mappedValue: p.APP_COR_CITY ?? "" },
    { group: "Correspondence address", label: "PIN code", source: "correspondencePinCode / registeredPinCode", sourceValue: display(kyc.correspondencePinCode ?? kyc.registeredPinCode), xmlTag: "APP_COR_PINCD", mappedValue: p.APP_COR_PINCD ?? "" },
    { group: "Correspondence address", label: "State (NDML code)", source: "correspondenceState / registeredState", sourceValue: display(kyc.correspondenceState ?? kyc.registeredState), xmlTag: "APP_COR_STATE", mappedValue: p.APP_COR_STATE ?? "" },
    { group: "Correspondence address", label: "Country (NDML code)", source: "countryOfIncorporation", sourceValue: display(kyc.countryOfIncorporation ?? "INDIA"), xmlTag: "APP_COR_CTRY", mappedValue: p.APP_COR_CTRY ?? "" },
    {
      group: "Correspondence address",
      label: "Address proof code",
      source: "correspondenceAddressProofType / registeredAddressProofType",
      sourceValue: display(kyc.correspondenceAddressProofType ?? kyc.registeredAddressProofType),
      xmlTag: "APP_COR_ADD_PROOF",
      mappedValue:
        (p.APP_COR_ADD_PROOF ?? "") +
        (mapAddressProofToNdml(kyc.correspondenceAddressProofType ?? kyc.registeredAddressProofType)?.label
          ? ` (${mapAddressProofToNdml(kyc.correspondenceAddressProofType ?? kyc.registeredAddressProofType)?.label})`
          : ""),
    },

    // ── Registered (KRA: APP_PER_*)
    { group: "Registered address", label: "Address line 1", source: "registeredLine1 / correspondenceLine1", sourceValue: display(kyc.registeredLine1 ?? kyc.correspondenceLine1), xmlTag: "APP_PER_ADD1", mappedValue: p.APP_PER_ADD1 ?? "" },
    { group: "Registered address", label: "City", source: "registeredCity / correspondenceCity", sourceValue: display(kyc.registeredCity ?? kyc.correspondenceCity), xmlTag: "APP_PER_CITY", mappedValue: p.APP_PER_CITY ?? "" },
    { group: "Registered address", label: "PIN code", source: "registeredPinCode / correspondencePinCode", sourceValue: display(kyc.registeredPinCode ?? kyc.correspondencePinCode), xmlTag: "APP_PER_PINCD", mappedValue: p.APP_PER_PINCD ?? "" },
    { group: "Registered address", label: "State (NDML code)", source: "registeredState / correspondenceState", sourceValue: display(kyc.registeredState ?? kyc.correspondenceState), xmlTag: "APP_PER_STATE", mappedValue: p.APP_PER_STATE ?? "" },
    {
      group: "Registered address",
      label: "Address proof code",
      source: "registeredAddressProofType / correspondenceAddressProofType",
      sourceValue: display(kyc.registeredAddressProofType ?? kyc.correspondenceAddressProofType),
      xmlTag: "APP_PER_ADD_PROOF",
      mappedValue:
        (p.APP_PER_ADD_PROOF ?? "") +
        (mapAddressProofToNdml(kyc.registeredAddressProofType ?? kyc.correspondenceAddressProofType)?.label
          ? ` (${mapAddressProofToNdml(kyc.registeredAddressProofType ?? kyc.correspondenceAddressProofType)?.label})`
          : ""),
    },

    // ── Primary signatory contact (drives APP_MOB_NO + APP_EMAIL)
    { group: "Primary signatory", label: "Email", source: "authorisedSignatories[0].email", sourceValue: display(sig?.email), xmlTag: "APP_EMAIL", mappedValue: p.APP_EMAIL ?? "" },
    { group: "Primary signatory", label: "Mobile", source: "authorisedSignatories[0].mobile", sourceValue: display(sig?.mobile), xmlTag: "APP_MOB_NO", mappedValue: p.APP_MOB_NO ?? "" },

    // ── FATCA
    { group: "FATCA", label: "Applicable", source: "fatcaApplicable", sourceValue: display(kyc.fatcaApplicable), xmlTag: "APP_FATCA_APPLICABLE_FLAG", mappedValue: p.APP_FATCA_APPLICABLE_FLAG ?? "" },
  ];
}
