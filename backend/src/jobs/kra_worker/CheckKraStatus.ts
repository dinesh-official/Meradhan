import type { CustomerProfileDataModel } from "@core/database/database";
import {
  type T_APP_PAN_INQ,
  type T_APP_PAN_INQ_DOWNLOAD,
} from "@packages/kyc-providers";
import type { Root } from "@packages/kyc-providers/pdf/dataMapper";
import { KraProcess } from "./KraWorker.service";


const normalizeStatus = (status: string | undefined | null) => {
  if (typeof status === "string") {
    return status.toLowerCase().trim();
  }
  return undefined;
};

/**
 * Helper: APP_STATUS / APP_UPDT_STATUS → "open for new Modification" (KYC PAN can accept new MODIFY).
 * Caller should note rejection reason (APP_STATUS / APP_UPDT_STATUS) for further action.
 */
const isAppStatusOpenForModify = (s: string | undefined) =>
  s !== undefined &&
  (s.includes("kyc rejected at") ||
    s.includes("onhold-incomplete at") ||
    s.includes("kyc onhold at") ||
    s.includes("kyc registd-incomplete at"));

const isUpdtStatusOpenForModify = (s: string | undefined) =>
  s !== undefined &&
  (s.includes("kyc rejted at") ||
    s.includes("kyc registd-incomplete at"));

/** APP_UPDT_STATUS: "Request KRA to enable KYC PAN for Modification" → wait */
const isUpdtStatusRequestKraEnable = (s: string | undefined) =>
  s !== undefined &&
  (s.includes("onhold-incomplete") ||
    s.includes("kyc onhold at") ||
    s.includes("underprocess-incomplete"));

/** APP_STATUS: "Request KRA to enable KYC PAN for Modification" */
const isAppStatusRequestKraEnable = (s: string | undefined) =>
  s !== undefined && s.includes("underprocess-incomplete");

export const checkKraProcessCheckStatus = (
  response: T_APP_PAN_INQ,
  lastTask: string | undefined | null,
) => {
  const status = normalizeStatus(response?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS);
  const updtStatus = normalizeStatus(response?.APP_RES_ROOT?.APP_PAN_INQ?.APP_UPDT_STATUS);

  // Note: Caller should make a note of APP_STATUS / APP_UPDT_STATUS (rejection reason) for further action.

  // Validation Pending with CAMS, CVL, KARVY, NSE, BSE KRA
  if (
    status?.includes("validation pending with") ||
    updtStatus?.includes("validation pending with")
  ) {
    return "WAITING";
  }

  // Check for ERROR - only treat non-empty strings as errors
  const error = response?.APP_RES_ROOT?.APP_PAN_INQ?.ERROR;
  if (
    error &&
    typeof error === "string" &&
    error.trim().length > 0 &&
    !status?.includes("validated") &&
    !status?.includes("registd")
  ) {
    return "ERROR";
  }

  // APP_UPDT_STATUS: "Request KRA to enable KYC PAN for Modification" → wait
  if (isUpdtStatusRequestKraEnable(updtStatus)) {
    return "WAITING";
  }

  // APP_STATUS: "Request KRA to enable KYC PAN for Modification" (underprocess-incomplete)
  if (isAppStatusRequestKraEnable(status)) {
    return "WAITING";
  }

  // APP_STATUS: "KYC Rejected at / Onhold-incomplete at / KYC Onhold at / KYC Registd-incomplete at" → KYC PAN is open for new Modification
  if (isAppStatusOpenForModify(status)) {
    return "AVAILABLE";
  }

  // APP_UPDT_STATUS: "KYC Rejted at / KYC Registd-incomplete at" → KYC PAN is open for new Modification
  if (isUpdtStatusOpenForModify(updtStatus)) {
    return "AVAILABLE";
  }

  // Validated at + KYC Rejted at: don't trigger CBRICS Register; PAN is open for new Modification
  if (status?.includes("validated") && (updtStatus?.includes("rejted") || updtStatus?.includes("rejected"))) {
    if (lastTask) {
      return "ERROR"; // Don't register again; use MODIFY for new modification
    }
    return "AVAILABLE";
  }

  // Underprocess at [KRA] with validated/rejected → download first, then modify
  if (
    status?.includes("underprocess") &&
    (updtStatus?.includes("validated") ||
      updtStatus?.includes("rejted") ||
      updtStatus?.includes("rejected"))
  ) {
    return "WAITING";
  }

  // General underprocess / onhold / incomplete
  if (
    status?.includes("underprocess") ||
    status?.includes("onhold") ||
    status?.includes("incomplete") ||
    updtStatus?.includes("underprocess") ||
    updtStatus?.includes("onhold") ||
    updtStatus?.includes("incomplete")
  ) {
    return "WAITING";
  }

  if (status?.includes("kyc validated")) {
    return "AVAILABLE";
  }

  if (status?.includes("validated at") || status?.includes("registd")) {
    return "AVAILABLE";
  }

  if (
    status?.startsWith("kyc registd") ||
    status?.startsWith("kyc validated") ||
    status?.endsWith("registd") ||
    status?.includes(" registd ") ||
    status?.includes(" registd at")
  ) {
    return "AVAILABLE";
  }

  // "KYC Rejected at ..." / "KYC Rejted at ..." → open for new Modification (handled above). Any other rejted/rejected:
  if (status?.includes("rejted") || status?.includes("rejected")) {
    if (lastTask) {
      return "REJECTED";
    }
    return "WAITING";
  }

  if (
    status?.startsWith("not available") ||
    status?.includes("not available")
  ) {
    if (lastTask == "REGISTER") return "WAITING";
    if (lastTask == "MODIFY") return "ERROR";
    return "REGISTER";
  }

  return "WAITING";
};

export const checkIsKraMatched = (
  data: Root,
  customer: CustomerProfileDataModel,
  kraData: T_APP_PAN_INQ_DOWNLOAD,
) => {
  const kraProcess = new KraProcess();
  const genKra = kraProcess.buildRegisterPayload(data, customer);
  const check = genKra.APP_PAN_INQ;
  const kra = kraData.APP_RES_ROOT.APP_PAN_INQ;
  const checkKey: (keyof T_APP_PAN_INQ_DOWNLOAD["APP_RES_ROOT"]["APP_PAN_INQ"])[] =
    [
      "APP_POS_CODE",
      "APP_PAN_NO",
      "APP_GEN",
      "APP_NAME",
      "APP_F_NAME",
      "APP_UID_NO",
      "APP_COR_CITY",
      "APP_COR_PINCD",
      "APP_COR_STATE",
      "APP_COR_CTRY",
      "APP_EMAIL",
      "APP_COR_ADD_REF",
      "APP_PER_CITY",
      "APP_PER_PINCD",
      "APP_PER_STATE",
      "APP_PER_CTRY",
      "APP_PER_ADD_REF",
      "APP_MAR_STATUS",
      "APP_COR_ADD1",
      "APP_COR_ADD2",
      "APP_COR_ADD3",
      "APP_PER_ADD1",
      "APP_PER_ADD2",
      "APP_PER_ADD3",
    ];



  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matchers = checkKey.map((e) => normalizeStatus((check as any)[e])?.toLocaleLowerCase() == normalizeStatus(kra[e])?.toLocaleLowerCase());

  return Boolean(matchers.find((e) => e == false));
};
