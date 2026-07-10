import {
  calcInterest,
  enumerateBondPortfolioCashflows,
  isBulletCouponSchedule,
} from "./portfolio.utils";
import {
  buildShutFallbackFromBond,
  type PortfolioCouponScheduleRow,
} from "./portfolio_cashflow_shut";

/** Bond fields required to project coupon cashflows (same shape as Prisma `bonds` select). */
export type BondInterestScheduleRow = {
  isin: string;
  faceValue: unknown;
  couponRate: unknown;
  interestPaymentMode: string | null;
  interestPaymentFrequency: string | null;
  dateOfAllotment: Date | null;
  maturityDate: Date | null;
  maturityDateIst?: Date | null;
  allCouponDates?: Date[] | null;
  recordDate?: Date | null;
  recordDateIst?: Date | null;
  recordDays?: number | null;
};

export type HoldingInterestRow = {
  isin: string;
  quantity: number;
  /** Settlement / purchase anchor (matches portfolio cashflow `settleDate`). */
  settleDate: Date;
};

/**
 * Portfolio **interest accrued / recognised to date** (UTC calendar day `asOf`):
 * - **Bullet / on-maturity coupon**: straight-line accrual from `settleDate` to `min(asOf, maturity)`.
 * - **Other schedules**: sum of projected **INTEREST** cashflow amounts on coupon dates **on or before** `asOf`
 *   (aligned with `enumerateBondPortfolioCashflows`; does not add intra-period stub for non-bullet).
 */
export function computePortfolioInterestEarned(
  holdings: HoldingInterestRow[],
  bondByIsin: Map<string, BondInterestScheduleRow>,
  asOf: Date,
  couponScheduleByIsin?: Map<string, PortfolioCouponScheduleRow[]>,
): number {
  const asOfDay = new Date(asOf);
  asOfDay.setUTCHours(0, 0, 0, 0);

  let total = 0;

  for (const h of holdings) {
    if (!Number.isFinite(h.quantity) || h.quantity <= 0) continue;
    const bond = bondByIsin.get(h.isin);
    if (!bond?.dateOfAllotment || !bond.maturityDate) continue;

    const allotment = new Date(bond.dateOfAllotment);
    allotment.setUTCHours(0, 0, 0, 0);
    const maturitySrc = bond.maturityDateIst ?? bond.maturityDate;
    const maturity = new Date(maturitySrc);
    maturity.setUTCHours(0, 0, 0, 0);
    const settleDate = new Date(h.settleDate);
    settleDate.setUTCHours(0, 0, 0, 0);

    if (settleDate.getTime() >= maturity.getTime()) continue;

    const fvPerUnit = Number(bond.faceValue ?? 0);
    const couponPct = Number(bond.couponRate ?? 0);
    if (!Number.isFinite(fvPerUnit) || fvPerUnit <= 0 || !Number.isFinite(couponPct) || couponPct <= 0) {
      continue;
    }

    const fvTotal = fvPerUnit * h.quantity;
    const annualCoupon = fvTotal * (couponPct / 100);

    if (isBulletCouponSchedule(bond.interestPaymentMode, bond.interestPaymentFrequency)) {
      if (settleDate.getTime() < maturity.getTime()) {
        const end = asOfDay.getTime() < maturity.getTime() ? asOfDay : maturity;
        if (end.getTime() > settleDate.getTime()) {
          total += calcInterest(annualCoupon, settleDate, end);
        }
      }
      continue;
    }

    const schedule = enumerateBondPortfolioCashflows({
      allotment,
      maturity,
      settleDate,
      faceValuePerUnit: fvPerUnit,
      quantity: h.quantity,
      couponRatePercent: couponPct,
      interestPaymentMode: bond.interestPaymentMode,
      interestPaymentFrequency: bond.interestPaymentFrequency,
      allCouponDates: bond.allCouponDates ?? undefined,
      couponSchedule: couponScheduleByIsin?.get(h.isin),
      shutFallback: buildShutFallbackFromBond(bond),
    });

    for (const ev of schedule) {
      if (ev.type !== "INTEREST") continue;
      const d = new Date(ev.date);
      d.setUTCHours(0, 0, 0, 0);
      if (d.getTime() <= asOfDay.getTime()) total += ev.amount;
    }
  }

  return Number(total.toFixed(2));
}
