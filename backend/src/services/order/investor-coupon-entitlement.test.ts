import { describe, expect, test } from "bun:test";
import {
  formatInterestPaymentDateDdMmm,
  formatLastInterestPaymentDateDisplay,
  isBuyerEntitledToCoupon,
  isCashflowShutForUpcomingCoupon,
  resolveInvestorCouponScheduleForPdf,
} from "./investor-coupon-entitlement";

/** Semi-annual schedule used by older entitlement tests. */
const semiAnnualCoupons = [
  { dueDateYmd: "2026-07-01", recordDateYmd: "2026-06-16", recordDays: 15 },
  { dueDateYmd: "2027-01-01", recordDateYmd: "2026-12-22", recordDays: 10 },
  { dueDateYmd: "2027-07-01", recordDateYmd: "2027-06-16", recordDays: 15 },
  { dueDateYmd: "2028-01-01", recordDateYmd: "2027-12-17", recordDays: 15 },
];

/** Monthly 20th coupons Jun-2026 … Aug-2027, recordDays = 15. */
function monthlyCoupons20th(): {
  dueDateYmd: string;
  recordDays: number;
}[] {
  const out: { dueDateYmd: string; recordDays: number }[] = [];
  // 2026-06 through 2027-08
  for (let y = 2026; y <= 2027; y++) {
    const startM = y === 2026 ? 6 : 1;
    const endM = y === 2027 ? 8 : 12;
    for (let m = startM; m <= endM; m++) {
      out.push({
        dueDateYmd: `${y}-${String(m).padStart(2, "0")}-20`,
        recordDays: 15,
      });
    }
  }
  return out;
}

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
      coupons: semiAnnualCoupons,
    });

    expect(result.buyerEntitledToNextCoupon).toBe(true);
    expect(result.cashflowShutFlag).toBe(false);
    expect(result.interestPaymentDates[0]).toBe("1-Jan");
    expect(result.interestPaymentDates).toContain("1-Jul");
    expect(result.lastInterestPaymentDate).toBe("01-Jul-2026 (Wednesday)");
    expect(result.lastInterestPaymentDateRaw).toBe("2026-07-01");
  });

  test("shut: settlement after record → last IP = upcoming coupon (senior formula)", () => {
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-12-24",
      coupons: semiAnnualCoupons,
    });

    expect(result.buyerEntitledToNextCoupon).toBe(false);
    expect(result.cashflowShutFlag).toBe(true);
    expect(result.interestPaymentDates[0]).toBe("1-Jul");
    expect(result.lastInterestPaymentDate).toBe("01-Jan-2027 (Friday)");
    expect(result.lastInterestPaymentDateRaw).toBe("2027-01-01");
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
      coupons: semiAnnualCoupons,
    });
    expect(result.buyerEntitledToNextCoupon).toBe(true);
    expect(result.interestPaymentDates[0]).toBe("1-Jan");
  });

  test("settlement on coupon date → that coupon is last IP; buyer starts at next", () => {
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2027-01-01",
      coupons: semiAnnualCoupons,
    });

    expect(result.buyerEntitledToNextCoupon).toBe(true);
    expect(result.cashflowShutFlag).toBe(false);
    expect(result.interestPaymentDates[0]).toBe("1-Jul");
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

describe("monthly shut-period last IP (client / senior formula)", () => {
  const coupons = monthlyCoupons20th();

  test("NOT in shut: settlement 01-Jul → last IP 20-Jun, cash flows from 20-Jul", () => {
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-07-01",
      coupons,
    });

    expect(result.cashflowShutFlag).toBe(false);
    expect(result.buyerEntitledToNextCoupon).toBe(true);
    expect(result.lastInterestPaymentDateRaw).toBe("2026-06-20");
    expect(result.lastInterestPaymentDate).toBe("20-Jun-2026 (Saturday)");
    expect(result.interestPaymentDates[0]).toBe("20-Jul");
  });

  test("senior example: settle 14-Jul, record 05-Jul, next 20-Jul → last IP 20-Jul", () => {
    // recordDays=15 → record = 05-Jul; user also cited record 06-Jul — same shut outcome
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-07-14",
      coupons,
    });

    expect(
      isCashflowShutForUpcomingCoupon("2026-07-14", {
        dueDateYmd: "2026-07-20",
        recordDays: 15,
      }),
    ).toBe(true);

    expect(result.cashflowShutFlag).toBe(true);
    expect(result.buyerEntitledToNextCoupon).toBe(false);
    expect(result.lastInterestPaymentDateRaw).toBe("2026-07-20");
    expect(result.lastInterestPaymentDate).toBe("20-Jul-2026 (Monday)");
    expect(result.interestPaymentDates[0]).toBe("20-Aug");
  });

  test("senior example with explicit record 06-Jul", () => {
    const withRecord = monthlyCoupons20th().map((c) =>
      c.dueDateYmd === "2026-07-20"
        ? { ...c, recordDateYmd: "2026-07-06", recordDays: 14 }
        : c,
    );
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-07-14",
      coupons: withRecord,
    });

    expect(result.cashflowShutFlag).toBe(true);
    expect(result.lastInterestPaymentDateRaw).toBe("2026-07-20");
    expect(result.interestPaymentDates[0]).toBe("20-Aug");
  });

  test("IN shut: settlement 10-Jul → last IP 20-Jul, cash flows from 20-Aug", () => {
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-07-10",
      coupons,
    });

    expect(result.cashflowShutFlag).toBe(true);
    expect(result.lastInterestPaymentDateRaw).toBe("2026-07-20");
    expect(result.lastInterestPaymentDate).toBe("20-Jul-2026 (Monday)");
    expect(result.interestPaymentDates[0]).toBe("20-Aug");
    expect(result.interestPaymentDates).toHaveLength(12);
  });

  test("IN shut: settlement 18-Jul → last IP 20-Jul", () => {
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-07-18",
      coupons,
    });

    expect(result.cashflowShutFlag).toBe(true);
    expect(result.lastInterestPaymentDateRaw).toBe("2026-07-20");
    expect(result.interestPaymentDates[0]).toBe("20-Aug");
  });

  test("settlement on coupon date 20-Jul → last IP 20-Jul (on/before); cash flows from Aug", () => {
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-07-20",
      coupons,
    });

    // settle == next coupon → not in open shut window (settle < next is false)
    expect(result.cashflowShutFlag).toBe(false);
    expect(result.lastInterestPaymentDateRaw).toBe("2026-07-20");
    expect(result.lastInterestPaymentDate).toBe("20-Jul-2026 (Monday)");
    expect(result.interestPaymentDates[0]).toBe("20-Aug");
  });

  test("settlement on record date 05-Jul → shut flag true; last IP advances to 20-Jul; buyer still gets 20-Jul cash flow", () => {
    const result = resolveInvestorCouponScheduleForPdf({
      settlementYmd: "2026-07-05",
      coupons,
    });

    // RECORD ≤ settle < NEXT → cashflow_shut_flag true → last IP = upcoming coupon
    expect(result.cashflowShutFlag).toBe(true);
    expect(result.buyerEntitledToNextCoupon).toBe(true);
    expect(result.lastInterestPaymentDateRaw).toBe("2026-07-20");
    expect(result.interestPaymentDates[0]).toBe("20-Jul");
  });
});
