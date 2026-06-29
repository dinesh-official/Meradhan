# Deridata-backed Load Autofill — Implementation Plan (Plan 4a)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development or superpowers:executing-plans. Checkbox steps.

**Goal:** Make the CRM "Load autofill" feature use Deridata data for that ISIN — reading `deridata_issue_detail` (instead of `bond_reference_*`) and pricing via the **Deridata Calculator API** (instead of calc.meradhan.co) — when Deridata data exists for the ISIN and the flag is on; otherwise fall back to the existing path unchanged.

**Architecture:** Add a pure mapper `mapDeridataAutofill(...)` + a thin orchestrator `buildDeridataAutofill(...)` in a new `bond_auto_update_autofill.deridata.ts`. `BondAutoUpdateAutofillService.buildAutofill` gains a guarded branch at the top: when `env.USE_DERIDATA_CALCULATOR` is true AND a `deridataIssueDetail` row exists for the ISIN, take the Deridata path; else the current path runs untouched. The Deridata path returns the **same `BondDealAutofillResponse` shape** so the CRM UI is unchanged.

**Tech Stack:** Bun test, Prisma (`db.dataBase`), Plan 1 `DeridataApi`, Plan 2 mappers/date helpers, existing `resolveAutoUpdateCalcInputs`.

## Decisions (from the user)
- **Scope:** Auto — Deridata when `deridataIssueDetail` exists (+ flag), else fall back to calc.meradhan.co. No hardcoded ISIN list.
- **Gap fields:** Deridata Calculator doesn't return accrued-interest *days* or an explicit last-coupon date → leave them null/empty (`accruedInterestDays: null`, `lastCouponDate: ""`).

