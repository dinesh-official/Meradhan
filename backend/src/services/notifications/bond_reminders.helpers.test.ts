import { describe, expect, test } from "bun:test";
import { isSettlementUnderShutPeriodForCouponDue } from "@services/order/order-pricing-helper";
import {
  isSettlementUnderShutPeriodForCoupon,
  purchaseDateToSettlementAnchor,
  resolveSettlementDateForHolding,
  settlementDateFromBondDetails,
  settlementDateFromNseModSettleDate,
  istYmdToUtcMidnight,
} from "./bond_reminders.helpers";

const jun8 = istYmdToUtcMidnight(2026, 5, 8);
const jun10 = istYmdToUtcMidnight(2026, 5, 10);
const jun7 = istYmdToUtcMidnight(2026, 5, 7);
const jun15 = istYmdToUtcMidnight(2026, 5, 15);

describe("isSettlementUnderShutPeriodForCoupon", () => {
  /**
   * Verification: ex-interest purchase (shut period) must not get COUPON_D_MINUS_4 / COUPON_DAY
   * for that coupon anchor — enqueueCouponForOffset records SKIPPED instead of queuing mail.
   */
  test("shut-period purchase skips reminders for that coupon (record 8 Jun, settle 10 Jun, due 15 Jun)", () => {
    expect(
      isSettlementUnderShutPeriodForCoupon({
        settlement: jun10,
        dueDate: jun15,
        recordDateIst: jun8,
        recordDays: 7,
      }),
    ).toBe(true);
  });

  test("returns true when settlement is between record date and due date", () => {
    expect(
      isSettlementUnderShutPeriodForCoupon({
        settlement: jun10,
        dueDate: jun15,
        recordDateIst: jun8,
        recordDays: 7,
      }),
    ).toBe(true);
    expect(
      isSettlementUnderShutPeriodForCouponDue(jun10, jun15, jun8, 7),
    ).toBe(true);
  });

  test("returns false when settlement is before record date", () => {
    expect(
      isSettlementUnderShutPeriodForCoupon({
        settlement: jun7,
        dueDate: jun15,
        recordDateIst: jun8,
        recordDays: 7,
      }),
    ).toBe(false);
  });

  test("returns false on coupon due date (settlement not strictly before due)", () => {
    expect(
      isSettlementUnderShutPeriodForCoupon({
        settlement: jun15,
        dueDate: jun15,
        recordDateIst: jun8,
        recordDays: 7,
      }),
    ).toBe(false);
  });

  test("derives record date from recordDays when recordDateIst is missing", () => {
    expect(
      isSettlementUnderShutPeriodForCoupon({
        settlement: jun10,
        dueDate: jun15,
        recordDateIst: null,
        recordDays: 7,
      }),
    ).toBe(true);
  });

  test("returns false when record date cannot be determined", () => {
    expect(
      isSettlementUnderShutPeriodForCoupon({
        settlement: jun10,
        dueDate: jun15,
        recordDateIst: null,
        recordDays: null,
      }),
    ).toBe(false);
  });
});

describe("resolveSettlementDateForHolding", () => {
  test("prefers NSE modSettleDate over bondDetails and purchaseDate", () => {
    const resolved = resolveSettlementDateForHolding({
      modSettleDate: "10-06-2026",
      bondDetails: {
        pricing: { settlementDate: "2026-06-01" },
      },
      purchaseDate: new Date("2026-05-01T12:00:00.000Z"),
    });
    expect(resolved.getTime()).toBe(jun10.getTime());
  });

  test("uses bondDetails when NSE date absent", () => {
    const resolved = resolveSettlementDateForHolding({
      modSettleDate: null,
      bondDetails: {
        pricing: { settlementDate: "2026-06-10" },
      },
      purchaseDate: new Date("2026-05-01T12:00:00.000Z"),
    });
    expect(resolved.getTime()).toBe(jun10.getTime());
  });

  test("falls back to purchaseDate IST anchor", () => {
    const purchase = new Date("2026-06-10T18:30:00.000Z");
    const resolved = resolveSettlementDateForHolding({
      modSettleDate: undefined,
      bondDetails: null,
      purchaseDate: purchase,
    });
    expect(resolved.getTime()).toBe(purchaseDateToSettlementAnchor(purchase).getTime());
  });
});

describe("settlementDateFromNseModSettleDate", () => {
  test("parses ISO and DD-MM-YYYY", () => {
    expect(settlementDateFromNseModSettleDate("2026-06-10")?.getTime()).toBe(
      jun10.getTime(),
    );
    expect(settlementDateFromNseModSettleDate("10-06-2026")?.getTime()).toBe(
      jun10.getTime(),
    );
  });
});

describe("settlementDateFromBondDetails", () => {
  test("reads pricing.settlementDate YYYY-MM-DD", () => {
    expect(
      settlementDateFromBondDetails({
        pricing: { settlementDate: "2026-06-10" },
      })?.getTime(),
    ).toBe(jun10.getTime());
  });
});
