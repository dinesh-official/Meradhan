import { describe, expect, test } from "bun:test";
import {
  calculateBondPricing,
  calculateStampDuty,
  resolveManualPricingFromAutofill,
} from "./bondManualPricing";
import type { BondDealAutofillResponse } from "@root/apiGateway";

describe("bondManualPricing", () => {
  test("calculateStampDuty from total consideration", () => {
    expect(calculateStampDuty(1_005_866.25)).toBe(1);
    expect(calculateStampDuty(3_945)).toBe(0);
  });

  test("calculateBondPricing scales principal and accrued interest", () => {
    const result = calculateBondPricing({
      faceValue: 10_000,
      cleanPrice: 98.9572,
      accruedInterestPerUnit: 0.4603,
      quantity: 2,
    });

    expect(result.principalAmount).toBe(19_791.44);
    expect(result.accruedInterest).toBe(92.06);
    expect(result.stampDuty).toBe(0);
    expect(result.settlementAmount).toBe(19_883.5);
  });

  test("resolveManualPricingFromAutofill uses manual inputs", () => {
    const autofill = {
      isin: "INE123",
      quantity: 1,
      sources: { usedReferenceMetadata: true, usedCouponSchedule: true, yieldSource: "bonds" },
      suggested: { faceValue: 10_000, yield: 10 } as BondDealAutofillResponse["suggested"],
      pricing: {
        finalPrice: 98.5,
        finalYieldRaw: 10,
        accruedInterestPerUnit: 1.25,
        settlementAmount: null,
        totalAccruedInterest: null,
        principalAmount: null,
        totalConsideration: null,
        calc: {},
      },
      margin: {},
    } satisfies BondDealAutofillResponse;

    const manual = resolveManualPricingFromAutofill(autofill);
    expect(manual?.principalAmount).toBe(9_850);
    expect(manual?.accruedInterest).toBe(125);
    expect(manual?.totalConsideration).toBe(9_975);
    expect(manual?.stampDuty).toBe(0);
  });
});
