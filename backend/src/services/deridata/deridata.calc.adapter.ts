import type { CalcApiResponse } from "@resource/crm/bonds/bond_auto_update_autofill.calc";
import type { ExternalCalcResponse } from "@resource/bonds/bond_clac";
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
};

function buildLegacyCalcResponse(
  response: DeriDataCalculatorResponse,
  ctx: LegacyCalcBase,
): CalcApiResponse & ExternalCalcResponse {
  // Pass DeriData summary through unchanged — do not add stamp duty or recompute amounts.
  const totalConsideration = parseDeriDataMoney(
    response.summary.total_consideration,
  );

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
    principal_amount: response.summary.principal ?? "0",
    quantity: String(ctx.quantity),
    running_total: response.summary.total_consideration ?? "0",
    settle_dt: ctx.settlementDateYmd,
    settlement_amount: formatMoney(totalConsideration),
    stamp_duty: "0",
    total_ai: response.summary.accrued_int_bottom ?? "0",
    total_consideration: response.summary.total_consideration ?? "0",
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
