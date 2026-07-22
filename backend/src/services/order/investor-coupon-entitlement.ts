/**
 * Buyer investor coupon entitlement for Order Receipt / Deal PDFs.
 *
 * Cash flows:
 *   nextCoupon = first scheduled coupon strictly after settlement
 *   if settlement <= recordDate → firstCashFlow = nextCoupon
 *   else                        → firstCashFlow = couponAfter(nextCoupon)
 *
 * Last coupon date (client / senior formula — mirrors cashflow_shut_flag):
 *
 *   last_coupon_date =
 *     IF cashflow_shut_flag
 *       THEN first_coupon_date_on_or_after_settlement   // upcoming / shut coupon
 *       ELSE last_coupon_date_on_or_before_settlement   // previous paid coupon
 *
 * Example: settle 14-Jul, record 06-Jul, next 20-Jul, shut=true
 *   → last_coupon_date = 20-Jul-2026
 */

import { db } from "@core/database/database";
import { dropMaturityDayIfMonthHasCoupon } from "./order-pricing-helper";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** Max buyer cash-flow dates shown on PDF (monthly = 12). */
const MAX_BUYER_CASHFLOWS = 12;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function ymdOnly(ymd: string): string {
  return ymd.trim().split("T")[0]!;
}

function utcMidnightFromYmd(ymd: string): Date {
  return new Date(`${ymdOnly(ymd)}T00:00:00.000Z`);
}

function toUtcYmd(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function addUtcCalendarDays(isoDate: string, delta: number): string {
  const [y, m, d] = ymdOnly(isoDate).split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d! + delta, 12));
  return toUtcYmd(dt);
}

/** Interest payment date display: `16-Feb` (matches getPayoutDates). */
export function formatInterestPaymentDateDdMmm(due: Date): string {
  const dd = due.getUTCDate();
  const monthName = MONTHS[due.getUTCMonth()] ?? "Jan";
  return `${dd}-${monthName}`;
}

/** Last IP display: `16-Feb-2026 (Monday)` (matches getLastCouponDate). */
export function formatLastInterestPaymentDateDisplay(due: Date): string {
  const dd = pad2(due.getUTCDate());
  const mmm = MONTHS[due.getUTCMonth()] ?? "Jan";
  const yyyy = String(due.getUTCFullYear());
  const weekday = DAYS[due.getUTCDay()] ?? "";
  return `${dd}-${mmm}-${yyyy} (${weekday})`;
}

export type InvestorCouponInput = {
  dueDateYmd: string;
  recordDateYmd?: string | null;
  recordDays?: number | null;
};

export type ResolveInvestorCouponScheduleInput = {
  settlementYmd: string;
  coupons: InvestorCouponInput[];
  /**
   * @deprecated Prefer maturity + MAX_BUYER_CASHFLOWS. Kept for callers;
   * still applied as a soft upper bound when set.
   */
  endLimitYmd?: string | null;
  maturityYmd?: string | null;
  /** Override max cash flows (default 12). */
  maxCashFlows?: number;
};

export type InvestorCouponScheduleForPdf = {
  /** Buyer-entitled upcoming coupons as `d-MMM`. */
  interestPaymentDates: string[];
  /**
   * Last IP for PDF: `DD-MMM-YYYY (Weekday)`.
   * Shut → first coupon on/after settlement; else last on/before settlement.
   */
  lastInterestPaymentDate: string | null;
  /** Same last coupon as `YYYY-MM-DD`. */
  lastInterestPaymentDateRaw: string | null;
  /** Whether buyer is entitled to the next contractual coupon after settlement. */
  buyerEntitledToNextCoupon: boolean;
  /** Same meaning as DeriData / CRM `cashflow_shut_flag` for the upcoming coupon. */
  cashflowShutFlag: boolean;
};

function resolveRecordDateYmd(coupon: InvestorCouponInput): string | null {
  const explicit = coupon.recordDateYmd?.trim();
  if (explicit && /^\d{4}-\d{2}-\d{2}$/.test(ymdOnly(explicit))) {
    return ymdOnly(explicit);
  }
  const days =
    coupon.recordDays != null && Number.isFinite(coupon.recordDays)
      ? Math.floor(coupon.recordDays)
      : null;
  if (days != null && days > 0) {
    return addUtcCalendarDays(ymdOnly(coupon.dueDateYmd), -days);
  }
  return null;
}

