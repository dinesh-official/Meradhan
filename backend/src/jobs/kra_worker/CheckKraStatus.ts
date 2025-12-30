import type { CustomerProfileDataModel } from "@core/database/database";
import {
  type T_APP_PAN_INQ,
  type T_APP_PAN_INQ_DOWNLOAD,
} from "@packages/kyc-providers";
import type { Root } from "@packages/kyc-providers/pdf/dataMapper";
import { KraProcess } from "./KraWorker.service";

export const checkKraProcessCheckStatus = (response: T_APP_PAN_INQ) => {
  const status =
    response?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS?.toLowerCase().trim();
  const updtStatus =
    response?.APP_RES_ROOT?.APP_PAN_INQ?.APP_UPDT_STATUS?.toLowerCase().trim();

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

  // FAILED (explicit) -
  if (status?.includes("rejted") || status?.includes("rejected")) {
    return "AVAILABLE";
  }

  // SUCCESS -
  if (
    status?.startsWith("kyc registd") ||
    status?.startsWith("kyc validated")
  ) {
    return "AVAILABLE";
  }

  // Default fallback -
  return "REGISTER";
};

export const checkIsKraMatched = (
  data: Root,
  customer: CustomerProfileDataModel,
  kraData: T_APP_PAN_INQ_DOWNLOAD
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
  const matchers = checkKey.map((e) => (check as any)[e] == kra[e]);

  return Boolean(matchers.find((e) => e == false));
};
