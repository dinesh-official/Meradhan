import {
  accruedInterest,
  DEFAULT_BOND_MARKET_HOLIDAYS,
  firstWorkingDayAfter,
  getLastCouponDateFromReferenceData,
  getLastNextCouponDateBasedOnSettlementDate,
  getNextCouponDate,
  toISTISODate,
} from "@services/order/order-pricing-helper";
import axios from "axios";
import moment from "moment";

const CALC_API_URL = "https://calc.meradhan.co/api/calculate";

export type CalcApiResponse = {
  accrued_days: number;
  cf_count: number;
  cf_rows: Array<{
    date: string;
    days: number;
    interest: string;
    num: number;
    principal: string;
    total: string;
    total_raw: number;
  }>;
  final_price: string;
  final_yield: string;
  final_yield_raw: number;
  period_status: string;
  principal_amount: string;
  quantity: string;
  running_total: string;
  settle_dt: string;
  settlement_amount: string;
  stamp_duty: string;
  total_ai: string;
  total_consideration: string;
};

export type InterestMode =
  | "MONTHLY"
  | "QUARTERLY"
  | "HALF_YEARLY"
  | "YEARLY"
  | "ON_MATURITY"
  | "UNKNOWN";

export function paymentFrequencyToDbEnum(
  input: string | null | undefined,
): InterestMode {
  const v = String(input ?? "")
    .trim()
    .toLowerCase();
  if (v === "monthly") return "MONTHLY";
  if (v === "quarterly") return "QUARTERLY";
  if (v === "semi-annual" || v === "semi annual" || v === "semiannual") {
    return "HALF_YEARLY";
  }
  if (v === "annual" || v === "yearly") return "YEARLY";
  if (v === "on maturity" || v === "on-maturity" || v === "maturity") {
    return "ON_MATURITY";
  }
  return "UNKNOWN";
}

