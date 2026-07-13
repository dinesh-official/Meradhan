# Order Stage Reconciliation — Complete Guide

**Status:** Implemented (guided rollout)  
**Date:** 2026-07-13  
**Scope:** Post-payment NSE RFQ settlement pipeline with durable stage tracking, 30‑minute resume cron, and CRM admin visibility  
**Constraint:** Do **not** rewrite existing NSE / Razorpay step implementations — reuse them from a new orchestrator

---

## Locked decisions (resolved)

| Decision | Choice |
|---|---|
| Primary path | Redis worker (immediate) |
| Backstop | Cron every 30 minutes (`order_stage_reconciliation.cron.ts`) |
| `orders.settlementStage` | Last **successful** stage |
| `pg_routing` | Netbanking only; non-netbanking seeded as skipped success |
| Email / receipt | Post-pipeline via existing `trySendOrderReceiptPdfEmail` |
| Max attempts per stage | 5 |
| Orchestrator | `OrderSettlementService.reconcileOrderSettlementByStages` (same class → private steps unchanged) |
| Worker | Calls new runner; `initiateOrderSettlement` kept for rollback |
| CRM | Settlement Pipeline card + Resume button on order details |

## Table of contents

1. [Problem & goal](#1-problem--goal)
2. [What exists today](#2-what-exists-today)
3. [Target sequence (business)](#3-target-sequence-business)
4. [Stage model](#4-stage-model)
5. [Database changes](#5-database-changes)
6. [Code-level changes](#6-code-level-changes)
7. [Orchestrator algorithm](#7-orchestrator-algorithm)
8. [Triggers (Redis + cron)](#8-triggers-redis--cron)
9. [Idempotency & concurrency](#9-idempotency--concurrency)
10. [Implementation phases](#10-implementation-phases)
11. [Acceptance criteria](#11-acceptance-criteria)
12. [Risks & guards](#12-risks--guards)
13. [CRM admin visibility](#13-crm-admin-visibility)
14. [Quick reference map](#14-quick-reference-map)

---

## 1. Problem & goal

### Problem

After a customer payment succeeds, settlement runs via Redis (`orderSettlementQueue` → `OrderSettlementService.initiateOrderSettlement`). If any NSE or Razorpay step fails mid-way:

- There is no first-class cursor on `orders` for “where are we in settlement?”
- Retries tend to restart the full chain (risk of duplicate RFQ / Add ISIN)
- Ops cannot see per-stage payload, response, and status in one place

### Goal

1. Track settlement as an ordered sequence of stages
2. Persist request/response per stage
3. Resume from the first incomplete or failed stage (idempotent)
4. Cron every **30 minutes** as a backstop for stuck orders
5. **Reuse** existing step functions; only add schema + orchestration + cron + thin wiring

### Non-goals

- Rewriting `NseRfq` or existing settlement step method bodies
- Replacing payment reconciliation (Razorpay capture) — that stays separate
- Changing customer-facing payment UX
- Frontend stages UI (optional later)

---

## 2. What exists today

| Concern | Location |
|---|---|
| Queue | `orderSettlementQueue` in `backend/src/jobs/queue/worker_queues.ts` |
| Worker | `backend/src/jobs/order_settlement_worker.ts` |
| Orchestration (linear) | `OrderSettlementService.initiateOrderSettlement` |
| Add ISIN | `addIsinToSettlement` → `nseRfq.createRfq` |
| Quote accept | `acceptNegotiation` |
| Deal propose | `proposeDeal` |
| Deal accept | `acceptOrRejectDeal` |
| PG routing | `makeRazorpayRouteTransition` (`@services/razorpay-route/RPay-route`) |
| Login token | `NseRfq` (cached login key in Redis) |
| Legacy step logs | `order_logs` |
| Automation batch logs | `order_settlement_automation_logs` |
| Payment backstop | `PaymentReconciliationService` + `payment_reconciliation.cron.ts` (hourly) |
| Step constants | `SettlementStep` / `SettlementStatus` in `packages/config/src/constants.ts` |

### Current happy path (simplified)

```
Payment captured
  → orderSettlementQueue.add(...)
  → initiateOrderSettlement(orderId, isNetBanking)
      → ADD_ISIN
      → ACCEPT_NEGOTIATION
      → PROPOSE_DEAL
      → ACCEPT_OR_REJECT_DEAL
      → UPDATE_ORDER_STATUS
      → RAZORPAY_ROUTE_TRANSFER (if netbanking)
      → email / order receipt
```

Logging today is split across `order_logs` and `order_settlement_automation_logs`. There is **no** `settlementStage` on `orders` and **no** `order_stages` table.

---

## 3. Target sequence (business)

| # | API / action | Payload (summary) | Response (summary) | Pipeline stage |
|---|---|---|---|---|
| 0 | RFQ login / token | Domain + username + password (static env) | `loginKey` | *Internal — not a DB stage* |
| 1 | Add ISIN | ISIN, yield, qty, B/S, … | RFQ no, deal date, settlement date, quote time, end time | `add_isin` |
| 2 | Quote accept | RFQ no, accept value, amount, … | Accept date, negotiation_id, trade_no, accept qty, B/S, accept value | `quote_accept` |
| 3 | Deal propose | Clean price, accrual, RFQ no, negotiation_id, TC | Exchange order no | `deal_propose` |
| 4 | Deal accept | Clean price, accrual, RFQ no, negotiation_id, TC | Accept confirmation | `deal_accept` |
| 5 | Razorpay route | `rfq_no`, UCC, customer id | Transfer result | `pg_routing` |
| 6 | Email / receipt | Order + deal data | Sent | *Attach to `pg_routing` or post–`deal_accept` (confirm)* |

Token generation stays inside `NseRfq` (already used by existing methods). Do **not** create a separate `order_stages` row for login unless product explicitly requires it later.

---

## 4. Stage model

### Order cursor enum (`orders.settlement_stage`)

| Value | Meaning |
|---|---|
| `started` | Settlement pipeline entered (optional) |
| `payment_done` | Payment captured; stage rows seeded; ready to run NSE steps |
| `add_isin` | Add ISIN completed (or current — see convention below) |
| `quote_accept` | Quote accept completed |
| `deal_propose` | Deal propose completed |
| `deal_accept` | Deal accept completed |
| `pg_routing` | Razorpay routing (+ related post-steps) completed |

**Recommended convention:** `orders.settlementStage` = **last successfully completed** stage. While a step is executing, the matching `order_stages.status = 3` (waiting).

### Per-row status codes (`order_stages.status`)

| Code | Meaning |
|---|---|
| `0` | Not started |
| `1` | Success |
| `2` | Fail |
| `3` | Waiting / in progress |

Failed rows must use `2`, not `0`.

### Mapping to existing `SettlementStep`

| New stage | Existing constant / action |
|---|---|
| `add_isin` | `SettlementStep.ADD_ISIN` |
| `quote_accept` | `SettlementStep.ACCEPT_NEGOTIATION` |
| `deal_propose` | `SettlementStep.PROPOSE_DEAL` |
| `deal_accept` | `SettlementStep.ACCEPT_OR_REJECT_DEAL` |
| `pg_routing` | Logged today as `RAZORPAY_ROUTE_TRANSFER` (no `SettlementStep` entry yet) |

Keep existing `SettlementStep` values for dual-write compatibility with `order_logs`.

---

## 5. Database changes

Additive only. Do not drop or alter existing settlement log tables.

### 5.1 New enum

```prisma
enum OrderSettlementStage {
  started
  payment_done
  add_isin
  quote_accept
  deal_propose
  deal_accept
  pg_routing
}
```

### 5.2 New column on `orders`

| Column | Type | Notes |
|---|---|---|
| `settlementStage` | `OrderSettlementStage?` | Nullable so existing rows stay valid |
| Index | `@@index([settlementStage, updatedAt])` | Cron stuck-order lookup |

No change to `OrderStatus` / `PaymentStatus` for this feature.

### 5.3 New table `order_stages`

| Column | Type | Notes |
|---|---|---|
| `id` | Int PK | Autoincrement |
| `orderId` | Int FK → `orders.id` | Cascade delete recommended |
| `orderNo` | String | e.g. `MD101` (`orders.orderNumber`) |
| `stage` | `OrderSettlementStage` | Pipeline step only |
| `status` | Int | `0` / `1` / `2` / `3` |
| `payload` | Json? | Request / prepared payload |
| `response` | Json? | API response or error body |
| `seq` | Int | Execution order `1..N` |
| `attemptCount` | Int? | Optional; default `0` |
| `lastError` | String? | Optional |
| `createdAt` | DateTime | `@default(now())` |
| `updatedAt` | DateTime | `@updatedAt` |

**Constraints / indexes:**

- `@@unique([orderId, stage])`
- `@@index([orderNo])`
- `@@index([status, updatedAt])`
- `@@index([orderId, seq])`
- `@@map("order_stages")`

### 5.4 Prisma sketch

```prisma
enum OrderSettlementStage {
  started
  payment_done
  add_isin
  quote_accept
  deal_propose
  deal_accept
  pg_routing
}

model Order {
  // ... existing fields ...
  settlementStage OrderSettlementStage?
  orderStages     OrderStage[]

  @@index([settlementStage, updatedAt])
}

model OrderStage {
  id           Int                  @id @default(autoincrement())
  orderId      Int
  order        Order                @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderNo      String
  stage        OrderSettlementStage
  status       Int                  @default(0)
  payload      Json?
  response     Json?
  seq          Int
  attemptCount Int                  @default(0)
  lastError    String?
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt

  @@unique([orderId, stage])
  @@index([orderNo])
  @@index([status, updatedAt])
  @@index([orderId, seq])
  @@map("order_stages")
}
```

### 5.5 Seed rows (on payment done / settlement start)

| seq | stage | initial status |
|---|---|---|
| 1 | `add_isin` | 0 |
| 2 | `quote_accept` | 0 |
| 3 | `deal_propose` | 0 |
| 4 | `deal_accept` | 0 |
| 5 | `pg_routing` | 0 |

Then set `orders.settlementStage = payment_done`.

**Sample after seed:**

```
1, MD101, add_isin,      0, {}, {}, 1, ...
2, MD101, quote_accept,  0, {}, {}, 2, ...
3, MD101, deal_propose,  0, {}, {}, 3, ...
4, MD101, deal_accept,   0, {}, {}, 4, ...
5, MD101, pg_routing,    0, {}, {}, 5, ...
```

If `pg_routing` is not applicable (non-netbanking), either skip seeding that row or seed and immediately mark `1` with `{ skipped: true }`.

### 5.6 What does **not** change

- `order_logs`
- `order_settlement_automation_logs`
- `OrderStatus` / `PaymentStatus` enums
- Razorpay / RFQ / negotiation tables (no schema change required for this feature)

---

## 6. Code-level changes

### Principle

- **Do not rewrite** `addIsinToSettlement`, `acceptNegotiation`, `proposeDeal`, `acceptOrRejectDeal`, `makeRazorpayRouteTransition`, or `NseRfq` login.
- **Add** orchestrator + schema + cron.
- **Thin-wire** payment / assign enqueue sites to seed stages.

### 6.1 New files

| Area | Proposed path | Responsibility |
|---|---|---|
| Schema | `backend/databases/postgres/prisma/schema/orders.prisma` | Enum, column, `OrderStage` model |
| Migration | `backend/databases/postgres/prisma/migrations/...` | Apply DB changes |
| Constants | `packages/config/src/constants.ts` | Stage names, status codes, map → `SettlementStep` |
| Orchestrator | `backend/src/services/order/order_stage_reconciliation.service.ts` | Seed, run, resume, update stages |
| Repo (optional) | `backend/src/services/order/order_stage.repo.ts` | CRUD helpers for `order_stages` |
| Cron | `backend/src/jobs/cron/order_stage_reconciliation.cron.ts` | `*/30` stuck-order resume |
| Cron register | Same import pattern as `payment_reconciliation.cron.ts` | Ensure cron loads with backend |

### 6.2 Light wiring (call sites only)

| File | Change |
|---|---|
| `backend/src/jobs/order_settlement_worker.ts` | Call new orchestrator (or wrap old entry) |
| `backend/src/resource/customer/payment/payment.controller.ts` | Before/after queue add: seed stages + `payment_done` |
| `backend/src/services/payment/payment_reconciliation.service.ts` | Seed when queueing missed settlement; optionally use `order_stages` for missing-step detection |
| `backend/src/resource/crm/orders/orders.service.ts` | Seed when CRM assign enqueues settlement |
| `backend/scripts/asign-order.ts` (and root `asign-order.ts` if used) | Same seed if that path enqueues settlement |

### 6.3 Intentionally untouched

| Symbol / file | Why |
|---|---|
| `OrderSettlementService.addIsinToSettlement` | Step 1 |
| `OrderSettlementService.acceptNegotiation` | Step 2 |
| `OrderSettlementService.proposeDeal` | Step 3 |
| `OrderSettlementService.acceptOrRejectDeal` | Step 4 |
| `makeRazorpayRouteTransition` | Step 5 PG |
| `NseRfq` token/login | Dependency of NSE calls |
| `nse_RFQ.ts` / `rfq.types.ts` | No client rewrite |
| Step method bodies inside `order_settlement.service.ts` | Called by orchestrator |
| Frontend order UIs | Out of scope for v1 |

`initiateOrderSettlement` may remain for rollback; prefer a **new** method (e.g. `reconcileOrderStages`) rather than editing the old method’s internals.

### 6.4 Suggested constants

```ts
export const OrderPipelineStage = {
  STARTED: "started",
  PAYMENT_DONE: "payment_done",
  ADD_ISIN: "add_isin",
  QUOTE_ACCEPT: "quote_accept",
  DEAL_PROPOSE: "deal_propose",
  DEAL_ACCEPT: "deal_accept",
  PG_ROUTING: "pg_routing",
} as const;

export const OrderStageStatus = {
  NOT_STARTED: 0,
  SUCCESS: 1,
  FAIL: 2,
  WAITING: 3,
} as const;

export const STAGE_TO_SETTLEMENT_STEP = {
  add_isin: SettlementStep.ADD_ISIN,
  quote_accept: SettlementStep.ACCEPT_NEGOTIATION,
  deal_propose: SettlementStep.PROPOSE_DEAL,
  deal_accept: SettlementStep.ACCEPT_OR_REJECT_DEAL,
} as const;
```

---

## 7. Orchestrator algorithm

### High-level flow

```
Payment captured
    → seed order_stages (5 rows, status=0)
    → orders.settlementStage = payment_done
    → enqueue Redis (primary path)

Redis worker / Cron
    → processOrderStages(orderId)
        → find first stage with status ∈ {0, 2} (or expired waiting)
        → call EXISTING step method
        → update order_stages row + orders.settlementStage
        → continue sequentially until fail or complete
```

### Pseudocode

```
function seedOrderStages(order):
  upsert rows for (add_isin, quote_accept, deal_propose, deal_accept, pg_routing)
  set orders.settlementStage = payment_done

function processOrderStages(orderId):
  acquire lock(orderId)
  rows = order_stages WHERE orderId ORDER BY seq ASC

  for row in rows:
    if row.status == SUCCESS: continue
    if row.attemptCount >= MAX_ATTEMPTS: alert; break

    mark status=WAITING; attemptCount++
    try:
      result = dispatch(row.stage)   // existing methods only
      save payload + response; status=SUCCESS
      orders.settlementStage = row.stage
    catch err:
      save error in response; status=FAIL; lastError=...
      send settlement failure alert
      break

  release lock(orderId)

function dispatch(stage):
  switch stage:
    add_isin      → OrderSettlementService.addIsinToSettlement(...)
    quote_accept  → OrderSettlementService.acceptNegotiation(...)
    deal_propose  → OrderSettlementService.proposeDeal(...)
    deal_accept   → OrderSettlementService.acceptOrRejectDeal(...)
    pg_routing    → makeRazorpayRouteTransition(...)  // if applicable
```

Downstream stages should read prior stage `response` (or existing helpers `getRfqNumber` / `getNegotiationId` / `getAccruedInterest`) — do not invent parallel payload builders if existing methods already build them.

---

## 8. Triggers (Redis + cron)

### A. Primary — Redis (keep)

Keep enqueue from:

- Payment webhook / capture (`payment.controller.ts`)
- Payment reconciliation (missed capture → queue settlement)
- CRM / assign-order flows

Redis remains the **fast path**. Stage seeding happens at enqueue (or at the start of the orchestrator, idempotent upsert).

### B. Backstop — Cron every 30 minutes

```
Cron: */30 * * * *  timezone Asia/Kolkata
```

**Select orders where:**

- `settlementStage IN (payment_done, add_isin, quote_accept, deal_propose, deal_accept)`
- `updatedAt <= now() - 30 minutes`
- `paymentStatus = COMPLETED`
- Exclude terminal order statuses as needed (`SETTLED`, `CANCELLED`, `REJECTED`, `EXPIRED` — confirm business rules)
- Skip rows currently `waiting` updated within a short grace window (avoid clashing with a live Redis job)

**Batch size:** e.g. max 50 orders per run.

### Relation to existing payment crons

| Job | Purpose |
|---|---|
| Payment recon (hourly) | Fix missed Razorpay capture; may enqueue settlement |
| Abandoned order (15m) | Cancel unpaid `PENDING` |
| **Order stage recon (30m)** | Resume NSE/PG stages after payment done |

Payment recon owns **payment capture**. Stage recon owns **NSE/PG step resume**.

---

## 9. Idempotency & concurrency

### Idempotency (critical)

| Stage | On retry if already succeeded |
|---|---|
| `add_isin` | If `rfqNumber` exists in stage response / success log → **do not** call NSE again |
| `quote_accept` | If `negotiationId` exists → skip NSE call |
| `deal_propose` / `deal_accept` | If success response exists → skip |
| `pg_routing` | If `orders.transferId` already set → skip |

Prefer `order_stages.response` as source of truth once populated; until cutover, also consult existing `order_logs`.

### Concurrency

- Redis worker and cron must not process the same order at once
- Use a Redis lock **or** only pick stages not in `WAITING` with recent `updatedAt`
- Mark `WAITING` before calling external APIs

### Dual-write (transition)

While rolling out, keep writing:

1. `order_stages` (new source of truth for resume)
2. Existing `order_logs` / automation logs (via calling current step methods unchanged)

---

## 10. Implementation phases

### Phase 1 — Schema

- Add `OrderSettlementStage` enum
- Add nullable `orders.settlementStage` + index
- Add `order_stages` model + migration
- Run `prisma generate`

### Phase 2 — Constants & seed helper

- Add stage/status constants in `packages/config`
- Implement `seedOrderStages(orderId)` (idempotent upsert)

### Phase 3 — Orchestrator

- New `OrderStageReconciliationService`
- Dispatch to existing step methods
- Update payload / response / status / order cursor
- Idempotent skip for already-success stages

### Phase 4 — Wire worker & entry points

- Settlement worker → new orchestrator
- Payment / recon / CRM assign → seed before enqueue
- Leave old `initiateOrderSettlement` intact for rollback

### Phase 5 — Cron

- `order_stage_reconciliation.cron.ts` every 30 minutes
- Lock + batch limit + logging

### Phase 6 — Hardening

- Max attempts per stage
- Skip / auto-success `pg_routing` when N/A
- Alerts via existing `sendSettlementAutomationFailureEmail`
- Optional CRM `GET /orders/:id/stages`

---

## 11. Acceptance criteria

- [x] Schema: `OrderSettlementStage`, `orders.settlementStage`, `order_stages` + migration
- [x] Constants + `seedOrderStages` + enqueue wiring
- [x] `reconcileOrderSettlementByStages` with lock, resume, idempotency
- [x] Worker switched to new runner (`initiateOrderSettlement` retained)
- [x] Payment recon uses seed + same `jobId`
- [x] 30-min cron registered
- [x] CRM Settlement Pipeline + Resume endpoint/UI
- [ ] UAT: happy path, fail mid-way, resume without duplicate RFQ, transferId guard

---

## 12. Risks & guards

| Risk | Guard implemented |
|---|---|
| Duplicate RFQ on retry | Skip Add ISIN if `rfqNumber` already in stage response / order logs |
| Duplicate Razorpay transfer | Skip `pg_routing` if `orders.transferId` set |
| Redis + cron double-run | Redis lock `order-stage-lock:{orderId}` + skip recent WAITING stages in cron |
| Payment recon full restart | Worker uses resume-safe runner; recon seeds + uses same job id |
| Infinite fail loop | `ORDER_STAGE_MAX_ATTEMPTS = 5` then alert and stop |
| Blind `initiateOrderSettlement` restart | Not called by new path; kept only for manual rollback |

---

## 13. CRM admin visibility

**Order details** (`OrderDetailsView`):

- New **Settlement Pipeline** card lists all `orderStages` by `seq`
- Status chips: not started / success / failed / waiting
- Failed steps show `lastError`; collapsible payload/response
- **Resume settlement** → `POST /api/crm/orders/:id/resume-settlement` (same Redis job)
- Existing Order Activity Timeline + Payment Process Logs remain

**API:**

- `getOrderById` includes `settlementStage` + `orderStages`
- Types in `packages/apiGateway/.../orders.response.ts`

---

## 14. Quick reference map

### Sequence diagram

```
[Payment captured]
        │
        ▼
 seed order_stages + settlementStage=payment_done
        │
        ├──────────────────────────────┐
        ▼                              ▼
 Redis worker (primary)         Cron */30 (backstop)
        │                              │
        └──────────┬───────────────────┘
                   ▼
        reconcileOrderSettlementByStages (locked)
                   │
     ┌─────────────┼─────────────┬──────────────┬──────────────┐
     ▼             ▼             ▼              ▼              ▼
  add_isin   quote_accept  deal_propose   deal_accept    pg_routing
  (existing)  (existing)    (existing)     (existing)     (existing)
                   │
                   ▼
        update order_stages + orders.settlementStage
                   │
                   ▼
              CRM Settlement Pipeline + Resume
```

### Implemented files

| Kind | Path |
|---|---|
| Schema / migration | `backend/databases/postgres/prisma/schema/orders.prisma`, `migrations/20260713153000_order_settlement_stages/` |
| Constants | `packages/config/src/constants.ts` |
| Orchestrator | `backend/src/services/order/order_settlement.service.ts` (`seedOrderStages`, `reconcileOrderSettlementByStages`) |
| Worker | `backend/src/jobs/order_settlement_worker.ts` |
| Cron | `backend/src/jobs/cron/order_stage_reconciliation.cron.ts` |
| CRM API/UI | `orders.service/controller/routes`, `orders.api.ts`, `OrderDetailsView.tsx` |

**Untouched on purpose:** NSE RFQ client method bodies for step APIs, Razorpay route core, abandoned-order cron, `initiateOrderSettlement` body, MeraDhan customer frontend.

---

*Prefer additive orchestration over modifying existing NSE settlement step bodies. Always resume from the first non-success stage.*
