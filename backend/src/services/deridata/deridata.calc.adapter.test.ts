import { describe, expect, test } from "bun:test";
import {
  mapDeriDataToCalcApiResponse,
  parseDeriDataMoney,
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
});