/**
 * Buyer entitled to a coupon when settlement is on/before that coupon's record date.
 * If record date cannot be resolved, include the coupon (no shut info).
 */
export function isBuyerEntitledToCoupon(
  settlementYmd: string,
  coupon: InvestorCouponInput,
): boolean {
  const recordYmd = resolveRecordDateYmd(coupon);
  if (!recordYmd) return true;
  return ymdOnly(settlementYmd) <= recordYmd;
}

/**
 * Mirrors `resolveCashflowShutFlag` / DeriData:
 * RECORD_DATE ≤ SETTLEMENT_DATE < NEXT_COUPON_DATE
 * (maturity coupon suppresses shut).
 */
export function isCashflowShutForUpcomingCoupon(
  settlementYmd: string,
  upcomingCoupon: InvestorCouponInput,
  maturityYmd?: string | null,
): boolean {
  const settle = ymdOnly(settlementYmd);
  const nextYmd = ymdOnly(upcomingCoupon.dueDateYmd);
  const maturity = maturityYmd ? ymdOnly(maturityYmd) : null;
  if (maturity && nextYmd === maturity) return false;

  const recordYmd = resolveRecordDateYmd(upcomingCoupon);
  if (!recordYmd) return false;

  return settle >= recordYmd && settle < nextYmd;
}

/**
 * Pure resolver: contractual schedule + settlement → buyer PDF interest dates.
 *
 * Last IP follows the client formula tied to cashflow_shut_flag.
 */
export function resolveInvestorCouponScheduleForPdf(
  input: ResolveInvestorCouponScheduleInput,
): InvestorCouponScheduleForPdf {
  const settlementYmd = ymdOnly(input.settlementYmd);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(settlementYmd)) {
    return {
      interestPaymentDates: [],
      lastInterestPaymentDate: null,
      lastInterestPaymentDateRaw: null,
      buyerEntitledToNextCoupon: false,
      cashflowShutFlag: false,
    };
  }

  const settlementDt = utcMidnightFromYmd(settlementYmd);
  const endLimitYmd = input.endLimitYmd ? ymdOnly(input.endLimitYmd) : null;
  const endLimitDt = endLimitYmd ? utcMidnightFromYmd(endLimitYmd) : null;
  const maturityYmd = input.maturityYmd ? ymdOnly(input.maturityYmd) : null;
  const maturityDt = maturityYmd ? utcMidnightFromYmd(maturityYmd) : null;
  const maxCashFlows =
    input.maxCashFlows != null &&
    Number.isFinite(input.maxCashFlows) &&
    input.maxCashFlows > 0
      ? Math.floor(input.maxCashFlows)
      : MAX_BUYER_CASHFLOWS;

  const sorted = [...input.coupons]
    .map((c) => ({
      ...c,
      dueDateYmd: ymdOnly(c.dueDateYmd),
    }))
    .filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.dueDateYmd))
    .sort((a, b) => a.dueDateYmd.localeCompare(b.dueDateYmd));

  // last_coupon_date_on_or_before_settlement
  let lastOnOrBefore: Date | null = null;
  for (const c of sorted) {
    const due = utcMidnightFromYmd(c.dueDateYmd);
    if (due.getTime() <= settlementDt.getTime()) lastOnOrBefore = due;
    else break;
  }

  // first_coupon_date_on_or_after_settlement (senior formula for shut last IP)
  const onOrAfter = sorted.filter(
    (c) => utcMidnightFromYmd(c.dueDateYmd).getTime() >= settlementDt.getTime(),
  );
  const firstOnOrAfter = onOrAfter[0] ?? null;

  // Cash-flow next = first coupon strictly after settlement
  const afterSettlement = sorted.filter(
    (c) => utcMidnightFromYmd(c.dueDateYmd).getTime() > settlementDt.getTime(),
  );
  const nextCouponAfterSettlement = afterSettlement[0] ?? null;

  // Shut flag is evaluated on the upcoming coupon (on/after settlement).
  const cashflowShutFlag = firstOnOrAfter
    ? isCashflowShutForUpcomingCoupon(
        settlementYmd,
        firstOnOrAfter,
        maturityYmd,
      )
    : false;

  // Senior formula:
  //   shut → first on/after settlement
  //   else → last on/before settlement
  const lastDue = cashflowShutFlag
    ? firstOnOrAfter
      ? utcMidnightFromYmd(firstOnOrAfter.dueDateYmd)
      : lastOnOrBefore
    : lastOnOrBefore;

  const buyerEntitledToNextCoupon = nextCouponAfterSettlement
    ? isBuyerEntitledToCoupon(settlementYmd, nextCouponAfterSettlement)
    : false;

  // If in shut, skip the shut coupon for buyer cash flows.
  const firstIndex = nextCouponAfterSettlement
    ? buyerEntitledToNextCoupon
      ? 0
      : 1
    : 0;

  const cashFlowCoupons: InvestorCouponInput[] = [];
  for (let i = firstIndex; i < afterSettlement.length; i++) {
    const c = afterSettlement[i]!;
    const due = utcMidnightFromYmd(c.dueDateYmd);
    if (maturityDt && due.getTime() > maturityDt.getTime()) break;
    if (endLimitDt && due.getTime() > endLimitDt.getTime()) break;
    cashFlowCoupons.push(c);
    if (cashFlowCoupons.length >= maxCashFlows) break;
  }

  const entitledDates = cashFlowCoupons.map((c) =>
    utcMidnightFromYmd(c.dueDateYmd),
  );
  const cleaned = dropMaturityDayIfMonthHasCoupon(entitledDates, maturityDt);

  return {
    interestPaymentDates: cleaned.map(formatInterestPaymentDateDdMmm),
    lastInterestPaymentDate: lastDue
      ? formatLastInterestPaymentDateDisplay(lastDue)
      : null,
    lastInterestPaymentDateRaw: lastDue ? toUtcYmd(lastDue) : null,
    buyerEntitledToNextCoupon,
    cashflowShutFlag,
  };
}

