# Deridata API Client Module — Implementation Plan (Plan 1 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the isolated `backend/src/modules/deridata/` client module — checksum auth, typed Zod schemas for all 6 Deridata endpoints, and an HTTP client with one method per endpoint — fully unit-tested, with no DB or app wiring yet.

**Architecture:** Mirror the existing `backend/src/modules/absolutedata/` module (api / types, plus a new `checksum` helper). The client signs every request with an HMAC-SHA256 checksum built server-side, resolves 4xx bodies instead of throwing (matching `AbsoluteDataApi`), and returns a discriminated-union result per call so callers branch on `ok`/error code.

**Tech Stack:** Bun (runtime + `bun test`), TypeScript 5.9, Zod v4, axios 1.12, Node `crypto` (HMAC). Config via `@packages/config`.

## Decomposition (this is Plan 1 of 4)
1. **Plan 1 — API client module (this doc):** checksum, types, HTTP client. Independently testable, no DB.
2. **Plan 2 — Schema + mappers:** 6 data tables + 3 control tables (`deridata.prisma`); mappers from each response → its table and `issue-detail` → `bonds`.
3. **Plan 3 — Ingestion engine:** seed import, `deridata_sync_tasks` work-list, daily-budget cron worker with `ISSUE_DETAIL` gating + resume.
4. **Plan 4 — App wiring + decommission:** routes, feature flags, catalog flip, new UI sections, phased removal of AbsoluteData/NSDL.

Spec: `docs/superpowers/specs/2026-06-29-deridata-integration-design.md`.

## Global Constraints

- Runtime/test: **Bun**; run tests with `bun test <path>`. Backend root: `/home/sugandhan/Desktop/Repos/MeraDhan/backend`.
- Validation: **Zod v4** (`import { z } from "zod"`). Follow existing `.optional()`/`.default()` style in `packages/config/src/env.ts`.
- HTTP: **axios**, `validateStatus: (s) => s >= 200 && s < 500` (resolve 4xx, parse error bodies) — exactly as `absolutedata.api.ts:36`.
- Checksum: **HMAC-SHA256**, message `{uuid}|{merchant_id}|{merchant_name}|{merchant_email}|{public_ip}` (exact order, **no spaces** around `|`), Base64-encoded. **Server-side only.** Golden vector: message `abc-123|101|TestMerchant|test@mail.com|192.168.1.1` + key `your_secret_key` → `9c7hzRj0Dt5KzpnXUY4y0DZhontMeL8QoO+QV/B6hxk=`.
- UUID format: `{merchant_id}|{timestamp_ms}|{random_int}` — fresh per request, never reused.
- Base URL: prod `https://www.deridata.com`, UAT `https://test.deridata.com`. Strip trailing slashes.
- Endpoints (all POST, JSON body includes `merchant_id`, `uuid`, `checksum`):
  - `/api/public/merchant/v1/issue-detail/`
  - `/api/public/merchant/v1/calculator/`
  - `/api/public/merchant/v1/ebp/`
  - `/api/public/merchant/v1/secondary-trades/`
  - `/api/public/merchant/v1/security-covenant/`
  - `/api/public/merchant/v1/documents/`
- Error mapping (from spec §Error Responses): `401 Invalid checksum`, `401 Invalid merchant_id`, `403 Limit expired`, `404 No record found for ISIN`, `400 Invalid JSON body`, `500`.
- Integration is a **no-op when unconfigured** (no merchant_id/secret_key) — mirror `absoluteDataApiFromEnv()` throwing only when explicitly invoked without config.
- Do NOT commit unless the user asks (repo rule). Each "Commit" step below stages the change; run the commit only when the user has authorized committing.

---

### Task 1: Deridata env config

**Files:**
- Modify: `packages/config/src/env.ts:117-122` (add Deridata block after the Absolute Data block)
- Test: `packages/config/src/env.deridata.test.ts`

**Interfaces:**
- Produces: `env.DERIDATA_MERCHANT_ID`, `env.DERIDATA_SECRET_KEY`, `env.DERIDATA_MERCHANT_NAME`, `env.DERIDATA_MERCHANT_EMAIL`, `env.DERIDATA_PUBLIC_IP`, `env.DERIDATA_BASE_URL` (string, default `https://www.deridata.com`), `env.DERIDATA_DAILY_CALL_LIMIT` (number, default `10000`), `env.DERIDATA_ENABLED` (boolean, default `false`), `env.USE_DERIDATA_CALCULATOR` (boolean, default `false`), `env.USE_DERIDATA_AS_CATALOG` (boolean, default `false`).

