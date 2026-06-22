import { describe, expect, test } from "bun:test";
import { reconcileInventory } from "./inventory_reconciliation";

describe("reconcileInventory", () => {
  test("subtracts in-flight (not-yet-settled) quantity from PDF balance — the Muthoot 150/50 case", () => {
    const result = reconcileInventory({
      pdfRows: [{ isin: "INE549K08574", balance: 150, companyName: "MUTHOOT FINCORP LIMITED" }],
      inFlightByIsin: new Map([["INE549K08574", 50]]),
    });

    expect(result.lines).toEqual([
      {
        isin: "INE549K08574",
        companyName: "MUTHOOT FINCORP LIMITED",
        pdfBalance: 150,
        inFlight: 50,
        correctedQty: 100,
      },
    ]);
    expect(result.anomalies).toEqual([]);
    expect(result.disappearedIsins).toEqual([]);
  });

  test("uses 0 in-flight when an ISIN has no pending orders", () => {
    const result = reconcileInventory({
      pdfRows: [{ isin: "INE08XP07324", balance: 10 }],
      inFlightByIsin: new Map(),
    });

    expect(result.lines[0]).toMatchObject({ isin: "INE08XP07324", inFlight: 0, correctedQty: 10 });
  });

  test("floors negative corrected quantity at 0 and records it as an anomaly", () => {
    const result = reconcileInventory({
      pdfRows: [{ isin: "INE413U07442", balance: 40 }],
      inFlightByIsin: new Map([["INE413U07442", 55]]),
    });

    expect(result.lines[0]).toMatchObject({ isin: "INE413U07442", correctedQty: 0 });
    expect(result.anomalies).toEqual([{ isin: "INE413U07442", pdfBalance: 40, inFlight: 55 }]);
  });

  test("reports ISINs that were in the prior batch but are absent from the PDF", () => {
    const result = reconcileInventory({
      pdfRows: [{ isin: "INE08XP07324", balance: 10 }],
      inFlightByIsin: new Map(),
      priorIsins: ["INE08XP07324", "INE605Y07155"],
    });

    expect(result.disappearedIsins).toEqual(["INE605Y07155"]);
  });

  test("includes a PDF ISIN that is new to the CRM", () => {
    const result = reconcileInventory({
      pdfRows: [{ isin: "INE999X07999", balance: 7 }],
      inFlightByIsin: new Map(),
      priorIsins: ["INE08XP07324"],
    });

    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toMatchObject({ isin: "INE999X07999", correctedQty: 7 });
  });

  test("returns lines sorted by ISIN ascending", () => {
    const result = reconcileInventory({
      pdfRows: [
        { isin: "INE605Y07155", balance: 35 },
        { isin: "INE08XP07324", balance: 10 },
      ],
      inFlightByIsin: new Map(),
    });

    expect(result.lines.map((l) => l.isin)).toEqual(["INE08XP07324", "INE605Y07155"]);
  });
});
