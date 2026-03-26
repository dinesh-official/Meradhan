# KRA Worker – Scenario Review

Review of `backend/src/jobs/kra_worker` and `packages/kyc-providers/src/kra/_docs` for missing or incorrect scenarios.

---

## Critical issues (bugs)

### 1. **`checkIsKraMatched` return value is inverted**

**File:** `CheckKraStatus.ts` (line 163)

```ts
return Boolean(matchers.find((e) => e == false));
```

- `matchers[i] === true` when field `i` matches.
- `find(e => e == false)` returns the first mismatch or `undefined`.
- So the function returns **`true` when there is a mismatch**, **`false` when all match**.

In `KraWorker.service.ts`, when `isMatched` is **true** you do CBRICS register (treat as “matched”). So you are doing CBRICS when KRA data **does not match** your KYC, and doing Modify when it **does match**. That is the opposite of the intended behaviour.

**Fix:** Return “all matched” instead of “any mismatch”:

```ts
return matchers.every(Boolean);
// or: return !matchers.some((e) => e === false);
```

---

### 2. **Rejection never updates customer to REJECTED**

**Files:** `CheckKraStatus.ts`, `KraWorker.service.ts`

In `CheckKraStatus.ts`, when KRA returns “rejted”/“rejected” you return the **string** `"WAITING"` (line 106), not a string containing “rejted”.

In the service you do:

```ts
const isRejected = status.includes("rejted") || status.includes("rejected");
if (isRejected && lastTask != null) { ... update to REJECTED ... }
```

`status` is always one of `"WAITING"` | `"REGISTER"` | `"AVAILABLE"` | `"ERROR"`. None of these contain `"rejted"` or `"rejected"`, so **`isRejected` is always false** and the customer is never set to `kraStatus: "REJECTED"`.

**Fix (choose one):**

- **Option A:** In `checkKraProcessCheckStatus`, return a dedicated value when rejected, e.g. `"REJECTED"`, and in the service handle `status === "REJECTED"` to update customer to REJECTED and stop (no reschedule).
- **Option B:** In the service, derive rejection from the **raw response** instead of `status`, e.g.  
  `const isRejected = /rejted|rejected/i.test(res?.APP_RES_ROOT?.APP_PAN_INQ?.APP_STATUS ?? "") || /rejted|rejected/i.test(res?.APP_RES_ROOT?.APP_PAN_INQ?.APP_UPDT_STATUS ?? "");`  
  and keep the same “update to REJECTED and return” block.

---

## Missing or unclear scenarios

### 3. **Unknown status fallback (no reschedule, no clear log)**

**File:** `KraWorker.service.ts` (line 250)

If `checkKraProcessCheckStatus` ever returns something other than `WAITING` / `REGISTER` / `AVAILABLE` / `ERROR` (e.g. a new API status string), execution falls through to `return res;`. You then:

- Do not reschedule.
- Do not log a specific “unknown status” outcome.
- Do not update customer/KYC state.

So the job stops with no clear record of why.

**Suggestion:** Add an explicit default branch, e.g. log to `kraDataLogs` with something like `stage: "UNKNOWN_KRA_STATUS"`, store the raw `status` and `res`, and either reschedule as WAITING (to retry later) or stop and set a clear “under review”/“failed” state so support can see it.

---

### 4. **Customer or KYC payload missing – silent return**

**File:** `KraWorker.service.ts` (lines 66–78)

When `customer` or `payload` is null you `return` without:

- Logging to `kraDataLogs` (e.g. “Customer not found” / “KYC flow not found”).
- Updating any status.

The job just ends. Operators have no trace in KRA logs.

**Suggestion:** Before returning, create a `kraDataLogs` entry (e.g. `stage: "CUSTOMER_OR_KYC_NOT_FOUND"`) and optionally set/keep a clear `kraStatus` so the case is visible in the UI.

---

### 5. **Download API failure – only generic catch**

If `this.kraProcess.downloadKraReport()` throws (e.g. network, 5xx, invalid response), you hit the outer `catch`, log “Rescheduling the job”, and call `addKraWorkerJob(data)`. There is no distinction between:

