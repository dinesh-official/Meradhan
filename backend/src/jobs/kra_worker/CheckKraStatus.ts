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

export const checkKraProcessCheckStatus = (
  response: T_APP_PAN_INQ,
  lastTask: string | undefined | null,
) => {
  const status = normalizeStatus(response?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS);
  const updtStatus = normalizeStatus(response?.APP_RES_ROOT?.APP_PAN_INQ?.APP_UPDT_STATUS);


  // Fix 3: Handle "Validation Pending with CAMS, CVL, KARVY, NSE, BSE KRA" suffix
  // This suffix is added when other KRAs' web services are down
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

  // Fix 1: If APP_STATUS = "Validated at ..." AND APP_UPDT_STATUS = "KYC Rejted at ..."
  // Don't trigger CBRICS Register (modification was rejected, but original KYC is validated)
  if (status?.includes("validated") && (updtStatus?.includes("rejted") || updtStatus?.includes("rejected"))) {
    if (lastTask) {
      return "ERROR"; // KYC exists and is validated, but modification was rejected - don't register again
    } else {
      return "AVAILABLE";
    }
  }

  // Fix 2: Handle 3rd party validation in process
  // If status is "underprocess at [KRA]" and KYC is validated or rejected,
  // we need to download first, then modify. Return WAITING to trigger download workflow.
  if (
    status?.includes("underprocess") &&
    (updtStatus?.includes("validated") ||
      updtStatus?.includes("rejted") ||
      updtStatus?.includes("rejected"))
  ) {
    return "WAITING"; // Need to download first before modification
  }

  // PENDING -
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

  // 7) Success
  if (status?.includes("validated at") || status?.includes("registd")) {
    return "AVAILABLE";
  }

  // Must be BEFORE any "registd" checks
  if (status?.includes("incomplete") || updtStatus?.includes("incomplete")) {
    return "WAITING"; // or a separate state like "INCOMPLETE"
  }

  // SUCCESS -
  if (
    status?.startsWith("kyc registd") ||
    status?.startsWith("kyc validated") ||
    status?.endsWith("registd") || // Handles "CVLMF Registd" and other variants
    status?.includes(" registd ") || // Handles cases with spaces around "registd"
    status?.includes(" registd at") // Handles "KYC Registd at [KRA]"
  ) {
    return "AVAILABLE";
  }

  // FAILED (explicit) - KYC rejected at KRA; service will set customer to REJECTED and stop
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

  // Default fallback -
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