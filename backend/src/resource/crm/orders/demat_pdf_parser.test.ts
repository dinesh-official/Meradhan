import { describe, expect, test } from "bun:test";
import { parseDematHoldingText } from "./demat_pdf_parser";

// Faithful sample of what pdf-parse actually extracts from the HDFC "Depository
// Holding Details" statement (captured via scripts/debug_demat_pdf.ts). The real
// layout glues columns together with NO separators: the ISIN runs into the
// company name, and Balance/Rate/Value/Status are concatenated
// ("10.00096,300.00963,000.00Free"). Balance has 3 decimals; Rate and Value have
// 2 — that decimal pattern is what makes the glued tail splittable. A synthetic
// Pledged row and the grand-total line are appended to exercise filtering.
const REAL = `

BONDNEST CAPITAL INDIA SECURITIES PVT LTD
MUMBAI - 400012
Account  TypeISINCompany NameScrip TypeBalanceRate (Rs.)Value (Rs.)Status
Free Balance        INE08XP07324AKARA CAPITAL ADVISORS PRIVATE
LIMITED
12.50 NCD 27DC28
FVRS1LAC
10.00096,300.00963,000.00Free
INE605Y07155AUXILO FINSERVE PRIVATE LIMITEDSR 003 9.90 NCD
21FB27 FVRS1LAC
35.000102,009.363,570,327.60Free
INE01YL07433EARLYSALARY SERVICES PRIVATE
LIMITED
10.50 NCD 09JN28
FVRS1LAC
50.00099,969.604,998,480.00Free
INE0BUS07CL8INDEL MONEY  LIMITED10.50 NCD 17AP29
FVRS10000
349.0009,838.003,433,462.00Free
INE0NES07329KEERTANA FINSERV LIMITED12 NCD 22SP27
FVRS10000
1,183.0009,820.3611,617,485.88Free
INE000PLD012SOME RESTRICTED CO9 NCD 01JA30
FVRS1LAC
5.000100,000.00500,000.00Pledged
129,068,992.59
Page Number 4 of 4`;

describe("parseDematHoldingText (real glued pdf-parse layout)", () => {
  test("extracts every Free holding's ISIN and Balance from the glued numeric tail", () => {
    const { rows } = parseDematHoldingText(REAL);
    const byIsin = Object.fromEntries(rows.map((r) => [r.isin, r.balance]));
    expect(byIsin).toEqual({
      INE08XP07324: 10,
      INE605Y07155: 35,
      INE01YL07433: 50,
      INE0BUS07CL8: 349,
      INE0NES07329: 1183,
    });
  });

  test("parses large comma-grouped balances (Keertana 1,183.000 -> 1183)", () => {
    const { rows } = parseDematHoldingText(REAL);
    expect(rows.find((r) => r.isin === "INE0NES07329")?.balance).toBe(1183);
  });

  test("does not mistake the coupon/face-value in the scrip type for the balance", () => {
    const { rows } = parseDematHoldingText(REAL);
    // INDEL row: scrip '10.50 NCD 17AP29 FVRS10000', balance 349 — not 10.5 or 10000.
    expect(rows.find((r) => r.isin === "INE0BUS07CL8")?.balance).toBe(349);
  });

  test("skips non-Free holdings and records a warning", () => {
    const { rows, parseWarnings } = parseDematHoldingText(REAL);
    expect(rows.find((r) => r.isin === "INE000PLD012")).toBeUndefined();
    expect(parseWarnings.some((w) => w.includes("INE000PLD012"))).toBe(true);
  });

  test("does not parse the grand-total line as a holding", () => {
    const { rows } = parseDematHoldingText(REAL);
    expect(rows.every((r) => r.balance !== 129068992.59)).toBe(true);
  });

  test("captures a best-effort company name", () => {
    const { rows } = parseDematHoldingText(REAL);
    expect(rows.find((r) => r.isin === "INE08XP07324")?.companyName).toContain(
      "AKARA CAPITAL ADVISORS PRIVATE"
    );
  });

  test("returns a warning and no rows when no ISINs are present", () => {
    const { rows, parseWarnings } = parseDematHoldingText("nothing to see here");
    expect(rows).toEqual([]);
    expect(parseWarnings.length).toBeGreaterThan(0);
  });

  test("de-duplicates a repeated ISIN by summing Free balances", () => {
    const text = `INE08XP07324ACME LTD10 NCD 01JA30
FVRS1LAC
10.000100.001000.00Free
INE08XP07324ACME LTD10 NCD 01JA30
FVRS1LAC
5.000100.00500.00Free`;
    const { rows } = parseDematHoldingText(text);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ isin: "INE08XP07324", balance: 15 });
  });

  test("also handles space-separated tails (robustness)", () => {
    const text =
      "INE549K08574MUTHOOT FINCORP LIMITED TR B 10.26 NCD 18JL31 FVRS10000 800.000 10,051.55 8,041,240.00 Free";
    const { rows } = parseDematHoldingText(text);
    expect(rows[0]).toMatchObject({ isin: "INE549K08574", balance: 800 });
  });
});
