import { db } from "@core/database/database";
import { calculateYieldToPrice } from "@services/deridata/deridata.calculator.client";
import { parseDeriDataRecordDateYmd } from "@services/deridata/deridata.calc.adapter";
import type { DeriDataCalculatorResponse } from "@services/deridata/deridata.types";
import { getLastCouponDateFromReferenceData } from "@services/order/order-pricing-helper";
import {
  resolveShutPeriod,
  type ShutPeriodResult,
} from "@services/order/shut-period-accrual";
import { cacheStorage } from "@store/redis_store";

export const DERIDATA_CASHFLOW_DATE_FORMAT = "DD-MMM-YYYY" as const;

/** Phase-1 cashflow probe only (record_date + cashflows). Phase-2 pricing stays live. */
export const DERIDATA_PHASE1_CASHFLOW_CACHE_TTL_SEC = 30 * 60;

function phase1CashflowCacheKey(
  isin: string,
  settlementDate: string,
  underShut: boolean,
): string {
  return `deridata:phase1-cashflow:${isin}:${settlementDate}:shut:${underShut ? 1 : 0}`;
}

async function getCachedPhase1Response(
  key: string,
): Promise<DeriDataCalculatorResponse | null> {
  try {
    return await cacheStorage.get<DeriDataCalculatorResponse>(key);
  } catch (err) {
    console.warn(
      `[deriData cashflow cache] get failed for ${key}:`,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}

async function setCachedPhase1Response(
  key: string,
  response: DeriDataCalculatorResponse,
): Promise<void> {
  try {
    await cacheStorage.set(key, response, DERIDATA_PHASE1_CASHFLOW_CACHE_TTL_SEC);
  } catch (err) {
    console.warn(
      `[deriData cashflow cache] set failed for ${key}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

export type AccrualDaysFromDailyCashflowInput = {
  isin: string;
  /** Settlement / value date (YYYY-MM-DD). */
  settlementDate: string;
  /** YTM passed to DeriData yield-to-price. Default 10.5. */
  yield?: number;
  /**
   * DeriData `cashflow_shut_flag` input (not the computed result).
   * Default true.
   */
  underShut?: boolean;
  quantity?: number;
  faceValue?: number;
};

export type AccrualDaysFromDeriDataResponseInput = {
  settlementDate: string;
  response: DeriDataCalculatorResponse;
  /** Used when cashflows have no past coupon date. */
  lastCouponFallback?: string | null;
  isin?: string;
  /** Probe flag that was sent into DeriData (echoed in result). */
  underShut?: boolean;
  yield?: number;
};

export type AccrualDaysFromDailyCashflowResult = ShutPeriodResult & {
  isin: string;
  settlementDate: string;
  yield: number;
  underShut: boolean;
  recordDate: string;
  lastCouponDate: string | null;
  nextCouponDate: string;
  dateFormat: typeof DERIDATA_CASHFLOW_DATE_FORMAT;
  cashflowDates: string[];
  /** Echo of DeriData `cashflow_shut_flag` when present. */
  deriDataCashflowShutFlag: boolean | null;
  /** Raw calculator response when fetched by `resolveAccrualDaysFromDailyCashflow`. */
  deriDataResponse?: DeriDataCalculatorResponse;
  /** True when Phase-1 DeriData response was served from Redis. */
  fromCache?: boolean;
};

function settlementDateFromYmd(ymd: string): Date {
  const date = ymd.trim().split("T")[0]!;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid settlementDate (expected YYYY-MM-DD): ${ymd}`);
  }
  return new Date(`${date}T00:00:00.000Z`);
}

function parseCashflowDatesYmd(
  response: DeriDataCalculatorResponse,
): string[] {
  const dates = (response.cashflows ?? [])
    .map((row) => parseDeriDataRecordDateYmd(row.cash_flow_dates))
    .filter((d): d is string => d != null);
  return [...new Set(dates)].sort();
}

function resolveNextCouponFromCashflows(
  cashflowDatesYmd: string[],
  settlementYmd: string,
): string | null {
  const settlement = settlementYmd.trim().split("T")[0]!;
  for (const d of cashflowDatesYmd) {
    if (d > settlement) return d;
  }
  // DeriData may return the next coupon as the first row even when equal;
  // fall back to first cashflow date if none are strictly after settlement.
  return cashflowDatesYmd[0] ?? null;
}

function resolveLastCouponFromCashflows(
  cashflowDatesYmd: string[],
  settlementYmd: string,
): string | null {
  const settlement = settlementYmd.trim().split("T")[0]!;
  let last: string | null = null;
  for (const d of cashflowDatesYmd) {
    if (d <= settlement) last = d;
    else break;
  }
  return last;
}

async function resolveFaceValue(
  isin: string,
  override?: number,
): Promise<number> {
  if (override != null && Number.isFinite(override) && override > 0) {
    return override;
  }
  const bond = await db.dataBase.bonds.findUnique({
    where: { isin },
    select: { faceValue: true },
  });
  const fv = Number(bond?.faceValue ?? 10_000);
  return Number.isFinite(fv) && fv > 0 ? fv : 10_000;
}

/**
 * Computes accrual days + shut status from an already-fetched DeriData
 * calculator response (no network call).
 */
export async function resolveAccrualDaysFromDeriDataResponse(
  input: AccrualDaysFromDeriDataResponseInput,
): Promise<AccrualDaysFromDailyCashflowResult> {
  const isin = (input.isin ?? "").trim().toUpperCase();
  const settlementDate = input.settlementDate.trim().split("T")[0]!;
  const ytm =
    input.yield != null && Number.isFinite(input.yield) ? input.yield : 10.5;
  const underShut = input.underShut ?? true;

  const recordDate = parseDeriDataRecordDateYmd(input.response.record_date);
  if (!recordDate) {
    throw new Error(
      `DeriData did not return a parseable record_date${isin ? ` for ${isin}` : ""}`,
    );
  }

  const cashflowDates = parseCashflowDatesYmd(input.response);
  const nextCouponDate = resolveNextCouponFromCashflows(
    cashflowDates,
    settlementDate,
  );
  if (!nextCouponDate) {
    throw new Error(
      `DeriData cashflows did not include a next coupon date${isin ? ` for ${isin}` : ""}`,
    );
  }

  let lastCouponDate = resolveLastCouponFromCashflows(
    cashflowDates,
    settlementDate,
  );
  if (!lastCouponDate && input.lastCouponFallback?.trim()) {
    lastCouponDate = input.lastCouponFallback.trim().split("T")[0]!;
  }
  if (!lastCouponDate && isin) {
    lastCouponDate = await getLastCouponDateFromReferenceData(
      isin,
      settlementDateFromYmd(settlementDate),
    );
  }

  const shut = resolveShutPeriod({
    RECORD_DATE: recordDate,
    NEXT_COUPON_DATE: nextCouponDate,
    SETTLEMENT_DATE: settlementDate,
    LAST_COUPON_DATE: lastCouponDate ?? undefined,
  });

  return {
    isin,
    settlementDate,
    yield: ytm,
    underShut,
    recordDate,
    lastCouponDate,
    nextCouponDate,
    dateFormat: DERIDATA_CASHFLOW_DATE_FORMAT,
    cashflowDates,
    deriDataCashflowShutFlag:
      typeof input.response.cashflow_shut_flag === "boolean"
        ? input.response.cashflow_shut_flag
        : null,
    accrualDays: shut.accrualDays,
    isUnderShutPeriod: shut.isUnderShutPeriod,
  };
}

/** Maps Phase1 shut/accrual result into autofill response / Phase2 input fields. */
export function toAutofillShutFields(
  shutAccrual: AccrualDaysFromDailyCashflowResult,
) {
  return {
    cashflowShutFlag: shutAccrual.isUnderShutPeriod,
    accruedDays: shutAccrual.accrualDays,
    isUnderShutPeriod: shutAccrual.isUnderShutPeriod,
    periodStatus: shutAccrual.isUnderShutPeriod ? "Shut Period" : "Normal",
    recordDate: shutAccrual.recordDate,
    lastCouponDate: shutAccrual.lastCouponDate,
    nextCouponDate: shutAccrual.nextCouponDate,
    recordDays: (() => {
      const from = new Date(`${shutAccrual.recordDate}T00:00:00.000Z`);
      const to = new Date(`${shutAccrual.nextCouponDate}T00:00:00.000Z`);
      const days = Math.round((to.getTime() - from.getTime()) / 86_400_000);
      return Number.isFinite(days) && days >= 0 ? days : null;
    })(),
  };
}

/**
 * Fetches DeriData daily cashflows for an ISIN, extracts record / coupon dates,
 * then computes accrual days and whether settlement is under shut period.
 *
 * Phase-1 DeriData response is cached in Redis (isin + settlement + shut probe).
 * Callers that need live pricing must still run a separate Phase-2 calculator call.
 *
 * Uses the same shut/accrual rules as `resolveShutPeriod`.
 */
export async function resolveAccrualDaysFromDailyCashflow(
  input: AccrualDaysFromDailyCashflowInput,
): Promise<AccrualDaysFromDailyCashflowResult> {
  const isin = input.isin.trim().toUpperCase();
  const settlementDate = input.settlementDate.trim().split("T")[0]!;
  const ytm =
    input.yield != null && Number.isFinite(input.yield) ? input.yield : 10.5;
  const underShut = input.underShut ?? true;
  const quantity =
    input.quantity != null && input.quantity > 0 ? input.quantity : 1;
  const faceValue = await resolveFaceValue(isin, input.faceValue);
  const cacheKey = phase1CashflowCacheKey(isin, settlementDate, underShut);

  let deriDataResponse = await getCachedPhase1Response(cacheKey);
  let fromCache = deriDataResponse != null;

  if (!deriDataResponse) {
    deriDataResponse = await calculateYieldToPrice({
      isin,
      valueDate: settlementDate,
      faceValue,
      quantity,
      ytm,
      cashflowShutFlag: underShut,
    });
    fromCache = false;
    await setCachedPhase1Response(cacheKey, deriDataResponse);
  }

  const resolved = await resolveAccrualDaysFromDeriDataResponse({
    isin,
    settlementDate,
    response: deriDataResponse,
    underShut,
    yield: ytm,
  });

  return {
    ...resolved,
    deriDataResponse,
    fromCache,
  };
}
