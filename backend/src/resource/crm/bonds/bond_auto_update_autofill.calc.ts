import {
  accruedInterest,
  computeBondSettlement,
  resolveCashflowShutFlag,
  resolveCouponDatesForSettlement,
  settlementDateFromYmd,
  toISTISODate,
} from "@services/order/order-pricing-helper";
import moment from "moment";

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
    .toLowerCase()
    .replace(/_/g, " ");
  if (v === "monthly") return "MONTHLY";
  if (v === "quarterly") return "QUARTERLY";
  if (
    v === "semi-annual" ||
    v === "semi annual" ||
    v === "semiannual" ||
    v === "half yearly" ||
    v === "half-yearly"
  ) {
    return "HALF_YEARLY";
  }
  if (v === "annual" || v === "yearly") return "YEARLY";
  if (
    v === "on maturity" ||
    v === "on-maturity" ||
    v === "maturity"
  ) {
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

function defaultSettlementYmd(): string {
  return computeBondSettlement(new Date()).settlementDate;
}

export type AutoUpdateAutofillInput = {
  quantity?: number;
  settlementDate?: string;
  pricingYield?: number;
  cleanPrice?: number;
  pricingMode?: "ytm" | "cleanPrice";
};

type BondRowForCalc = {
  buyYield?: number | null;
  yield?: number | null;
  sellPrice?: number | null;
};

export function resolveAutoUpdateCalcInputs(
  bondRow: BondRowForCalc | null | undefined,
  overrides?: AutoUpdateAutofillInput,
): {
  quantity: number;
  settlementDateYmd: string;
  settlementDateOverridden: boolean;
  pricingMode: "ytm" | "cleanPrice";
  pricingYield: number | undefined;
  pricingYieldOverride: number | undefined;
  cleanPrice: number | undefined;
  cleanPriceOverride: number | undefined;
} {
  const quantityRaw =
    overrides?.quantity != null && Number(overrides.quantity) > 0
      ? Number(overrides.quantity)
      : 1;
  const quantity =
    Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1;

  const settlementOverrideRaw = overrides?.settlementDate?.trim();
  const settlementDateOverridden = Boolean(
    settlementOverrideRaw && /^\d{4}-\d{2}-\d{2}$/.test(settlementOverrideRaw),
  );
  const settlementDateYmd = settlementDateOverridden
    ? settlementOverrideRaw!
    : defaultSettlementYmd();

  const pricingYieldOverride =
    overrides?.pricingYield != null && Number.isFinite(overrides.pricingYield)
      ? overrides.pricingYield
      : undefined;
  const cleanPriceOverride =
    overrides?.cleanPrice != null && Number.isFinite(overrides.cleanPrice)
      ? overrides.cleanPrice
      : undefined;
  const pricingMode =
    overrides?.pricingMode === "cleanPrice" ? "cleanPrice" : "ytm";

  const pricingYield =
    pricingYieldOverride != null
      ? pricingYieldOverride
      : bondRow?.buyYield != null && Number.isFinite(bondRow.buyYield)
        ? bondRow.buyYield
        : bondRow?.yield != null && Number.isFinite(bondRow.yield)
          ? bondRow.yield
          : undefined;
  const cleanPrice =
    cleanPriceOverride != null
      ? cleanPriceOverride
      : bondRow?.sellPrice != null && Number.isFinite(bondRow.sellPrice)
        ? bondRow.sellPrice
        : undefined;

  return {
    quantity,
    settlementDateYmd,
    settlementDateOverridden,
    pricingMode,
    pricingYield,
    pricingYieldOverride,
    cleanPrice,
    cleanPriceOverride,
  };
}

export function pickYmd(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  for (const c of candidates) {
    const s = c?.trim();
    if (s && /^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  }
  return undefined;
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
  lastCouponDateIst?: Date | null;
  nextCouponDateIst?: Date | null;
  recordDays?: number | null;
};

export function recomputeAccruedPricing(input: {
  settlementDateYmd: string;
  faceValue: number;
  couponRate: number;
  quantity: number;
  lastCouponDate: string;
  nextCouponDate: string;
  recordDays: number;
  recordDateYmd?: string;
  maturityDateYmd?: string;
}) {
  const settlementDateObj = settlementDateFromYmd(input.settlementDateYmd);
  const recordDateOverride =
    input.recordDateYmd?.trim()
      ? settlementDateFromYmd(input.recordDateYmd)
      : undefined;

  const cashflowShutFlag = resolveCashflowShutFlag({
    settlementDateYmd: input.settlementDateYmd,
    nextCouponDateYmd: input.nextCouponDate,
    recordDays: input.recordDays,
    recordDateYmd: input.recordDateYmd,
    maturityDateYmd: input.maturityDateYmd,
  });

  const pricing = accruedInterest({
    couponRate: input.couponRate,
    faceValue: input.faceValue,
    lastCouponDate: settlementDateFromYmd(
      input.lastCouponDate || input.settlementDateYmd,
    ),
    nextCouponDate: settlementDateFromYmd(
      input.nextCouponDate || input.settlementDateYmd,
    ),
    quantity: input.quantity,
    recordDays: input.recordDays,
    settlementDate: settlementDateObj,
    recordDateOverride,
    cashflowShutFlag,
  });

  return {
    pricing,
    periodStatus: cashflowShutFlag ? "Shut Period" : "Normal",
    cashflowShutFlag,
  };
}

export function buildManualAccruedFromContext(input: {
  settlementDateYmd: string;
  faceValue: number;
  couponRate: number;
  quantity: number;
  lastCouponDate: string;
  nextCouponDate: string;
  recordDays: number;
}) {
  const { pricing } = recomputeAccruedPricing(input);
  const quantity = input.quantity > 0 ? input.quantity : 1;

  return {
    pricing,
    totalAccruedInterest: pricing.accruedInterest,
    accruedInterestPerUnit: pricing.accruedInterest / quantity,
    noOfAccrualDays: pricing.noOfAccrualDays,
    isUnderShutPeriod: pricing.isUnderShutPeriod,
    recordDate: pricing.recordDate,
  };
}

export async function buildAutofillCalcContext(
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
  const settlementDateYmd = resolved.settlementDateYmd;
  const settlementDateObj = settlementDateFromYmd(settlementDateYmd);
  const couponResolved = await resolveCouponDatesForSettlement(
    isin,
    settlementDateObj,
    bondData
      ? {
        lastCouponDateIst: bondData.lastCouponDateIst ?? null,
        nextCouponDateIst: bondData.nextCouponDateIst ?? null,
        recordDays: bondData.recordDays ?? null,
      }
      : null,
  );

  const lastCouponDate = couponResolved.lastCouponDate ?? "";
  const nextCouponDate = couponResolved.nextCouponDate ?? "";
  const recordDays = couponResolved.recordDays ?? 0;
  const recordDateYmd = couponResolved.recordDate ?? "";

  const faceValue = Number(bond?.faceValue ?? bondData?.faceValue ?? 10000);
  const couponRate = Number(bond?.couponRate ?? bondData?.couponRate ?? 0);

  const maturityDate =
    pickYmd(
      bond?.maturityDateIst instanceof Date &&
        !Number.isNaN(bond.maturityDateIst.getTime())
        ? toISTISODate(bond.maturityDateIst)
        : toYyyyMmDd(bondData?.maturityDate ?? bond?.maturityDateIst),
    ) ?? "";

  const { pricing, periodStatus, cashflowShutFlag } = recomputeAccruedPricing({
    settlementDateYmd,
    faceValue,
    couponRate,
    quantity: resolved.quantity,
    lastCouponDate,
    nextCouponDate,
    recordDays,
    recordDateYmd: recordDateYmd || undefined,
    maturityDateYmd: maturityDate || undefined,
  });

  const couponDate = {
    lastCouponDate,
    nextCouponDate,
    recordDays,
    recordDate: recordDateYmd,
    isUnderShutPeriod: cashflowShutFlag,
  };

  const bondType = toCalcBondType(bondData?.bondType ?? bond?.bondType);
  const datedDate =
    pickYmd(
      bond?.issueDateIst instanceof Date &&
        !Number.isNaN(bond.issueDateIst.getTime())
        ? toISTISODate(bond.issueDateIst)
        : toYyyyMmDd(bondData?.dateOfAllotment ?? bond?.issueDateIst),
    ) ?? "";

  const interestPaymentFrequency =
    bond?.interestPaymentFrequency ?? bondData?.interestPaymentFrequency ?? null;

  const couponPayRow = couponRows[0] ?? null;
  const dueDateYmd =
    couponPayRow?.dueDateIst instanceof Date &&
      !Number.isNaN(couponPayRow.dueDateIst.getTime())
      ? toYyyyMmDd(couponPayRow.dueDateIst)
      : null;

  return {
    isin,
    quantity: resolved.quantity,
    settlementDateYmd,
    faceValue,
    couponRate,
    pricingMode: resolved.pricingMode,
    pricingYield: resolved.pricingYield ?? 0,
    cleanPrice: resolved.cleanPrice,
    lastCouponDate,
    nextCouponDate,
    datedDate,
    maturityDate,
    cashflowShutFlag,
    pricing,
    couponDate,
    dueDateYmd,
    bondType,
    periodStatus,
    interestPaymentFrequency,
  };
}

/** @deprecated Use buildAutofillCalcContext */
export const buildCalcPayloadAndContext = buildAutofillCalcContext;
