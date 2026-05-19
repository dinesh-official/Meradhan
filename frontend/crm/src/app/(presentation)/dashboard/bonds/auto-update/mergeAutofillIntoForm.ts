import type { BondDealAutofillSuggestions } from "@root/apiGateway";
import { parseApiDateStringToLocalDate } from "../_utils/bondCalendarDates";
import type { BondFormData } from "../_utils/bondDetailsToFormData";
export const AUTOFILL_MERGE_KEYS = [
  "bondName",
  "creditRating",
  "allCouponDates",
  "natureOfInstrument",
  "maturityDate",
  "dateOfAllotment",
  "lastCouponDate",
  "nextCouponDate",
  "recordDate",
  "recordDays",
  "dayConvention",
  "interestPaymentFrequency",
  "interestPaymentMode",
  "faceValue",
  "couponRate",
  "buyYield",
  "yield",
  "sellPrice",
] as const;

export type AutofillMergeKey = (typeof AUTOFILL_MERGE_KEYS)[number];

export function defaultIncludeMap(): Record<AutofillMergeKey, boolean> {
  return Object.fromEntries(
    AUTOFILL_MERGE_KEYS.map((k) => [k, true]),
  ) as Record<AutofillMergeKey, boolean>;
}

function ymdToDate(s: string | null | undefined): Date | undefined {
  if (!s?.trim()) return undefined;
  return parseApiDateStringToLocalDate(s.trim());
}

function ymdListToDates(ymds: string[] | null | undefined): Date[] {
  if (!ymds?.length) return [];
  return ymds
    .map((s) => parseApiDateStringToLocalDate(s.trim()))
    .filter((d) => !Number.isNaN(d.getTime()));
}

/**
 * Applies selected autofill suggestions onto a full bond form payload (typically current DB snapshot).
 */
export function mergeAutofillIntoForm(
  base: BondFormData,
  suggested: BondDealAutofillSuggestions,
  include: Record<AutofillMergeKey, boolean>,
): BondFormData {
  const out: BondFormData = { ...base };

  if (include.bondName && suggested.bondName?.trim()) {
    out.bondName = suggested.bondName.trim();
  }
  if (include.creditRating && suggested.creditRating?.trim()) {
    out.creditRating = suggested.creditRating.trim();
  }
  if (include.allCouponDates) {
    const dates = ymdListToDates(
      suggested.allCouponDates ?? suggested.allCouponDatesIst,
    );
    if (dates.length) out.allCouponDates = dates;
  }
  if (include.natureOfInstrument && suggested.natureOfInstrument) {
    out.natureOfInstrument =
      suggested.natureOfInstrument as BondFormData["natureOfInstrument"];
  }

  if (include.maturityDate) {
    const d = ymdToDate(suggested.maturityDate);
    if (d) out.maturityDate = d;
  }
  if (include.dateOfAllotment) {
    const d = ymdToDate(suggested.dateOfAllotment);
    if (d) out.dateOfAllotment = d;
  }
  if (include.lastCouponDate) {
    const d = ymdToDate(suggested.lastCouponDate);
    if (d) out.lastCouponDate = d;
  }
  if (include.nextCouponDate) {
    const d = ymdToDate(suggested.nextCouponDate);
    if (d) out.nextCouponDate = d;
  }
  if (include.recordDate) {
    const d = ymdToDate(suggested.recordDate);
    if (d) out.recordDate = d;
  }
  if (include.recordDays && suggested.recordDays != null && Number.isFinite(suggested.recordDays)) {
    out.recordDays = Math.round(suggested.recordDays);
  }
  if (include.dayConvention && suggested.dayConvention != null) {
    out.dayConvention = suggested.dayConvention;
  }
  if (include.interestPaymentFrequency && suggested.interestPaymentFrequency) {
    out.interestPaymentFrequency =
      suggested.interestPaymentFrequency as BondFormData["interestPaymentFrequency"];
  }
  if (include.interestPaymentMode && suggested.interestPaymentMode) {
    out.interestPaymentMode =
      suggested.interestPaymentMode as BondFormData["interestPaymentMode"];
  }
  if (include.faceValue && Number.isFinite(suggested.faceValue)) {
    out.faceValue = suggested.faceValue;
  }
  if (include.couponRate && Number.isFinite(suggested.couponRate)) {
    out.couponRate = suggested.couponRate;
  }
  if (include.buyYield && suggested.buyYield != null && Number.isFinite(suggested.buyYield)) {
    out.buyYield = suggested.buyYield;
  }
  if (include.yield && Number.isFinite(suggested.yield)) {
    out.yield = suggested.yield;
  }
  if (include.sellPrice && suggested.sellPrice != null && Number.isFinite(suggested.sellPrice)) {
    out.sellPrice = suggested.sellPrice;
  }

  return out;
}
