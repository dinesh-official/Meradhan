/**
 * Buyer investor coupon entitlement for Order Receipt / Deal PDFs.
 *
 * Contractual coupons are never deleted — we only decide whether the buyer
 * receives each upcoming coupon:
 *   buyerGetsCoupon = settlementDate <= recordDate
 *
 * Last interest payment date is always settlement-relative (latest due ≤ settlement).
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
  /** Inclusive end of future coupon window (maturity capped at ~1y). */
  endLimitYmd?: string | null;
  maturityYmd?: string | null;
};

export type InvestorCouponScheduleForPdf = {
  /** Buyer-entitled upcoming coupons as `d-MMM`. */
  interestPaymentDates: string[];
  /** Latest contractual coupon with due ≤ settlement: `DD-MMM-YYYY (Weekday)`. */
  lastInterestPaymentDate: string | null;
  /** Same last coupon as `YYYY-MM-DD`. */
  lastInterestPaymentDateRaw: string | null;
  /** Whether buyer is entitled to the next contractual coupon after settlement. */
  buyerEntitledToNextCoupon: boolean;
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
 * Pure resolver: contractual schedule + settlement → buyer PDF interest dates.
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
    };
  }

  const settlementDt = utcMidnightFromYmd(settlementYmd);
  const endLimitYmd = input.endLimitYmd ? ymdOnly(input.endLimitYmd) : null;
  const endLimitDt = endLimitYmd ? utcMidnightFromYmd(endLimitYmd) : null;
  const maturityYmd = input.maturityYmd ? ymdOnly(input.maturityYmd) : null;
  const maturityDt = maturityYmd ? utcMidnightFromYmd(maturityYmd) : null;

  const sorted = [...input.coupons]
    .map((c) => ({
      ...c,
      dueDateYmd: ymdOnly(c.dueDateYmd),
    }))
    .filter((c) => /^\d{4}-\d{2}-\d{2}$/.test(c.dueDateYmd))
    .sort((a, b) => a.dueDateYmd.localeCompare(b.dueDateYmd));

  let lastDue: Date | null = null;
  for (const c of sorted) {
    const due = utcMidnightFromYmd(c.dueDateYmd);
    if (due.getTime() <= settlementDt.getTime()) lastDue = due;
    else break;
  }

  const upcoming = sorted.filter((c) => {
    const due = utcMidnightFromYmd(c.dueDateYmd);
    if (due.getTime() < settlementDt.getTime()) return false;
    if (endLimitDt && due.getTime() > endLimitDt.getTime()) return false;
    return true;
  });

  const nextCoupon = upcoming[0] ?? null;
  const buyerEntitledToNextCoupon = nextCoupon
    ? isBuyerEntitledToCoupon(settlementYmd, nextCoupon)
    : false;

  const entitledUpcoming = upcoming.filter((c) =>
    isBuyerEntitledToCoupon(settlementYmd, c),
  );

  const entitledDates = entitledUpcoming.map((c) =>
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
  };
}

function settlementYmdFromDate(settlement: Date): string | null {
  if (Number.isNaN(settlement.getTime())) return null;
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
    };
  }

  const settlementDt = utcMidnightFromYmd(settlementYmd);

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

  const oneYearLater = new Date(
    Date.UTC(
      settlementDt.getUTCFullYear() + 1,
      settlementDt.getUTCMonth(),
      settlementDt.getUTCDate(),
      12,
    ),
  );
  const endLimit = maturityDate
    ? new Date(Math.min(maturityDate.getTime(), oneYearLater.getTime()))
    : oneYearLater;

  const coupons = rows
    .map((r) => {
      const due =
        r.dueDateIst instanceof Date && !Number.isNaN(r.dueDateIst.getTime())
          ? r.dueDateIst
          : null;
      if (!due) return null;
      const recordDateYmd =
        r.recordDateIst instanceof Date &&
        !Number.isNaN(r.recordDateIst.getTime())
          ? toUtcYmd(r.recordDateIst)
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
    endLimitYmd: toUtcYmd(endLimit),
    maturityYmd: maturityDate ? toUtcYmd(maturityDate) : null,
  });
}
