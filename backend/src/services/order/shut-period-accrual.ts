/**
 * Pure shut-period / accrual-days calculator.
 *
 * Shut is ON when: RECORD_DATE ≤ SETTLEMENT_DATE < NEXT_COUPON_DATE
 * (settlement on coupon date → shut with 0 accrual days)
 *
 * accrualDays:
 *   - shut: negative days from settlement to next coupon
 *   - normal: positive days from LAST_COUPON_DATE to SETTLEMENT_DATE
 */

export type ShutPeriodInput = {
  RECORD_DATE: string;
  NEXT_COUPON_DATE: string;
  SETTLEMENT_DATE: string;
  /** Required to compute accrual days when not in shut period. */
  LAST_COUPON_DATE?: string;
};

export type ShutPeriodResult = {
  accrualDays: number;
  isUnderShutPeriod: boolean;
};

const MS_PER_DAY = 86_400_000;

function ymdToUtcMidnight(ymd: string): Date {
  const date = ymd.trim().split("T")[0]!;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error(`Invalid date (expected YYYY-MM-DD): ${ymd}`);
  }
  return new Date(`${date}T00:00:00.000Z`);
}

function ymdOnly(ymd: string): string {
  return ymd.trim().split("T")[0]!;
}

function calendarDaysBetween(fromYmd: string, toYmd: string): number {
  const from = ymdToUtcMidnight(fromYmd);
  const to = ymdToUtcMidnight(toYmd);
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export function resolveShutPeriod(input: ShutPeriodInput): ShutPeriodResult {
  const recordDate = ymdToUtcMidnight(input.RECORD_DATE);
  const settlementDate = ymdToUtcMidnight(input.SETTLEMENT_DATE);
  const nextCouponDate = ymdToUtcMidnight(input.NEXT_COUPON_DATE);

  if (ymdOnly(input.SETTLEMENT_DATE) === ymdOnly(input.NEXT_COUPON_DATE)) {
    return { accrualDays: 0, isUnderShutPeriod: true };
  }

  const isUnderShutPeriod =
    settlementDate.getTime() >= recordDate.getTime() &&
    settlementDate.getTime() < nextCouponDate.getTime();

  if (isUnderShutPeriod) {
    const daysToNextCoupon = Math.floor(
      (nextCouponDate.getTime() - settlementDate.getTime()) / MS_PER_DAY,
    );
    return {
      accrualDays: -daysToNextCoupon,
      isUnderShutPeriod: true,
    };
  }

  if (!input.LAST_COUPON_DATE) {
    throw new Error(
      "LAST_COUPON_DATE is required to compute accrual days outside shut period",
    );
  }

  const accrualDays = Math.max(
    0,
    calendarDaysBetween(input.LAST_COUPON_DATE, input.SETTLEMENT_DATE),
  );

  return { accrualDays, isUnderShutPeriod: false };
}
