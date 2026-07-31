import { describe, expect, test } from "bun:test";
import { calculateStampDuty, resolveBondStampDuty } from "./stamp-duty";

describe("stamp-duty", () => {
  test("calculateStampDuty applies tiered rounding", () => {
    expect(calculateStampDuty(10_594)).toBe(0);
    expect(calculateStampDuty(650_000)).toBe(1);
  });

  test("resolveBondStampDuty reuses saved value when quantity matches", () => {
    expect(
      resolveBondStampDuty({
        totalConsideration: 10_594,
        quantity: 1,
        savedStampDuty: 1,
        savedPricingQuantity: 1,
      }),
    ).toBe(1);
  });

  test("resolveBondStampDuty recalculates when quantity differs", () => {
    expect(
      resolveBondStampDuty({
        totalConsideration: 21_188,
        quantity: 2,
        savedStampDuty: 1,
        savedPricingQuantity: 1,
      }),
    ).toBe(0);
  });
});
