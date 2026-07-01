import { db } from "@core/database/database";
import {
  addDaysUtcMidnight,
  isSettlementUnderShutPeriodForCoupon,
} from "@services/notifications/bond_reminders.helpers";

export type PortfolioCouponScheduleRow = {
  dueDate: Date;
  recordDateIst: Date | null;
  recordDays: number | null;
};

export type PortfolioBondShutFallback = {
  recordDate: Date | null;
  recordDays: number | null;
};

export function normalizeUtcMidnight(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function sameUtcCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/** Resolve record metadata for a coupon due date from reference schedule or bond fallback. */
export function resolveCouponShutMeta(
  dueDate: Date,
  schedule: PortfolioCouponScheduleRow[] | undefined,
  fallback: PortfolioBondShutFallback | undefined,
): { recordDateIst: Date | null; recordDays: number | null } {
  const due = normalizeUtcMidnight(dueDate);

  const exact = schedule?.find((row) =>
    sameUtcCalendarDay(normalizeUtcMidnight(row.dueDate), due),
  );
  if (exact) {
    const recordDays =
      exact.recordDays != null && exact.recordDays > 0
        ? exact.recordDays
        : fallback?.recordDays != null && fallback.recordDays > 0
          ? fallback.recordDays
          : null;
    const recordDateIst =
      exact.recordDateIst ??
      (recordDays != null ? addDaysUtcMidnight(due, -recordDays) : null);
    return { recordDateIst, recordDays };
  }

  const recordDays =
    fallback?.recordDays != null && fallback.recordDays > 0
      ? fallback.recordDays
      : null;
  if (recordDays != null) {
    return {
      recordDateIst: addDaysUtcMidnight(due, -recordDays),
      recordDays,
    };
  }

  return {
    recordDateIst: fallback?.recordDate ?? null,
    recordDays: null,
  };
}

/**
 * True when the buyer settled in shut period for this coupon (record date ≤ settlement < due date).
 * Uses the same rule as order pricing / bond reminders — does not modify pricing code.
 */
export function shouldSkipCouponPaymentForSettlement(
  settlement: Date,
  dueDate: Date,
  schedule: PortfolioCouponScheduleRow[] | undefined,
  fallback: PortfolioBondShutFallback | undefined,
): boolean {
  const meta = resolveCouponShutMeta(dueDate, schedule, fallback);
  if (!meta.recordDateIst && (meta.recordDays == null || meta.recordDays <= 0)) {
    return false;
  }

  return isSettlementUnderShutPeriodForCoupon({
    settlement,
    dueDate,
    recordDateIst: meta.recordDateIst,
    recordDays: meta.recordDays,
  });
}

export function buildShutFallbackFromBond(bond: {
  recordDate?: Date | null;
  recordDateIst?: Date | null;
  recordDays?: number | null;
}): PortfolioBondShutFallback {
  return {
    recordDate: bond.recordDateIst ?? bond.recordDate ?? null,
    recordDays:
      bond.recordDays != null && Number.isFinite(bond.recordDays)
        ? Math.round(bond.recordDays)
        : null,
  };
}

/** Batch-load per-coupon record/due rows for portfolio cashflow shut-period checks. */
export async function loadCouponSchedulesByIsin(
  isins: string[],
): Promise<Map<string, PortfolioCouponScheduleRow[]>> {
  if (!isins.length) return new Map();

  const rows = await db.dataBase.bondReferenceCouponPaymentDate.findMany({
    where: { isin: { in: isins } },
    orderBy: [{ isin: "asc" }, { dueDateIst: "asc" }],
    select: {
      isin: true,
      dueDateIst: true,
      dueDate: true,
      recordDateIst: true,
      recordDate: true,
      recordDays: true,
    },
  });

  const map = new Map<string, PortfolioCouponScheduleRow[]>();
  for (const row of rows) {
    const due = row.dueDateIst ?? row.dueDate;
    if (!due || Number.isNaN(due.getTime())) continue;

    const list = map.get(row.isin) ?? [];
    list.push({
      dueDate: due,
      recordDateIst: row.recordDateIst ?? row.recordDate ?? null,
      recordDays:
        row.recordDays != null && Number.isFinite(row.recordDays)
          ? Math.round(row.recordDays)
          : null,
    });
    map.set(row.isin, list);
  }

  return map;
}