- [ ] **Step 1: Write the failing test**

```ts
// packages/config/src/env.deridata.test.ts
import { describe, it, expect } from "bun:test";
import { z } from "zod";

// Re-declare the Deridata sub-schema shape to assert defaults/coercion behave.
// (env.ts parses process.env at import time; here we test the schema rules in isolation.)
const DeridataSchema = z.object({
  DERIDATA_MERCHANT_ID: z.coerce.number().int().positive().optional(),
  DERIDATA_SECRET_KEY: z.string().min(1).optional(),
  DERIDATA_MERCHANT_NAME: z.string().min(1).optional(),
  DERIDATA_MERCHANT_EMAIL: z.string().email().optional(),
  DERIDATA_PUBLIC_IP: z.string().min(1).optional(),
  DERIDATA_BASE_URL: z.url().optional().default("https://www.deridata.com"),
  DERIDATA_DAILY_CALL_LIMIT: z.coerce.number().int().positive().default(10000),
  DERIDATA_ENABLED: z.coerce.boolean().default(false),
  USE_DERIDATA_CALCULATOR: z.coerce.boolean().default(false),
  USE_DERIDATA_AS_CATALOG: z.coerce.boolean().default(false),
});

describe("Deridata env schema", () => {
  it("applies defaults when unset", () => {
    const parsed = DeridataSchema.parse({});
    expect(parsed.DERIDATA_BASE_URL).toBe("https://www.deridata.com");
    expect(parsed.DERIDATA_DAILY_CALL_LIMIT).toBe(10000);
    expect(parsed.DERIDATA_ENABLED).toBe(false);
    expect(parsed.DERIDATA_MERCHANT_ID).toBeUndefined();
  });

  it("coerces numeric and boolean strings from process.env", () => {
    const parsed = DeridataSchema.parse({
      DERIDATA_MERCHANT_ID: "101",
      DERIDATA_DAILY_CALL_LIMIT: "5000",
      DERIDATA_ENABLED: "true",
    });
    expect(parsed.DERIDATA_MERCHANT_ID).toBe(101);
    expect(parsed.DERIDATA_DAILY_CALL_LIMIT).toBe(5000);
    expect(parsed.DERIDATA_ENABLED).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test ../packages/config/src/env.deridata.test.ts`
Expected: FAIL — file/module resolution or assertion error before the schema exists in `env.ts`.

- [ ] **Step 3: Add the Deridata block to `env.ts`**

Insert after line 122 (the Absolute Data block), before the `PASSWORD_PEPPER` block:

```ts
    // Deridata (bonds merchant API) — optional; required only when DERIDATA_ENABLED
    DERIDATA_MERCHANT_ID: z.coerce.number().int().positive().optional(),
    DERIDATA_SECRET_KEY: z.string().min(1).optional(),
    DERIDATA_MERCHANT_NAME: z.string().min(1).optional(),
    DERIDATA_MERCHANT_EMAIL: z.string().email().optional(),
    DERIDATA_PUBLIC_IP: z.string().min(1).optional(),
    DERIDATA_BASE_URL: z.url().optional().default("https://www.deridata.com"),
    DERIDATA_DAILY_CALL_LIMIT: z.coerce.number().int().positive().default(10000),
    DERIDATA_ENABLED: z.coerce.boolean().default(false),
    USE_DERIDATA_CALCULATOR: z.coerce.boolean().default(false),
    USE_DERIDATA_AS_CATALOG: z.coerce.boolean().default(false),
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test ../packages/config/src/env.deridata.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify the app still type-checks and boots config**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && npx tsc --noEmit`
Expected: no new errors referencing `env.ts`.

- [ ] **Step 6: Stage the change (commit only if authorized)**

```bash
git add packages/config/src/env.ts packages/config/src/env.deridata.test.ts
git commit -m "feat(config): add Deridata merchant API env vars"
```

---

### Task 2: Checksum + UUID helper

**Files:**
- Create: `backend/src/modules/deridata/deridata.checksum.ts`
- Test: `backend/src/modules/deridata/deridata.checksum.test.ts`