export function toYyyyMmDd(
  input: string | number | Date | null | undefined,
): string | undefined {
  if (input == null) return undefined;
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export function parseCalcMoneyString(
  s: string | null | undefined,
): number | null {
  if (s == null || !String(s).trim()) return null;
  const n = Number(String(s).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function parseInterestPaymentDatesString(
  raw: string | null | undefined,
): Date[] {
  if (!raw?.trim()) return [];
  const formats = [
    "DD-MMM-YYYY",
    "DD-MMM-YY",
    "YYYY-MM-DD",
    "DD-MM-YYYY",
    "DD/MM/YYYY",
  ];
  const out: Date[] = [];
  for (const part of raw.split(/[,;\n\r|]+/)) {
    const s = part.trim();
    if (!s) continue;
    const m = moment(s, formats, true);
    if (m.isValid()) out.push(m.toDate());
  }
  return out;
}

export function mapNatureOfInstrument(
  raw: string | null | undefined,
): "SECURED" | "UNSECURED" | "UNKNOWN" | null {
  const s = String(raw ?? "")
    .trim()
    .toUpperCase();
  if (!s) return null;
  if (s.includes("UNSECURED")) return "UNSECURED";
  if (s.includes("SECURED")) return "SECURED";
  if (s === "SECURED" || s === "UNSECURED") return s;
  return "UNKNOWN";
}

function toCalcPaymentFrequency(raw: string | null | undefined): string {
  if (!raw?.trim()) return "Monthly";
  const u = raw.trim().toUpperCase().replace(/[\s-]+/g, "_");
  if (u === "MONTHLY") return "Monthly";
  if (u === "QUARTERLY") return "Quarterly";
  if (u === "HALF_YEARLY" || u === "SEMI_ANNUAL") return "Semi-Annual";
  if (u === "YEARLY") return "Annual";
  if (u === "ON_MATURITY") return "On Maturity";
  const lower = raw.trim().toLowerCase();
  if (lower.includes("quarter")) return "Quarterly";
  if (lower.includes("semi") || lower.includes("half")) return "Semi-Annual";
  if (lower.includes("month")) return "Monthly";
  if (lower.includes("year") || lower.includes("annual")) return "Annual";
  if (lower.includes("maturity")) return "On Maturity";
  return "Monthly";
}

function toCalcDayConvention(
  raw: string | null | undefined,
): "Actual/Actual" | "Actual/365" {
  if (!raw?.trim()) return "Actual/Actual";
  const u = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (u.includes("ACT/365") || u.includes("ACTUAL/365") || u === "A/365") {
    return "Actual/365";
  }
  return "Actual/Actual";
}

function toCalcBondType(raw: string | null | undefined): "Bullet" | "Amortizing" {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (
    v === "amortizing" ||
    v === "amortising" ||
    v === "amortized" ||
    v.includes("amort")
  ) {
    return "Amortizing";
  }
  return "Bullet";
}

function formatCalcFaceValue(faceValue: number): string {
  return Number.isFinite(faceValue) ? faceValue.toFixed(2) : "10000.00";
}

function formatCalcCouponRate(couponRate: number): string {
  return Number.isFinite(couponRate) ? couponRate.toFixed(4) : "0.0000";
}

export function collectAllCouponDatesYmd(
  couponRows: Array<{
    dueDate?: Date | null;
    dueDateIst?: Date | null;
    interestPaymentDates?: string | null;
  }>,
  cfRows: Array<{ date: string }> | undefined,
  existingBondDates: Date[] | undefined,
): string[] {
  const set = new Set<string>();
  const add = (d: Date | string | null | undefined) => {
    const ymd = toYyyyMmDd(d);
    if (ymd) set.add(ymd);
  };
  for (const row of couponRows) {
    add(row.dueDateIst);
    add(row.dueDate);
    for (const d of parseInterestPaymentDatesString(row.interestPaymentDates)) {
      add(d);
    }
  }
  for (const row of cfRows ?? []) {
    if (row.date?.trim()) add(row.date.trim());
  }
  for (const d of existingBondDates ?? []) {
    add(d);
  }
  return [...set].sort();
}

function ymdToUtcNoon(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
}

function defaultT1IstSettlementYmd(): string {
  const holidays = new Set(DEFAULT_BOND_MARKET_HOLIDAYS);
  return toYyyyMmDd(firstWorkingDayAfter(new Date(), holidays))!;
}

export type AutoUpdateAutofillInput = {
  quantity?: number;
  settlementDate?: string;
  pricingYield?: number;
};

type BondRowForCalc = {
  buyYield?: number | null;
  yield?: number | null;
};

export function resolveAutoUpdateCalcInputs(
  bondRow: BondRowForCalc | null | undefined,
  overrides?: AutoUpdateAutofillInput,
): {
  quantity: number;
  settlementDateYmd: string;
  pricingYield: number | undefined;
  pricingYieldOverride: number | undefined;
} {
  const quantityRaw =
    overrides?.quantity != null && Number(overrides.quantity) > 0
      ? Number(overrides.quantity)
      : 1;
  const quantity =
    Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1;

  let settlementDateYmd: string;
  if (
    overrides?.settlementDate?.trim() &&
    /^\d{4}-\d{2}-\d{2}$/.test(overrides.settlementDate.trim())
  ) {
    settlementDateYmd = overrides.settlementDate.trim();
  } else {
    settlementDateYmd = defaultT1IstSettlementYmd();
  }

  const pricingYieldOverride =
    overrides?.pricingYield != null && Number.isFinite(overrides.pricingYield)
      ? overrides.pricingYield
      : undefined;

  const pricingYield =
    pricingYieldOverride != null
      ? pricingYieldOverride
      : bondRow?.buyYield != null && Number.isFinite(bondRow.buyYield)
        ? bondRow.buyYield
        : bondRow?.yield != null && Number.isFinite(bondRow.yield)
          ? bondRow.yield
          : undefined;

  return {
    quantity,
    settlementDateYmd,
    pricingYield,
    pricingYieldOverride,
  };
}

export type BondReferenceRow = {
  couponRate: number | null;
  faceValue: number | null;
  interestPaymentFrequency: string | null;
  dayConvention: string | null;
  bondType: string | null;
  issueDateIst: Date | null;
  maturityDateIst: Date | null;
  maturityDate: Date | null;
  issuerName: string | null;
  natureOfInstrument: string | null;
};

export type BondDataRow = {
  bondName: string | null;
  creditRating: string | null;
  natureOfInstrument: string | null;
  faceValue: number | null;
  couponRate: number | null;
  interestPaymentFrequency: string | null;
  dayConvention: string | null;
  bondType: string | null;
  dateOfAllotment: Date | null;
  maturityDate: Date | null;
  buyYield: number | null;
  yield: number | null;
  seniority: string | null;
  redemptionType: string | null;
  taxStatus: string | null;
  isListed: string | null;
  couponType: string | null;
  categories: string[];
  allCouponDates: Date[];
};

export async function buildCalcPayloadAndContext(
  isin: string,
  bond: BondReferenceRow | null,
  bondData: BondDataRow | null,
  couponRows: Array<{
    dueDate?: Date | null;
    dueDateIst?: Date | null;
    interestPaymentDates?: string | null;
  }>,
  resolved: ReturnType<typeof resolveAutoUpdateCalcInputs>,
) {
  const settlementDateObj = ymdToUtcNoon(resolved.settlementDateYmd);
  const couponDate = await getLastNextCouponDateBasedOnSettlementDate(
    isin,
    settlementDateObj,
  );
  const lastCouponDate = await getLastCouponDateFromReferenceData(
    isin,
    settlementDateObj,
  );
  const nextCouponDate = await getNextCouponDate(isin, settlementDateObj);

  const pricing = accruedInterest({
    couponRate: bond?.couponRate || 0,
    faceValue: bond?.faceValue || 0,
    lastCouponDate: new Date(lastCouponDate!),
    nextCouponDate: new Date(nextCouponDate!),
    quantity: resolved.quantity,
    recordDays: couponDate.recordDays || 0,
    settlementDate: settlementDateObj,
  });

  const faceValue = Number(bond?.faceValue ?? bondData?.faceValue ?? 10000);
  const couponRate = Number(bond?.couponRate ?? bondData?.couponRate ?? 0);
  const bondType = toCalcBondType(bondData?.bondType ?? bond?.bondType);
  const datedDate =
    bond?.issueDateIst instanceof Date &&
      !Number.isNaN(bond.issueDateIst.getTime())
      ? toISTISODate(bond.issueDateIst)
      : toYyyyMmDd(bondData?.dateOfAllotment ?? bond?.issueDateIst) ?? "";
  const maturityDate =
    bond?.maturityDateIst instanceof Date &&
      !Number.isNaN(bond.maturityDateIst.getTime())
      ? toISTISODate(bond.maturityDateIst)
      : toYyyyMmDd(bondData?.maturityDate ?? bond?.maturityDateIst) ?? "";

  const pricingYieldStr =
    resolved.pricingYield != null ? String(resolved.pricingYield) : "0";

  const payload = {
    ISIN: isin,
    Face_Value: formatCalcFaceValue(faceValue),
    Coupon_Rate_Pct: formatCalcCouponRate(couponRate),
    Payment_Frequency: toCalcPaymentFrequency(
      bond?.interestPaymentFrequency ?? bondData?.interestPaymentFrequency,
    ),
    Quantity: String(resolved.quantity),
    Settlement_Date: resolved.settlementDateYmd,
    Dated_Date: datedDate,
    Last_IP_Date: lastCouponDate ?? "",
    Next_IP_Date: nextCouponDate ?? "",
    Maturity_Date: maturityDate,
    Period_Status: pricing.isUnderShutPeriod ? "Shut Period" : "Normal",
    Input_Type: "Calculate from Yield",
    Pricing_Input: pricingYieldStr,
    Is_End_Of_Month_Bond: "No",
    Price_Rounding_Decimals: "4",
    Stamp_Duty: "0",
    Day_Convention: toCalcDayConvention(
      bond?.dayConvention ?? bondData?.dayConvention,
    ),
    Bond_Type: bondType,
    amort_schedule: bondType === "Amortizing" ? "" : "",
  };

  const couponPayRow = couponRows[0] ?? null;
  const dueDateYmd =
    couponPayRow?.dueDateIst instanceof Date &&
      !Number.isNaN(couponPayRow.dueDateIst.getTime())
      ? toYyyyMmDd(couponPayRow.dueDateIst)
      : null;

  return {
    payload,
    pricing,
    couponDate,
    dueDateYmd,
    bondType,
  };
}

export async function postToCalcApi(
  payload: Record<string, string>,
): Promise<CalcApiResponse> {
  console.log(JSON.stringify(payload, null, 2));
  const response = await axios.post<CalcApiResponse>(CALC_API_URL, payload);
  return response.data;
}
