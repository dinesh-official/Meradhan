# Deridata Ingestion Engine — Implementation Plan (Plan 3 of 4)

> **STATUS: DEFERRED / NOT IMPLEMENTED (2026-06-29).** The cron/work-list batch engine
> described here was intentionally removed in favour of a focused one-off populate for the
> 37 autofill ISINs (see `deridata.populate.ts` + `be-start.sh`). This document is retained
> as the blueprint for the future cron that will populate the remaining universe, with the
> ISIN list sourced from AbsoluteData. None of the code below currently exists in the tree.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the resumable, rate-limit-aware batch ingestion engine that seeds the ISIN universe, walks the `deridata_sync_tasks` work-list within a daily call budget, gates the 5 secondary endpoints behind a successful `ISSUE_DETAIL`, persists each response via the Plan-2 mappers, and resumes the next day when the budget/limit is hit.

**Architecture:** A pure core (`runDeridataSync`) drives the loop against two injected interfaces — a `DeridataClientLike` (Plan 1's `DeridataApi`) and a `DeridataStore` (persistence). The core is unit-tested with in-memory fakes (proving budget reset, 403-stop, 404-terminal, gating, retry, resume). A `PrismaDeridataStore` adapter implements the interface against `db.dataBase` using the Plan-2 mappers. A seed importer + script load ISINs into `deridata_isin_registry` and create `ISSUE_DETAIL` tasks. A cron wires it all together and emails a summary.

**Tech Stack:** Bun test, TypeScript 5.9, Prisma 6 (`db.dataBase`), node-cron, `xlsx` (already a dependency) for the seed file, Plan 1 client + Plan 2 mappers.

## Global Constraints

- Backend root: `/home/sugandhan/Desktop/Repos/MeraDhan/backend`. Prisma client: `import { db } from "@core/database/database"` → `db.dataBase`. Enums/types: `DataBaseSchema.$Enums.DeridataEndpoint` / `DeridataTaskStatus`.
- Logger: `import logger from "@utils/logger/logger"` → `logger.logInfo(msg, {})`, `logger.logError(msg, err)`. Email: `import { EmailCommunication } from "@communication/email_communication"`.
- Cron pattern: self-register with `cron.schedule(expr, cb, { timezone: "Asia/Kolkata" })` at module import, then add the import to `src/jobs/start.ts`. Skip work when not configured (mirror `bond_reference_schedules.cron.ts`).
- The core engine MUST be pure of DB/network — all I/O behind the `DeridataStore` / `DeridataClientLike` interfaces so it is unit-testable with fakes. No `Date.now()` inside the loop — accept `now: Date`.
- Daily budget is tracked in the `deridata_sync_state` singleton (id=1). Budget day = **IST calendar day** (`YYYY-MM-DD`). Reset `callsUsedToday` to 0 when `budgetDate` changes.
- **Every call made counts** against the budget (including 404/403 — the request reached the server). `403 Limit expired` → stop the run, leave the task PENDING. `404` → terminal `NOT_FOUND`, no retry, and (if `ISSUE_DETAIL`) create no child tasks. `401/5xx/network` → retry with backoff until `MAX_ATTEMPTS`, then `FAILED`.
- **Gating:** seed creates only the `ISSUE_DETAIL` task per ISIN. On `ISSUE_DETAIL` success, create the 5 child tasks (`CALCULATOR`, `EBP`, `SECONDARY_TRADES`, `SECURITY_COVENANT`, `DOCUMENTS`). On `ISSUE_DETAIL` 404, create none.
- **Priority:** order pending tasks by `priority asc, id asc`. Seed `ISSUE_DETAIL` priority = registry `priority` (default 100; lower = sooner, for active ISINs). Child priority = `1000 + endpointIndex` so all issue-details run before any child.
- **CALCULATOR default snapshot:** Price-to-Yield at par — `{ value_date: <IST today>, amount: 100, yield_to_price: false, selected_yield: "ytm", clean_price: 100, cashflow_shut_flag: false }`. This yields the XIRR + full cashflow schedule (the durable artifact). Documented as a revisitable default.
- Inter-call delay: 100ms (match the AbsoluteData cron) — injectable as `delayMs` (0 in tests).
- Persistence is idempotent per ISIN: `ISSUE_DETAIL`/`SECONDARY_TRADES`/`SECURITY_COVENANT`/`DOCUMENTS` upsert by `isin`; `CALCULATOR`/`EBP` replace prior rows for the ISIN (delete-then-insert) so re-runs don't accumulate. Child rows (cashflows, history, press releases) are created with the parent.
- Do NOT commit unless the user authorizes it. Do NOT run a real migration here (Plan 2's tables already exist locally).

---

### Task 1: Budget helpers (pure)

**Files:**
- Create: `backend/src/modules/deridata/ingest/deridata.budget.ts`
- Test: `backend/src/modules/deridata/ingest/deridata.budget.test.ts`

**Interfaces:**
- Produces:
  - `istDayString(d: Date): string` — `YYYY-MM-DD` for the IST calendar day of `d`.
  - `type BudgetState = { callsUsedToday: number; budgetDate: string | null }`.
  - `applyDailyReset(state: BudgetState, now: Date): BudgetState` — returns a state whose `budgetDate` = `istDayString(now)`, resetting `callsUsedToday` to 0 if the day changed.
  - `remainingBudget(state: BudgetState, limit: number): number` — `max(0, limit - callsUsedToday)`.
  - `budgetExhausted(state: BudgetState, limit: number): boolean`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/modules/deridata/ingest/deridata.budget.test.ts
import { describe, it, expect } from "bun:test";
import { istDayString, applyDailyReset, remainingBudget, budgetExhausted } from "./deridata.budget";

describe("istDayString", () => {
  it("returns the IST calendar day", () => {
    // 2026-06-29T20:00:00Z is 2026-06-30 01:30 IST
    expect(istDayString(new Date("2026-06-29T20:00:00Z"))).toBe("2026-06-30");
    expect(istDayString(new Date("2026-06-29T10:00:00Z"))).toBe("2026-06-29");
  });
});

describe("applyDailyReset", () => {
  it("resets count when the IST day changes", () => {
    const now = new Date("2026-06-30T05:00:00Z"); // 2026-06-30 IST
    const out = applyDailyReset({ callsUsedToday: 9999, budgetDate: "2026-06-29" }, now);
    expect(out.budgetDate).toBe("2026-06-30");
    expect(out.callsUsedToday).toBe(0);
  });
  it("keeps count on the same day", () => {
    const now = new Date("2026-06-30T05:00:00Z");
    const out = applyDailyReset({ callsUsedToday: 50, budgetDate: "2026-06-30" }, now);
    expect(out.callsUsedToday).toBe(50);
  });
});

describe("remainingBudget / budgetExhausted", () => {
  it("computes remaining and exhaustion", () => {
    expect(remainingBudget({ callsUsedToday: 90, budgetDate: "x" }, 100)).toBe(10);
    expect(remainingBudget({ callsUsedToday: 120, budgetDate: "x" }, 100)).toBe(0);
    expect(budgetExhausted({ callsUsedToday: 100, budgetDate: "x" }, 100)).toBe(true);
    expect(budgetExhausted({ callsUsedToday: 99, budgetDate: "x" }, 100)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/ingest/deridata.budget.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/modules/deridata/ingest/deridata.budget.ts
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export type BudgetState = { callsUsedToday: number; budgetDate: string | null };

/** IST calendar day (YYYY-MM-DD) for the given instant. */
export function istDayString(d: Date): string {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

/** Reset the daily counter when the IST day rolls over. */
export function applyDailyReset(state: BudgetState, now: Date): BudgetState {
  const today = istDayString(now);
  if (state.budgetDate === today) return { ...state };
  return { callsUsedToday: 0, budgetDate: today };
}

export function remainingBudget(state: BudgetState, limit: number): number {
  return Math.max(0, limit - state.callsUsedToday);
}

export function budgetExhausted(state: BudgetState, limit: number): boolean {
  return state.callsUsedToday >= limit;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/ingest/deridata.budget.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Stage (commit only if authorized)**

```bash
git add backend/src/modules/deridata/ingest/deridata.budget.ts backend/src/modules/deridata/ingest/deridata.budget.test.ts
git commit -m "feat(deridata): daily budget helpers"
```

---

### Task 2: Task policy (pure) — ordering, gating, outcome, backoff

**Files:**
- Create: `backend/src/modules/deridata/ingest/deridata.task-policy.ts`
- Test: `backend/src/modules/deridata/ingest/deridata.task-policy.test.ts`

**Interfaces:**
- Consumes: `DeridataResult` (Plan 1 `deridata.types`).
- Produces:
  - `ENDPOINT_ORDER: $Enums.DeridataEndpoint[]` = `["ISSUE_DETAIL","CALCULATOR","EBP","SECONDARY_TRADES","SECURITY_COVENANT","DOCUMENTS"]`.
  - `CHILD_ENDPOINTS = ENDPOINT_ORDER.slice(1)`.
  - `endpointIndex(e): number`.
  - `childTaskPriority(e): number` = `1000 + endpointIndex(e)`.
  - `MAX_ATTEMPTS = 5`.
  - `backoffMs(attempts: number): number` — exponential, capped (e.g. `min(60_000 * 2^(attempts-1), 6h)`).
  - `type Outcome = { kind: "done" | "not_found" | "stop" | "retry" | "failed" }`.
  - `decideOutcome(result: DeridataResult<unknown>, attempts: number): Outcome`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/modules/deridata/ingest/deridata.task-policy.test.ts
import { describe, it, expect } from "bun:test";
import {
  ENDPOINT_ORDER, CHILD_ENDPOINTS, endpointIndex, childTaskPriority,
  backoffMs, decideOutcome, MAX_ATTEMPTS,
} from "./deridata.task-policy";

describe("ordering", () => {
  it("puts ISSUE_DETAIL first and lists 5 children", () => {
    expect(ENDPOINT_ORDER[0]).toBe("ISSUE_DETAIL");
    expect(CHILD_ENDPOINTS).toHaveLength(5);
    expect(CHILD_ENDPOINTS).not.toContain("ISSUE_DETAIL");
    expect(childTaskPriority("CALCULATOR")).toBeLessThan(childTaskPriority("DOCUMENTS"));
    expect(endpointIndex("ISSUE_DETAIL")).toBe(0);
  });
});

describe("backoffMs", () => {
  it("grows with attempts and is capped", () => {
    expect(backoffMs(1)).toBeGreaterThan(0);
    expect(backoffMs(2)).toBeGreaterThan(backoffMs(1));
    expect(backoffMs(50)).toBeLessThanOrEqual(6 * 60 * 60 * 1000);
  });
});

describe("decideOutcome", () => {
  it("ok -> done", () => {
    expect(decideOutcome({ ok: true, data: {} }, 0).kind).toBe("done");
  });
  it("NOT_FOUND -> not_found (terminal)", () => {
    expect(decideOutcome({ ok: false, error: "x", code: "NOT_FOUND" }, 0).kind).toBe("not_found");
  });
  it("LIMIT_EXPIRED -> stop", () => {
    expect(decideOutcome({ ok: false, error: "x", code: "LIMIT_EXPIRED" }, 0).kind).toBe("stop");
  });
  it("transient error retries until MAX_ATTEMPTS then fails", () => {
    expect(decideOutcome({ ok: false, error: "x", code: "SERVER_ERROR" }, 0).kind).toBe("retry");
    expect(decideOutcome({ ok: false, error: "x", code: "SERVER_ERROR" }, MAX_ATTEMPTS - 1).kind).toBe("failed");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/ingest/deridata.task-policy.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/modules/deridata/ingest/deridata.task-policy.ts
import { type DataBaseSchema } from "@core/database/database";
import type { DeridataResult } from "../deridata.types";

type Endpoint = DataBaseSchema.$Enums.DeridataEndpoint;

export const ENDPOINT_ORDER: Endpoint[] = [
  "ISSUE_DETAIL", "CALCULATOR", "EBP", "SECONDARY_TRADES", "SECURITY_COVENANT", "DOCUMENTS",
];

export const CHILD_ENDPOINTS: Endpoint[] = ENDPOINT_ORDER.slice(1);

export function endpointIndex(e: Endpoint): number {
  const i = ENDPOINT_ORDER.indexOf(e);
  return i < 0 ? 999 : i;
}

/** Child tasks sort after all issue-details (which use registry priority <= 100). */
export function childTaskPriority(e: Endpoint): number {
  return 1000 + endpointIndex(e);
}

export const MAX_ATTEMPTS = 5;

/** Exponential backoff in ms, capped at 6 hours. */
export function backoffMs(attempts: number): number {
  const base = 60_000 * Math.pow(2, Math.max(0, attempts - 1));
  return Math.min(base, 6 * 60 * 60 * 1000);
}

export type Outcome = { kind: "done" | "not_found" | "stop" | "retry" | "failed" };

export function decideOutcome(result: DeridataResult<unknown>, attempts: number): Outcome {
  if (result.ok) return { kind: "done" };
  if (result.code === "NOT_FOUND") return { kind: "not_found" };
  if (result.code === "LIMIT_EXPIRED") return { kind: "stop" };
  return attempts + 1 >= MAX_ATTEMPTS ? { kind: "failed" } : { kind: "retry" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/ingest/deridata.task-policy.test.ts`
Expected: PASS (4 describe blocks).

- [ ] **Step 5: Stage (commit only if authorized)**

```bash
git add backend/src/modules/deridata/ingest/deridata.task-policy.ts backend/src/modules/deridata/ingest/deridata.task-policy.test.ts
git commit -m "feat(deridata): task policy (ordering, gating, outcomes, backoff)"
```

---

### Task 3: Sync engine core (injectable store + client)

**Files:**
- Create: `backend/src/modules/deridata/ingest/deridata.worker.ts`
- Test: `backend/src/modules/deridata/ingest/deridata.worker.test.ts`

**Interfaces:**
- Consumes: Task 1 budget helpers, Task 2 policy, Plan 1 `DeridataResult`.
- Produces:
  - `interface SyncTaskLite { id: number; isin: string; endpoint: $Enums.DeridataEndpoint; attempts: number }`.
  - `interface DeridataClientLike` — 6 methods returning `Promise<DeridataResult<unknown>>` (`getIssueDetail/getEbp/getSecondaryTrades/getSecurityCovenant/getDocuments` take `isin`; `calculate` takes the input object).
  - `interface DeridataStore` — `loadState()`, `saveState(BudgetState)`, `nextPendingBatch(limit, now)`, `markInProgress(id)`, `persistResult(endpoint, isin, data, now)`, `markDone(id, now)`, `createChildTasks(isin)`, `markNotFound(id, now)`, `scheduleRetry(id, err, code, nextRunAfter)`, `markFailed(id, err, code)`, `resetPending(id)`.
  - `type SyncSummary = { processed; done; notFound; failed; retried; stoppedOnLimit; budgetRemaining }`.
  - `runDeridataSync(opts: { client; store; limit; batchSize?; now?; delayMs?; calcValueDate? }): Promise<SyncSummary>`.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/modules/deridata/ingest/deridata.worker.test.ts
import { describe, it, expect } from "bun:test";
import { runDeridataSync, type DeridataStore, type SyncTaskLite, type DeridataClientLike } from "./deridata.worker";
import type { BudgetState } from "./deridata.budget";
import type { DeridataResult } from "../deridata.types";

// In-memory fake store backed by a mutable task list.
function makeStore(tasks: SyncTaskLite[]) {
  let state: BudgetState = { callsUsedToday: 0, budgetDate: null };
  const status = new Map<number, string>(tasks.map((t) => [t.id, "PENDING"]));
  const persisted: Array<{ endpoint: string; isin: string }> = [];
  const childrenCreatedFor: string[] = [];
  let nextId = 100;
  const store: DeridataStore = {
    async loadState() { return state; },
    async saveState(s) { state = s; },
    async nextPendingBatch(limit) {
      return tasks.filter((t) => status.get(t.id) === "PENDING").slice(0, limit);
    },
    async markInProgress(id) { status.set(id, "IN_PROGRESS"); },
    async persistResult(endpoint, isin) { persisted.push({ endpoint, isin }); },
    async markDone(id) { status.set(id, "DONE"); },
    async createChildTasks(isin) {
      childrenCreatedFor.push(isin);
      for (const ep of ["CALCULATOR", "EBP", "SECONDARY_TRADES", "SECURITY_COVENANT", "DOCUMENTS"] as const) {
        const t = { id: nextId++, isin, endpoint: ep, attempts: 0 } as SyncTaskLite;
        tasks.push(t); status.set(t.id, "PENDING");
      }
    },
    async markNotFound(id) { status.set(id, "NOT_FOUND"); },
    async scheduleRetry(id) { status.set(id, "PENDING"); },
    async markFailed(id) { status.set(id, "FAILED"); },
    async resetPending(id) { status.set(id, "PENDING"); },
  };
  return { store, status, persisted, childrenCreatedFor, getState: () => state };
}

const okResult: DeridataResult<unknown> = { ok: true, data: { isin: "X" } };
function client(overrides: Partial<DeridataClientLike> = {}): DeridataClientLike {
  const ok = async () => okResult;
  return {
    getIssueDetail: ok, calculate: ok, getEbp: ok, getSecondaryTrades: ok,
    getSecurityCovenant: ok, getDocuments: ok, ...overrides,
  };
}

describe("runDeridataSync", () => {
  it("ISSUE_DETAIL success creates 5 children and persists", async () => {
    const tasks: SyncTaskLite[] = [{ id: 1, isin: "INE1", endpoint: "ISSUE_DETAIL", attempts: 0 }];
    const f = makeStore(tasks);
    const summary = await runDeridataSync({ client: client(), store: f.store, limit: 100, delayMs: 0, now: new Date("2026-06-30T05:00:00Z") });
    expect(f.childrenCreatedFor).toEqual(["INE1"]);
    expect(f.status.get(1)).toBe("DONE");
    expect(summary.done).toBe(6); // issue-detail + 5 children all ok in one run
    expect(summary.processed).toBe(6);
  });

  it("stops on LIMIT_EXPIRED and leaves the task PENDING", async () => {
    const tasks: SyncTaskLite[] = [
      { id: 1, isin: "INE1", endpoint: "ISSUE_DETAIL", attempts: 0 },
      { id: 2, isin: "INE2", endpoint: "ISSUE_DETAIL", attempts: 0 },
    ];
    const f = makeStore(tasks);
    const limitClient = client({ getIssueDetail: async () => ({ ok: false, error: "Limit expired", code: "LIMIT_EXPIRED" }) });
    const summary = await runDeridataSync({ client: limitClient, store: f.store, limit: 100, delayMs: 0, now: new Date("2026-06-30T05:00:00Z") });
    expect(summary.stoppedOnLimit).toBe(true);
    expect(f.status.get(1)).toBe("PENDING");
    expect(f.status.get(2)).toBe("PENDING");
  });

  it("ISSUE_DETAIL 404 is terminal and creates no children", async () => {
    const tasks: SyncTaskLite[] = [{ id: 1, isin: "INE1", endpoint: "ISSUE_DETAIL", attempts: 0 }];
    const f = makeStore(tasks);
    const nf = client({ getIssueDetail: async () => ({ ok: false, error: "No record", code: "NOT_FOUND" }) });
    const summary = await runDeridataSync({ client: nf, store: f.store, limit: 100, delayMs: 0, now: new Date("2026-06-30T05:00:00Z") });
    expect(f.status.get(1)).toBe("NOT_FOUND");
    expect(f.childrenCreatedFor).toEqual([]);
    expect(summary.notFound).toBe(1);
  });

  it("respects the daily budget limit", async () => {
    const tasks: SyncTaskLite[] = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, isin: `INE${i}`, endpoint: "EBP" as const, attempts: 0 }));
    const f = makeStore(tasks);
    const summary = await runDeridataSync({ client: client(), store: f.store, limit: 3, delayMs: 0, now: new Date("2026-06-30T05:00:00Z") });
    expect(summary.processed).toBe(3);
    expect(summary.budgetRemaining).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/ingest/deridata.worker.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/modules/deridata/ingest/deridata.worker.ts
import { type DataBaseSchema } from "@core/database/database";
import type { DeridataResult } from "../deridata.types";
import {
  applyDailyReset, budgetExhausted, remainingBudget, type BudgetState,
} from "./deridata.budget";
import { backoffMs, decideOutcome } from "./deridata.task-policy";

type Endpoint = DataBaseSchema.$Enums.DeridataEndpoint;

export interface SyncTaskLite {
  id: number;
  isin: string;
  endpoint: Endpoint;
  attempts: number;
}

export interface DeridataClientLike {
  getIssueDetail(isin: string): Promise<DeridataResult<unknown>>;
  calculate(input: {
    isin: string; value_date: string; amount: number; yield_to_price: boolean;
    selected_yield: "ytm" | "ytc" | "ytp"; clean_price?: number | null; cashflow_shut_flag: boolean;
  }): Promise<DeridataResult<unknown>>;
  getEbp(isin: string): Promise<DeridataResult<unknown>>;
  getSecondaryTrades(isin: string): Promise<DeridataResult<unknown>>;
  getSecurityCovenant(isin: string): Promise<DeridataResult<unknown>>;
  getDocuments(isin: string): Promise<DeridataResult<unknown>>;
}

export interface DeridataStore {
  loadState(): Promise<BudgetState>;
  saveState(state: BudgetState): Promise<void>;
  nextPendingBatch(limit: number, now: Date): Promise<SyncTaskLite[]>;
  markInProgress(id: number): Promise<void>;
  persistResult(endpoint: Endpoint, isin: string, data: unknown, now: Date): Promise<void>;
  markDone(id: number, now: Date): Promise<void>;
  createChildTasks(isin: string): Promise<void>;
  markNotFound(id: number, now: Date): Promise<void>;
  scheduleRetry(id: number, err: string, code: string | undefined, nextRunAfter: Date): Promise<void>;
  markFailed(id: number, err: string, code: string | undefined): Promise<void>;
  resetPending(id: number): Promise<void>;
}

export type SyncSummary = {
  processed: number;
  done: number;
  notFound: number;
  failed: number;
  retried: number;
  stoppedOnLimit: boolean;
  budgetRemaining: number;
};

function callEndpoint(
  client: DeridataClientLike,
  task: SyncTaskLite,
  calcValueDate: string,
): Promise<DeridataResult<unknown>> {
  switch (task.endpoint) {
    case "ISSUE_DETAIL": return client.getIssueDetail(task.isin);
    case "CALCULATOR":
      return client.calculate({
        isin: task.isin, value_date: calcValueDate, amount: 100,
        yield_to_price: false, selected_yield: "ytm", clean_price: 100, cashflow_shut_flag: false,
      });
    case "EBP": return client.getEbp(task.isin);
    case "SECONDARY_TRADES": return client.getSecondaryTrades(task.isin);
    case "SECURITY_COVENANT": return client.getSecurityCovenant(task.isin);
    case "DOCUMENTS": return client.getDocuments(task.isin);
    default: return Promise.resolve({ ok: false, error: `unknown endpoint ${task.endpoint}`, code: "UNKNOWN" });
  }
}

const sleep = (ms: number) => (ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());

export async function runDeridataSync(opts: {
  client: DeridataClientLike;
  store: DeridataStore;
  limit: number;
  batchSize?: number;
  now?: Date;
  delayMs?: number;
  calcValueDate?: string;
}): Promise<SyncSummary> {
  const { client, store, limit } = opts;
  const now = opts.now ?? new Date();
  const batchSize = opts.batchSize ?? 200;
  const delayMs = opts.delayMs ?? 100;
  const calcValueDate = opts.calcValueDate ?? new Date(now.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

  let state = applyDailyReset(await store.loadState(), now);
  await store.saveState(state);

  const summary: SyncSummary = {
    processed: 0, done: 0, notFound: 0, failed: 0, retried: 0,
    stoppedOnLimit: false, budgetRemaining: remainingBudget(state, limit),
  };

  let stop = false;
  while (!stop && !budgetExhausted(state, limit)) {
    const take = Math.min(batchSize, remainingBudget(state, limit));
    const batch = await store.nextPendingBatch(take, now);
    if (batch.length === 0) break;

    for (const task of batch) {
      if (budgetExhausted(state, limit)) { stop = true; break; }
      await store.markInProgress(task.id);

      const result = await callEndpoint(client, task, calcValueDate);
      state = { ...state, callsUsedToday: state.callsUsedToday + 1 };
      summary.processed++;

      const outcome = decideOutcome(result, task.attempts);
      if (outcome.kind === "stop") {
        await store.resetPending(task.id);
        summary.stoppedOnLimit = true;
        stop = true;
        break;
      } else if (outcome.kind === "done" && result.ok) {
        await store.persistResult(task.endpoint, task.isin, result.data, now);
        await store.markDone(task.id, now);
        summary.done++;
        if (task.endpoint === "ISSUE_DETAIL") await store.createChildTasks(task.isin);
      } else if (outcome.kind === "not_found") {
        await store.markNotFound(task.id, now);
        summary.notFound++;
      } else if (outcome.kind === "retry" && !result.ok) {
        await store.scheduleRetry(task.id, result.error, result.code, new Date(now.getTime() + backoffMs(task.attempts + 1)));
        summary.retried++;
      } else if (!result.ok) {
        await store.markFailed(task.id, result.error, result.code);
        summary.failed++;
      }

      await sleep(delayMs);
    }
    await store.saveState(state);
  }

  await store.saveState(state);
  summary.budgetRemaining = remainingBudget(state, limit);
  return summary;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/ingest/deridata.worker.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Stage (commit only if authorized)**

```bash
git add backend/src/modules/deridata/ingest/deridata.worker.ts backend/src/modules/deridata/ingest/deridata.worker.test.ts
git commit -m "feat(deridata): resumable sync engine core (budget, gating, resume)"
```

---

### Task 4: Prisma store adapter (persistence + task ops)

**Files:**
- Create: `backend/src/modules/deridata/ingest/deridata.prisma-store.ts`

**Interfaces:**
- Consumes: `DeridataStore`/`SyncTaskLite` (Task 3), Plan 2 mappers, `childTaskPriority`/`CHILD_ENDPOINTS` (Task 2), `db.dataBase`.
- Produces: `class PrismaDeridataStore implements DeridataStore`.

Persistence per endpoint (idempotent): `ISSUE_DETAIL` → upsert `deridataIssueDetail` by isin; `CALCULATOR` → delete prior rows for isin then create with nested cashflows; `EBP` → delete prior then createMany; `SECONDARY_TRADES` → delete prior then create with nested history; `SECURITY_COVENANT` → upsert by isin; `DOCUMENTS` → delete prior then create with nested press releases. `ISSUE_DETAIL` also writes the `bonds` row via `mapIssueDetailToBonds` only when `env.USE_DERIDATA_AS_CATALOG` (kept in Plan 4; here just persist the deridata table — leave a TODO-free comment that catalog write is wired in Plan 4).

- [ ] **Step 1: Write the implementation**

```ts
// backend/src/modules/deridata/ingest/deridata.prisma-store.ts
import { db, type DataBaseSchema } from "@core/database/database";
import type { BudgetState } from "./deridata.budget";
import type { DeridataStore, SyncTaskLite } from "./deridata.worker";
import { CHILD_ENDPOINTS, childTaskPriority } from "./deridata.task-policy";
import { mapIssueDetailToRow } from "../deridata.issue-detail.mapper";
import {
  mapCalculator, mapEbp, mapSecondaryTrades, mapSecurityCovenant, mapDocuments,
} from "../deridata.mappers";
import type {
  IssueDetail, CalculatorResponse, EbpResponse, SecondaryTradesResponse,
  SecurityCovenant, DocumentsResponse,
} from "../deridata.api";

type Endpoint = DataBaseSchema.$Enums.DeridataEndpoint;
const prisma = db.dataBase;
const STATE_ID = 1;

export class PrismaDeridataStore implements DeridataStore {
  async loadState(): Promise<BudgetState> {
    const row = await prisma.deridataSyncState.upsert({
      where: { id: STATE_ID },
      create: { id: STATE_ID, callsUsedToday: 0, budgetDate: null },
      update: {},
    });
    return { callsUsedToday: row.callsUsedToday, budgetDate: row.budgetDate };
  }

  async saveState(state: BudgetState): Promise<void> {
    await prisma.deridataSyncState.update({
      where: { id: STATE_ID },
      data: { callsUsedToday: state.callsUsedToday, budgetDate: state.budgetDate, lastResetAt: new Date() },
    });
  }

  async nextPendingBatch(limit: number, now: Date): Promise<SyncTaskLite[]> {
    if (limit <= 0) return [];
    const rows = await prisma.deridataSyncTask.findMany({
      where: { status: "PENDING", OR: [{ nextRunAfter: null }, { nextRunAfter: { lte: now } }] },
      orderBy: [{ priority: "asc" }, { id: "asc" }],
      take: limit,
      select: { id: true, isin: true, endpoint: true, attempts: true },
    });
    return rows;
  }

  async markInProgress(id: number): Promise<void> {
    await prisma.deridataSyncTask.update({ where: { id }, data: { status: "IN_PROGRESS" } });
  }

  async markDone(id: number, now: Date): Promise<void> {
    await prisma.deridataSyncTask.update({ where: { id }, data: { status: "DONE", fetchedAt: now, lastError: null } });
  }

  async markNotFound(id: number, now: Date): Promise<void> {
    await prisma.deridataSyncTask.update({ where: { id }, data: { status: "NOT_FOUND", fetchedAt: now } });
  }

  async scheduleRetry(id: number, err: string, code: string | undefined, nextRunAfter: Date): Promise<void> {
    await prisma.deridataSyncTask.update({
      where: { id },
      data: { status: "PENDING", attempts: { increment: 1 }, lastError: err.slice(0, 500), lastStatusCode: codeToStatus(code), nextRunAfter },
    });
  }

  async markFailed(id: number, err: string, code: string | undefined): Promise<void> {
    await prisma.deridataSyncTask.update({
      where: { id },
      data: { status: "FAILED", attempts: { increment: 1 }, lastError: err.slice(0, 500), lastStatusCode: codeToStatus(code) },
    });
  }

  async resetPending(id: number): Promise<void> {
    await prisma.deridataSyncTask.update({ where: { id }, data: { status: "PENDING" } });
  }

  async createChildTasks(isin: string): Promise<void> {
    await prisma.deridataSyncTask.createMany({
      data: CHILD_ENDPOINTS.map((endpoint) => ({ isin, endpoint, priority: childTaskPriority(endpoint) })),
      skipDuplicates: true,
    });
  }

  async persistResult(endpoint: Endpoint, isin: string, data: unknown, now: Date): Promise<void> {
    switch (endpoint) {
      case "ISSUE_DETAIL": {
        const row = mapIssueDetailToRow(data as IssueDetail);
        await prisma.deridataIssueDetail.upsert({ where: { isin }, create: row, update: { ...row, isin: undefined } as never });
        // NOTE: catalog write to `bonds` (mapIssueDetailToBonds) is wired in Plan 4 behind USE_DERIDATA_AS_CATALOG.
        break;
      }
      case "CALCULATOR": {
        const { row, cashflows } = mapCalculator(isin, { valueDate: row_valueDate(now), mode: "price_to_yield", selectedYield: "ytm", inputPrice: 100 }, data as CalculatorResponse);
        await prisma.$transaction([
          prisma.deridataCalculator.deleteMany({ where: { isin } }),
          prisma.deridataCalculator.create({ data: { ...row, cashflows: { create: cashflows } } }),
        ]);
        break;
      }
      case "EBP": {
        const rows = mapEbp(data as EbpResponse);
        await prisma.$transaction([
          prisma.deridataEbpItem.deleteMany({ where: { isin } }),
          ...(rows.length ? [prisma.deridataEbpItem.createMany({ data: rows })] : []),
        ]);
        break;
      }
      case "SECONDARY_TRADES": {
        const { row, history } = mapSecondaryTrades(data as SecondaryTradesResponse);
        await prisma.$transaction([
          prisma.deridataSecondaryTrade.deleteMany({ where: { isin } }),
          prisma.deridataSecondaryTrade.create({ data: { ...row, history: { create: history } } }),
        ]);
        break;
      }
      case "SECURITY_COVENANT": {
        const row = mapSecurityCovenant(data as SecurityCovenant);
        await prisma.deridataSecurityCovenant.upsert({ where: { isin }, create: row, update: { ...row, isin: undefined } as never });
        break;
      }
      case "DOCUMENTS": {
        const { row, pressReleases } = mapDocuments(data as DocumentsResponse);
        await prisma.$transaction([
          prisma.deridataDocument.deleteMany({ where: { isin } }),
          prisma.deridataDocument.create({ data: { ...row, pressReleases: { create: pressReleases } } }),
        ]);
        break;
      }
    }
  }
}

function codeToStatus(code: string | undefined): number | undefined {
  switch (code) {
    case "BAD_REQUEST": return 400;
    case "INVALID_CHECKSUM":
    case "INVALID_MERCHANT": return 401;
    case "LIMIT_EXPIRED": return 403;
    case "NOT_FOUND": return 404;
    case "SERVER_ERROR": return 500;
    default: return undefined;
  }
}

function row_valueDate(now: Date): string {
  return new Date(now.getTime() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);
}
```

- [ ] **Step 2: Type-check against generated Prisma types**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && npx tsc --noEmit 2>&1 | grep -i deridata`
Expected: no Deridata errors. (If `upsert update` complains about `isin: undefined`, replace with an explicit field list omitting `isin`.)

- [ ] **Step 3: Stage (commit only if authorized)**

```bash
git add backend/src/modules/deridata/ingest/deridata.prisma-store.ts
git commit -m "feat(deridata): Prisma store adapter (idempotent persistence + task ops)"
```

---

### Task 5: Seed import + import script

**Files:**
- Create: `backend/src/modules/deridata/ingest/deridata.seed.ts`
- Create: `backend/scripts/deridata-import-isins.ts`
- Test: `backend/src/modules/deridata/ingest/deridata.seed.test.ts`

**Interfaces:**
- Produces:
  - `extractIsinsFromRows(rows: Record<string, unknown>[]): string[]` — pull + normalize the ISIN column from parsed sheet rows (accept header variants `isin`/`ISIN`/`Isin`); dedupe; validate length 12.
  - `seedIsins(isins: string[], sourceBatch: string): Promise<{ registered: number; tasksCreated: number }>` — upsert `deridataIsinRegistry`, create one `ISSUE_DETAIL` task per ISIN (priority from registry default), `skipDuplicates`.
- Script `deridata-import-isins.ts`: parse an `.xlsx`/`.csv` via `xlsx`, call `extractIsinsFromRows` + `seedIsins`, print counts.

- [ ] **Step 1: Write the failing test (pure extractor only)**

```ts
// backend/src/modules/deridata/ingest/deridata.seed.test.ts
import { describe, it, expect } from "bun:test";
import { extractIsinsFromRows } from "./deridata.seed";

describe("extractIsinsFromRows", () => {
  it("pulls, uppercases, dedupes, validates 12-char ISINs across header variants", () => {
    const rows = [
      { ISIN: "ine2otq07077" },
      { isin: "INE2OTQ07077" }, // dup
      { Isin: "INE467V07966" },
      { ISIN: "" },             // skip
      { ISIN: "BADISIN" },      // skip (not 12 chars)
      { other: "x" },           // skip (no isin col)
    ];
    expect(extractIsinsFromRows(rows)).toEqual(["INE2OTQ07077", "INE467V07966"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/ingest/deridata.seed.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write `deridata.seed.ts`**

```ts
// backend/src/modules/deridata/ingest/deridata.seed.ts
import { db } from "@core/database/database";

const prisma = db.dataBase;

/** Pull the ISIN column (any case) from parsed rows; normalize, validate (12 chars), dedupe. */
export function extractIsinsFromRows(rows: Record<string, unknown>[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of rows) {
    const key = Object.keys(row).find((k) => k.trim().toLowerCase() === "isin");
    if (!key) continue;
    const v = String(row[key] ?? "").trim().toUpperCase();
    if (v.length !== 12) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

/** Upsert ISINs into the registry and create one ISSUE_DETAIL task each (gating entry point). */
export async function seedIsins(
  isins: string[],
  sourceBatch: string,
): Promise<{ registered: number; tasksCreated: number }> {
  let registered = 0;
  for (const isin of isins) {
    await prisma.deridataIsinRegistry.upsert({
      where: { isin },
      create: { isin, sourceBatch },
      update: { sourceBatch, isActive: true },
    });
    registered++;
  }
  const created = await prisma.deridataSyncTask.createMany({
    data: isins.map((isin) => ({ isin, endpoint: "ISSUE_DETAIL" as const, priority: 100 })),
    skipDuplicates: true,
  });
  return { registered, tasksCreated: created.count };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/ingest/deridata.seed.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Write the import script**

```ts
// backend/scripts/deridata-import-isins.ts
/**
 * Import a seed ISIN list (Excel/CSV from the AbsoluteData team) into the Deridata
 * registry and create one ISSUE_DETAIL task per ISIN.
 *
 * Run from backend/:  bun run scripts/deridata-import-isins.ts ./isins.xlsx
 */
import * as XLSX from "xlsx";
import { extractIsinsFromRows, seedIsins } from "@modules/deridata/ingest/deridata.seed";

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: bun run scripts/deridata-import-isins.ts <path-to.xlsx|csv>");
    process.exit(1);
  }
  const wb = XLSX.readFile(file);
  const sheet = wb.Sheets[wb.SheetNames[0]!]!;
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const isins = extractIsinsFromRows(rows);
  console.log(`Parsed ${rows.length} rows → ${isins.length} valid unique ISINs.`);
  if (!isins.length) { console.error("No valid ISINs found. Check the 'ISIN' column header."); process.exit(1); }
  const batch = `import-${file.split("/").pop()}`;
  const res = await seedIsins(isins, batch);
  console.log(`Registered ${res.registered} ISINs; created ${res.tasksCreated} ISSUE_DETAIL tasks.`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 6: Type-check + stage**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && npx tsc --noEmit 2>&1 | grep -i deridata` (expect none).

```bash
git add backend/src/modules/deridata/ingest/deridata.seed.ts backend/src/modules/deridata/ingest/deridata.seed.test.ts backend/scripts/deridata-import-isins.ts
git commit -m "feat(deridata): seed importer + ISIN import script"
```

---

### Task 6: Cron wiring + registration

**Files:**
- Create: `backend/src/jobs/cron/deridata_ingest.cron.ts`
- Modify: `backend/src/jobs/start.ts` (add the import)
- Modify: `backend/package.json` (add `deridata:ingest` one-shot runner)

**Interfaces:**
- Consumes: `runDeridataSync` (Task 3), `PrismaDeridataStore` (Task 4), `deridataApiFromEnv` (Plan 1), `env`, `logger`, `EmailCommunication`.
- Produces: `runDeridataIngest(): Promise<void>` (used by both the cron and the one-shot script) + a registered cron.

- [ ] **Step 1: Write the cron module**

```ts
// backend/src/jobs/cron/deridata_ingest.cron.ts
import cron from "node-cron";
import logger from "@utils/logger/logger";
import { env } from "@packages/config/src/env";
import { deridataApiFromEnv } from "@modules/deridata/deridata.api";
import { PrismaDeridataStore } from "@modules/deridata/ingest/deridata.prisma-store";
import { runDeridataSync } from "@modules/deridata/ingest/deridata.worker";

const TZ_IST = { timezone: "Asia/Kolkata" } as const;

export async function runDeridataIngest(): Promise<void> {
  if (!env.DERIDATA_ENABLED) {
    logger.logInfo("deridata_ingest skipped: DERIDATA_ENABLED is false", {});
    return;
  }
  let client;
  try {
    client = deridataApiFromEnv();
  } catch (e) {
    logger.logError("deridata_ingest: not configured", e);
    return;
  }
  const store = new PrismaDeridataStore();
  logger.logInfo("deridata_ingest started", { limit: env.DERIDATA_DAILY_CALL_LIMIT });
  const summary = await runDeridataSync({
    client,
    store,
    limit: env.DERIDATA_DAILY_CALL_LIMIT,
    now: new Date(),
  });
  logger.logInfo("deridata_ingest completed", summary as unknown as Record<string, unknown>);
}

// Run hourly during backfill so the daily budget is consumed steadily and resumes
// promptly after the IST midnight reset. Safe to run often — it no-ops when the
// budget is spent or the queue is empty.
cron.schedule(
  "0 * * * *",
  () => {
    runDeridataIngest().catch((err) => logger.logError("deridata_ingest cron top-level error", err));
  },
  TZ_IST,
);
```

- [ ] **Step 2: Register in `start.ts`**

Add after the `bond_reference_schedules` import (line 6):

```ts
import "./cron/deridata_ingest.cron";
```

- [ ] **Step 3: Add a one-shot runner to `package.json`**

In the `scripts` block, after `deridata:smoke`:

```json
    "deridata:ingest": "bun run -e 'import(\"./src/jobs/cron/deridata_ingest.cron\").then(m => m.runDeridataIngest())'",
```

(If the inline `-e` form is awkward in this repo, instead create `backend/scripts/deridata-ingest-once.ts` that imports and calls `runDeridataIngest()`, and point the script at it.)

- [ ] **Step 4: Type-check the whole module + cron**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && npx tsc --noEmit 2>&1 | grep -iE "deridata|start.ts"`
Expected: no Deridata/start.ts errors.

- [ ] **Step 5: Full module test run**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun run test:deridata`
Expected: all deridata tests (Plans 1–3) PASS.

- [ ] **Step 6: Stage (commit only if authorized)**

```bash
git add backend/src/jobs/cron/deridata_ingest.cron.ts backend/src/jobs/start.ts backend/package.json
git commit -m "feat(deridata): hourly ingest cron + one-shot runner"
```

---

## Manual verification (after merge, with DB + creds)

1. **Seed:** `cd backend && bun run scripts/deridata-import-isins.ts ./isins.xlsx` → registry + ISSUE_DETAIL tasks created. Verify: `psql "$DATABASE_URL" -c "select status, count(*) from deridata_sync_tasks group by 1"`.
2. **One pass (UAT, small limit):** set `DERIDATA_DAILY_CALL_LIMIT=20`, `DERIDATA_ENABLED=true`, then run the one-shot ingest. Verify rows appear in `deridata_issue_detail` and children get created for found ISINs.
3. **Resume:** run again — confirms NOT_FOUND ISINs aren't retried and DONE tasks are skipped; budget resets next IST day.
4. **Limit behavior:** with a tiny limit, confirm the run stops at the budget and leaves the next task PENDING.

---

## Self-Review (completed)

- **Spec coverage (Plan 3 scope):** seed import (§6.1) — Task 5. ISSUE_DETAIL gating + coverage guard (§6.1a) — Tasks 2–4 (policy decides, worker calls `createChildTasks` only on issue-detail success, store creates 5 children). Worker loop + budget reset + 403 stop + 404 terminal + retry/backoff + resume (§6.2) — Tasks 1–3. Priority/phase ordering (§6.3) — Task 2 (`childTaskPriority`) + Task 4 (`orderBy priority,id`). Idempotent persistence per endpoint (Global Constraints) — Task 4. Cron + summary (§6.2) — Task 6. Steady-state refresh (§6.4) is a scheduling concern deferred to ops (re-enqueue query) — noted, not built here.
- **Placeholder scan:** none. The `row_valueDate`/`codeToStatus` helpers are concrete. The one conditional note (inline `-e` vs a tiny runner file) is an environment fallback, not a placeholder.
- **Type consistency:** `DeridataStore`/`SyncTaskLite`/`DeridataClientLike`/`BudgetState`/`SyncSummary` defined in Tasks 1/3 and implemented verbatim in Task 4. `decideOutcome`/`backoffMs`/`childTaskPriority`/`CHILD_ENDPOINTS` from Task 2 used in Tasks 3–4. `runDeridataSync` signature identical across Tasks 3 and 6. Endpoint string-union matches the Prisma `DeridataEndpoint` enum from Plan 2.
- **Known type risk flagged for executor:** Prisma `upsert.update` with `{ ...row, isin: undefined }` may need an explicit field-list omit instead of `isin: undefined`; Task 4 Step 2 calls this out. Also confirm `mapCalculator` is invoked with the same `valueDate` used as the stored snapshot date (Task 4 uses `row_valueDate(now)`).
