import type {
  PortfolioBondShutFallback,
  PortfolioCouponScheduleRow,
} from "./portfolio_cashflow_shut";
import { shouldSkipCouponPaymentForSettlement } from "./portfolio_cashflow_shut";

export type { PortfolioBondShutFallback, PortfolioCouponScheduleRow };

export const isNA = (value: string): boolean => {
  const v = value.trim().toLowerCase();
  return v === "n/a" || v === "na" || v === "n.a";
};

export const formatDateStr = (d: Date): string => {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const parseSettleDate = (raw: string): Date => {
  const parts = raw.split("-");
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`);
  }
  return new Date(raw);
};


export const getMaturityBucketLabel = (yearsRemaining: number): string | null => {
  if (yearsRemaining < 0) return null;
  if (yearsRemaining < 1) return "Below 1 year";
  if (yearsRemaining < 3) return "1 - 3 years";
  if (yearsRemaining < 5) return "3 - 5 years";
  if (yearsRemaining < 8) return "5 - 8 years";
  if (yearsRemaining < 15) return "8 - 15 years";
  return null;
};

export const getCouponBucket = (rate: number): string | null => {
  if (rate >= 0 && rate < 4) return "0-3";
  if (rate >= 4 && rate < 8) return "4-7";
  if (rate >= 8 && rate < 11) return "8-10";
  if (rate > 10) return ">10";
  return null;
};

export const lastDayOfMonth = (year: number, month: number): number =>
  new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

export const isEndOfMonth = (d: Date): boolean =>
  d.getUTCDate() === lastDayOfMonth(d.getUTCFullYear(), d.getUTCMonth());

export const addMonths = (d: Date, n: number, snapToEOM: boolean): Date => {
  const targetMonth = d.getUTCMonth() + n;
  const newYear = d.getUTCFullYear() + Math.floor(targetMonth / 12);
  const newMonth = ((targetMonth % 12) + 12) % 12;
  const newDay = snapToEOM ? lastDayOfMonth(newYear, newMonth) : d.getUTCDate();
  return new Date(Date.UTC(newYear, newMonth, newDay));
};

export const monthStepForMode = (mode: string): number => {
  if (mode === "YEARLY") return 12;
  if (mode === "HALF_YEARLY") return 6;
  if (mode === "QUARTERLY") return 3;
  return 1;
};

/**
 * Schedule logic requires a concrete INTEREST_MODE. DB rows often leave
 * `interestPaymentMode` as UNKNOWN while `interestPaymentFrequency` is populated.
 */
export function resolveEffectiveCouponMode(
  mode: string | null | undefined,
  frequency: string | null | undefined,
): string {
  const m = String(mode ?? "").trim();
  /** Keep sentinel for bullet-style bonds; callers branch before stepping Yearly-periods logic. */
  if (m === "ON_MATURITY") return "ON_MATURITY";
  if (m && m !== "UNKNOWN") return m;

  const v = String(frequency ?? "").trim().toLowerCase();
  if (!v) return "HALF_YEARLY";

  if (v.includes("month")) return "MONTHLY";
  if (v.includes("quarter")) return "QUARTERLY";
  if (v.includes("semi")) return "HALF_YEARLY";
  if (v.includes("annual") || v.includes("year") || v === "yearly") return "YEARLY";
  if (v.includes("maturity") || v.includes("cumulative")) return "ON_MATURITY";

  return "HALF_YEARLY";
}

export function isBulletCouponSchedule(
  interestPaymentMode: string | null | undefined,
  interestPaymentFrequency: string | null | undefined,
): boolean {
  const mode = resolveEffectiveCouponMode(
    interestPaymentMode,
    interestPaymentFrequency,
  );
  return mode === "ON_MATURITY";
}

export type BondPortfolioCfEvent = {
  type: "INTEREST" | "MATURITY";
  date: Date;
  amount: number;
};

const cfAmountEps = 1e-4;

function uniqSortedUtcDays(dates: Iterable<Date>): Date[] {
  const seen = new Set<number>();
  const out: Date[] = [];
  for (const raw of dates) {
    const d = new Date(raw);
    d.setUTCHours(0, 0, 0, 0);
    const t = d.getTime();
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(d);
  }
  out.sort((a, b) => a.getTime() - b.getTime());
  return out;
}

/** When strict calendar checks fail against master maturity vs allotment, still build a plausible schedule from allotment anchors. */
export function resolveSyntheticScheduleEom(allotment: Date, maturity: Date, syntheticMode: string): boolean {
  const { valid, isEOM } = validateAlignment(allotment, maturity, syntheticMode);
  if (valid) return isEOM;
  return isEndOfMonth(allotment);
}

/**
 * Per-holding projected cashflows: uses `allCouponDates` when populated, bullet accrual for ON_MATURITY,
 * otherwise allotment-based synthetic periods with relaxed alignment.
 */
export function enumerateBondPortfolioCashflows(p: {
  allotment: Date;
  maturity: Date;
  settleDate: Date;
  faceValuePerUnit: number;
  quantity: number;
  couponRatePercent: number;
  interestPaymentMode: string | null | undefined;
  interestPaymentFrequency: string | null | undefined;
  allCouponDates?: Date[] | null;
  couponSchedule?: PortfolioCouponScheduleRow[] | null;
  shutFallback?: PortfolioBondShutFallback | null;
}): BondPortfolioCfEvent[] {
  const events: BondPortfolioCfEvent[] = [];

  const allotment = new Date(p.allotment);
  allotment.setUTCHours(0, 0, 0, 0);
  const maturity = new Date(p.maturity);
  maturity.setUTCHours(0, 0, 0, 0);
  const settleDate = new Date(p.settleDate);
  settleDate.setUTCHours(0, 0, 0, 0);

  if (settleDate.getTime() > maturity.getTime()) return events;

  const qty = Number(p.quantity ?? 0);
  if (!Number.isFinite(qty) || qty <= 0) return events;

  const fvPerUnit = Number(p.faceValuePerUnit ?? 0);
  const couponPct = Number(p.couponRatePercent ?? 0);
  const fvTotal = fvPerUnit * qty;
  const annualCoupon = fvTotal * (couponPct / 100);

  const bullet = isBulletCouponSchedule(p.interestPaymentMode, p.interestPaymentFrequency);
  const masterCouponDates =
    bullet ? [] : uniqSortedUtcDays(p.allCouponDates ?? []);

  const couponSchedule = p.couponSchedule ?? undefined;
  const shutFallback = p.shutFallback ?? undefined;

  const skipCouponIfShut = (couponDate: Date): boolean =>
    shouldSkipCouponPaymentForSettlement(
      settleDate,
      couponDate,
      couponSchedule,
      shutFallback,
    );

  if (bullet) {
    const hasCouponIncome = couponPct > cfAmountEps && settleDate.getTime() < maturity.getTime();
    if (hasCouponIncome) {
      const amt = parseFloat(calcInterest(annualCoupon, settleDate, maturity).toFixed(2));
      if (amt > cfAmountEps) {
        events.push({ type: "INTEREST", date: new Date(maturity), amount: amt });
      }
    }
    events.push({ type: "MATURITY", date: new Date(maturity), amount: fvTotal });
    return events;
  }

  if (masterCouponDates.length > 0) {
    let milestones = masterCouponDates.filter(
      (d) => d.getTime() > allotment.getTime() && d.getTime() <= maturity.getTime(),
    );

    const lastTs = milestones.length ? milestones[milestones.length - 1]!.getTime() : -1;
    if (lastTs !== maturity.getTime()) {
      milestones = [...milestones, new Date(maturity)];
      milestones.sort((a, b) => a.getTime() - b.getTime());
    }

    let prev = allotment;
    for (const dt of milestones) {
      const d = new Date(dt);
      d.setUTCHours(0, 0, 0, 0);
      if (d.getTime() <= settleDate.getTime()) {
        prev = d;
        continue;
      }

      if (skipCouponIfShut(d)) {
        prev = d;
        continue;
      }

      const amt = parseFloat(calcInterest(annualCoupon, prev, d).toFixed(2));
      if (amt > cfAmountEps) {
        events.push({ type: "INTEREST", date: new Date(d), amount: amt });
      }
      prev = d;
    }

    events.push({ type: "MATURITY", date: new Date(maturity), amount: fvTotal });
    return events;
  }

  let syntheticMode = resolveEffectiveCouponMode(
    p.interestPaymentMode,
    p.interestPaymentFrequency,
  );
  if (syntheticMode === "ON_MATURITY") syntheticMode = "HALF_YEARLY";
  const isEOM = resolveSyntheticScheduleEom(allotment, maturity, syntheticMode);
  const step = monthStepForMode(syntheticMode);
  const adjustedStart = getAdjustedStartDate(settleDate, allotment, maturity, step, isEOM);

  let cursor = new Date(allotment);
  let lastPayoutDate = new Date(adjustedStart);

  while (cursor.getTime() <= maturity.getTime()) {
    const next = addMonths(cursor, step, isEOM);
    cursor = next.getTime() > maturity.getTime() ? new Date(maturity) : new Date(next);

    if (cursor.getTime() > adjustedStart.getTime()) {
      if (skipCouponIfShut(cursor)) {
        lastPayoutDate = new Date(cursor);
      } else {
        const amt = parseFloat(calcInterest(annualCoupon, lastPayoutDate, cursor).toFixed(2));
        if (amt > cfAmountEps) {
          events.push({ type: "INTEREST", date: new Date(cursor), amount: amt });
        }
        lastPayoutDate = new Date(cursor);
      }
    }

    if (cursor.getTime() === maturity.getTime()) break;
  }

  if (settleDate.getTime() <= maturity.getTime()) {
    events.push({ type: "MATURITY", date: new Date(maturity), amount: fvTotal });
  }

  return events;
}

export const validateAlignment = (
  allotment: Date,
  maturity: Date,
  mode: string
): { valid: boolean; isEOM: boolean } => {
  const bothEOM = isEndOfMonth(allotment) && isEndOfMonth(maturity);
  const allotDay = allotment.getUTCDate();
  const matDay = maturity.getUTCDate();
  const allotMonth = allotment.getUTCMonth() + 1;
  const matMonth = maturity.getUTCMonth() + 1;

  if (!bothEOM && allotDay !== matDay) return { valid: false, isEOM: false };

  if (mode === "MONTHLY") return { valid: true, isEOM: bothEOM };
  if (mode === "YEARLY") return { valid: allotMonth === matMonth, isEOM: bothEOM };

  const diff = ((matMonth - allotMonth) % 12 + 12) % 12;
  if (mode === "HALF_YEARLY") return { valid: diff % 6 === 0, isEOM: bothEOM };
  if (mode === "QUARTERLY") return { valid: diff % 3 === 0, isEOM: bothEOM };

  return { valid: false, isEOM: false };
};

export const getAdjustedStartDate = (
  settleDate: Date,
  allotment: Date,
  maturity: Date,
  monthStep: number,
  isEOM: boolean
): Date => {
  let cursor = new Date(allotment);
  let lastBoundary = new Date(allotment);

  while (cursor <= maturity) {
    const next = addMonths(cursor, monthStep, isEOM);
    cursor = next > maturity ? new Date(maturity) : next;

    if (cursor <= settleDate) {
      lastBoundary = new Date(cursor);
    } else {
      break;
    }

    if (cursor.getTime() === maturity.getTime()) break;
  }

  return lastBoundary;
};

export const calcInterest = (
  annualInterest: number,
  fromDate: Date,
  toDate: Date
): number => {
  let total = 0;
  let cursor = new Date(fromDate);

  while (cursor < toDate) {
    const year = cursor.getUTCFullYear();
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInYear = isLeap ? 366 : 365;

    const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
    const periodEnd = yearEnd < toDate ? yearEnd : toDate;
    const daysInPeriod = Math.floor(
      (periodEnd.getTime() - cursor.getTime()) / (1000 * 60 * 60 * 24)
    );

    total += (annualInterest / daysInYear) * daysInPeriod;
    cursor = periodEnd;
  }

  return total;
};
