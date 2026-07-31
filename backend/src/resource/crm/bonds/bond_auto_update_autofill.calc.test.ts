import { describe, expect, test } from "bun:test";
import {
  buildManualAccruedFromContext,
  recomputeAccruedPricing,
} from "./bond_auto_update_autofill.calc";

describe("recomputeAccruedPricing", () => {
  test("normal period uses positive days since last coupon", () => {
    const result = recomputeAccruedPricing({
      settlementDateYmd: "2026-07-10",
      faceValue: 10_000,
      couponRate: 10,
      quantity: 1,
      lastCouponDate: "2026-06-10",
      nextCouponDate: "2026-07-26",
      recordDays: 14,
    });

    expect(result.pricing.isUnderShutPeriod).toBe(false);
    expect(result.pricing.noOfAccrualDays).toBe(30);
    expect(result.pricing.accruedInterest).toBeGreaterThan(0);
  });

  test("monthly coupon on 13th: settlement on 13th counts from prior coupon", () => {
    const result = recomputeAccruedPricing({
      settlementDateYmd: "2026-07-13",
      faceValue: 10_000,
      couponRate: 10.75,
      quantity: 1,
      lastCouponDate: "2026-06-13",
      nextCouponDate: "2026-08-13",
      recordDays: 15,
    });

    expect(result.cashflowShutFlag).toBe(false);
    expect(result.pricing.isUnderShutPeriod).toBe(false);
    expect(result.pricing.noOfAccrualDays).toBe(30);
  });

  test("maturity next coupon forces normal period for DeriData flag", () => {
    const result = recomputeAccruedPricing({
      settlementDateYmd: "2026-12-20",
      faceValue: 10_000,
      couponRate: 10,
      quantity: 1,
      lastCouponDate: "2026-11-30",
      nextCouponDate: "2026-12-31",
      recordDays: 15,
      maturityDateYmd: "2026-12-31",
    });

    expect(result.cashflowShutFlag).toBe(false);
    expect(result.pricing.isUnderShutPeriod).toBe(false);
    expect(result.pricing.noOfAccrualDays).toBeGreaterThan(0);
  });

  test("shut period uses negative days until next coupon", () => {
    const result = recomputeAccruedPricing({
      settlementDateYmd: "2026-07-13",
      faceValue: 1_000,
      couponRate: 10,
      quantity: 10,
      lastCouponDate: "2026-06-26",
      nextCouponDate: "2026-07-26",
      recordDays: 14,
    });

    expect(result.pricing.isUnderShutPeriod).toBe(true);
    expect(result.pricing.noOfAccrualDays).toBeLessThan(0);
    expect(result.pricing.accruedInterest).toBeLessThan(0);
    expect(result.cashflowShutFlag).toBe(true);
  });
});

describe("buildManualAccruedFromContext", () => {
  test("returns per-unit and total from manual accruedInterest()", () => {
    const result = buildManualAccruedFromContext({
      settlementDateYmd: "2026-07-10",
      faceValue: 10_000,
      couponRate: 10,
      quantity: 10,
      lastCouponDate: "2026-06-10",
      nextCouponDate: "2026-07-26",
      recordDays: 14,
    });

    expect(result.accruedInterestPerUnit).toBe(result.totalAccruedInterest / 10);
    expect(result.totalAccruedInterest).toBe(result.pricing.accruedInterest);
    expect(result.noOfAccrualDays).toBe(30);
  });
});
