import type { CustomerProfileDataModel } from "@core/database/database";
import type { T_APP_PAN_INQ } from "@packages/kyc-providers";
import type { Root } from "@packages/kyc-providers/pdf/dataMapper";

export const checkKraProcessCheckStatus = (response: T_APP_PAN_INQ) => {
  const status =
    response.APP_RES_ROOT.APP_PAN_INQ.APP_STATUS?.toLowerCase().trim();

  if (!status) return "REGISTER";

  if (status.startsWith("not available") || status.includes("not available")) {
    return "REGISTER";
  }

  // SUCCESS -
  if (status.startsWith("kyc registd") || status.startsWith("kyc validated")) {
    return "PASS";
  }

  // PENDING -
  if (
    status.includes("underprocess") ||
    status.includes("onhold") ||
    status.includes("incomplete")
  ) {
    return "WAITING";
  }

  // FAILED (explicit) -
  if (status.includes("rejted") || status.includes("rejected")) {
    return "PASS";
  }

  // Default fallback -
  return "REGISTER";
};

export const checkIsKraMatched = (
  data: Root,
  customer: CustomerProfileDataModel
) => {
  const kraData = data.PAN_INQ_RESP.PERSONAL_INFO;

  const isNameMatched =
    kraData.NAME?.toLowerCase().trim() ===
    customer.fullName.toLowerCase().trim();

  const isDobMatched =
    kraData.DOB?.toLowerCase().trim() ===
    customer.dateOfBirth.toLowerCase().trim();

  return isNameMatched && isDobMatched;
};
