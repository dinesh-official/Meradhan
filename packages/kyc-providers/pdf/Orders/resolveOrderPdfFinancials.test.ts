import { describe, expect, test } from "bun:test";
import { resolveOrderPdfFinancials } from "./resolveOrderPdfFinancials";

describe("resolveOrderPdfFinancials", () => {
  test("prefers frozen order pricing snapshot for downstream consumers", () => {
    const result = resolveOrderPdfFinancials({
      qun: 2,
      faceValue: 1_000_000,
      orderData: {
        subTotal: 0,
        stampDuty: 0,
        totalAmount: 0,
        bondDetails: {
          pricing: {
            cleanPrice: 100.5846,
            principalAmount: 2_011_692,
            accruedInterest: 40.5,
            totalConsideration: 2_011_732.5,
            stampDuty: 2,
            settlementAmount: 2_011_734.5,
            noOfAccrualDays: 12,
          },
        },
      },
    });

    expect(result.cleanPrice).toBe(100.5846);
    expect(result.principalAmount).toBe(2_011_692);
    expect(result.accruedInterest).toBe(40.5);
    expect(result.totalConsideration).toBe(2_011_732.5);
    expect(result.stampDutyAmount).toBe(2);
    expect(result.settlementAmount).toBe(2_011_734.5);
    expect(result.accruedInterestDays).toBe(12);
  });

  test("settlement amount always includes stamp duty even when snapshot omits it", () => {
    const result = resolveOrderPdfFinancials({
      qun: 1,
      faceValue: 1_000,
      orderData: {
        stampDuty: 100,
        bondDetails: {
          pricing: {
            totalConsideration: 1_000_000,
            stampDuty: 100,
            settlementAmount: 1_000_000, // wrong snapshot without stamp
          },
        },
        metadata: {
          settleOrder: {
            modConsideration: 1_000_000,
            stampDutyAmount: 100,
          },
        },
      },
    });

    expect(result.totalConsideration).toBe(1_000_000);
    expect(result.stampDutyAmount).toBe(100);
    expect(result.settlementAmount).toBe(1_000_100);
  });
});