- Transient failure (retry is good).
- Permanent failure (e.g. KRA says “download not allowed” or invalid PAN/DOB).

**Suggestion:** (Optional) For download, consider checking response status/error code where the SDK exposes it, and either:

- Log a specific stage (e.g. `DOWNLOAD_FAILED`) with the error, and/or  
- After N consecutive download failures for the same customer/KYC, stop rescheduling and set a clear “under review”/“failed” state so someone can intervene.

---

### 6. **Enquiry API – null/empty/malformed response**

If the enquiry API returns `null`, empty body, or a structure where `APP_RES_ROOT?.APP_PAN_INQ` is missing, then:

- `normalizeStatus(undefined)` is `undefined`.
- You may fall through many `status?.includes(...)` checks and eventually hit the default `return "WAITING"` in `CheckKraStatus.ts`, so you keep rescheduling.

**Suggestion:** At the start of `checkKraProcessCheckStatus`, if `response?.APP_RES_ROOT?.APP_PAN_INQ` is missing, return a dedicated value (e.g. `"ERROR"`) so the service can log and optionally stop or limit retries instead of rescheduling forever.

---

### 7. **“Not available” + no `lastTask`**

**File:** `CheckKraStatus.ts` (lines 109–115)

```ts
if (status?.startsWith("not available") || status?.includes("not available")) {
  if (lastTask == "REGISTER") return "WAITING";
  if (lastTask == "MODIFY") return "ERROR";
  return "REGISTER";
}
```

When status is “not available” and `lastTask` is `null`/`undefined`, you return `"REGISTER"`. That is correct for “KYC not found at KRA, so register”. If `lastTask` is something else (e.g. `"ENQUIRY"` or a typo), you also return `"REGISTER"`. Just confirm that “not available” with unknown `lastTask` should always trigger register; if not, you may want an explicit branch or log.

---

### 8. **Fix 2 – “underprocess” + validated/rejected → WAITING**

You return `"WAITING"` so the flow keeps doing enquiry and never downloads. Comment says “download first, then modify”. So the intended flow is: next run(s) keep getting “underprocess” until KRA flips to something that leads to AVAILABLE, then you download. If KRA stays in this state for a long time, you only reschedule (with 72h cap). No separate “download then modify” step is triggered until status becomes AVAILABLE. If the API allows download while status is “underprocess” with updt “validated”, you might be able to add an earlier “try download” path; that depends on the KRA docs. Worth confirming against `_docs` that you don’t support a state where download is allowed before enquiry shows AVAILABLE.

---

## Already handled (no change needed)

- **72h timeout:** RUNNER key TTL stops rescheduling after 72 hours; no infinite loop.
- **Validated + modification rejected (Fix 1):** You return ERROR and don’t re-register; service doesn’t call CBRICS again.
- **Validation pending with CAMS/CVL/KARVY/NSE/BSE (Fix 3):** Treated as WAITING.
- **Register/Modify response (e.g. status 7 / 01):** Handled via enquiry on next run; no change needed for those samples.
- **Job failure + reschedule:** Catch block logs and calls `addKraWorkerJob` then rethrows; Bull marks job failed and a new job runs later.

---

## Summary

| # | Issue | Severity | Action |
|---|--------|----------|--------|
| 1 | `checkIsKraMatched` returns true on mismatch | Critical | Invert to return true when all match (e.g. `matchers.every(Boolean)`) |
| 2 | Rejection never sets customer to REJECTED | Critical | Handle REJECTED from status helper or from raw response |
| 3 | Unknown status → silent fallback | Medium | Default branch: log UNKNOWN_KRA_STATUS, decide reschedule vs stop |
| 4 | Customer/payload missing → no log | Medium | Log to kraDataLogs before return |
| 5 | Download failure only generic catch | Low | Optional: specific stage / limit retries |
| 6 | Enquiry null/malformed response | Low | Return ERROR (or dedicated value) when APP_PAN_INQ missing |
| 7 | “Not available” with no lastTask | Low | Confirm behaviour; add branch/log if needed |
| 8 | Fix 2 download timing | Low | Confirm with KRA docs; optional earlier download path |

Implementing fixes for **1** and **2** is strongly recommended; the rest improve observability and edge-case behaviour.