function settlementYmdFromDate(settlement: Date): string | null {
  if (Number.isNaN(settlement.getTime())) return null;
  // UTC-midnight dates (settlementDateFromYmd) → use UTC calendar day.
  if (
    settlement.getUTCHours() === 0 &&
    settlement.getUTCMinutes() === 0 &&
    settlement.getUTCSeconds() === 0 &&
    settlement.getUTCMilliseconds() === 0
  ) {
    return toUtcYmd(settlement);
  }
  // IST calendar day (same as getPayoutDates / getLastCouponDate).
  return settlement.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/**
 * Loads contractual coupon rows for an ISIN and resolves buyer PDF schedule.
 */
export async function loadInvestorCouponScheduleForPdf(
  isin: string,
  settlement: Date,
): Promise<InvestorCouponScheduleForPdf> {
  const settlementYmd = settlementYmdFromDate(settlement);
  if (!settlementYmd) {
    return {
      interestPaymentDates: [],
      lastInterestPaymentDate: null,
      lastInterestPaymentDateRaw: null,
      buyerEntitledToNextCoupon: false,
      cashflowShutFlag: false,
    };
  }

  const [meta, rows] = await Promise.all([
    db.dataBase.bondReferenceMetadata.findUnique({ where: { isin } }),
    db.dataBase.bondReferenceCouponPaymentDate.findMany({
      where: { isin },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const maturityDate =
    meta?.maturityDateIst instanceof Date &&
    !Number.isNaN(meta.maturityDateIst.getTime())
      ? meta.maturityDateIst
      : null;

  const coupons = rows
    .map((r) => {
      const due =
        r.dueDateIst instanceof Date && !Number.isNaN(r.dueDateIst.getTime())
          ? r.dueDateIst
          : r.dueDate instanceof Date && !Number.isNaN(r.dueDate.getTime())
            ? r.dueDate
            : null;
      if (!due) return null;
      const recordDateYmd =
        r.recordDateIst instanceof Date &&
        !Number.isNaN(r.recordDateIst.getTime())
          ? toUtcYmd(r.recordDateIst)
          : r.recordDate instanceof Date &&
              !Number.isNaN(r.recordDate.getTime())
            ? toUtcYmd(r.recordDate)
            : null;
      const recordDays =
        typeof r.recordDays === "number" && Number.isFinite(r.recordDays)
          ? Math.floor(r.recordDays)
          : null;
      return {
        dueDateYmd: toUtcYmd(due),
        recordDateYmd,
        recordDays,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c != null);

  return resolveInvestorCouponScheduleForPdf({
    settlementYmd,
    coupons,
    // No calendar-year endLimit — take up to 12 consecutive coupons from first
    // buyer cash flow (capped by maturity) so monthly shut cases include the
    // shifted 12th payment (e.g. Aug…Jul).
    maturityYmd: maturityDate ? toUtcYmd(maturityDate) : null,
  });
}