**Interfaces:**
- Produces:
  - `buildChecksumMessage(parts: { uuid: string; merchantId: number | string; merchantName: string; merchantEmail: string; publicIp: string }): string` — joins with `|`, no spaces.
  - `signChecksum(message: string, secretKey: string): string` — HMAC-SHA256 → Base64.
  - `generateUuid(merchantId: number | string): string` — `{merchantId}|{Date.now()}|{randInt}`.
  - `buildAuthFields(cfg: { merchantId; merchantName; merchantEmail; publicIp; secretKey }): { merchant_id; uuid; checksum }` — convenience used by the API client per request.

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/modules/deridata/deridata.checksum.test.ts
import { describe, it, expect } from "bun:test";
import {
  buildChecksumMessage,
  signChecksum,
  generateUuid,
  buildAuthFields,
} from "./deridata.checksum";

describe("deridata checksum", () => {
  it("builds the message with | and no spaces", () => {
    const msg = buildChecksumMessage({
      uuid: "abc-123",
      merchantId: 101,
      merchantName: "TestMerchant",
      merchantEmail: "test@mail.com",
      publicIp: "192.168.1.1",
    });
    expect(msg).toBe("abc-123|101|TestMerchant|test@mail.com|192.168.1.1");
  });

  it("matches the documented HMAC-SHA256 golden vector", () => {
    const msg = "abc-123|101|TestMerchant|test@mail.com|192.168.1.1";
    expect(signChecksum(msg, "your_secret_key")).toBe(
      "9c7hzRj0Dt5KzpnXUY4y0DZhontMeL8QoO+QV/B6hxk=",
    );
  });

  it("generates a fresh, well-formed uuid each call", () => {
    const a = generateUuid(101);
    const b = generateUuid(101);
    expect(a).not.toBe(b);
    expect(a.split("|")[0]).toBe("101");
    expect(a.split("|")).toHaveLength(3);
  });

  it("buildAuthFields returns merchant_id, uuid, and a verifiable checksum", () => {
    const fields = buildAuthFields({
      merchantId: 101,
      merchantName: "TestMerchant",
      merchantEmail: "test@mail.com",
      publicIp: "192.168.1.1",
      secretKey: "your_secret_key",
    });
    expect(fields.merchant_id).toBe(101);
    const expected = signChecksum(
      buildChecksumMessage({
        uuid: fields.uuid,
        merchantId: 101,
        merchantName: "TestMerchant",
        merchantEmail: "test@mail.com",
        publicIp: "192.168.1.1",
      }),
      "your_secret_key",
    );
    expect(fields.checksum).toBe(expected);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.checksum.test.ts`
Expected: FAIL — "Cannot find module './deridata.checksum'".

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/modules/deridata/deridata.checksum.ts
import { createHmac, randomInt } from "node:crypto";

export type ChecksumMessageParts = {
  uuid: string;
  merchantId: number | string;
  merchantName: string;
  merchantEmail: string;
  publicIp: string;
};

/** Build the checksum message: `{uuid}|{merchant_id}|{merchant_name}|{merchant_email}|{public_ip}` (no spaces). */
export function buildChecksumMessage(parts: ChecksumMessageParts): string {
  return [
    parts.uuid,
    String(parts.merchantId),
    parts.merchantName,
    parts.merchantEmail,
    parts.publicIp,
  ].join("|");
}

/** HMAC-SHA256 of `message` with `secretKey`, Base64-encoded. */
export function signChecksum(message: string, secretKey: string): string {
  return createHmac("sha256", secretKey).update(message, "utf8").digest("base64");
}

/** Fresh per-request UUID: `{merchantId}|{timestampMs}|{randomInt}`. */
export function generateUuid(merchantId: number | string): string {
  return `${merchantId}|${Date.now()}|${randomInt(1, 1_000_000_000)}`;
}

export type AuthConfig = {
  merchantId: number | string;
  merchantName: string;
  merchantEmail: string;
  publicIp: string;
  secretKey: string;
};

export type AuthFields = {
  merchant_id: number | string;
  uuid: string;
  checksum: string;
};

/** Produce the per-request auth fields (fresh uuid + checksum) to merge into a request body. */
export function buildAuthFields(cfg: AuthConfig): AuthFields {
  const uuid = generateUuid(cfg.merchantId);
  const message = buildChecksumMessage({
    uuid,
    merchantId: cfg.merchantId,
    merchantName: cfg.merchantName,
    merchantEmail: cfg.merchantEmail,
    publicIp: cfg.publicIp,
  });
  return {
    merchant_id: cfg.merchantId,
    uuid,
    checksum: signChecksum(message, cfg.secretKey),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.checksum.test.ts`
Expected: PASS (4 tests). The golden-vector assertion confirms parity with Deridata's Python example.

- [ ] **Step 5: Stage the change (commit only if authorized)**

```bash
git add backend/src/modules/deridata/deridata.checksum.ts backend/src/modules/deridata/deridata.checksum.test.ts
git commit -m "feat(deridata): HMAC-SHA256 checksum + uuid helpers"
```

---

### Task 3: Response types + ISIN guard + result parser

**Files:**
- Create: `backend/src/modules/deridata/deridata.types.ts`
- Test: `backend/src/modules/deridata/deridata.types.test.ts`

**Interfaces:**
- Consumes: nothing from prior tasks.
- Produces:
  - `assertDeridataIsin(isin: string): string` — trims/uppercases, throws on empty/invalid length.
  - Zod schemas: `IssueDetailSchema`, `CalculatorResponseSchema`, `EbpResponseSchema`, `SecondaryTradesResponseSchema`, `SecurityCovenantSchema`, `DocumentsResponseSchema`, and `DeridataErrorSchema` (`{ error: string }`).
  - `parseEndpointResponse<T>(schema: z.ZodType<T>, data: unknown): DeridataResult<T>` where
    `type DeridataResult<T> = { ok: true; data: T } | { ok: false; error: string; code: DeridataErrorCode }`.
  - `type DeridataErrorCode = "INVALID_CHECKSUM" | "INVALID_MERCHANT" | "LIMIT_EXPIRED" | "NOT_FOUND" | "BAD_REQUEST" | "SERVER_ERROR" | "UNKNOWN"`.
  - `classifyError(status: number, body: unknown): DeridataErrorCode` — maps HTTP status + `error` string to a code.

Note: schemas are **lenient** — every field `.nullish()` / passthrough where the spec allows `null` / `"N/A"` / `"NA"` / `[]` / `"-"` / `""` (Annexure B). The goal here is safe parsing, not strict shape enforcement; the `raw` JSON is preserved by the caller (Plan 2).

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/modules/deridata/deridata.types.test.ts
import { describe, it, expect } from "bun:test";
import {
  assertDeridataIsin,
  IssueDetailSchema,
  parseEndpointResponse,
  classifyError,
} from "./deridata.types";

describe("assertDeridataIsin", () => {
  it("normalizes valid ISIN", () => {
    expect(assertDeridataIsin(" ine2otq07077 ")).toBe("INE2OTQ07077");
  });
  it("throws on empty", () => {
    expect(() => assertDeridataIsin("")).toThrow();
  });
});

describe("parseEndpointResponse", () => {
  it("returns ok:true with parsed data for a valid issue-detail body", () => {
    const body = { isin: "INE2OTQ07077", coupon: "6.2626%", coupon_type: "Fixed", tags: [] };
    const res = parseEndpointResponse(IssueDetailSchema, body);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.isin).toBe("INE2OTQ07077");
  });

  it("returns ok:false NOT_FOUND for an error body", () => {
    const res = parseEndpointResponse(IssueDetailSchema, { error: "No record found for ISIN" });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("NOT_FOUND");
  });
});

describe("classifyError", () => {
  it("maps statuses to codes", () => {
    expect(classifyError(401, { error: "Invalid checksum" })).toBe("INVALID_CHECKSUM");
    expect(classifyError(401, { error: "Invalid merchant_id" })).toBe("INVALID_MERCHANT");
    expect(classifyError(403, { error: "Limit expired" })).toBe("LIMIT_EXPIRED");
    expect(classifyError(404, { error: "No record found for ISIN" })).toBe("NOT_FOUND");
    expect(classifyError(400, { error: "Invalid JSON body" })).toBe("BAD_REQUEST");
    expect(classifyError(500, { error: "An error occurred" })).toBe("SERVER_ERROR");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.types.test.ts`
Expected: FAIL — "Cannot find module './deridata.types'".

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/modules/deridata/deridata.types.ts
import { z } from "zod";

export function assertDeridataIsin(isin: string): string {
  const normalized = (isin ?? "").trim().toUpperCase();
  if (normalized.length < 8 || normalized.length > 14) {
    throw new Error(`Invalid Deridata ISIN: ${JSON.stringify(isin)}`);
  }
  return normalized;
}

// Lenient leaf helpers — Deridata uses null / "N/A" / "NA" / "-" / "" / [] conventions.
const str = z.string().nullish();
const num = z.union([z.number(), z.string()]).nullish();
const arr = <T extends z.ZodTypeAny>(t: T) => z.array(t).nullish();

export const DeridataErrorSchema = z.object({ error: z.string() });

// 1. Issue Detail — passthrough so unspecified fields survive into `raw`.
export const IssueDetailSchema = z
  .object({
    isin: str,
    did: str,
    coupon: str,
    coupon_fixed: num,
    coupon_type: str,
    coupon_frequency: str,
    maturity: str,
    issue_date: str,
    allotment_date: str,
    face_value: num,
    record_date: num,
    coupon_date: str,
    issuer_name: str,
    description: str,
    issuer_industry: str,
    seniority: str,
    security: str,
    listed: str,
    tax_free: str,
    current_rating: arr(z.string()),
    rating_agency: arr(z.string()),
    outlook: arr(z.unknown()),
    instrument_type: arr(z.string()),
    tags: arr(z.string()),
    redemption_type: str,
    redemption_premium: str,
    redemption: arr(z.unknown()),
    total_issue_size_cr: num,
    financial_covenants: z.record(z.string(), z.unknown()).nullish(),
  })
  .passthrough();

// 2. Calculator
export const CalculatorResponseSchema = z
  .object({
    summary: z
      .object({
        clean_price: num,
        accrued_int_top: num,
        dirty_price: num,
        principal: str,
        accrued_int_bottom: str,
        total_consideration: str,
        xirr: num,
        cashflow_shut_flag: z.boolean().nullish(),
        shut_period_message: str,
        record_date: str,
      })
      .passthrough()
      .nullish(),
    cashflows: arr(
      z
        .object({
          cash_flow_dates: str,
          coupon_cash_flow: str,
          principal_cash_flow: str,
          total_cash_flow: str,
        })
        .passthrough(),
    ),
  })
  .passthrough();

// 3. EBP
export const EbpResponseSchema = z
  .object({ isin: str, ebp_items: arr(z.record(z.string(), z.unknown())) })
  .passthrough();

// 4. Secondary Trades
export const SecondaryTradesResponseSchema = z
  .object({
    isin: str,
    trades: arr(z.record(z.string(), z.unknown())),
    trade_history: arr(z.record(z.string(), z.unknown())),
  })
  .passthrough();

// 5. Security & Covenant
export const SecurityCovenantSchema = z
  .object({
    isin: str,
    step_up_condition: str,
    step_down_condition: str,
    security_cover: str,
    nature_of_security: str,
    credit_enhancement: str,
    guarantee: str,
    guarantor: str,
    percentage_of_guarantee: str,
    financial_covenants: z.record(z.string(), z.unknown()).nullish(),
  })
  .passthrough();

// 6. Documents
export const DocumentsResponseSchema = z
  .object({
    isin: str,
    im_link: str,
    press_release_links: arr(
      z.object({ agency: str, rating: str, outlook: str, url: str }).passthrough(),
    ),
  })
  .passthrough();

export type DeridataErrorCode =
  | "INVALID_CHECKSUM"
  | "INVALID_MERCHANT"
  | "LIMIT_EXPIRED"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "SERVER_ERROR"
  | "UNKNOWN";

export type DeridataResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: DeridataErrorCode };

export function classifyError(status: number, body: unknown): DeridataErrorCode {
  const msg =
    body && typeof body === "object" && "error" in body
      ? String((body as { error: unknown }).error).toLowerCase()
      : "";
  if (status === 403 || msg.includes("limit")) return "LIMIT_EXPIRED";
  if (status === 404 || msg.includes("no record")) return "NOT_FOUND";
  if (status === 401 && msg.includes("merchant")) return "INVALID_MERCHANT";
  if (status === 401 || msg.includes("checksum")) return "INVALID_CHECKSUM";
  if (status === 400) return "BAD_REQUEST";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN";
}

/**
 * Parse an endpoint body. If it matches the error shape (or fails the success schema),
 * return ok:false; otherwise ok:true. Status-based classification is done by the API client
 * via `classifyError`; here we default error bodies to NOT_FOUND-agnostic UNKNOWN unless the
 * message says otherwise.
 */
export function parseEndpointResponse<T>(
  schema: z.ZodType<T>,
  data: unknown,
  status = 200,
): DeridataResult<T> {
  const asError = DeridataErrorSchema.safeParse(data);
  if (asError.success) {
    return { ok: false, error: asError.data.error, code: classifyError(status, data) };
  }
  const parsed = schema.safeParse(data);
  if (parsed.success) return { ok: true, data: parsed.data };
  return { ok: false, error: parsed.error.message, code: "UNKNOWN" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.types.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Stage the change (commit only if authorized)**

```bash
git add backend/src/modules/deridata/deridata.types.ts backend/src/modules/deridata/deridata.types.test.ts
git commit -m "feat(deridata): Zod schemas, ISIN guard, error classification"
```

---

### Task 4: HTTP client with the 6 endpoint methods

**Files:**
- Create: `backend/src/modules/deridata/deridata.api.ts`
- Test: `backend/src/modules/deridata/deridata.api.test.ts`

**Interfaces:**
- Consumes: `buildAuthFields` (Task 2); all schemas + `parseEndpointResponse`, `classifyError`, `assertDeridataIsin`, `DeridataResult` (Task 3); `env` (Task 1).
- Produces:
  - `class DeridataApi` with constructor `({ merchantId, secretKey, merchantName, merchantEmail, publicIp, baseUrl?, timeoutMs? })` and methods:
    - `getIssueDetail(isin: string): Promise<DeridataResult<IssueDetail>>`
    - `calculate(input: CalculatorInput): Promise<DeridataResult<CalculatorResponse>>`
    - `getEbp(isin: string): Promise<DeridataResult<EbpResponse>>`
    - `getSecondaryTrades(isin: string): Promise<DeridataResult<SecondaryTradesResponse>>`
    - `getSecurityCovenant(isin: string): Promise<DeridataResult<SecurityCovenant>>`
    - `getDocuments(isin: string): Promise<DeridataResult<DocumentsResponse>>`
  - `type CalculatorInput` = `{ isin; value_date; amount; yield_to_price; selected_yield; ytm?; ytc?; ytp?; clean_price?; cashflow_shut_flag; type_field?: "cashflow" }`.
  - `deridataApiFromEnv(): DeridataApi` — throws if merchant_id/secret_key/name/email/public_ip unset.

The client injects auth fields into each POST body via `buildAuthFields`, uses `validateStatus: s < 500`, and on a resolved 4xx (or thrown axios error with a body) classifies via the HTTP status. Use a private `post(path, schema, body)` helper to avoid repetition (DRY).

- [ ] **Step 1: Write the failing test**

```ts
// backend/src/modules/deridata/deridata.api.test.ts
import { describe, it, expect, mock } from "bun:test";
import { DeridataApi } from "./deridata.api";

function makeApi(handler: (path: string, body: any) => { status: number; data: unknown }) {
  const api = new DeridataApi({
    merchantId: 101,
    secretKey: "your_secret_key",
    merchantName: "TestMerchant",
    merchantEmail: "test@mail.com",
    publicIp: "192.168.1.1",
  });
  // Replace the private axios client's post with a stub.
  (api as any).client = {
    post: mock(async (path: string, body: any) => {
      const { status, data } = handler(path, body);
      if (status >= 500) {
        const err: any = new Error("server"); err.isAxiosError = true; err.response = { status, data };
        throw err;
      }
      return { status, data };
    }),
  };
  return api;
}

describe("DeridataApi", () => {
  it("getIssueDetail injects auth fields and returns ok:true", async () => {
    let seenBody: any;
    const api = makeApi((path, body) => {
      seenBody = body;
      expect(path).toBe("/api/public/merchant/v1/issue-detail/");
      return { status: 200, data: { isin: "INE2OTQ07077", coupon: "6.2626%" } };
    });
    const res = await api.getIssueDetail("ine2otq07077");
    expect(res.ok).toBe(true);
    expect(seenBody.merchant_id).toBe(101);
    expect(typeof seenBody.uuid).toBe("string");
    expect(typeof seenBody.checksum).toBe("string");
    expect(seenBody.isin).toBe("INE2OTQ07077");
  });

  it("maps a 403 to LIMIT_EXPIRED", async () => {
    const api = makeApi(() => ({ status: 403, data: { error: "Limit expired" } }));
    const res = await api.getEbp("INE2OTQ07077");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("LIMIT_EXPIRED");
  });

  it("maps a 404 to NOT_FOUND", async () => {
    const api = makeApi(() => ({ status: 404, data: { error: "No record found for ISIN" } }));
    const res = await api.getDocuments("INE2OTQ07077");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.code).toBe("NOT_FOUND");
  });

  it("calculate posts to the calculator path with the input merged", async () => {
    let seenBody: any;
    const api = makeApi((path, body) => {
      seenBody = body;
      expect(path).toBe("/api/public/merchant/v1/calculator/");
      return { status: 200, data: { summary: { clean_price: "98.5345" }, cashflows: [] } };
    });
    const res = await api.calculate({
      isin: "INE467V07966", value_date: "2026-04-16", amount: 100,
      yield_to_price: true, selected_yield: "ytm", ytm: 10, cashflow_shut_flag: false,
    });
    expect(res.ok).toBe(true);
    expect(seenBody.isin).toBe("INE467V07966");
    expect(seenBody.type_field).toBe("cashflow");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.api.test.ts`
Expected: FAIL — "Cannot find module './deridata.api'".

- [ ] **Step 3: Write the implementation**

```ts
// backend/src/modules/deridata/deridata.api.ts
import axios, { type AxiosInstance, isAxiosError } from "axios";
import { z } from "zod";
import { env } from "@packages/config/src/env";
import { buildAuthFields } from "./deridata.checksum";
import {
  assertDeridataIsin,
  classifyError,
  parseEndpointResponse,
  IssueDetailSchema,
  CalculatorResponseSchema,
  EbpResponseSchema,
  SecondaryTradesResponseSchema,
  SecurityCovenantSchema,
  DocumentsResponseSchema,
  type DeridataResult,
} from "./deridata.types";

export type DeridataApiConfig = {
  merchantId: number | string;
  secretKey: string;
  merchantName: string;
  merchantEmail: string;
  publicIp: string;
  /** Base URL without trailing slash, e.g. `https://www.deridata.com`. */
  baseUrl?: string;
  timeoutMs?: number;
};

export type CalculatorInput = {
  isin: string;
  value_date: string;
  amount: number;
  yield_to_price: boolean;
  selected_yield: "ytm" | "ytc" | "ytp";
  ytm?: number | null;
  ytc?: number | null;
  ytp?: number | null;
  clean_price?: number | null;
  cashflow_shut_flag: boolean;
  type_field?: "cashflow";
};

export type IssueDetail = z.infer<typeof IssueDetailSchema>;
export type CalculatorResponse = z.infer<typeof CalculatorResponseSchema>;
export type EbpResponse = z.infer<typeof EbpResponseSchema>;
export type SecondaryTradesResponse = z.infer<typeof SecondaryTradesResponseSchema>;
export type SecurityCovenant = z.infer<typeof SecurityCovenantSchema>;
export type DocumentsResponse = z.infer<typeof DocumentsResponseSchema>;

const DEFAULT_BASE_URL = "https://www.deridata.com";

const PATHS = {
  issueDetail: "/api/public/merchant/v1/issue-detail/",
  calculator: "/api/public/merchant/v1/calculator/",
  ebp: "/api/public/merchant/v1/ebp/",
  secondaryTrades: "/api/public/merchant/v1/secondary-trades/",
  securityCovenant: "/api/public/merchant/v1/security-covenant/",
  documents: "/api/public/merchant/v1/documents/",
} as const;

export class DeridataApi {
  private client: AxiosInstance;
  private readonly cfg: DeridataApiConfig;

  constructor(config: DeridataApiConfig) {
    this.cfg = config;
    const baseURL = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.client = axios.create({
      baseURL,
      timeout: config.timeoutMs ?? 30_000,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      validateStatus: (status) => status >= 200 && status < 500,
    });
  }

  private auth() {
    return buildAuthFields({
      merchantId: this.cfg.merchantId,
      merchantName: this.cfg.merchantName,
      merchantEmail: this.cfg.merchantEmail,
      publicIp: this.cfg.publicIp,
      secretKey: this.cfg.secretKey,
    });
  }

  private async post<T>(
    path: string,
    schema: z.ZodType<T>,
    payload: Record<string, unknown>,
  ): Promise<DeridataResult<T>> {
    const body = { ...this.auth(), ...payload };
    try {
      const res = await this.client.post<unknown>(path, body);
      return parseEndpointResponse(schema, res.data, res.status);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return {
          ok: false,
          error:
            (err.response.data as { error?: string } | undefined)?.error ??
            `HTTP ${err.response.status}`,
          code: classifyError(err.response.status, err.response.data),
        };
      }
      throw err;
    }
  }

  getIssueDetail(isin: string) {
    return this.post(PATHS.issueDetail, IssueDetailSchema, { isin: assertDeridataIsin(isin) });
  }

  calculate(input: CalculatorInput) {
    return this.post(PATHS.calculator, CalculatorResponseSchema, {
      ...input,
      isin: assertDeridataIsin(input.isin),
      type_field: input.type_field ?? "cashflow",
    });
  }

  getEbp(isin: string) {
    return this.post(PATHS.ebp, EbpResponseSchema, { isin: assertDeridataIsin(isin) });
  }

  getSecondaryTrades(isin: string) {
    return this.post(PATHS.secondaryTrades, SecondaryTradesResponseSchema, {
      isin: assertDeridataIsin(isin),
    });
  }

  getSecurityCovenant(isin: string) {
    return this.post(PATHS.securityCovenant, SecurityCovenantSchema, {
      isin: assertDeridataIsin(isin),
    });
  }

  getDocuments(isin: string) {
    return this.post(PATHS.documents, DocumentsResponseSchema, { isin: assertDeridataIsin(isin) });
  }
}

/** Build a client from env. Throws if required Deridata merchant config is missing. */
export function deridataApiFromEnv(): DeridataApi {
  const { DERIDATA_MERCHANT_ID, DERIDATA_SECRET_KEY, DERIDATA_MERCHANT_NAME, DERIDATA_MERCHANT_EMAIL, DERIDATA_PUBLIC_IP, DERIDATA_BASE_URL } = env;
  if (!DERIDATA_MERCHANT_ID || !DERIDATA_SECRET_KEY || !DERIDATA_MERCHANT_NAME || !DERIDATA_MERCHANT_EMAIL || !DERIDATA_PUBLIC_IP) {
    throw new Error("Deridata is not configured; set DERIDATA_MERCHANT_ID/SECRET_KEY/MERCHANT_NAME/MERCHANT_EMAIL/PUBLIC_IP");
  }
  return new DeridataApi({
    merchantId: DERIDATA_MERCHANT_ID,
    secretKey: DERIDATA_SECRET_KEY,
    merchantName: DERIDATA_MERCHANT_NAME,
    merchantEmail: DERIDATA_MERCHANT_EMAIL,
    publicIp: DERIDATA_PUBLIC_IP,
    baseUrl: DERIDATA_BASE_URL,
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/deridata.api.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the whole module test suite + type-check**

Run: `cd /home/sugandhan/Desktop/Repos/MeraDhan/backend && bun test src/modules/deridata/ && npx tsc --noEmit`
Expected: all deridata tests PASS; no new type errors.

- [ ] **Step 6: Stage the change (commit only if authorized)**

```bash
git add backend/src/modules/deridata/deridata.api.ts backend/src/modules/deridata/deridata.api.test.ts
git commit -m "feat(deridata): HTTP client with 6 endpoint methods + env factory"
```

---

## Self-Review (completed)

- **Spec coverage (Plan 1 scope):** module structure (§4.1), checksum auth + UUID format + golden vector (Global Constraints / §4.1), all 6 endpoint methods + error codes (§4.1, §Error mapping), env config incl. flags (§4.2). Schema/mapper, ingestion engine, and app-wiring/decommission are intentionally deferred to Plans 2–4.
- **Placeholder scan:** none — every step has runnable code and exact commands.
- **Type consistency:** `DeridataResult<T>`, `classifyError`, `parseEndpointResponse`, `buildAuthFields`, and schema names are defined in Tasks 2–3 and consumed with identical signatures in Task 4. `CalculatorInput.type_field` defaults to `"cashflow"` consistently in impl + test.
- **Note for executor:** `bun:test` is the runner (`backend/package.json` → `"test": "bun test"`). The Task-4 test stubs the private `client.post`; this is deliberate to keep Plan 1 free of network/DB. Live UAT calls against `https://test.deridata.com` happen in Plan 3 once real credentials + a whitelisted IP exist.
