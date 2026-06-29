# Deridata API Integration — Design Spec

**Date:** 2026-06-29
**Status:** Approved for planning
**Author:** brainstormed with Claude Code

---

## 1. Goal

Replace MeraDhan's current bond reference-data providers — **AbsoluteData** (REST enrichment) and **NSDL** (XLS scrape) — with **Deridata** (Merchant API v3.1) as the single source of bond data. Integrate **all 6 Deridata endpoints**, store each in its own new table in the **existing MeraDhan Postgres database**, ingest the data in **resumable daily batches** that respect Deridata's per-day call limit, and keep the existing UI working throughout via a mapping layer.

Out of scope (unchanged): NSE RFQ, NSE CBRICS, Razorpay, OpenAI, MSG91, CDSL/NSDL-eServices KYC. These are trading/clearing/payments/KYC integrations, not bond reference data.

---

## 2. Current-state summary (what we are replacing)

### Bond reference-data sources today
| Source | Fetch | Schedule | Provides | DB tables written |
|--------|-------|----------|----------|-------------------|
| **NSDL** | HTML scrape + XLS download (`backend/src/jobs/cron/scrap_bonds/nsdl_bond_service.ts`, `nsdl_bond_processor.ts`) | Daily 07:00 IST | The bond universe (~ ISIN list) + ~40 base fields | `bonds` |
| **AbsoluteData** | REST `GET /v1/bonds/isin/{isin}` (`backend/src/modules/absolutedata/`, `bond_reference_schedules.cron.ts`) | Daily 06:00 IST + inline in 07:00 scrape | Enrichment: coupon schedule, redemption schedule, seniority, day convention, Bloomberg ids, classification | `bonds` (merge), `bond_reference_metadata`, `bond_reference_coupon_payment_dates`, `bond_reference_redemption_schedule` |

The AbsoluteData integration is cleanly isolated in `backend/src/modules/absolutedata/` (api / types / mapper), which is the pattern the new `deridata` module mirrors.

### `bonds` table
Master catalog (~130 fields). NSDL lays the base record and defines which bonds exist; AbsoluteData fills gaps and enriches. NSDL wins for registrar/certificates; AbsoluteData wins for schedules/classification.

### UI consumers (must keep working)
- **meradhan app**: listing & category pages (`POST /bonds/listed/filter`, `GET /bonds/filter-options`), detail/overview (`GET /bonds/{isin}`), cashflow tab (`GET /bonds/{isin}/cashflow`), documents tab (`GET /bonds/{isin}/documents`), order pricing (`GET /bonds/{isin}/order-pricing`), comparison, watchlist.
- **crm app**: bond CRUD, auto-update/autofill (`/deal-autofill-calc`), priced-list, margins, reference-data, documents, logos.

### Database
Single PostgreSQL instance (`DATABASE_URL` + `DIRECT_URL`), Prisma with split schema files under `backend/databases/postgres/prisma/schema/`. No multi-DB setup.

---

## 3. Key constraints & decisions

| Decision | Choice |
|----------|--------|
| **ISIN universe source** | A seed list (Excel/PDF, ~30,000 ISINs) supplied by the AbsoluteData team is imported into a registry table. Deridata is then called per ISIN. No discovery scrape. |
| **Scope** | All 6 Deridata endpoints → 6 new data tables. |
| **Storage** | New `deridata_*` tables in the existing MeraDhan Postgres DB. No separate database. |
| **Rate limit** | Deridata enforces a per-day call cap (returns `403 Limit expired`). Full load ≈ 30,000 ISINs × 6 endpoints ≈ **180,000 calls**. Ingestion runs in resumable daily batches. |
| **Ingestion engine** | **Option A** — DB work-list table + daily-budget cron worker that resumes the next day. |
| **Calculator** | Store Deridata Calculator snapshots, but **keep calc.meradhan.co live behind a feature flag** for order pricing until Deridata's calculator is validated. |
| **Auth** | HMAC-SHA256 checksum, generated server-side only. IP-whitelisted. |

---

## 4. Architecture

### 4.1 New module: `backend/src/modules/deridata/`
Mirrors the `absolutedata` module structure.

