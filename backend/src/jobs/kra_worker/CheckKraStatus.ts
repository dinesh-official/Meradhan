import type { CustomerProfileDataModel } from "@core/database/database";
import type {
  T_APP_PAN_INQ,
  T_APP_PAN_INQ_DOWNLOAD,
} from "@packages/kyc-providers";
import type { Root } from "@packages/kyc-providers/pdf/dataMapper";

export const checkKraProcessCheckStatus = (response: T_APP_PAN_INQ) => {
  const status =
    response?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS?.toLowerCase().trim();

  if (!status) {
    if (!response?.APP_RES_ROOT?.APP_PAN_INQ.ERROR?.trim()) {
      return "REGISTER";
    }
  }

  if (response?.APP_RES_ROOT?.APP_PAN_INQ?.ERROR) {
    return "ERROR";
  }

  if (
    status?.startsWith("not available") ||
    status?.includes("not available")
  ) {
    return "REGISTER";
  }

  // SUCCESS -
  if (
    status?.startsWith("kyc registd") ||
    status?.startsWith("kyc validated")
  ) {
    return "PASS";
  }

  // PENDING -
  if (
    status?.includes("underprocess") ||
    status?.includes("onhold") ||
    status?.includes("incomplete")
  ) {
    return "WAITING";
  }

  // FAILED (explicit) -
  if (status?.includes("rejted") || status?.includes("rejected")) {
    return "PASS";
  }

  // Default fallback -
  return "REGISTER";
};

export const checkIsKraMatched = (
  data: Root,
  customer: CustomerProfileDataModel,
  kraData: T_APP_PAN_INQ_DOWNLOAD
) => {
  const kra = kraData.APP_RES_ROOT.APP_PAN_INQ;

  const isNameMatched =
    kra.APP_PAN_NO?.toLowerCase().trim() ===
    data.step_1.pan.panCardNo?.toLowerCase().trim();

  return isNameMatched;
};
