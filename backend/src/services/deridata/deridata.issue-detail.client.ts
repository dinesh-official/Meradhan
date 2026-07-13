import { AppError, HttpStatus } from "@utils/error/AppError";
import { buildDeriDataAuth } from "./deridata.auth";
import {
  getDeriDataConfig,
  getDeriDataIssueDetailUrl,
} from "./deridata.config";
import { parseDeriDataErrorBody } from "./deridata.error";
import type { DeriDataIssueDetailResponse } from "./deridata.types";

/**
 * Fetch bond master / issue terms for an ISIN from DeriData Daily Data.
 * Auth matches Merchant API V3.1 (uuid + checksum), same as calculator.
 */
export async function fetchIssueDetail(
  isin: string,
): Promise<DeriDataIssueDetailResponse> {
  const normalized = isin.trim().toUpperCase();
  if (!normalized) {
    throw new AppError("ISIN is required for DeriData issue-detail", {
      statusCode: HttpStatus.BAD_REQUEST,
      code: "DERIDATA_ISSUE_DETAIL_INVALID",
    });
  }

  const config = getDeriDataConfig();
  const auth = buildDeriDataAuth({
    merchantId: config.merchantId,
    secretKey: config.secretKey,
    merchantName: config.merchantName,
    merchantEmail: config.merchantEmail,
    publicIp: config.publicIp,
  });
  const url = getDeriDataIssueDetailUrl(config.baseUrl);

  const payload = {
    merchant_id: config.merchantId,
    uuid: auth.uuid,
    checksum: auth.checksum,
    isin: normalized,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const message = parseDeriDataErrorBody(
      text,
      "DeriData issue-detail request failed",
    );
    const statusCode =
      res.status === 401 || res.status === 403
        ? HttpStatus.UNAUTHORIZED
        : res.status >= 500
          ? HttpStatus.BAD_GATEWAY
          : HttpStatus.BAD_REQUEST;
    throw new AppError(`DeriData issue-detail failed: ${message}`, {
      statusCode,
      code: "DERIDATA_ISSUE_DETAIL_FAILED",
    });
  }

  return (await res.json()) as DeriDataIssueDetailResponse;
}

export async function fetchIssueDetailItem(isin: string) {
  const response = await fetchIssueDetail(isin);
  const item = response.data?.[0];
  if (!item) {
    throw new AppError(`No DeriData issue-detail found for ISIN ${isin}`, {
      statusCode: HttpStatus.NOT_FOUND,
      code: "DERIDATA_ISSUE_DETAIL_NOT_FOUND",
    });
  }
  return { item, response };
}
