# Deridata Schema + Mappers — Implementation Plan (Plan 2 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the Deridata database tables (6 data tables + their child tables + 3 control tables) to the Prisma schema, and the pure mapper functions that turn each Deridata API response (from Plan 1's typed client) into table rows — including mapping Issue Detail into the existing `bonds` catalog.

**Architecture:** Mirror the existing `bond_reference_*` models in `bond_priced_list.prisma` (autoincrement id, paired `DateTime` + `DateTimeIst @db.Date`, `raw Json?`, `createdAt`/`updatedAt`, `@@index`, `@@map`). Mappers are pure functions (no DB, no network) returning Prisma `*CreateInput` shapes, reusing the IST-date convention from `absolutedata.bonds.mapper.ts` but with a new `DD-MMM-YYYY` parser (Deridata's date format).

**Tech Stack:** Prisma 6 (PostgreSQL, single datasource, migrations under `backend/databases/postgres/prisma/migrations`), Zod v4 types from Plan 1, Bun test, TypeScript 5.9.

## Global Constraints

- Backend root: `/home/sugandhan/Desktop/Repos/MeraDhan/backend`. Run all `prisma`/`bun`/`tsc` from there.
- Prisma schema dir: `databases/postgres/prisma/schema/` (multi-file). New file: `deridata.prisma`. Generator output: `../../../generated/prisma/postgres` (already configured).
- Schema generate: `bun run db:generate` (= `prisma generate --schema=databases/postgres/prisma/schema`). Migration (needs a reachable DB): `npx prisma migrate dev --name add_deridata_tables`. If no DB is available in the working environment, generate + type-check is the gate; the migration is applied where `DATABASE_URL`/`DIRECT_URL` point.
- Table/model conventions (copy from `bond_priced_list.prisma`): `id Int @id @default(autoincrement())`; `isin String` (`@unique` for one-row-per-ISIN tables, plain + `@@index([isin])` for multi-row); date pairs `foo DateTime?` + `fooIst DateTime? @db.Date`; `raw Json?`; `createdAt DateTime @default(now())`; `updatedAt DateTime @updatedAt`; `@@map("snake_case")`.
- Deridata date format is **`DD-MMM-YYYY`** (e.g. `11-Apr-2028`) — NOT `YYYY-MM-DD`. Null conventions (Annexure B): `null`, `"N/A"`, `"NA"`, `"-"`, `""`, `[]`.
- Mappers must be **pure** (input object → output object). No Prisma client calls, no `Date.now()` beyond what Prisma defaults handle. Persisting rows happens in Plan 3.
- Reuse mapping idioms from `absolutedata.bonds.mapper.ts` (`mapInterestMode`, `mapTaxStatus`, `mapSeniority`, `mapNature`, `mapBondType`, `mapExchange`) — re-implement equivalently for Deridata's vocabulary (`coupon_frequency`: Monthly/Quarterly/SemiAnnual/Annual/On Maturity/Thrice a year/Irregular Occurrence; `tax_free`: Yes/No; `security`: Secured/Unsecured; `listed`: NSE/BSE/"NSE: BSE"/null).
- Prisma model→TS types: import as `DataBaseSchema.<Model>CreateInput` from `@core/database/database` (same import the AbsoluteData mapper uses: `import { type DataBaseSchema } from "@core/database/database"`).
- Do NOT commit unless the user has authorized it.

---

### Task 1: `deridata.prisma` schema (9 models + 2 enums)

**Files:**
- Create: `backend/databases/postgres/prisma/schema/deridata.prisma`

**Interfaces:**
- Produces Prisma models (and thus generated TS types): `DeridataIssueDetail`, `DeridataCalculator` + `DeridataCashflow`, `DeridataEbpItem`, `DeridataSecondaryTrade` + `DeridataTradeHistory`, `DeridataSecurityCovenant`, `DeridataDocument` + `DeridataPressRelease`, `DeridataIsinRegistry`, `DeridataSyncTask`, `DeridataSyncState`; enums `DeridataEndpoint`, `DeridataTaskStatus`.

- [ ] **Step 1: Write the schema file**

```prisma
// backend/databases/postgres/prisma/schema/deridata.prisma
// Deridata merchant API — one table per endpoint + control tables for batch ingestion.
// See docs/superpowers/specs/2026-06-29-deridata-integration-design.md

/// 1. Issue Detail — one row per ISIN.
model DeridataIssueDetail {
  id   Int    @id @default(autoincrement())
  isin String @unique

  did               String?
  coupon            String?
  couponFixed       Float?
  couponType        String?
  couponFrequency   String?
  issuerName        String?
  description       String?
  issuerIndustry    String?
  seniority         String?
  security          String?
  listed            String?
  taxFree           String?
  redemptionType    String?
  redemptionPremium String?
  faceValue         Float?
  recordDate        Int?
  totalIssueSizeCr  Float?

  maturity        DateTime?
  maturityIst     DateTime? @db.Date
  issueDate       DateTime?
  issueDateIst    DateTime? @db.Date
  allotmentDate   DateTime?
  allotmentDateIst DateTime? @db.Date
  couponDate      DateTime?
  couponDateIst   DateTime? @db.Date

  currentRating   String[]
  ratingAgency    String[]
  instrumentType  String[]
  tags            String[]

  outlook            Json?
  redemption         Json?
  financialCovenants Json?

  raw       Json?
  fetchedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([isin])
  @@map("deridata_issue_detail")
}

/// 2. Calculator — point-in-time snapshot per (isin, valueDate, mode, input).
model DeridataCalculator {
  id   Int    @id @default(autoincrement())
  isin String

  valueDate     String?
  mode          String? // "yield_to_price" | "price_to_yield"
  selectedYield String? // ytm | ytc | ytp
  inputYield    Float?
  inputPrice    Float?

  cleanPrice         String?
  accruedIntTop      String?
  dirtyPrice         String?
  principal          String?
  accruedIntBottom   String?
  totalConsideration String?
  xirr               String?
  cashflowShutFlag   Boolean?
  shutPeriodMessage  String?
  recordDate         String?

  cashflows DeridataCashflow[]

  raw       Json?
  fetchedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([isin])
  @@map("deridata_calculator")
}

model DeridataCashflow {
  id           Int                @id @default(autoincrement())
  calculatorId Int
  calculator   DeridataCalculator @relation(fields: [calculatorId], references: [id], onDelete: Cascade)

  cashFlowDate      String?
  cashFlowDateIst   DateTime? @db.Date
  couponCashFlow    String?
  principalCashFlow String?
  totalCashFlow     String?

  createdAt DateTime @default(now())

  @@index([calculatorId])
  @@map("deridata_cashflows")
}

/// 3. EBP — one row per ebp_items[] entry.
model DeridataEbpItem {
  id   Int    @id @default(autoincrement())
  isin String

  allotmentDate    String?
  issueSize        String?
  baseIssueSize    String?
  greenShoe        String?
  reissuance       String?
  bidTotal         Int?
  bidAnchor        Int?
  bidQib           Int?
  bidNonQib        Int?
  bidCoverRatio    Float?
  allottedAmtTotal String?
  allottedTotal    Int?
  wat              Float?
  wap              Float?
  cutOffYield      Float?
  cutOffPrice      Float?
  wtAvgPrice       Float?
  wtAvgYield       Float?
  spreadBps        Float?
  ebp              String?
  fv               String?

  raw       Json?
  fetchedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([isin])
  @@map("deridata_ebp_items")
}

/// 4. Secondary Trades — summary row per ISIN + trade history rows.
model DeridataSecondaryTrade {
  id   Int    @id @default(autoincrement())
  isin String @unique

  wayPercentage    String?
  cumulativeVolume String?
  avgDailyVolume   String?
  avgVolTrades     String?
  avgDailyTrades   String?
  lastTradeDate    String?
  spread           Int?

  history DeridataTradeHistory[]

  raw       Json?
  fetchedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([isin])
  @@map("deridata_secondary_trades")
}

model DeridataTradeHistory {
  id      Int                    @id @default(autoincrement())
  tradeId Int
  trade   DeridataSecondaryTrade @relation(fields: [tradeId], references: [id], onDelete: Cascade)

  tradeDate    String?
  tradeDateIst DateTime? @db.Date
  spread       Int?
  volume       Float?
  yield        Float?

  createdAt DateTime @default(now())

  @@index([tradeId])
  @@map("deridata_trade_history")
}

/// 5. Security & Covenant — one row per ISIN.
model DeridataSecurityCovenant {
  id   Int    @id @default(autoincrement())
  isin String @unique

  stepUpCondition       String?
  stepDownCondition     String?
  securityCover         String?
  natureOfSecurity      String?
  creditEnhancement     String?
  guarantee             String?
  guarantor             String?
  percentageOfGuarantee String?

  covMinNw          String?
  covCadRatio       String?
  covMinPatEbitdaPbt String?
  covDeRatio        String?
  covGnpaNnpaPar90  String?
  covOther          String?
  covShareholdingAmt String?

  financialCovenants Json?

  raw       Json?
  fetchedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([isin])
  @@map("deridata_security_covenant")
}

/// 6. Documents — one row per ISIN. im_link is NOT persisted (1-hour pre-signed URL).
model DeridataDocument {
  id   Int    @id @default(autoincrement())
  isin String @unique

  pressReleases DeridataPressRelease[]

  raw       Json?
  fetchedAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([isin])
  @@map("deridata_documents")
}

model DeridataPressRelease {
  id         Int              @id @default(autoincrement())
  documentId Int
  document   DeridataDocument @relation(fields: [documentId], references: [id], onDelete: Cascade)

  agency  String?
  rating  String?
  outlook String?
  url     String?

  createdAt DateTime @default(now())

  @@index([documentId])
  @@map("deridata_press_releases")
}

/// Control: the imported seed universe of ISINs.
model DeridataIsinRegistry {
  id          Int      @id @default(autoincrement())
  isin        String   @unique
  sourceBatch String?
  isActive    Boolean  @default(true)
  priority    Int      @default(100)
  addedAt     DateTime @default(now())

  @@index([isActive])
  @@map("deridata_isin_registry")
}

/// Control: resumable work-list, one row per (isin, endpoint).
model DeridataSyncTask {
  id             Int                @id @default(autoincrement())
  isin           String
  endpoint       DeridataEndpoint
  status         DeridataTaskStatus @default(PENDING)
  attempts       Int                @default(0)
  lastError      String?
  lastStatusCode Int?
  nextRunAfter   DateTime?
  fetchedAt      DateTime?
  priority       Int                @default(100)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([isin, endpoint], name: "deridata_sync_tasks_isin_endpoint_key")
  @@index([status, priority])
  @@index([isin])
  @@map("deridata_sync_tasks")
}

/// Control: singleton daily-budget tracker.
model DeridataSyncState {
  id             Int       @id @default(1)
  callsUsedToday Int       @default(0)
  budgetDate     String? // IST calendar day "YYYY-MM-DD"
  limitHitAt     DateTime?
  lastResetAt    DateTime?

  updatedAt DateTime @updatedAt

  @@map("deridata_sync_state")
}

enum DeridataEndpoint {
  ISSUE_DETAIL
  CALCULATOR
  EBP
  SECONDARY_TRADES
  SECURITY_COVENANT
  DOCUMENTS
}

enum DeridataTaskStatus {
  PENDING
  IN_PROGRESS
  DONE
  FAILED
  SKIPPED
  NOT_FOUND
}
```

- [ ] **Step 2: Validate the schema compiles + generate the client**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun run db:generate`
Expected: "Generated Prisma Client" with no schema validation errors. (If it reports a relation/format error, fix the `.prisma` file and re-run.)

- [ ] **Step 3: Format check (optional but matches repo)**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && npx prisma format --schema=databases/postgres/prisma/schema`
Expected: file reformatted in place, exit 0.

- [ ] **Step 4: Create the migration (only where a DB is reachable)**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && npx prisma migrate dev --name add_deridata_tables`
Expected: a new folder under `databases/postgres/prisma/migrations/` and "Your database is now in sync". If `DATABASE_URL` is unreachable in this environment, SKIP this step and record that the migration must be generated against the target DB; Step 2 (generate) is the gate.

- [ ] **Step 5: Stage the change (commit only if authorized)**

```bash
git add backend/databases/postgres/prisma/schema/deridata.prisma backend/databases/postgres/prisma/migrations/
git commit -m "feat(deridata): Prisma schema for 6 data tables + control tables"
```

---

### Task 2: `DD-MMM-YYYY` date helpers

**Files:**
- Create: `backend/src/modules/deridata/deridata.date.ts`
- Test: `backend/src/modules/deridata/deridata.date.test.ts`

**Interfaces:**
- Produces:
  - `deridataDateToIstIso(s: string | null | undefined): string | null` — `DD-MMM-YYYY` → IST-aligned ISO string; `null` for null/`""`/`"-"`/`"N/A"`/`"NA"`/unparseable.
  - `deridataDateToIstDateOnly(s: string | null | undefined): Date | undefined` — same, returns a `Date` (for `@db.Date` columns) or `undefined`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/modules/deridata/deridata.date.test.ts
import { describe, it, expect } from "bun:test";
import { deridataDateToIstIso, deridataDateToIstDateOnly } from "./deridata.date";

describe("deridataDateToIstIso", () => {
  it("parses DD-MMM-YYYY to an IST-aligned ISO instant", () => {
    // 11-Apr-2028 at IST midnight === 2028-04-11T05:30:00 in ISO (UTC+5:30 offset baked in)
    expect(deridataDateToIstIso("11-Apr-2028")).toBe("2028-04-11T05:30:00.000Z");
  });
  it("is case-insensitive on the month", () => {
    expect(deridataDateToIstIso("26-jun-2023")).toBe("2023-06-26T05:30:00.000Z");
  });
  it("returns null for null conventions", () => {
    for (const v of [null, undefined, "", "-", "N/A", "NA", "garbage", "2026-04-16"]) {
      expect(deridataDateToIstIso(v as any)).toBeNull();
    }
  });
});

describe("deridataDateToIstDateOnly", () => {
  it("returns a Date for valid input and undefined otherwise", () => {
    expect(deridataDateToIstDateOnly("11-Apr-2028")).toBeInstanceOf(Date);
    expect(deridataDateToIstDateOnly("-")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.date.test.ts`
Expected: FAIL — "Cannot find module './deridata.date'".

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/modules/deridata/deridata.date.ts

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** `DD-MMM-YYYY` (e.g. `11-Apr-2028`) → IST-aligned ISO string; null for null/N/A/"-"/""/unparseable. */
export function deridataDateToIstIso(s: string | null | undefined): string | null {
  const v = (s ?? "").trim();
  if (!v || /^(n\/?a|-)$/i.test(v)) return null;
  const m = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(v);
  if (!m) return null;
  const day = Number(m[1]);
  const mon = MONTHS[m[2]!.toLowerCase()];
  const year = Number(m[3]);
  if (!mon) return null;
  const utc = new Date(Date.UTC(year, mon - 1, day, 0, 0, 0));
  if (Number.isNaN(utc.getTime())) return null;
  return new Date(utc.getTime() + IST_OFFSET_MS).toISOString();
}

/** Same as `deridataDateToIstIso` but returns a `Date` (for `@db.Date` columns) or `undefined`. */
export function deridataDateToIstDateOnly(s: string | null | undefined): Date | undefined {
  const iso = deridataDateToIstIso(s);
  return iso ? new Date(iso) : undefined;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.date.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Stage the change (commit only if authorized)**

```bash
git add backend/src/modules/deridata/deridata.date.ts backend/src/modules/deridata/deridata.date.test.ts
git commit -m "feat(deridata): DD-MMM-YYYY IST date helpers"
```

---

### Task 3: Issue Detail mappers (→ table row and → bonds)

**Files:**
- Create: `backend/src/modules/deridata/deridata.issue-detail.mapper.ts`
- Test: `backend/src/modules/deridata/deridata.issue-detail.mapper.test.ts`

**Interfaces:**
- Consumes: `IssueDetail` (Plan 1 `deridata.types`), `deridataDateToIstIso`/`deridataDateToIstDateOnly` (Task 2).
- Produces:
  - `mapIssueDetailToRow(item: IssueDetail): DataBaseSchema.DeridataIssueDetailCreateInput` — full row incl. `raw` and `fetchedAt: new Date()`.
  - `mapIssueDetailToBonds(item: IssueDetail): Partial<DataBaseSchema.BondsUpdateInput>` — only the catalog fields Deridata authoritatively supplies (used in Plan 4 to write `bonds`). Enum helpers: coupon_frequency→INTEREST_MODE, tax_free→TAX_TYPE, security→INSTRUMENT_SECURITY, seniority→BOND_SENIORITY, listed→{IS_LISTED, STOCK_EXCHANGE}.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/modules/deridata/deridata.issue-detail.mapper.test.ts
import { describe, it, expect } from "bun:test";
import { mapIssueDetailToRow, mapIssueDetailToBonds } from "./deridata.issue-detail.mapper";
import type { IssueDetail } from "./deridata.api";

const sample: IssueDetail = {
  isin: "INE2OTQ07077",
  did: "0685NABARDJAN298EQ2",
  coupon: "6.2626%",
  coupon_fixed: 6.2626,
  coupon_type: "Fixed",
  coupon_frequency: "Quarterly",
  maturity: "11-Apr-2028",
  issue_date: "26-Jun-2023",
  allotment_date: "26-Jun-2023",
  coupon_date: "11-Apr-2026",
  face_value: 100000,
  record_date: 15,
  issuer_name: "FEDBANK FINANCIAL SERVICES LIMITED",
  issuer_industry: "NBFC",
  seniority: "Senior",
  security: "Secured",
  listed: "NSE",
  tax_free: "No",
  current_rating: ["CARE: AA+", "IND: AA+"],
  rating_agency: ["CARE", "IND"],
  tags: [],
  total_issue_size_cr: 200,
} as IssueDetail;

describe("mapIssueDetailToRow", () => {
  it("copies scalar fields and parses dates to IST ISO", () => {
    const row = mapIssueDetailToRow(sample);
    expect(row.isin).toBe("INE2OTQ07077");
    expect(row.did).toBe("0685NABARDJAN298EQ2");
    expect(row.couponFixed).toBe(6.2626);
    expect(row.maturity).toBe("2028-04-11T05:30:00.000Z");
    expect(row.faceValue).toBe(100000);
    expect(row.currentRating).toEqual(["CARE: AA+", "IND: AA+"]);
    expect(row.raw).toBeDefined();
    expect(row.fetchedAt).toBeInstanceOf(Date);
  });
});

describe("mapIssueDetailToBonds", () => {
  it("maps enums and catalog fields Deridata supplies", () => {
    const b = mapIssueDetailToBonds(sample);
    expect(b.bondName).toBe("FEDBANK FINANCIAL SERVICES LIMITED");
    expect(b.faceValue).toBe(100000);
    expect(b.interestPaymentMode).toBe("QUARTERLY");
    expect(b.taxStatus).toBe("TAXABLE");
    expect(b.natureOfInstrument).toBe("SECURED");
    expect(b.seniority).toBe("SENIOR");
    expect(b.isListed).toBe("YES");
    expect(b.exchangeListedOn).toBe("NSE");
    expect(b.maturityDate).toBe("2028-04-11T05:30:00.000Z");
  });

  it("treats tax_free=Yes as TAX_FREE and unlisted as NO/UNKNOWN", () => {
    const b = mapIssueDetailToBonds({ ...sample, tax_free: "Yes", listed: null } as IssueDetail);
    expect(b.taxStatus).toBe("TAX_FREE");
    expect(b.isListed).toBe("NO");
    expect(b.exchangeListedOn).toBe("UNKNOWN");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.issue-detail.mapper.test.ts`
Expected: FAIL — "Cannot find module './deridata.issue-detail.mapper'".

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/modules/deridata/deridata.issue-detail.mapper.ts
import { type $Enums, type DataBaseSchema } from "@core/database/database";
import type { IssueDetail } from "./deridata.api";
import { deridataDateToIstIso, deridataDateToIstDateOnly } from "./deridata.date";

const pickStr = (v: unknown): string | undefined => {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (!s || /^(n\/?a|-)$/i.test(s)) return undefined;
  return s;
};
const pickNum = (v: unknown): number | undefined => {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
};

function mapInterestMode(freq: string | null | undefined): $Enums.INTEREST_MODE | undefined {
  const f = pickStr(freq)?.toLowerCase();
  if (!f) return undefined;
  if (f.includes("month")) return "MONTHLY";
  if (f.includes("quarter")) return "QUARTERLY";
  if (f.includes("semi") || f.includes("half")) return "HALF_YEARLY";
  if (f.includes("annual") || f.includes("year")) return "YEARLY";
  if (f.includes("maturity")) return "ON_MATURITY";
  return undefined;
}

function mapTaxStatus(taxFree: string | null | undefined): $Enums.TAX_TYPE | undefined {
  const t = pickStr(taxFree)?.toLowerCase();
  if (!t) return undefined;
  if (t === "yes" || t.includes("free")) return "TAX_FREE";
  if (t === "no") return "TAXABLE";
  return undefined;
}

function mapNature(security: string | null | undefined): $Enums.INSTRUMENT_SECURITY | undefined {
  const v = pickStr(security)?.toLowerCase();
  if (!v) return undefined;
  if (v.includes("unsecured")) return "UNSECURED";
  if (v.includes("secured")) return "SECURED";
  return "UNKNOWN";
}

function mapSeniority(s: string | null | undefined): $Enums.BOND_SENIORITY | undefined {
  const v = pickStr(s)?.toLowerCase();
  if (!v) return undefined;
  if (v.startsWith("senior")) return "SENIOR";
  if (v.includes("tier 2") || v.includes("tier ii")) return "TIER_2_SUBORDINATED";
  if (v.includes("lower tier")) return "LOWER_TIER_II_SUBORDINATED";
  return "UNKNOWN";
}

/** Deridata `listed`: "NSE" | "BSE" | "NSE: BSE" | null (null ⇒ unlisted). */
function mapListed(listed: string | null | undefined): {
  isListed: $Enums.IS_LISTED;
  exchange: $Enums.STOCK_EXCHANGE;
} {
  const e = pickStr(listed)?.toUpperCase();
  if (!e) return { isListed: "NO", exchange: "UNKNOWN" };
  const hasNse = e.includes("NSE");
  const hasBse = e.includes("BSE");
  const exchange: $Enums.STOCK_EXCHANGE = hasNse && hasBse ? "BOTH" : hasNse ? "NSE" : hasBse ? "BSE" : "UNKNOWN";
  return { isListed: "YES", exchange };
}

export function mapIssueDetailToRow(item: IssueDetail): DataBaseSchema.DeridataIssueDetailCreateInput {
  return {
    isin: String(item.isin ?? "").trim().toUpperCase(),
    did: pickStr(item.did),
    coupon: pickStr(item.coupon),
    couponFixed: pickNum(item.coupon_fixed),
    couponType: pickStr(item.coupon_type),
    couponFrequency: pickStr(item.coupon_frequency),
    issuerName: pickStr(item.issuer_name),
    description: pickStr(item.description),
    issuerIndustry: pickStr(item.issuer_industry),
    seniority: pickStr(item.seniority),
    security: pickStr(item.security),
    listed: pickStr(item.listed),
    taxFree: pickStr(item.tax_free),
    redemptionType: pickStr(item.redemption_type),
    redemptionPremium: pickStr(item.redemption_premium),
    faceValue: pickNum(item.face_value),
    recordDate: pickNum(item.record_date),
    totalIssueSizeCr: pickNum(item.total_issue_size_cr),
    maturity: deridataDateToIstIso(item.maturity),
    maturityIst: deridataDateToIstDateOnly(item.maturity),
    issueDate: deridataDateToIstIso(item.issue_date),
    issueDateIst: deridataDateToIstDateOnly(item.issue_date),
    allotmentDate: deridataDateToIstIso(item.allotment_date),
    allotmentDateIst: deridataDateToIstDateOnly(item.allotment_date),
    couponDate: deridataDateToIstIso(item.coupon_date),
    couponDateIst: deridataDateToIstDateOnly(item.coupon_date),
    currentRating: (item.current_rating ?? []).filter((x): x is string => typeof x === "string"),
    ratingAgency: (item.rating_agency ?? []).filter((x): x is string => typeof x === "string"),
    instrumentType: (item.instrument_type ?? []).filter((x): x is string => typeof x === "string"),
    tags: (item.tags ?? []).filter((x): x is string => typeof x === "string"),
    outlook: (item.outlook ?? undefined) as DataBaseSchema.DeridataIssueDetailCreateInput["outlook"],
    redemption: (item.redemption ?? undefined) as DataBaseSchema.DeridataIssueDetailCreateInput["redemption"],
    financialCovenants: (item.financial_covenants ?? undefined) as DataBaseSchema.DeridataIssueDetailCreateInput["financialCovenants"],
    raw: item as unknown as DataBaseSchema.DeridataIssueDetailCreateInput["raw"],
    fetchedAt: new Date(),
  };
}

export function mapIssueDetailToBonds(item: IssueDetail): Partial<DataBaseSchema.BondsUpdateInput> {
  const { isListed, exchange } = mapListed(item.listed);
  const out: Partial<DataBaseSchema.BondsUpdateInput> = {
    bondName: pickStr(item.issuer_name),
    description: pickStr(item.description),
    couponRate: pickNum(item.coupon_fixed),
    couponType: pickStr(item.coupon_type),
    interestPaymentFrequency: pickStr(item.coupon_frequency),
    interestPaymentMode: mapInterestMode(item.coupon_frequency),
    faceValue: pickNum(item.face_value),
    totalIssueSize: pickNum(item.total_issue_size_cr),
    sectorName: pickStr(item.issuer_industry),
    taxStatus: mapTaxStatus(item.tax_free),
    natureOfInstrument: mapNature(item.security),
    seniority: mapSeniority(item.seniority),
    isListed,
    exchangeListedOn: exchange,
    redemptionType: pickStr(item.redemption_type),
    maturityDate: deridataDateToIstIso(item.maturity),
    maturityDateIst: deridataDateToIstDateOnly(item.maturity),
    dateOfAllotment: deridataDateToIstIso(item.allotment_date),
    dateOfAllotmentIst: deridataDateToIstDateOnly(item.allotment_date),
    providerName: "Deridata",
  };
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.issue-detail.mapper.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Type-check the mapper against generated Prisma types**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && npx tsc --noEmit 2>&1 | grep -i deridata`
Expected: no output (no Deridata type errors). If `DataBaseSchema.DeridataIssueDetailCreateInput` is missing, re-run `bun run db:generate` (Task 1 Step 2).

- [ ] **Step 6: Stage the change (commit only if authorized)**

```bash
git add backend/src/modules/deridata/deridata.issue-detail.mapper.ts backend/src/modules/deridata/deridata.issue-detail.mapper.test.ts
git commit -m "feat(deridata): issue-detail mappers (row + bonds catalog)"
```

---

### Task 4: Mappers for the other 5 endpoints

**Files:**
- Create: `backend/src/modules/deridata/deridata.mappers.ts`
- Test: `backend/src/modules/deridata/deridata.mappers.test.ts`

**Interfaces:**
- Consumes: response types from `deridata.api` (`CalculatorResponse`, `EbpResponse`, `SecondaryTradesResponse`, `SecurityCovenant`, `DocumentsResponse`), `deridataDateToIstDateOnly` (Task 2).
- Produces (each returns plain Prisma `*CreateInput`-shaped objects; nested rows returned alongside their parent for Plan 3 to persist):
  - `mapCalculator(isin, input, res): { row: DataBaseSchema.DeridataCalculatorCreateInput; cashflows: DataBaseSchema.DeridataCashflowCreateInput[] }` where `input` carries `valueDate/mode/selectedYield/inputYield/inputPrice`.
  - `mapEbp(res): DataBaseSchema.DeridataEbpItemCreateInput[]` (one per `ebp_items`).
  - `mapSecondaryTrades(res): { row; history }`.
  - `mapSecurityCovenant(res): DataBaseSchema.DeridataSecurityCovenantCreateInput`.
  - `mapDocuments(res): { row; pressReleases }` (im_link intentionally dropped).

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/modules/deridata/deridata.mappers.test.ts
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
        summary: { clean_price: "98.5345", dirty_price: "99.0518", xirr: "", cashflow_shut_flag: false, record_date: "16-Mar-2026" },
        cashflows: [
          { cash_flow_dates: "30-Apr-2026", coupon_cash_flow: "0.7641", principal_cash_flow: "3.0303", total_cash_flow: "3.7944" },
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
    const rows = mapEbp({ isin: "INE007N07041", ebp_items: [{ issue_size: "100.00", ebp: "BSE", bid_total: 100 }] } as any);
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
      financial_covenants: { cad_ratio: "Capital Adequacy >= 18%", de_ratio: "Debt : Equity <= 6x" },
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
    expect((row as any).imLink).toBeUndefined();
    expect(pressReleases).toHaveLength(1);
    expect(pressReleases[0]!.agency).toBe("CARE");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.mappers.test.ts`
Expected: FAIL — "Cannot find module './deridata.mappers'".

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/modules/deridata/deridata.mappers.ts
import { type DataBaseSchema } from "@core/database/database";
import type {
  CalculatorResponse,
  EbpResponse,
  SecondaryTradesResponse,
  SecurityCovenant,
  DocumentsResponse,
} from "./deridata.api";
import { deridataDateToIstDateOnly } from "./deridata.date";

const pickStr = (v: unknown): string | undefined => {
  if (v == null) return undefined;
  const s = String(v).trim();
  if (!s || /^(n\/?a|-)$/i.test(s)) return undefined;
  return s;
};
const pickNum = (v: unknown): number | undefined => {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
};
const pickInt = (v: unknown): number | undefined => {
  const n = pickNum(v);
  return n == null ? undefined : Math.trunc(n);
};
const pickBool = (v: unknown): boolean | undefined => (typeof v === "boolean" ? v : undefined);

export type CalculatorInputMeta = {
  valueDate?: string;
  mode?: string;
  selectedYield?: string;
  inputYield?: number | null;
  inputPrice?: number | null;
};

export function mapCalculator(
  isin: string,
  meta: CalculatorInputMeta,
  res: CalculatorResponse,
): {
  row: DataBaseSchema.DeridataCalculatorCreateInput;
  cashflows: DataBaseSchema.DeridataCashflowCreateInput[];
} {
  const s = res.summary ?? {};
  const row: DataBaseSchema.DeridataCalculatorCreateInput = {
    isin: isin.trim().toUpperCase(),
    valueDate: meta.valueDate,
    mode: meta.mode,
    selectedYield: meta.selectedYield,
    inputYield: meta.inputYield ?? undefined,
    inputPrice: meta.inputPrice ?? undefined,
    cleanPrice: pickStr((s as any).clean_price),
    accruedIntTop: pickStr((s as any).accrued_int_top),
    dirtyPrice: pickStr((s as any).dirty_price),
    principal: pickStr((s as any).principal),
    accruedIntBottom: pickStr((s as any).accrued_int_bottom),
    totalConsideration: pickStr((s as any).total_consideration),
    xirr: pickStr((s as any).xirr),
    cashflowShutFlag: pickBool((s as any).cashflow_shut_flag),
    shutPeriodMessage: pickStr((s as any).shut_period_message),
    recordDate: pickStr((s as any).record_date),
    raw: res as unknown as DataBaseSchema.DeridataCalculatorCreateInput["raw"],
    fetchedAt: new Date(),
  };
  const cashflows = (res.cashflows ?? []).map((c) => ({
    cashFlowDate: pickStr((c as any).cash_flow_dates),
    cashFlowDateIst: deridataDateToIstDateOnly((c as any).cash_flow_dates),
    couponCashFlow: pickStr((c as any).coupon_cash_flow),
    principalCashFlow: pickStr((c as any).principal_cash_flow),
    totalCashFlow: pickStr((c as any).total_cash_flow),
  })) as DataBaseSchema.DeridataCashflowCreateInput[];
  return { row, cashflows };
}

export function mapEbp(res: EbpResponse): DataBaseSchema.DeridataEbpItemCreateInput[] {
  const isin = String(res.isin ?? "").trim().toUpperCase();
  return (res.ebp_items ?? []).map((it: any) => ({
    isin,
    allotmentDate: pickStr(it.allotment_date),
    issueSize: pickStr(it.issue_size),
    baseIssueSize: pickStr(it.base_issue_size),
    greenShoe: pickStr(it.green_shoe),
    reissuance: pickStr(it.reissuance),
    bidTotal: pickInt(it.bid_total),
    bidAnchor: pickInt(it.bid_anchor),
    bidQib: pickInt(it.bid_qib),
    bidNonQib: pickInt(it.bid_non_qib),
    bidCoverRatio: pickNum(it.bid_cover_ratio),
    allottedAmtTotal: pickStr(it.allotted_amt_total),
    allottedTotal: pickInt(it.allotted_total),
    wat: pickNum(it.wat),
    wap: pickNum(it.wap),
    cutOffYield: pickNum(it.cut_off_yield),
    cutOffPrice: pickNum(it.cut_off_price),
    wtAvgPrice: pickNum(it.wt_avg_price),
    wtAvgYield: pickNum(it.wt_avg_yield),
    spreadBps: pickNum(it.spread_bps),
    ebp: pickStr(it.ebp),
    fv: pickStr(it.fv),
    raw: it as DataBaseSchema.DeridataEbpItemCreateInput["raw"],
    fetchedAt: new Date(),
  })) as DataBaseSchema.DeridataEbpItemCreateInput[];
}

export function mapSecondaryTrades(res: SecondaryTradesResponse): {
  row: DataBaseSchema.DeridataSecondaryTradeCreateInput;
  history: DataBaseSchema.DeridataTradeHistoryCreateInput[];
} {
  const isin = String(res.isin ?? "").trim().toUpperCase();
  const t: any = (res.trades ?? [])[0] ?? {};
  const row: DataBaseSchema.DeridataSecondaryTradeCreateInput = {
    isin,
    wayPercentage: pickStr(t.way_percentage),
    cumulativeVolume: pickStr(t.cumulative_volume),
    avgDailyVolume: pickStr(t.avg_daily_volume),
    avgVolTrades: pickStr(t.avg_vol_trades),
    avgDailyTrades: pickStr(t.avg_daily_trades),
    lastTradeDate: pickStr(t.last_trade_date),
    spread: pickInt(t.spread),
    raw: res as unknown as DataBaseSchema.DeridataSecondaryTradeCreateInput["raw"],
    fetchedAt: new Date(),
  };
  const history = ((res as any).trade_history ?? []).map((h: any) => ({
    tradeDate: pickStr(h.trade_date),
    tradeDateIst: deridataDateToIstDateOnly(h.trade_date),
    spread: pickInt(h.spread),
    volume: pickNum(h.volume),
    yield: pickNum(h.yield),
  })) as DataBaseSchema.DeridataTradeHistoryCreateInput[];
  return { row, history };
}

export function mapSecurityCovenant(res: SecurityCovenant): DataBaseSchema.DeridataSecurityCovenantCreateInput {
  const fc: any = res.financial_covenants ?? {};
  return {
    isin: String(res.isin ?? "").trim().toUpperCase(),
    stepUpCondition: pickStr(res.step_up_condition),
    stepDownCondition: pickStr(res.step_down_condition),
    securityCover: pickStr(res.security_cover),
    natureOfSecurity: pickStr(res.nature_of_security),
    creditEnhancement: pickStr(res.credit_enhancement),
    guarantee: pickStr(res.guarantee),
    guarantor: pickStr(res.guarantor),
    percentageOfGuarantee: pickStr(res.percentage_of_guarantee),
    covMinNw: pickStr(fc.min_nw),
    covCadRatio: pickStr(fc.cad_ratio),
    covMinPatEbitdaPbt: pickStr(fc.min_pat_ebitda_pbt),
    covDeRatio: pickStr(fc.de_ratio),
    covGnpaNnpaPar90: pickStr(fc.gnpa_nnpa_par90),
    covOther: pickStr(fc.other),
    covShareholdingAmt: pickStr(fc.shareholding_amt),
    financialCovenants: (res.financial_covenants ?? undefined) as DataBaseSchema.DeridataSecurityCovenantCreateInput["financialCovenants"],
    raw: res as unknown as DataBaseSchema.DeridataSecurityCovenantCreateInput["raw"],
    fetchedAt: new Date(),
  };
}

export function mapDocuments(res: DocumentsResponse): {
  row: DataBaseSchema.DeridataDocumentCreateInput;
  pressReleases: DataBaseSchema.DeridataPressReleaseCreateInput[];
} {
  // im_link is a 1-hour pre-signed URL — intentionally NOT persisted.
  const { im_link: _dropped, ...rawNoLink } = (res ?? {}) as Record<string, unknown>;
  const row: DataBaseSchema.DeridataDocumentCreateInput = {
    isin: String(res.isin ?? "").trim().toUpperCase(),
    raw: rawNoLink as DataBaseSchema.DeridataDocumentCreateInput["raw"],
    fetchedAt: new Date(),
  };
  const pressReleases = ((res as any).press_release_links ?? []).map((p: any) => ({
    agency: pickStr(p.agency),
    rating: pickStr(p.rating),
    outlook: pickStr(p.outlook),
    url: pickStr(p.url),
  })) as DataBaseSchema.DeridataPressReleaseCreateInput[];
  return { row, pressReleases };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.mappers.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Run the whole module suite + type-check**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/ && npx tsc --noEmit 2>&1 | grep -i deridata`
Expected: all deridata tests PASS; no Deridata type errors printed.

- [ ] **Step 6: Stage the change (commit only if authorized)**

```bash
git add backend/src/modules/deridata/deridata.mappers.ts backend/src/modules/deridata/deridata.mappers.test.ts
git commit -m "feat(deridata): mappers for calculator/ebp/secondary-trades/covenant/documents"
```

---

## Self-Review (completed)

- **Spec coverage (Plan 2 scope):** 6 data tables + child tables + 3 control tables (spec §5) — Task 1. `DD-MMM-YYYY` IST parsing (spec Global Constraints / §4.1) — Task 2. Issue Detail → table + → `bonds` catalog mapping (spec §5.1, §7) — Task 3. Calculator/EBP/Secondary/Covenant/Documents mappers incl. `im_link` drop (spec §5.1, §5.2) — Task 4. Ingestion logic + persistence is Plan 3; routes/UI/decommission is Plan 4 (intentionally out of scope here).
- **Placeholder scan:** none — every step has runnable code and exact commands. Migration step is explicitly conditional on DB reachability (not a placeholder).
- **Type consistency:** mapper outputs are typed to the exact generated names from Task 1 (`DeridataIssueDetailCreateInput`, `DeridataCalculatorCreateInput`, `DeridataCashflowCreateInput`, `DeridataEbpItemCreateInput`, `DeridataSecondaryTradeCreateInput`, `DeridataTradeHistoryCreateInput`, `DeridataSecurityCovenantCreateInput`, `DeridataDocumentCreateInput`, `DeridataPressReleaseCreateInput`). Response types (`IssueDetail`, `CalculatorResponse`, etc.) are re-exported from `deridata.api` in Plan 1. Date helpers reused from Task 2 across Tasks 3–4.
- **Note for executor:** `DataBaseSchema` create-input types only exist after `bun run db:generate` (Task 1 Step 2) — run Task 1 before Tasks 3–4 type-check. Mappers are pure; nested child rows are returned next to their parent and wired with the FK during persistence in Plan 3.
