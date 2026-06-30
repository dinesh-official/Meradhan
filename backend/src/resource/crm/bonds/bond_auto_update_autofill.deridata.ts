import { deridataDateToIstIso } from "@modules/deridata/deridata.date";
import type { CalculatorInput, CalculatorResponse } from "@modules/deridata/deridata.api";
import type { DeridataResult } from "@modules/deridata/deridata.types";
import {
  mapSeniority,
  mapListed,
  mapTaxStatus,
} from "@modules/deridata/deridata.issue-detail.mapper";
import {
  parseCalcMoneyString,
  paymentFrequencyToDbEnum,
  mapNatureOfInstrument,
  resolveAutoUpdateCalcInputs,
  toYyyyMmDd,
  type AutoUpdateAutofillInput,
} from "./bond_auto_update_autofill.calc";
import type { BondDealAutofillResponse } from "./bond_auto_update_autofill.service";

/** Minimal shape of a `deridata_issue_detail` row used by the autofill mapper. */
export type DeridataIssueRow = {
  isin: string;
  issuerName?: string | null;
  couponFixed?: number | null;
  couponType?: string | null;
  couponFrequency?: string | null;
  faceValue?: number | null;
  recordDate?: number | null;
  maturity?: Date | null;
  allotmentDate?: Date | null;
  couponDate?: Date | null;
  security?: string | null;
  seniority?: string | null;
  taxFree?: string | null;
  listed?: string | null;
  redemptionType?: string | null;
  currentRating?: string[] | null;
  dayConvention?: string | null;
  issuerIndustry?: string | null;
  tags?: string[] | null;
};

/** First Deridata rating with the agency prefix stripped: "CARE: AA+" → "AA+". */
export function parseDeridataCreditRating(ratings?: string[] | null): string | null {
  const first = (ratings ?? []).map((r) => String(r ?? "").trim()).find(Boolean);
  if (!first) return null;
  const idx = first.indexOf(":");
  const grade = (idx >= 0 ? first.slice(idx + 1) : first).trim();
  return grade || null;
}

/**
 * Derive MeraDhan listing categories from Deridata `issuer_industry` + `tags`.
 * Only the cleanly-derivable slugs are returned; `latest-release` is editorial
 * (not in Deridata) so it is never set here.
 */
export function deriveDeridataCategories(issue: DeridataIssueRow): string[] {
  const cats = new Set<string>();
  const industry = (issue.issuerIndustry ?? "").toLowerCase();
  const tags = (issue.tags ?? []).map((t) => String(t ?? "").toUpperCase());
  const seniority = (issue.seniority ?? "").toLowerCase();
  if (industry.includes("nbfc")) cats.add("nbfc");
  if (industry.includes("bank")) cats.add("banks");
  if (industry.includes("psu")) cats.add("psu");
  if ((issue.taxFree ?? "").toLowerCase() === "yes" || tags.includes("TAXFREE")) cats.add("tax-free");
  if (tags.includes("ZERO COUPON")) cats.add("zero-coupon");
  if (tags.some((t) => t.includes("PERPETUAL")) || seniority.includes("perpetual")) cats.add("perpetual");
  return [...cats];
}

type BondDataRow = {
  bondName?: string | null;
  creditRating?: string | null;
  buyYield?: number | null;
  yield?: number | null;
  bondType?: string | null;
  seniority?: string | null;
  redemptionType?: string | null;
  taxStatus?: string | null;
  isListed?: string | null;
  couponType?: string | null;
  categories?: string[] | null;
  dayConvention?: string | null;
  faceValue?: number | null;
} | null;

type DeridataCalcClient = {
  calculate(input: CalculatorInput): Promise<DeridataResult<CalculatorResponse>>;
};

/** `DD-MMM-YYYY` → `YYYY-MM-DD` (null for null conventions / unparseable). */
export function deridataDateToYmd(s: string | null | undefined): string | null {
  const iso = deridataDateToIstIso(s);
  return iso ? iso.slice(0, 10) : null;
}

const round = (n: number | null, dp: number): number | null =>
  n != null && Number.isFinite(n) ? Number(n.toFixed(dp)) : null;

/** Build the Deridata Calculator request for Yield-to-Price autofill. amount is in Crores (₹). */
export function buildDeridataCalcInput(
  isin: string,
  resolved: ReturnType<typeof resolveAutoUpdateCalcInputs>,
  faceValue: number,
): CalculatorInput {
  const amountCr = (resolved.quantity * faceValue) / 1e7;
  return {
    isin,
    value_date: resolved.settlementDateYmd,
    amount: amountCr > 0 ? amountCr : faceValue / 1e7,
    yield_to_price: true,
    selected_yield: "ytm",
    ytm: resolved.pricingYield ?? 0,
    cashflow_shut_flag: false,
  };
}