## Global Constraints
- Backend root `/home/sugandhan/Desktop/Repos/MeraDhan/backend`. Reuse: `resolveAutoUpdateCalcInputs`, `parseCalcMoneyString`, `paymentFrequencyToDbEnum`, `mapNatureOfInstrument` from `bond_auto_update_autofill.calc.ts`; `deridataDateToIstIso` from `@modules/deridata/deridata.date`.
- Deridata Calculator **amount is in Crores (₹)**: `amount = quantity * faceValue / 1e7`. Mode = Yield-to-Price (`yield_to_price: true`, `selected_yield: "ytm"`, `ytm: pricingYield ?? 0`).
- Field map (Deridata `summary` → response): `clean_price`→finalPrice/sellPrice; `accrued_int_bottom`→accruedInterest(₹); `principal`→principalAmount; `total_consideration`→settlementAmount & totalConsideration; `xirr` ignored in yield→price mode (finalYieldRaw = the input pricingYield); `cashflow_shut_flag`/`shut_period_message`→isUnderShutPeriod; `record_date` (DD-MMM-YYYY)→recordDate (yyyy-mm-dd).
- `recordDays` ← `deridataIssueDetail.recordDate` (it's an integer day-count, not a date). `nextCouponDate` ← `deridataIssueDetail.couponDate` (yyyy-mm-dd) or first future cashflow. `allCouponDates` ← `cashflows[].cash_flow_dates` (skip `"-"`/null rows) as yyyy-mm-dd.
- Dates: convert Deridata `DD-MMM-YYYY` via `deridataDateToIstIso(...)?.slice(0,10)`.
- Flag: gate on `env.USE_DERIDATA_CALCULATOR`. Integration is a no-op (existing path) when off or when no Deridata row exists.
- Do NOT commit unless authorized.

---

### Task 1: Deridata autofill mapper + orchestrator

**Files:**
- Create: `backend/src/resource/crm/bonds/bond_auto_update_autofill.deridata.ts`
- Test: `backend/src/resource/crm/bonds/bond_auto_update_autofill.deridata.test.ts`
- Modify: `backend/src/resource/crm/bonds/bond_auto_update_autofill.service.ts` (add the guarded branch + extend `sources` with optional `usedDeridata`)

**Interfaces:**
- Consumes: `DeridataIssueDetail`/`DeridataCalculator` Prisma row shapes (via a minimal local type), `CalculatorResponse` (Plan 1), `resolveAutoUpdateCalcInputs`, `BondDealAutofillResponse`.
- Produces:
  - `deridataDateToYmd(s: string | null | undefined): string | null`.
  - `buildDeridataCalcInput(isin, resolved, faceValue): CalculatorInput`.
  - `mapDeridataAutofill(args): BondDealAutofillResponse` — pure mapping from issue-detail row + resolved inputs + calculator summary/cashflows.
  - `buildDeridataAutofill(isin, input, api, issueRow, bondData): Promise<BondDealAutofillResponse>` — calls the Deridata calculator then `mapDeridataAutofill`.

- [ ] **Step 1: Write the failing test (pure mapper)**

```ts
// bond_auto_update_autofill.deridata.test.ts
import { describe, it, expect } from "bun:test";
import { mapDeridataAutofill, deridataDateToYmd } from "./bond_auto_update_autofill.deridata";

const issue = {
  isin: "INE818W08131", issuerName: "ABC LTD", couponFixed: 8.5, couponType: "Fixed",
  couponFrequency: "Quarterly", faceValue: 100000, recordDate: 15,
  maturity: new Date("2028-04-11T05:30:00Z"), allotmentDate: new Date("2023-06-26T05:30:00Z"),
  couponDate: new Date("2026-04-11T05:30:00Z"), security: "Secured", seniority: "Senior",
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
  const resolved = { quantity: 10, settlementDateYmd: "2026-03-20", settlementDateOverridden: false, pricingYield: 9.1, pricingYieldOverride: 9.1 };
  const out = mapDeridataAutofill({ isin: "INE818W08131", resolved, issue, bondData: null, calc });

  it("maps pricing from the calculator summary", () => {
    expect(out.pricing.finalPrice).toBe(98.5345);
    expect(out.pricing.settlementAmount).toBe(78040780822 / 100); // 78,04,07,808.22
    expect(out.suggested.accruedInterest).toBe(4075383.98);
    expect(out.suggested.principalAmount).toBe(77633242.4 * 100 / 100); // 77,63,32,424.24
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

  it("flags the Deridata source", () => {
    expect(out.sources.usedDeridata).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** — `bun test src/resource/crm/bonds/bond_auto_update_autofill.deridata.test.ts` → module not found.

- [ ] **Step 3: Write `bond_auto_update_autofill.deridata.ts`** (mapper + orchestrator). Use the field map in Global Constraints. `buildDeridataCalcInput` computes `amount = quantity*faceValue/1e7`, mode yield→price. `buildDeridataAutofill` calls `api.calculate(input)`; if `!result.ok`, throw an Error with the Deridata error message (so the controller's catch surfaces it).

- [ ] **Step 4: Run test to verify it passes.**

- [ ] **Step 5: Wire the service branch.** In `BondAutoUpdateAutofillService.buildAutofill`, before the existing logic:

```ts
if (env.USE_DERIDATA_CALCULATOR) {
  const issueRow = await db.dataBase.deridataIssueDetail.findUnique({ where: { isin } });
  if (issueRow) {
    const bondData = await db.dataBase.bonds.findFirst({ where: { isin } });
    const api = deridataApiFromEnv();
    return buildDeridataAutofill(isin, input, api, issueRow, bondData);
  }
}
```

Add `usedDeridata?: boolean` to the `sources` type in `BondDealAutofillResponse`.

- [ ] **Step 6: Type-check + full autofill/deridata tests.**
  - `npx tsc --noEmit 2>&1 | grep -iE "deridata|autofill"` → none.
  - `bun test src/resource/crm/bonds/ src/modules/deridata/` → all pass.

- [ ] **Step 7: Stage (commit only if authorized).**

---

## Manual verification (on staging, where the IP is whitelisted)
1. Deploy. Set `DERIDATA_ENABLED=true`, `USE_DERIDATA_CALCULATOR=true`, `DERIDATA_DAILY_CALL_LIMIT` as agreed.
2. Seed + ingest the 37:
   ```bash
   cd backend
   bun run deridata:import scripts/deridata-autofill-isins.csv
   bun run deridata:ingest   # repeat until tasks DONE; needs Deridata UAT/prod up
   ```
3. In CRM, open Load autofill for one of the 37 ISINs → response should carry `sources.usedDeridata = true`, with price/accrued/settlement from Deridata. A non-seeded ISIN should still autofill via calc.meradhan.co (`usedDeridata` absent).

## Self-Review
- Covers the user's two decisions (auto-with-fallback; gap fields null). Pure mapper is unit-tested; the network + DB branch is thin and type-checked. Response shape is preserved (only an additive optional `usedDeridata`). calc.meradhan.co path is untouched when the flag is off or no Deridata row exists.
- Open risk for executor: confirm `principal`/`total_consideration` from Deridata are already the absolute position values for the `amount` we send (they are, per the API spec's ₹ examples), so no extra ×quantity scaling is applied.