- **`deridata.api.ts`** — HTTP client (axios). Responsibilities:
  - Build checksum message `{uuid}|{merchant_id}|{merchant_name}|{merchant_email}|{public_ip}` (exact order, no spaces around `|`), sign with HMAC-SHA256 + secret key, base64-encode. Server-side only.
  - Generate a fresh UUID per request: `{merchant_id}|{timestamp}|{random_int}`.
  - One method per endpoint, each returning a typed result:
    - `getIssueDetail(isin)` → `POST /api/public/merchant/v1/issue-detail/`
    - `calculate(params)` → `POST /api/public/merchant/v1/calculator/`
    - `getEbp(isin)` → `POST /api/public/merchant/v1/ebp/`
    - `getSecondaryTrades(isin)` → `POST /api/public/merchant/v1/secondary-trades/`
    - `getSecurityCovenant(isin)` → `POST /api/public/merchant/v1/security-covenant/`
    - `getDocuments(isin)` → `POST /api/public/merchant/v1/documents/`
  - Map Deridata error responses to a structured `{ ok: false, error, status }` result (don't throw on 4xx) so the worker can branch on `401 Invalid checksum`, `403 Limit expired`, `404 No record found`.
  - Factory `deridataApiFromEnv()` reads env config; throws if not configured.

- **`deridata.types.ts`** — Zod schemas + TS types for all 6 responses (see Deridata v3.1 field tables). Includes the Annexure B null/NA conventions (`null`, `"N/A"`, `"NA"`, `[]`, `"-"`, `""`).

- **`deridata.mapper.ts`** — maps each response into its table row, and maps `issue-detail` → existing `bonds` columns (so current UI is unaffected). Handles Deridata date format `DD-MMM-YYYY` → ISO + IST calendar day (reuse the IST helpers used by the AbsoluteData mapper).

### 4.2 Config (`packages/config/src/env.ts`)
New env vars (all validated with Zod):
```
DERIDATA_MERCHANT_ID        (number/string, required to enable)
DERIDATA_SECRET_KEY         (string, required to enable)
DERIDATA_MERCHANT_NAME      (string)
DERIDATA_MERCHANT_EMAIL     (string)
DERIDATA_PUBLIC_IP          (string — must match backend egress IP whitelisted with Deridata)
DERIDATA_BASE_URL           (url, default https://www.deridata.com; UAT https://test.deridata.com)
DERIDATA_DAILY_CALL_LIMIT   (number — daily budget; confirm exact value with Deridata)
DERIDATA_ENABLED            (bool — master flag)
USE_DERIDATA_CALCULATOR     (bool — flag; default false during transition)
USE_DERIDATA_AS_CATALOG     (bool — flag; flips bonds writer from AbsoluteData/NSDL to Deridata)
```
Like AbsoluteData, integration is a no-op when not configured.

> **Ops gate (blocking for go-live):** Deridata whitelists by IP, and the `public_ip` in the checksum must equal the request's actual egress IP. The backend/worker outbound IP (ECS task / NAT egress) must be registered with Deridata, and `DERIDATA_PUBLIC_IP` set to it. Confirm before enabling in any environment.

---

## 5. Database schema (new tables)

All new tables live in `backend/databases/postgres/prisma/schema/` (new file `deridata.prisma`), same datasource. Every data table carries `raw Json` (full response, forward-compat), `fetchedAt`, `createdAt`, `updatedAt`.

### 5.1 Data tables (6)
1. **`deridata_issue_detail`** — one row per ISIN. Columns for the Issue Detail fields (did, coupon, coupon_type, coupon_frequency, maturity, issue_date, allotment_date, face_value, record_date, coupon_date, issuer_name, description, issuer_industry, seniority, security, listed, tax_free, current_rating[], rating_agency[], outlook[], instrument_type[], tags[], redemption_type, redemption_premium, redemption[], put/call fields, multiple_*_dates[], total_issue_size_cr, financial_covenants{}). Also the field that maps into `bonds`.
2. **`deridata_calculator`** — point-in-time snapshot per (ISIN, value_date, mode, yield/price input). Summary fields (clean_price, accrued_int_top, dirty_price, principal, accrued_int_bottom, total_consideration, xirr, cashflow_shut_flag, shut_period_message, record_date). Child table **`deridata_cashflows`** (FK) for the cashflows array (cash_flow_dates, coupon_cash_flow, principal_cash_flow, total_cash_flow).
3. **`deridata_ebp`** — one row per `ebp_items[]` entry per ISIN (allotment_date, issue_size, base_issue_size, green_shoe, reissuance, bid_*, allotted_*, wat, wap, cut_off_*, wt_avg_*, spread_bps, type_of_*, manner_of_allotment, ebp, fv).
4. **`deridata_secondary_trades`** — summary row per ISIN (way_percentage, cumulative_volume, avg_daily_volume, avg_vol_trades, avg_daily_trades, last_trade_date, spread) + child table **`deridata_trade_history`** (trade_date, spread, volume, yield).
5. **`deridata_security_covenant`** — one row per ISIN (step_up_condition, step_down_condition, security_cover, nature_of_security, credit_enhancement, guarantee, guarantor, percentage_of_guarantee) + financial_covenants stored as structured columns (min_nw, cad_ratio, min_pat_ebitda_pbt, de_ratio, gnpa_nnpa_par90, other, shareholding_amt) and JSON.
6. **`deridata_documents`** — one row per ISIN for metadata + child **`deridata_press_releases`** (agency, rating, outlook, url). **`im_link` is NOT persisted long-term** (pre-signed S3 URL, valid 1 hour) — fetched on demand and returned fresh.

### 5.2 Control tables (2)
- **`deridata_isin_registry`** — the imported seed universe: `isin` (unique), `sourceBatch`, `isActive`, `priority` (for ordering backfill), `addedAt`.
- **`deridata_sync_tasks`** — the resumable work-list: one row per `(isin, endpoint)`. Columns: `isin`, `endpoint` (enum: ISSUE_DETAIL/CALCULATOR/EBP/SECONDARY_TRADES/SECURITY_COVENANT/DOCUMENTS), `status` (PENDING/IN_PROGRESS/DONE/FAILED/SKIPPED/NOT_FOUND), `attempts`, `lastError`, `lastStatusCode`, `nextRunAfter`, `fetchedAt`, `priority`. Unique `(isin, endpoint)`. `NOT_FOUND` is **terminal** (never retried) — a missing ISIN costs exactly one call, once.
- **`deridata_sync_state`** — singleton row tracking the daily budget: `callsUsedToday`, `budgetDate` (IST calendar day), `limitHitAt`, `lastResetAt`. (Small enough to fold into a settings table if preferred.)

---

## 6. Batch ingestion engine (Option A)

### 6.1 Seed import
A CRM-triggered (or script) importer parses the supplied Excel/CSV ISIN list (request Excel/CSV over PDF; if only PDF is available, extract the ISIN column to CSV first), upserts into `deridata_isin_registry`, and seeds `deridata_sync_tasks`. **Only the `ISSUE_DETAIL` task is created up front** per ISIN (see gating in 6.2) — the other 5 endpoint tasks are created lazily once `ISSUE_DETAIL` succeeds. Idempotent — re-importing only adds new ISINs. The raw uploaded file is archived (S3/uploads) for audit.

### 6.1a ISSUE_DETAIL gating (coverage guard)
The AbsoluteData ISIN list (~30,000) is larger than Deridata's coverage (~10,000), so ~20,000 ISINs will return `404 No record found`. Since a 404 still consumes a daily call, we **gate the other 5 endpoints on `ISSUE_DETAIL`**:
- `ISSUE_DETAIL` is probed first for every ISIN.
- **Success** → create PENDING tasks for the other 5 endpoints for that ISIN.
- **`404`** → mark the ISIN's `ISSUE_DETAIL` task `NOT_FOUND` (terminal) and create **no** further tasks for it.

Effect: a missing ISIN costs **1** call instead of 6. Full backfill drops from ~180,000 calls to ≈ **80,000** (10,000 covered × 6 + 20,000 missing × 1). If Deridata supplies their coverage list, seed from the intersection and 404s approach zero (~60,000 calls).

### 6.2 Worker (cron)
A node-cron job (and/or a small loop) that:
1. Reads/initializes `deridata_sync_state`. If `budgetDate` ≠ today (IST), reset `callsUsedToday = 0`, set `budgetDate = today`.
2. While `callsUsedToday < DERIDATA_DAILY_CALL_LIMIT`:
   - Pull the next batch of PENDING tasks ordered by `priority`, then endpoint priority, then ISIN (skip tasks with `nextRunAfter` in the future).
   - For each: mark IN_PROGRESS, call the Deridata endpoint, then:
     - **success** → map + upsert into the data table; mark DONE; `fetchedAt = now`; increment `callsUsedToday`. If the task was `ISSUE_DETAIL`, **create PENDING tasks for the other 5 endpoints** for this ISIN (gating, 6.1a).
     - **404 No record** → mark NOT_FOUND (**terminal, never retried**); increment counter. If the task was `ISSUE_DETAIL`, create **no** further tasks for this ISIN.
     - **403 Limit expired** → set `limitHitAt`, stop the run immediately (resume next day). Do **not** mark the task failed.
     - **401 Invalid checksum / 5xx / network** → increment `attempts`, set `lastError`/`lastStatusCode`, exponential backoff via `nextRunAfter`; FAILED after N attempts (alert).
   - Respect a small inter-call delay (e.g. 100ms, as the AbsoluteData cron does) to avoid throttling.
3. On budget exhaustion or empty queue, stop cleanly. Next run resumes exactly where it left off (state is in the DB).
4. Emit a run summary (done / not-found / failed / budget-remaining) — email + log, mirroring `bond_reference_schedules.cron.ts`.

### 6.3 Backfill prioritization
To make the catalog usable fast under the daily cap:
- **Phase 1 (gate):** `ISSUE_DETAIL` for all ISINs (powers the catalog/UI), active/listed ISINs first. This both fills the catalog and determines coverage — only ISINs that succeed here get the remaining endpoints.
- **Phase 2:** `CALCULATOR` + schedules (covered ISINs only).
- **Phase 3:** `EBP`, `SECONDARY_TRADES`, `SECURITY_COVENANT`, `DOCUMENTS` (covered ISINs only).

Full backfill duration ≈ `ceil(total_calls / DERIDATA_DAILY_CALL_LIMIT)` days, where `total_calls ≈ 80,000` after gating (≈ 8 days at 10k/day) rather than 180,000. Implemented via the `priority` column + endpoint ordering.

### 6.4 Steady-state refresh
After backfill, only changed/active bonds re-enqueue, per-endpoint cadence:
- Rarely change → low cadence: `ISSUE_DETAIL`, `SECURITY_COVENANT`, `DOCUMENTS` (e.g. weekly/monthly or on-demand).
- Change often → higher cadence: `EBP`, `SECONDARY_TRADES`, `CALCULATOR` (e.g. daily for active instruments).
Re-enqueue = reset matching `deridata_sync_tasks` rows to PENDING on a schedule. Steady-state daily volume is far below the backfill peak.

---

## 7. Wiring into the existing app

- **Catalog (no UI change):** `deridata.mapper.ts` maps `deridata_issue_detail` → existing `bonds` columns. Behind `USE_DERIDATA_AS_CATALOG`, the `bonds` writer switches from the AbsoluteData/NSDL merge to Deridata. Existing listing/detail/comparison/watchlist pages are unaffected.
- **New endpoints + UI (later):** new backend routes expose EBP, Secondary Trades, Security & Covenant from the new tables; new UI sections render them. Documents route returns persisted press releases + a freshly-fetched `im_link`.
- **Calculator:** behind `USE_DERIDATA_CALCULATOR` (default off). Deridata snapshots are stored; order pricing stays on calc.meradhan.co until validated, then the flag flips.

---

## 8. Decommissioning AbsoluteData + NSDL (phased, flag-gated)

1. Build `deridata` module + tables + ingestion engine alongside existing jobs (no behavior change).
2. Import seed ISINs; run backfill; validate Deridata coverage & field parity vs current `bonds` (reconciliation report).
3. Flip `USE_DERIDATA_AS_CATALOG` → `bonds` written from Deridata.
4. Disable the NSDL scrape cron (07:00) and AbsoluteData schedule cron (06:00).
5. After a stable period, remove the `absolutedata` module, the NSDL scraper jobs, and the now-unused `bond_reference_*` tables (or repoint them at Deridata). Keep a rollback window.

---

## 9. Testing

- **Unit:** checksum generation (golden vector from the Deridata Python example), UUID format, date `DD-MMM-YYYY` → ISO/IST, each mapper (incl. Annexure B null conventions), error-branching in the API client.
- **Ingestion:** budget reset across IST day boundary; 403 stops the run without marking tasks failed; resume continues from the work-list; 404 → NOT_FOUND no-retry; backoff on 5xx; idempotent seed import.
- **Integration (UAT base URL):** live calls against `https://test.deridata.com` for a few sample ISINs across all 6 endpoints.
- **Reconciliation:** compare Deridata-sourced `bonds` rows against current AbsoluteData/NSDL rows; report field-level diffs before flipping the catalog flag.

---

## 10. Open items to confirm with Deridata / ops

1. Exact **daily call limit** value (sets `DERIDATA_DAILY_CALL_LIMIT` and backfill duration).
2. **Egress IP whitelisting** for backend/worker; whether prod and UAT egress IPs differ.
3. Merchant credentials (merchant_id, secret_key, merchant_name, merchant_email).
4. Whether Deridata can supply a **bulk/universe feed** later (would remove the manual seed-list step).
5. Confirm Calculator request parameters we'll snapshot (value_date cadence, default yield mode) for `deridata_calculator`.
