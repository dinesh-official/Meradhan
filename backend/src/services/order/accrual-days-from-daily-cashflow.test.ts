import { describe, expect, test } from "bun:test";
import {
  resolveAccrualDaysFromDeriDataResponse,
  toAutofillShutFields,
} from "./accrual-days-from-daily-cashflow";
import type { DeriDataCalculatorResponse } from "@services/deridata/deridata.types";

const baseSummary: DeriDataCalculatorResponse["summary"] = {
  clean_price: "100.0000",
  accrued_int_top: "0.0000",
  dirty_price: "100.0000",
  principal: "10,000.00",
  accrued_int_bottom: "0.00",
  total_consideration: "10,000.00",
  xirr: "10.5",
};

describe("resolveAccrualDaysFromDeriDataResponse", () => {
  test("in shut: negative accrual days to next coupon", async () => {
    const response: DeriDataCalculatorResponse = {
      summary: baseSummary,
      cashflows: [
        {
          cash_flow_dates: "23-Jul-2026",
          coupon_cash_flow: "1.0000",
          principal_cash_flow: "0.0000",
          total_cash_flow: "1.0000",
        },
      ],
      cashflow_shut_flag: true,
      record_date: "12-Jul-2026",
    };

    const result = await resolveAccrualDaysFromDeriDataResponse({
      settlementDate: "2026-07-18",
      response,
      lastCouponFallback: "2026-07-11",
      isin: "INETEST000001",
      underShut: true,
      yield: 10.5,
    });

    expect(result.isUnderShutPeriod).toBe(true);
    expect(result.accrualDays).toBe(-5);
    expect(result.recordDate).toBe("2026-07-12");
    expect(result.nextCouponDate).toBe("2026-07-23");
    expect(result.lastCouponDate).toBe("2026-07-11");
  });

  test("before record date: positive accrual from last coupon", async () => {
    const response: DeriDataCalculatorResponse = {
      summary: baseSummary,
      cashflows: [
        {
          cash_flow_dates: "13-Aug-2026",
          coupon_cash_flow: "1.0000",
          principal_cash_flow: "0.0000",
          total_cash_flow: "1.0000",
        },
      ],
      cashflow_shut_flag: false,
      record_date: "29-Jul-2026",
    };

    const result = await resolveAccrualDaysFromDeriDataResponse({
      settlementDate: "2026-07-13",
      response,
      lastCouponFallback: "2026-06-13",
      isin: "INETEST000001",
    });

    expect(result.isUnderShutPeriod).toBe(false);
    expect(result.accrualDays).toBe(30);
    expect(result.recordDate).toBe("2026-07-29");
    expect(result.nextCouponDate).toBe("2026-08-13");
  });

  test("throws when record_date missing", async () => {
    const response: DeriDataCalculatorResponse = {
      summary: baseSummary,
      cashflows: [
        {
          cash_flow_dates: "23-Jul-2026",
          coupon_cash_flow: "1.0000",
          principal_cash_flow: "0.0000",
          total_cash_flow: "1.0000",
        },
      ],
      record_date: null,
    };

    await expect(
      resolveAccrualDaysFromDeriDataResponse({
        settlementDate: "2026-07-18",
        response,
        lastCouponFallback: "2026-07-11",
      }),
    ).rejects.toThrow(/record_date/);
  });

  test("toAutofillShutFields maps Phase1 result for Phase2 calculator input", async () => {
    const response: DeriDataCalculatorResponse = {
      summary: baseSummary,
      cashflows: [
        {
          cash_flow_dates: "23-Jul-2026",
          coupon_cash_flow: "1.0000",
          principal_cash_flow: "0.0000",
          total_cash_flow: "1.0000",
        },
      ],
      cashflow_shut_flag: true,
      record_date: "12-Jul-2026",
    };

    const phase1 = await resolveAccrualDaysFromDeriDataResponse({
      settlementDate: "2026-07-18",
      response,
      lastCouponFallback: "2026-07-11",
    });
    const fields = toAutofillShutFields(phase1);

    // Phase2 DeriData call must use computed shut, not the probe echo.
    expect(fields.cashflowShutFlag).toBe(true);
    expect(fields.cashflowShutFlag).toBe(phase1.isUnderShutPeriod);
    expect(fields.accruedDays).toBe(-5);
    expect(fields.isUnderShutPeriod).toBe(true);
    expect(fields.periodStatus).toBe("Shut Period");
    expect(fields.recordDate).toBe("2026-07-12");
    expect(fields.nextCouponDate).toBe("2026-07-23");
    expect(fields.recordDays).toBe(11);
  });
});
