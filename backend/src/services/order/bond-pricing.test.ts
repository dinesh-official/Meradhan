import { describe, expect, test } from "bun:test";
import { calculateBondPricing } from "./bond-pricing";

describe("bond-pricing", () => {
  test("scales principal and accrued interest with quantity", () => {
    const result = calculateBondPricing({
      faceValue: 10_000,
      cleanPrice: 98.9572,
      accruedInterest: 0.4603,
      quantity: 2,
    });

    expect(result.principalAmount).toBe(19_791.44);
    expect(result.accruedInterest).toBe(92.06);
    expect(result.totalConsideration).toBe(19_883.5);
  });

  test("calculates stamp duty from total consideration", () => {
    const result = calculateBondPricing({
      faceValue: 10_000,
      cleanPrice: 100.5846,
      accruedInterest: 2.025,
      quantity: 1,
    });

    expect(result.principalAmount).toBe(10_058.46);
    expect(result.accruedInterest).toBe(202.5);
    expect(result.totalConsideration).toBe(10_260.96);
    expect(result.stampDuty).toBe(0);
    expect(result.settlementAmount).toBe(10_260.96);
  });

  test("returns normalized snapshot fields for reuse", () => {
    const result = calculateBondPricing({
      faceValue: 1000,
      cleanPrice: 98.5,
      accruedInterest: 1.25,
      quantity: 4,
    });

    expect(result).toEqual({
      quantity: 4,
      faceValue: 1000,
      cleanPrice: 98.5,
      accruedInterestPerUnit: 1.25,
      principalAmount: 3940,
      accruedInterest: 50,
      totalConsideration: 3990,
      stampDuty: 0,
      settlementAmount: 3990,
    });
  });

  test("matches DeriData accrued_int_top units (% of par per unit)", () => {
    const result = calculateBondPricing({
      faceValue: 10_000,
      cleanPrice: 105.9312,
      accruedInterest: 0.8836,
      quantity: 1,
      stampDutyOverride: 0,
    });

    expect(result.principalAmount).toBe(10_593.12);
    expect(result.accruedInterest).toBeCloseTo(88.36, 2);
    expect(result.totalConsideration).toBeCloseTo(10_681.48, 2);
    expect(result.stampDuty).toBe(0);
    expect(result.settlementAmount).toBeCloseTo(10_681.48, 2);
  });

  test("stampDutyOverride skips local stamp duty calculation", () => {
    const result = calculateBondPricing({
      faceValue: 10_000,
      cleanPrice: 105.9312,
      accruedInterest: 0.88,
      quantity: 1,
      stampDutyOverride: 1,
    });

    expect(result.accruedInterest).toBe(88);
    expect(result.stampDuty).toBe(1);
    expect(result.settlementAmount).toBeCloseTo(10_682.12, 2);
  });
});
