import { describe, it, expect } from "bun:test";
import {
  mapCalculator,
  mapEbp,
  mapSecondaryTrades,
  mapSecurityCovenant,
  mapDocuments,
} from "./deridata.mappers";

describe("mapCalculator", () => {
  it("flattens summary + cashflows", () => {
    const { row, cashflows } = mapCalculator(
      "INE467V07966",
      { valueDate: "2026-04-16", mode: "yield_to_price", selectedYield: "ytm", inputYield: 10 },
      {
        summary: {
          clean_price: "98.5345",
          dirty_price: "99.0518",
          xirr: "",
          cashflow_shut_flag: false,
          record_date: "16-Mar-2026",
        },
        cashflows: [
          {
            cash_flow_dates: "30-Apr-2026",
            coupon_cash_flow: "0.7641",
            principal_cash_flow: "3.0303",
            total_cash_flow: "3.7944",
          },
        ],
      } as any,
    );
    expect(row.isin).toBe("INE467V07966");
    expect(row.cleanPrice).toBe("98.5345");
    expect(row.cashflowShutFlag).toBe(false);
    expect(cashflows).toHaveLength(1);
    expect(cashflows[0]!.couponCashFlow).toBe("0.7641");
    expect(cashflows[0]!.cashFlowDateIst).toBeInstanceOf(Date);
  });
});

describe("mapEbp", () => {
  it("returns one row per ebp_items entry with isin attached", () => {
    const rows = mapEbp({
      isin: "INE007N07041",
      ebp_items: [{ issue_size: "100.00", ebp: "BSE", bid_total: 100 }],
    } as any);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.isin).toBe("INE007N07041");
    expect(rows[0]!.issueSize).toBe("100.00");
    expect(rows[0]!.bidTotal).toBe(100);
  });
});

describe("mapSecondaryTrades", () => {
  it("splits summary and history", () => {
    const { row, history } = mapSecondaryTrades({
      isin: "INE0J7Q07017",
      trades: [{ way_percentage: "0.0000", last_trade_date: "21-Nov-2025", spread: 0 }],
      trade_history: [{ trade_date: "15-Jan-2025", spread: 68, volume: 46.3874, yield: 7.536 }],
    } as any);
    expect(row.isin).toBe("INE0J7Q07017");
    expect(row.wayPercentage).toBe("0.0000");
    expect(history).toHaveLength(1);
    expect(history[0]!.yield).toBe(7.536);
  });
});

describe("mapSecurityCovenant", () => {
  it("flattens covenant object into columns", () => {
    const row = mapSecurityCovenant({
      isin: "INE860H07IX6",
      security_cover: "110%",
      guarantee: "Not Guaranteed",
      financial_covenants: {
        cad_ratio: "Capital Adequacy >= 18%",
        de_ratio: "Debt : Equity <= 6x",
      },
    } as any);
    expect(row.isin).toBe("INE860H07IX6");
    expect(row.securityCover).toBe("110%");
    expect(row.covCadRatio).toBe("Capital Adequacy >= 18%");
    expect(row.covDeRatio).toBe("Debt : Equity <= 6x");
  });
});

describe("mapDocuments", () => {
  it("keeps press releases, drops im_link", () => {
    const { row, pressReleases } = mapDocuments({
      isin: "INE860H07IX6",
      im_link: "https://deridata.s3.amazonaws.com/secret",
      press_release_links: [{ agency: "CARE", rating: "AA+", outlook: "Stable", url: "https://x" }],
    } as any);
    expect(row.isin).toBe("INE860H07IX6");
    expect((row.raw as any)?.im_link).toBeUndefined();
    expect(pressReleases).toHaveLength(1);
    expect(pressReleases[0]!.agency).toBe("CARE");
  });
});
