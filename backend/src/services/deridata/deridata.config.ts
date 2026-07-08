import { AppError, HttpStatus } from "@utils/error/AppError";

/** Staging DeriData API — same host used in Merchant API V3.1 examples. */
export const DEFAULT_DERIDATA_BASE_URL = "https://stage-dd.meradhan.co/prod";

export type DeriDataConfig = {
  baseUrl: string;
  merchantId: number;
  secretKey: string;
  merchantName: string;
  merchantEmail: string;
  publicIp: string;
};

export function getDeriDataConfig(): DeriDataConfig {
  const baseUrl = (
    process.env.DERIDATA_BASE_URL?.trim() || DEFAULT_DERIDATA_BASE_URL
  ).replace(/\/+$/, "");
  const merchantIdRaw = process.env.DERIDATA_MERCHANT_ID?.trim() ?? "";
  const secretKey = process.env.DERIDATA_SECRET_KEY?.trim() ?? "";
  const merchantName = process.env.DERIDATA_MERCHANT_NAME?.trim() ?? "";
  const merchantEmail = process.env.DERIDATA_MERCHANT_EMAIL?.trim() ?? "";
  const publicIp = process.env.DERIDATA_PUBLIC_IP?.trim() ?? "";

  if (
    !merchantIdRaw ||
    !secretKey ||
    !merchantName ||
    !merchantEmail ||
    !publicIp
  ) {
    throw new AppError(
      "DeriData calculator credentials missing. Set DERIDATA_MERCHANT_ID, DERIDATA_SECRET_KEY, DERIDATA_MERCHANT_NAME, DERIDATA_MERCHANT_EMAIL, and DERIDATA_PUBLIC_IP in .env (DERIDATA_BASE_URL is optional).",
      {
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        code: "DERIDATA_MISCONFIGURED",
      },
    );
  }

  const merchantId = Number(merchantIdRaw);
  if (!Number.isFinite(merchantId) || merchantId <= 0) {
    throw new AppError("Invalid DERIDATA_MERCHANT_ID", {
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
      code: "DERIDATA_MISCONFIGURED",
    });
  }

  return {
    baseUrl,
    merchantId,
    secretKey,
    merchantName,
    merchantEmail,
    publicIp,
  };
}

export function getDeriDataCalculatorUrl(baseUrl: string): string {
  return `${baseUrl}/api/public/merchant/v1/calculator/`;
}

export function getDeriDataIssueDetailUrl(baseUrl: string): string {
  return `${baseUrl}/api/public/merchant/v1/issue-detail/`;
}

export function faceAmountInCrores(faceValue: number, quantity: number): number {
  const fv = Number.isFinite(faceValue) ? faceValue : 0;
  const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  return (fv * qty) / 1e7;
}
