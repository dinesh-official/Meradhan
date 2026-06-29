import { describe, it, expect } from "bun:test";
import { mapDeridataAutofill, deridataDateToYmd } from "./bond_auto_update_autofill.deridata";

const issue = {
  isin: "INE818W08131", issuerName: "ABC LTD", couponFixed: 8.5, couponType: "Fixed",
  couponFrequency: "Quarterly", faceValue: 100000, recordDate: 15,
  maturity: new Date("2028-04-11T05:30:00.000Z"), allotmentDate: new Date("2023-06-26T05:30:00.000Z"),
  couponDate: new Date("2026-04-11T05:30:00.000Z"), security: "Secured", seniority: "Senior",
  taxFree: "No", listed: "NSE", redemptionType: "Bullet", currentRating: ["CARE: AA+"],
} as any;

const calc = {
  summary: {
    clean_price: "98.5345", accrued_int_bottom: "40,75,383.98", principal: "77,63,32,424.24",
    total_consideration: "78,04,07,808.22", xirr: "", cashflow_shut_flag: false,
    shut_period_message: null, record_date: "16-Mar-2026",
  },
  cashflows: [
    { cash_flow_dates: "30-Apr-2026", coupon_cash_flow: "0.7641", principal_cash_flow: "0.0000", total_cash_flow: "0.7641" },
    { cash_flow_dates: "27-May-2028", coupon_cash_flow: "0.0264", principal_cash_flow: "3.0303", total_cash_flow: "3.0567" },
  ],
} as any;

describe("deridataDateToYmd", () => {
  it("converts DD-MMM-YYYY and rejects junk", () => {
    expect(deridataDateToYmd("11-Apr-2028")).toBe("2028-04-11");
    expect(deridataDateToYmd("-")).toBeNull();
  });
});

describe("mapDeridataAutofill", () => {
  const resolved = {
    quantity: 10, settlementDateYmd: "2026-03-20", settlementDateOverridden: false,
    pricingYield: 9.1, pricingYieldOverride: 9.1,
  };
  const out = mapDeridataAutofill({ isin: "INE818W08131", resolved, issue, bondData: null, calc });

  it("maps pricing from the calculator summary", () => {
    expect(out.pricing.finalPrice).toBe(98.5345);
    expect(out.pricing.settlementAmount).toBe(780407808.22);
    expect(out.suggested.accruedInterest).toBe(4075383.98);
    expect(out.suggested.principalAmount).toBe(776332424.24);
    expect(out.suggested.totalConsideration).toBe(780407808.22);
    expect(out.suggested.yield).toBe(9.1);
  });

  it("maps reference fields from issue-detail and leaves gap fields null/empty", () => {
    expect(out.suggested.bondName).toBe("ABC LTD");
    expect(out.suggested.couponRate).toBe(8.5);
    expect(out.suggested.faceValue).toBe(100000);
    expect(out.suggested.interestPaymentMode).toBe("QUARTERLY");
    expect(out.suggested.natureOfInstrument).toBe("SECURED");
    expect(out.suggested.maturityDate).toBe("2028-04-11");
    expect(out.suggested.recordDate).toBe("2026-03-16");
    expect(out.suggested.recordDays).toBe(15);
    expect(out.suggested.nextCouponDate).toBe("2026-04-11");
    expect(out.suggested.accruedInterestDays).toBeNull();
    expect(out.suggested.lastCouponDate).toBe("");
    expect(out.suggested.allCouponDates).toEqual(["2026-04-30", "2028-05-27"]);
  });

  it("flags the Deridata source and shut-period state", () => {
    expect(out.sources.usedDeridata).toBe(true);
    expect(out.suggested.isUnderShutPeriod).toBe(false);
  });
});
