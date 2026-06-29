import { type DataBaseSchema } from "@core/database/database";
import type {
  CalculatorResponse,
  EbpResponse,
  SecondaryTradesResponse,
  SecurityCovenant,
  DocumentsResponse,
} from "./deridata.api";
import { deridataDateToIstDateOnly } from "./deridata.date";

const pickStr = (v: unknown): string | undefined => {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (!s || /^(n\/?a|-)$/i.test(s)) return undefined;
  return s;
};
const pickNum = (v: unknown): number | undefined => {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
};
const pickInt = (v: unknown): number | undefined => {
  const n = pickNum(v);
  return n == null ? undefined : Math.trunc(n);
};
const pickBool = (v: unknown): boolean | undefined => (typeof v === "boolean" ? v : undefined);

export type CalculatorInputMeta = {
  valueDate?: string;
  mode?: string;
  selectedYield?: string;
  inputYield?: number | null;
  inputPrice?: number | null;
};

export function mapCalculator(
  isin: string,
  meta: CalculatorInputMeta,
  res: CalculatorResponse,
): {
  row: DataBaseSchema.DeridataCalculatorCreateInput;
  cashflows: DataBaseSchema.DeridataCashflowCreateInput[];
} {
  const s = (res.summary ?? {}) as Record<string, unknown>;
  const row: DataBaseSchema.DeridataCalculatorCreateInput = {
    isin: isin.trim().toUpperCase(),
    valueDate: meta.valueDate,
    mode: meta.mode,
    selectedYield: meta.selectedYield,
    inputYield: meta.inputYield ?? undefined,
    inputPrice: meta.inputPrice ?? undefined,
    cleanPrice: pickStr(s.clean_price),
    accruedIntTop: pickStr(s.accrued_int_top),
    dirtyPrice: pickStr(s.dirty_price),
    principal: pickStr(s.principal),
    accruedIntBottom: pickStr(s.accrued_int_bottom),
    totalConsideration: pickStr(s.total_consideration),
    xirr: pickStr(s.xirr),
    cashflowShutFlag: pickBool(s.cashflow_shut_flag),
    shutPeriodMessage: pickStr(s.shut_period_message),
    recordDate: pickStr(s.record_date),
    raw: res as unknown as DataBaseSchema.DeridataCalculatorCreateInput["raw"],
    fetchedAt: new Date(),
  };
  const cashflows = (res.cashflows ?? []).map((c) => {
    const cf = c as Record<string, unknown>;
    return {
      cashFlowDate: pickStr(cf.cash_flow_dates),
      cashFlowDateIst: deridataDateToIstDateOnly(cf.cash_flow_dates as string | null | undefined),
      couponCashFlow: pickStr(cf.coupon_cash_flow),
      principalCashFlow: pickStr(cf.principal_cash_flow),
      totalCashFlow: pickStr(cf.total_cash_flow),
    };
  }) as DataBaseSchema.DeridataCashflowCreateInput[];
  return { row, cashflows };
}

export function mapEbp(res: EbpResponse): DataBaseSchema.DeridataEbpItemCreateInput[] {
  const isin = String(res.isin ?? "").trim().toUpperCase();
  return (res.ebp_items ?? []).map((raw) => {
    const it = raw as Record<string, unknown>;
    return {
      isin,
      allotmentDate: pickStr(it.allotment_date),
      issueSize: pickStr(it.issue_size),
      baseIssueSize: pickStr(it.base_issue_size),
      greenShoe: pickStr(it.green_shoe),
      reissuance: pickStr(it.reissuance),
      bidTotal: pickInt(it.bid_total),
      bidAnchor: pickInt(it.bid_anchor),
      bidQib: pickInt(it.bid_qib),
      bidNonQib: pickInt(it.bid_non_qib),
      bidCoverRatio: pickNum(it.bid_cover_ratio),
      allottedAmtTotal: pickStr(it.allotted_amt_total),
      allottedTotal: pickInt(it.allotted_total),
      wat: pickNum(it.wat),
      wap: pickNum(it.wap),
      cutOffYield: pickNum(it.cut_off_yield),
      cutOffPrice: pickNum(it.cut_off_price),
      wtAvgPrice: pickNum(it.wt_avg_price),
      wtAvgYield: pickNum(it.wt_avg_yield),
      spreadBps: pickNum(it.spread_bps),
      ebp: pickStr(it.ebp),
      fv: pickStr(it.fv),
      raw: it as DataBaseSchema.DeridataEbpItemCreateInput["raw"],
      fetchedAt: new Date(),
    };
  }) as DataBaseSchema.DeridataEbpItemCreateInput[];
}

