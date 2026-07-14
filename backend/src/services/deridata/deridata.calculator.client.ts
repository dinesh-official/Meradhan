import { AppError, HttpStatus } from "@utils/error/AppError";
import { buildDeriDataAuth } from "./deridata.auth";
import {
  faceAmountInCrores,
  getDeriDataCalculatorUrl,
  getDeriDataConfig,
} from "./deridata.config";
import { parseDeriDataErrorBody } from "./deridata.error";
import type {
  DeriDataCalculatorResponse,
  PriceToYieldInput,
  YieldToPriceInput,
} from "./deridata.types";

async function postCalculator(
  body: Record<string, unknown>,
): Promise<DeriDataCalculatorResponse> {
  const config = getDeriDataConfig();
  const auth = buildDeriDataAuth({
    merchantId: config.merchantId,
    secretKey: config.secretKey,
    merchantName: config.merchantName,
    merchantEmail: config.merchantEmail,
    publicIp: config.publicIp,
  });
  const url = getDeriDataCalculatorUrl(config.baseUrl);

  const payload = {
    merchant_id: config.merchantId,
    uuid: auth.uuid,
    checksum: auth.checksum,
    ...body,
  };



  console.log(payload);

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
      "DeriData calculator request failed",
    );

    const statusCode =
      res.status === 401 || res.status === 403
        ? HttpStatus.UNAUTHORIZED
        : res.status >= 500
          ? HttpStatus.BAD_GATEWAY
          : HttpStatus.BAD_REQUEST;
    throw new AppError(`DeriData calculator failed: ${message}`, {
      statusCode,
      code: "DERIDATA_CALC_FAILED",
    });
  }

  return (await res.json()) as DeriDataCalculatorResponse;
}

export async function calculateYieldToPrice(
  input: YieldToPriceInput,
): Promise<DeriDataCalculatorResponse> {
  const amount = faceAmountInCrores(input.faceValue, input.quantity);
  return postCalculator({
    isin: input.isin,
    value_date: input.valueDate,
    amount,
    yield_to_price: true,
    selected_yield: "ytm",
    ytm: input.ytm,
    ytc: null,
    ytp: null,
    clean_price: null,
    cashflow_shut_flag: input.cashflowShutFlag,
    type_field: "cashflow",
  });
}

export async function calculatePriceToYield(
  input: PriceToYieldInput,
): Promise<DeriDataCalculatorResponse> {
  const amount = faceAmountInCrores(input.faceValue, input.quantity);
  return postCalculator({
    isin: input.isin,
    value_date: input.valueDate,
    amount,
    yield_to_price: false,
    selected_yield: "ytm",
    ytm: null,
    ytc: null,
    ytp: null,
    clean_price: input.cleanPrice,
    cashflow_shut_flag: input.cashflowShutFlag,
    type_field: "cashflow",
  });
}
