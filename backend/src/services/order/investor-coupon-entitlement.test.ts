import { describe, expect, test } from "bun:test";
import {
  formatInterestPaymentDateDdMmm,
  formatLastInterestPaymentDateDisplay,
  isBuyerEntitledToCoupon,
  resolveInvestorCouponScheduleForPdf,
} from "./investor-coupon-entitlement";

const coupons = [
  { dueDateYmd: "2026-07-01", recordDateYmd: "2026-06-16", recordDays: 15 },
  { dueDateYmd: "2027-01-01", recordDateYmd: "2026-12-22", recordDays: 10 },
  { dueDateYmd: "2027-07-01", recordDateYmd: "2027-06-16", recordDays: 15 },
  { dueDateYmd: "2028-01-01", recordDateYmd: "2027-12-17", recordDays: 15 },
];

describe("investor-coupon-entitlement", () => {
  test("format helpers match existing PDF string shapes", () => {
    const due = new Date("2026-02-16T00:00:00.000Z");
    expect(formatInterestPaymentDateDdMmm(due)).toBe("16-Feb");
    expect(formatLastInterestPaymentDateDisplay(due)).toBe(
      "16-Feb-2026 (Monday)",
    );
  });

  test("normal: settlement before record → next coupon included", () => {
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-12-20",
      coupons,
      endLimitYmd: "2027-12-20",
    });

    expect(result.buyerEntitledToNextCoupon).toBe(true);
    expect(result.interestPaymentDates[0]).toBe("1-Jan");
    expect(result.interestPaymentDates).toContain("1-Jul");
    expect(result.lastInterestPaymentDate).toBe("01-Jul-2026 (Wednesday)");
    expect(result.lastInterestPaymentDateRaw).toBe("2026-07-01");
  });

  test("shut: settlement after record → next coupon excluded for buyer", () => {
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-12-24",
      coupons,
      endLimitYmd: "2027-12-24",
    });

    expect(result.buyerEntitledToNextCoupon).toBe(false);
    expect(result.interestPaymentDates[0]).not.toBe("1-Jan");
    expect(result.interestPaymentDates[0]).toBe("1-Jul");
    expect(result.lastInterestPaymentDate).toBe("01-Jul-2026 (Wednesday)");
    expect(result.lastInterestPaymentDateRaw).toBe("2026-07-01");
  });

  test("settlement on record date → buyer entitled", () => {
    expect(
      isBuyerEntitledToCoupon("2026-12-22", {
        dueDateYmd: "2027-01-01",
        recordDateYmd: "2026-12-22",
      }),
    ).toBe(true);

    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-12-22",
      coupons,
      endLimitYmd: "2027-12-22",
    });
    expect(result.buyerEntitledToNextCoupon).toBe(true);
    expect(result.interestPaymentDates[0]).toBe("1-Jan");
  });

  test("settlement on coupon date → that coupon not in buyer list", () => {
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2027-01-01",
      coupons,
      endLimitYmd: "2028-01-01",
    });

    expect(result.buyerEntitledToNextCoupon).toBe(false);
    // Jan-2027 coupon is reassigned away from buyer; Jul-2027 is first entitled.
    expect(result.interestPaymentDates[0]).toBe("1-Jul");
    expect(result.interestPaymentDates).toEqual(["1-Jul", "1-Jan"]);
    // Due on settlement counts as last interest payment.
    expect(result.lastInterestPaymentDateRaw).toBe("2027-01-01");
    expect(result.lastInterestPaymentDate).toBe("01-Jan-2027 (Friday)");
  });

  test("missing record date includes coupon (safe fallback)", () => {
    expect(
      isBuyerEntitledToCoupon("2026-12-24", {
        dueDateYmd: "2027-01-01",
      }),
    ).toBe(true);
  });

  test("recordDays derives record date when explicit record missing", () => {
    // due 2027-01-01, recordDays 10 → record 2026-12-22
    expect(
      isBuyerEntitledToCoupon("2026-12-24", {
        dueDateYmd: "2027-01-01",
        recordDays: 10,
      }),
    ).toBe(false);
    expect(
      isBuyerEntitledToCoupon("2026-12-20", {
        dueDateYmd: "2027-01-01",
        recordDays: 10,
      }),
    ).toBe(true);
  });
});