export function mapSecondaryTrades(res: SecondaryTradesResponse): {
  row: DataBaseSchema.DeridataSecondaryTradeCreateInput;
  history: DataBaseSchema.DeridataTradeHistoryCreateInput[];
} {
  const isin = String(res.isin ?? "").trim().toUpperCase();
  const t = ((res.trades ?? [])[0] ?? {}) as Record<string, unknown>;
  const row: DataBaseSchema.DeridataSecondaryTradeCreateInput = {
    isin,
    wayPercentage: pickStr(t.way_percentage),
    cumulativeVolume: pickStr(t.cumulative_volume),
    avgDailyVolume: pickStr(t.avg_daily_volume),
    avgVolTrades: pickStr(t.avg_vol_trades),
    avgDailyTrades: pickStr(t.avg_daily_trades),
    lastTradeDate: pickStr(t.last_trade_date),
    spread: pickInt(t.spread),
    raw: res as unknown as DataBaseSchema.DeridataSecondaryTradeCreateInput["raw"],
    fetchedAt: new Date(),
  };
  const history = (res.trade_history ?? []).map((raw) => {
    const h = raw as Record<string, unknown>;
    return {
      tradeDate: pickStr(h.trade_date),
      tradeDateIst: deridataDateToIstDateOnly(h.trade_date as string | null | undefined),
      spread: pickInt(h.spread),
      volume: pickNum(h.volume),
      yield: pickNum(h.yield),
    };
  }) as DataBaseSchema.DeridataTradeHistoryCreateInput[];
  return { row, history };
}

export function mapSecurityCovenant(
  res: SecurityCovenant,
): DataBaseSchema.DeridataSecurityCovenantCreateInput {
  const fc = (res.financial_covenants ?? {}) as Record<string, unknown>;
  return {
    isin: String(res.isin ?? "").trim().toUpperCase(),
    stepUpCondition: pickStr(res.step_up_condition),
    stepDownCondition: pickStr(res.step_down_condition),
    securityCover: pickStr(res.security_cover),
    natureOfSecurity: pickStr(res.nature_of_security),
    creditEnhancement: pickStr(res.credit_enhancement),
    guarantee: pickStr(res.guarantee),
    guarantor: pickStr(res.guarantor),
    percentageOfGuarantee: pickStr(res.percentage_of_guarantee),
    covMinNw: pickStr(fc.min_nw),
    covCadRatio: pickStr(fc.cad_ratio),
    covMinPatEbitdaPbt: pickStr(fc.min_pat_ebitda_pbt),
    covDeRatio: pickStr(fc.de_ratio),
    covGnpaNnpaPar90: pickStr(fc.gnpa_nnpa_par90),
    covOther: pickStr(fc.other),
    covShareholdingAmt: pickStr(fc.shareholding_amt),
    financialCovenants: (res.financial_covenants ??
      undefined) as DataBaseSchema.DeridataSecurityCovenantCreateInput["financialCovenants"],
    raw: res as unknown as DataBaseSchema.DeridataSecurityCovenantCreateInput["raw"],
    fetchedAt: new Date(),
  };
}

export function mapDocuments(res: DocumentsResponse): {
  row: DataBaseSchema.DeridataDocumentCreateInput;
  pressReleases: DataBaseSchema.DeridataPressReleaseCreateInput[];
} {
  // im_link is a 1-hour pre-signed URL — intentionally NOT persisted.
  const { im_link: _dropped, ...rawNoLink } = (res ?? {}) as Record<string, unknown>;
  const row: DataBaseSchema.DeridataDocumentCreateInput = {
    isin: String(res.isin ?? "").trim().toUpperCase(),
    raw: rawNoLink as DataBaseSchema.DeridataDocumentCreateInput["raw"],
    fetchedAt: new Date(),
  };
  const pressReleases = (res.press_release_links ?? []).map((raw) => {
    const p = raw as Record<string, unknown>;
    return {
      agency: pickStr(p.agency),
      rating: pickStr(p.rating),
      outlook: pickStr(p.outlook),
      url: pickStr(p.url),
    };
  }) as DataBaseSchema.DeridataPressReleaseCreateInput[];
  return { row, pressReleases };
}
