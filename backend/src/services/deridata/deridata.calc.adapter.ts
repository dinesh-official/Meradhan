import type { CalcApiResponse } from "@resource/crm/bonds/bond_auto_update_autofill.calc";
import type { ExternalCalcResponse } from "@resource/bonds/bond_clac";
import { calculateStampDuty } from "@services/order/stamp-duty";
import moment from "moment";
import type {
  DeriDataCalcContext,
  DeriDataCalculatorResponse,
} from "./deridata.types";

export function parseDeriDataMoney(
  s: string | null | undefined,
): number | null {
  if (s == null || !String(s).trim()) return null;
  const n = Number(String(s).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

export function parseDeriDataRecordDateYmd(
  raw: string | null | undefined,
): string | null {
  if (!raw?.trim()) return null;
  const m = moment(raw.trim(), ["DD-MMM-YYYY", "DD-MMM-YY"], true);
  return m.isValid() ? m.format("YYYY-MM-DD") : null;
}

function formatMoney(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return "0.00";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function mapCashflowsToCfRows(
  cashflows: DeriDataCalculatorResponse["cashflows"],
): CalcApiResponse["cf_rows"] {
  return (cashflows ?? []).map((row, index) => ({
    date: row.cash_flow_dates ?? "",
    days: 0,
    interest: row.coupon_cash_flow ?? "-",
    num: index + 1,
    principal: row.principal_cash_flow ?? "-",
    total: row.total_cash_flow ?? "-",
    total_raw: parseDeriDataMoney(row.total_cash_flow) ?? 0,
  }));
}

type LegacyCalcBase = {
  quantity: number;
  settlementDateYmd: string;
  accruedDays?: number | null;
  periodStatus?: string | null;
  ytm?: number | null;
  cleanPrice?: number | null;
  totalAccruedInterest?: number | null;
  accruedInterestPerUnit?: number | null;
  manualAccruedInterest?: boolean;
  principalAmount?: number | null;
  totalConsideration?: number | null;
  settlementAmount?: number | null;
  stampDuty?: number | null;
};

export function parseDeriDataPricingAmounts(
  response: DeriDataCalculatorResponse,
): {
  cleanPrice: number | null;
  accruedInterestPerUnit: number | null;
  principalAmount: number | null;
  totalAccruedInterest: number | null;
  totalConsideration: number | null;
  stampDuty: number | null;
  settlementAmount: number | null;
} {
  const cleanPrice = parseDeriDataMoney(response.summary.clean_price);
  const accruedInterestPerUnit = parseDeriDataMoney(response.summary.accrued_int_top);
  const principalAmount = parseDeriDataMoney(response.summary.principal);
  const totalAccruedInterest = parseDeriDataMoney(response.summary.accrued_int_bottom);
  const totalConsideration = parseDeriDataMoney(response.summary.total_consideration);
  const stampDutyFromApi = parseDeriDataMoney(response.summary.stamp_duty);
  const settlementFromApi = parseDeriDataMoney(response.summary.settlement_amount);
  const stampDuty =
    stampDutyFromApi != null && Number.isFinite(stampDutyFromApi)
      ? stampDutyFromApi
      : settlementFromApi != null &&
          totalConsideration != null &&
          Number.isFinite(settlementFromApi) &&
          Number.isFinite(totalConsideration)
        ? settlementFromApi - totalConsideration
        : totalConsideration != null && Number.isFinite(totalConsideration)
          ? calculateStampDuty(totalConsideration)
          : null;
  const settlementAmount =
    settlementFromApi != null && Number.isFinite(settlementFromApi)
      ? settlementFromApi
      : totalConsideration != null &&
          stampDuty != null &&
          Number.isFinite(totalConsideration) &&
          Number.isFinite(stampDuty)
        ? totalConsideration + stampDuty
        : null;

  return {
    cleanPrice,
    accruedInterestPerUnit,
    principalAmount,
    totalAccruedInterest,
    totalConsideration,
    stampDuty,
    settlementAmount,
  };
}

function buildLegacyCalcResponse(
  response: DeriDataCalculatorResponse,
  ctx: LegacyCalcBase,
): CalcApiResponse & ExternalCalcResponse {
  const principalFromDeri = parseDeriDataMoney(response.summary.principal);
  const totalConsiderationFromDeri = parseDeriDataMoney(
    response.summary.total_consideration,
  );
  const principal =
    ctx.principalAmount != null && Number.isFinite(ctx.principalAmount)
      ? ctx.principalAmount
      : principalFromDeri;
  const totalConsideration =
    ctx.totalConsideration != null && Number.isFinite(ctx.totalConsideration)
      ? ctx.totalConsideration
      : totalConsiderationFromDeri;
  const totalAccruedInterest =
    ctx.totalAccruedInterest != null && Number.isFinite(ctx.totalAccruedInterest)
      ? ctx.totalAccruedInterest
      : ctx.manualAccruedInterest
        ? 0
        : parseDeriDataMoney(response.summary.accrued_int_bottom);
  const stampDuty =
    ctx.stampDuty != null && Number.isFinite(ctx.stampDuty)
      ? ctx.stampDuty
      : totalConsideration != null && Number.isFinite(totalConsideration)
        ? calculateStampDuty(totalConsideration)
        : 0;
  const settlementAmount =
    ctx.settlementAmount != null && Number.isFinite(ctx.settlementAmount)
      ? ctx.settlementAmount
      : totalConsideration != null && Number.isFinite(totalConsideration)
        ? totalConsideration + stampDuty
        : null;

  const finalYieldRaw =
    ctx.ytm != null && Number.isFinite(ctx.ytm)
      ? ctx.ytm
      : parseDeriDataMoney(response.summary.xirr) ?? 0;

  const cfRows = mapCashflowsToCfRows(response.cashflows);

  return {
    accrued_days: ctx.accruedDays ?? 0,
    cf_count: cfRows.length,
    cf_rows: cfRows,
    final_price: response.summary.clean_price ?? "0",
    final_yield: String(finalYieldRaw),
    final_yield_raw: finalYieldRaw,
    period_status: ctx.periodStatus ?? "Normal",
    principal_amount:
      principal != null && Number.isFinite(principal)
        ? formatMoney(principal)
        : response.summary.principal ?? "0",
    quantity: String(ctx.quantity),
    running_total:
      totalConsideration != null && Number.isFinite(totalConsideration)
        ? formatMoney(totalConsideration)
        : response.summary.total_consideration ?? "0",
    settle_dt: ctx.settlementDateYmd,
    settlement_amount: formatMoney(settlementAmount),
    stamp_duty: String(stampDuty),
    total_ai:
      totalAccruedInterest != null && Number.isFinite(totalAccruedInterest)
        ? formatMoney(totalAccruedInterest)
        : response.summary.accrued_int_bottom ?? "0",
    total_consideration:
      totalConsideration != null && Number.isFinite(totalConsideration)
        ? formatMoney(totalConsideration)
        : response.summary.total_consideration ?? "0",
  };
}

export function mapDeriDataToCalcApiResponse(
  response: DeriDataCalculatorResponse,
  ctx: DeriDataCalcContext,
): CalcApiResponse {
  return buildLegacyCalcResponse(response, ctx);
}

export function mapDeriDataToExternalCalcResponse(
  response: DeriDataCalculatorResponse,
  ctx: DeriDataCalcContext & { cleanPrice?: number | null },
): ExternalCalcResponse {
  return buildLegacyCalcResponse(response, ctx);
}

export function mapDeriDataToCalcPayload(
  response: DeriDataCalculatorResponse,
  ctx: DeriDataCalcContext,
): Record<string, unknown> {
  const legacy = buildLegacyCalcResponse(response, ctx);
  return {
    ...legacy,
    deridata: response,
    record_date: response.record_date ?? null,
    cashflow_shut_flag: response.cashflow_shut_flag ?? null,
    shut_period_message: response.shut_period_message ?? null,
  };
}
