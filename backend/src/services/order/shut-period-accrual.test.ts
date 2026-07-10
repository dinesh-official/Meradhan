import { describe, expect, test } from "bun:test";
import { resolveShutPeriod } from "./shut-period-accrual";

describe("resolveShutPeriod", () => {
  test("in shut: negative accrual days to next coupon", () => {
    expect(
      resolveShutPeriod({
        RECORD_DATE: "2026-07-12",
        NEXT_COUPON_DATE: "2026-07-23",
        SETTLEMENT_DATE: "2026-07-18",
        LAST_COUPON_DATE: "2026-07-11",
      }),
    ).toEqual({ accrualDays: -5, isUnderShutPeriod: true });
  });

  test("before record date: positive accrual from last coupon", () => {
    expect(
      resolveShutPeriod({
        RECORD_DATE: "2026-07-29",
        NEXT_COUPON_DATE: "2026-08-13",
        SETTLEMENT_DATE: "2026-07-13",
        LAST_COUPON_DATE: "2026-06-13",
      }),
    ).toEqual({ accrualDays: 30, isUnderShutPeriod: false });
  });

  test("settlement on coupon date: zero accrual, shut on", () => {
    expect(
      resolveShutPeriod({
        RECORD_DATE: "2026-07-12",
        NEXT_COUPON_DATE: "2026-07-23",
        SETTLEMENT_DATE: "2026-07-23",
        LAST_COUPON_DATE: "2026-07-11",
      }),
    ).toEqual({ accrualDays: 0, isUnderShutPeriod: true });
  });
});
