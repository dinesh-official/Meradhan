import { describe, expect, test } from "bun:test";
import { resolveCashflowShutFlag } from "./order-pricing-helper";

describe("resolveCashflowShutFlag", () => {
  test("INE342T07544-style monthly bond: settlement before record window is false", () => {
    expect(
      resolveCashflowShutFlag({
        settlementDateYmd: "2026-07-13",
        nextCouponDateYmd: "2026-08-13",
        recordDays: 15,
      }),
    ).toBe(false);
  });

  test("shut period when settlement is on/after record date", () => {
    expect(
      resolveCashflowShutFlag({
        settlementDateYmd: "2026-07-13",
        nextCouponDateYmd: "2026-07-26",
        recordDays: 14,
      }),
    ).toBe(true);
  });

  test("coupon-schedule record date wins over recordDays offset", () => {
    expect(
      resolveCashflowShutFlag({
        settlementDateYmd: "2026-07-13",
        nextCouponDateYmd: "2026-08-13",
        recordDays: 15,
        recordDateYmd: "2026-06-29",
      }),
    ).toBe(true);
  });

  test("maturity coupon suppresses shut even inside record window", () => {
    expect(
      resolveCashflowShutFlag({
        settlementDateYmd: "2026-07-13",
        nextCouponDateYmd: "2026-12-31",
        recordDays: 15,
        maturityDateYmd: "2026-12-31",
      }),
    ).toBe(false);
  });
});
