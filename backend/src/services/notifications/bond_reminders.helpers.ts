/**
 * Pure helpers for the bond-reminder feature. Kept side-effect-free so they
 * can be imported by tests and other consumers without dragging in the Bull
 * queue / DB client used by `bond_reminders.service.ts`.
 */

import type { INTEREST_MODE } from "@databases/generated/prisma/postgres";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const MONTH_LABELS = [
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

/** Returns IST calendar parts (year/month/day, month 0-indexed) for the given instant. */
export function istCalendarParts(at = new Date()): { y: number; m: number; d: number } {
  const ist = new Date(at.getTime() + IST_OFFSET_MS);
  return {
    y: ist.getUTCFullYear(),
    m: ist.getUTCMonth(),
    d: ist.getUTCDate(),
  };
}

/**
 * Convert IST (y, m, d) to the UTC-midnight Date used by `@db.Date` columns
 * (`Bonds.maturityDateIst`, `BondReferenceCouponPaymentDate.dueDateIst`,
 * `BondReminderLog.anchorDateIst`). This matches `toIstDateOnlyUtcMidnight`
 * in `bond_priced_list.service.ts`.
 */
export function istYmdToUtcMidnight(y: number, m: number, d: number): Date {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return new Date(`${y}-${mm}-${dd}T00:00:00.000Z`);
}

/** Add `days` to an IST-anchored UTC-midnight date, preserving UTC-midnight semantics. */
export function addDaysUtcMidnight(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

/** Pretty IST date for the email body: e.g. "12 May 2026". */
export function formatIstDateLabel(d: Date): string {
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mmm = MONTH_LABELS[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  return `${dd} ${mmm} ${yyyy}`;
}

/** ₹ 1,23,456.78 (Indian numbering). */
export function formatRupees(amount: number): string {
  if (!Number.isFinite(amount)) return "0.00";
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fullCustomerName(p: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
}): string {
  return [p.firstName, p.middleName, p.lastName]
    .filter((s): s is string => Boolean(s && s.trim()))
    .join(" ")
    .trim();
}

/**
 * Period fraction by payment frequency. ON_MATURITY and UNKNOWN return null
 * because no single "next coupon" amount can be derived for them.
 */
export function periodFractionFor(
  mode: INTEREST_MODE | string | null | undefined,
): number | null {
  switch (mode) {
    case "MONTHLY":
      return 1 / 12;
    case "QUARTERLY":
      return 1 / 4;
    case "HALF_YEARLY":
      return 1 / 2;
    case "YEARLY":
      return 1;
    case "ON_MATURITY":
    case "UNKNOWN":
    default:
      return null;
  }
}

/**
 * Derive the indicative coupon amount due to a customer for a single coupon event:
 *   perBondCoupon  = faceValue * (couponRate / 100) * periodFraction
 *   customerAmount = round2(perBondCoupon * quantity)
 *
 * Returns null if frequency does not support periodic coupons or any input is missing.
 */
export function couponAmountForHolding(
  bond: {
    faceValue: number | null;
    couponRate: number | null;
    interestPaymentFrequency: string | null;
    interestPaymentMode: INTEREST_MODE | null;
  },
  quantity: number,
): number | null {
  const fraction = periodFractionFor(
    bond.interestPaymentMode ?? bond.interestPaymentFrequency,
  );
  if (fraction === null) return null;

  const faceValue = Number(bond.faceValue ?? 0);
  const couponRate = Number(bond.couponRate ?? 0);
  const qty = Number(quantity ?? 0);
  if (!(faceValue > 0) || !(couponRate > 0) || !(qty > 0)) return null;

  const perBond = faceValue * (couponRate / 100) * fraction;
  return Math.round(perBond * qty * 100) / 100;
}
