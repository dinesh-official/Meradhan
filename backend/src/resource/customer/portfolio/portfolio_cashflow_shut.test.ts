import { describe, expect, test } from "bun:test";
import { istYmdToUtcMidnight } from "@services/notifications/bond_reminders.helpers";
import {
  resolveCouponShutMeta,
  shouldSkipCouponPaymentForSettlement,
} from "./portfolio_cashflow_shut";
import { enumerateBondPortfolioCashflows } from "./portfolio.utils";

const jun8 = istYmdToUtcMidnight(2026, 5, 8);
const jun10 = istYmdToUtcMidnight(2026, 5, 10);
const jun15 = istYmdToUtcMidnight(2026, 5, 15);
const jul15 = istYmdToUtcMidnight(2026, 6, 15);
const allotment = istYmdToUtcMidnight(2020, 0, 15);
const maturity = istYmdToUtcMidnight(2030, 5, 15);

describe("shouldSkipCouponPaymentForSettlement", () => {
  test("skips June coupon when settlement is after record date and before due date", () => {
    expect(
      shouldSkipCouponPaymentForSettlement(
        jun10,
        jun15,
        [{ dueDate: jun15, recordDateIst: jun8, recordDays: 7 }],
        undefined,
      ),
    ).toBe(true);
  });

  test("does not skip July coupon for the same holding", () => {
    expect(
      shouldSkipCouponPaymentForSettlement(
        jun10,
        jul15,
        [{ dueDate: jul15, recordDateIst: istYmdToUtcMidnight(2026, 6, 8), recordDays: 7 }],
        undefined,
      ),
    ).toBe(false);
  });
});

describe("enumerateBondPortfolioCashflows shut period", () => {
  test("ex-interest purchase: first interest is July, not June", () => {
    const events = enumerateBondPortfolioCashflows({
      allotment,
      maturity,
      settleDate: jun10,
      faceValuePerUnit: 1000,
      quantity: 10,
      couponRatePercent: 10,
      interestPaymentMode: "MONTHLY",
      interestPaymentFrequency: "Monthly",
      allCouponDates: [jun15, jul15, istYmdToUtcMidnight(2026, 7, 15)],
      couponSchedule: [{ dueDate: jun15, recordDateIst: jun8, recordDays: 7 }],
      shutFallback: { recordDate: jun8, recordDays: 7 },
    });

    const interestIn2026 = events.filter(
      (e) => e.type === "INTEREST" && e.date.getUTCFullYear() === 2026,
    );

    expect(
      interestIn2026.some((e) => e.date.getUTCMonth() === 5),
    ).toBe(false);
    expect(interestIn2026[0]?.date.getUTCMonth()).toBe(6);
  });

  test("falls back to bond record metadata when schedule row is missing", () => {
    const meta = resolveCouponShutMeta(jun15, [], {
      recordDate: jun8,
      recordDays: 7,
    });
    expect(meta.recordDateIst?.getTime()).toBe(jun8.getTime());
    expect(meta.recordDays).toBe(7);
  });

  test("derives per-coupon record date from recordDays when only bond fallback exists", () => {
    const meta = resolveCouponShutMeta(jul15, [], {
      recordDate: jun8,
      recordDays: 7,
    });
    expect(meta.recordDateIst?.getTime()).toBe(istYmdToUtcMidnight(2026, 6, 8).getTime());
  });
});
