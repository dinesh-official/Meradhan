import { describe, expect, test } from "bun:test";
import {
  mapDeriDataToCalcApiResponse,
  parseDeriDataMoney,
  parseDeriDataPricingAmounts,
  parseDeriDataRecordDateYmd,
} from "./deridata.calc.adapter";
import type { DeriDataCalculatorResponse } from "./deridata.types";

const sampleResponse: DeriDataCalculatorResponse = {
  summary: {
    clean_price: "98.9572",
    accrued_int_top: "0.4603",
    dirty_price: "99.4175",
    principal: "9,895.72",
    accrued_int_bottom: "46.03",
    total_consideration: "9,941.75",
    xirr: "",
  },
  cashflows: [
    {
      cash_flow_dates: "22-Jul-2026",
      coupon_cash_flow: "0.9863",
      principal_cash_flow: "0.0000",
      total_cash_flow: "0.9863",
    },
  ],
  cashflow_shut_flag: false,
  shut_period_message: null,
  record_date: "08-Jul-2026",
};

describe("deridata.calc.adapter", () => {
  test("parseDeriDataPricingAmounts prefers DeriData stamp_duty field", () => {
    const amounts = parseDeriDataPricingAmounts({
      ...sampleResponse,
      summary: {
        ...sampleResponse.summary,
        stamp_duty: "1",
        settlement_amount: "9,942.75",
      },
    });

    expect(amounts.stampDuty).toBe(1);
    expect(amounts.settlementAmount).toBe(9942.75);
  });

  test("parseDeriDataPricingAmounts maps DeriData summary fields", () => {
    const amounts = parseDeriDataPricingAmounts(sampleResponse);

    expect(amounts.cleanPrice).toBe(98.9572);
    expect(amounts.accruedInterestPerUnit).toBe(0.4603);
    expect(amounts.principalAmount).toBe(9895.72);
    expect(amounts.totalAccruedInterest).toBe(46.03);
    expect(amounts.totalConsideration).toBe(9941.75);
    expect(amounts.stampDuty).toBe(0);
    expect(amounts.settlementAmount).toBe(9941.75);
  });

  test("parseDeriDataMoney handles comma-separated values", () => {
    expect(parseDeriDataMoney("9,895.72")).toBe(9895.72);
    expect(parseDeriDataMoney("46.03")).toBe(46.03);
  });

  test("parseDeriDataRecordDateYmd", () => {
    expect(parseDeriDataRecordDateYmd("08-Jul-2026")).toBe("2026-07-08");
  });

  test("mapDeriDataToCalcApiResponse maps summary fields", () => {
    const mapped = mapDeriDataToCalcApiResponse(sampleResponse, {
      quantity: 1,
      settlementDateYmd: "2026-07-06",
      accruedDays: 12,
      periodStatus: "Shut Period",
      ytm: 13.8,
    });

    expect(mapped.final_price).toBe("98.9572");
    expect(mapped.total_ai).toBe("46.03");
    expect(mapped.principal_amount).toBe("9,895.72");
    expect(mapped.total_consideration).toBe("9,941.75");
    expect(mapped.final_yield_raw).toBe(13.8);
    expect(mapped.accrued_days).toBe(12);
    expect(mapped.period_status).toBe("Shut Period");
    expect(mapped.cf_count).toBe(1);
    expect(mapped.stamp_duty).toBe("0");
    expect(parseDeriDataMoney(mapped.settlement_amount)).toBe(9941.75);
  });

  test("manual totalAccruedInterest overrides DeriData accrued_int_bottom", () => {
    const mapped = mapDeriDataToCalcApiResponse(
      {
        ...sampleResponse,
        summary: {
          ...sampleResponse.summary,
          accrued_int_bottom: "2,819.18",
        },
      },
      {
        quantity: 10,
        settlementDateYmd: "2026-07-06",
        totalAccruedInterest: 2500.5,
        principalAmount: 1_000_000,
        totalConsideration: 1_002_500.5,
        settlementAmount: 1_002_501.5,
      },
    );

    expect(parseDeriDataMoney(mapped.total_ai)).toBe(2500.5);
    expect(parseDeriDataMoney(mapped.principal_amount)).toBe(1_000_000);
    expect(parseDeriDataMoney(mapped.total_consideration)).toBe(1_002_500.5);
    expect(parseDeriDataMoney(mapped.settlement_amount)).toBe(1_002_501.5);
  });

  test("manualAccruedInterest skips DeriData accrued_int_bottom when total is absent", () => {
    const mapped = mapDeriDataToCalcApiResponse(
      {
        ...sampleResponse,
        summary: {
          ...sampleResponse.summary,
          accrued_int_bottom: "2,819.18",
        },
      },
      {
        quantity: 10,
        settlementDateYmd: "2026-07-06",
        manualAccruedInterest: true,
      },
    );

    expect(parseDeriDataMoney(mapped.total_ai)).toBe(0);
  });

  test("stamp duty is calculated from total consideration, not principal", () => {
    const mapped = mapDeriDataToCalcApiResponse(
      {
        ...sampleResponse,
        summary: {
          ...sampleResponse.summary,
          principal: "400,000.00",
          accrued_int_bottom: "250,000.00",
          total_consideration: "650,000.00",
        },
      },
      {
        quantity: 1,
        settlementDateYmd: "2026-07-06",
      },
    );

    expect(mapped.stamp_duty).toBe("1");
    expect(parseDeriDataMoney(mapped.settlement_amount)).toBe(650_001);
  });
});