export function mapDeridataAutofill(args: {
  isin: string;
  resolved: ReturnType<typeof resolveAutoUpdateCalcInputs>;
  issue: DeridataIssueRow;
  bondData: BondDataRow;
  calc: CalculatorResponse;
}): BondDealAutofillResponse {
  const { isin, resolved, issue, calc } = args;
  const summary = (calc.summary ?? {}) as Record<string, unknown>;

  const finalPrice = parseCalcMoneyString(summary.clean_price as string | null | undefined);
  const finalYieldRaw = resolved.pricingYield ?? 0;
  const accruedInterest = parseCalcMoneyString(summary.accrued_int_bottom as string | null | undefined);
  const principalAmount = parseCalcMoneyString(summary.principal as string | null | undefined);
  const totalConsideration = parseCalcMoneyString(summary.total_consideration as string | null | undefined);
  const settlementAmount = totalConsideration;

  const isUnderShutPeriod =
    Boolean(summary.cashflow_shut_flag) || /shut/i.test(String(summary.shut_period_message ?? ""));

  // Future coupon/redemption dates that actually carry a cashflow (skip "-" / null rows).
  const allCouponDates = [
    ...new Set(
      (calc.cashflows ?? [])
        .filter((cf) => parseCalcMoneyString((cf as { total_cash_flow?: string | null }).total_cash_flow) != null)
        .map((cf) => deridataDateToYmd((cf as { cash_flow_dates?: string | null }).cash_flow_dates))
        .filter((d): d is string => Boolean(d)),
    ),
  ].sort();

  // Derive last-coupon date + accrued days from the full cashflow schedule:
  // Deridata returns past coupon rows (marked "-") too, so the most recent
  // scheduled date strictly before the settlement date is the last coupon.
  const settlementYmd = resolved.settlementDateYmd;
  const scheduleDates = [
    ...new Set(
      (calc.cashflows ?? [])
        .map((cf) => deridataDateToYmd((cf as { cash_flow_dates?: string | null }).cash_flow_dates))
        .filter((d): d is string => Boolean(d)),
    ),
  ].sort();
  const pastCouponDates = scheduleDates.filter((d) => d < settlementYmd);
  const lastCouponDate = pastCouponDates.length ? pastCouponDates[pastCouponDates.length - 1]! : "";
  const accruedInterestDays = lastCouponDate
    ? Math.max(0, Math.round((Date.parse(settlementYmd) - Date.parse(lastCouponDate)) / 86_400_000))
    : null;

  const faceValue = Number(issue.faceValue ?? 0);
  const couponRate = round(Number(issue.couponFixed ?? 0), 2) ?? 0;
  const freqEnum = paymentFrequencyToDbEnum(issue.couponFrequency);

  const nextCouponDate =
    toYyyyMmDd(issue.couponDate ?? undefined) ?? allCouponDates[0] ?? "";

  const suggested: BondDealAutofillResponse["suggested"] = {
    bondName: issue.issuerName?.trim() || null,
    creditRating: parseDeridataCreditRating(issue.currentRating) ?? "UnRated",
    allCouponDates,
    allCouponDatesIst: allCouponDates,
    natureOfInstrument: mapNatureOfInstrument(issue.security),
    maturityDate: toYyyyMmDd(issue.maturity ?? undefined) ?? null,
    dateOfAllotment: toYyyyMmDd(issue.allotmentDate ?? undefined) ?? null,
    lastCouponDate, // derived from the calculator cashflow schedule
    nextCouponDate,
    recordDate: deridataDateToYmd(summary.record_date as string | null | undefined),
    recordDays: issue.recordDate ?? null,
    accruedInterestDays, // derived: settlement date − last coupon date
    dueDate: null,
    // Hard field: no Deridata source — intentionally left blank.
    dayConvention: null,
    interestPaymentFrequency: freqEnum,
    interestPaymentMode: freqEnum,
    faceValue,
    couponRate,
    // buyYield is left blank (not Deridata reference data). `yield` echoes the
    // operator's "Custom yield %" (resolved.pricingYield) that drives the calculator.
    buyYield: null,
    yield: round(finalYieldRaw, 2) ?? 0,
    sellPrice: round(finalPrice, 4),
    settlementAmount,
    accruedInterest,
    principalAmount,
    totalConsideration,
    isUnderShutPeriod,
    // Hard field: no Deridata source — intentionally left blank.
    bondType: null,
    seniority: mapSeniority(issue.seniority) ?? null,
    redemptionType: issue.redemptionType ?? null,
    taxStatus: mapTaxStatus(issue.taxFree) ?? null,
    isListed: mapListed(issue.listed).isListed,
    couponType: issue.couponType ?? null,
    categories: deriveDeridataCategories(issue),
  };

  return {
    isin,
    quantity: resolved.quantity,
    sources: {
      usedReferenceMetadata: false,
      usedCouponSchedule: (calc.cashflows?.length ?? 0) > 0,
      yieldSource: resolved.pricingYieldOverride != null ? "override" : "bonds",
      usedProviderPrice: false,
      usedProviderQuantity: false,
      usedProviderSettlementDate: false,
      usedCalcBondApi: false,
      usedDeridata: true,
    },
    suggested,
    pricing: {
      finalPrice,
      finalYieldRaw: Number.isFinite(finalYieldRaw) ? finalYieldRaw : 0,
      settlementAmount,
      totalAccruedInterest: accruedInterest,
      principalAmount,
      totalConsideration,
      calc: { ...summary, cashflows: calc.cashflows ?? [] },
    },
    margin: {},
  };
}

/** Orchestrate: call the Deridata calculator, then map into the autofill response. */
export async function buildDeridataAutofill(
  isin: string,
  input: AutoUpdateAutofillInput,
  api: DeridataCalcClient,
  issue: DeridataIssueRow,
  bondData: BondDataRow,
): Promise<BondDealAutofillResponse> {
  const resolved = resolveAutoUpdateCalcInputs(bondData, input);
  const faceValue = Number(issue.faceValue ?? bondData?.faceValue ?? 100000);
  const result = await api.calculate(buildDeridataCalcInput(isin, resolved, faceValue));
  if (!result.ok) {
    throw new Error(`Deridata calculator failed for ${isin}: ${result.error}`);
  }
  return mapDeridataAutofill({ isin, resolved, issue, bondData, calc: result.data });
}
