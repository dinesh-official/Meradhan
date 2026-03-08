# Testing

**Analysis Date:** 2025-03-08

## Current State

**No formal test framework** is configured in the repo. There is no Jest, Vitest, Mocha, or similar runner in root or in backend/frontend `package.json` scripts.

## What Exists

- **Ad-hoc script:** `backend/test.ts` – used for manual/one-off checks (e.g. KRA process status). Not part of an automated suite.
- **Load / stress:** Scripts under `tests/` (if any) or similar ad-hoc load tests; not integrated into CI.
- **CBRICS / NSE:** Manual or helper-style usage for CBRICS/NSE flows; no automated E2E or unit tests for these paths.
- **Frontend:** No React Testing Library or component tests detected; no test scripts in CRM or MeraDhan `package.json`.

## Recommendations

- Introduce a test runner (e.g. Vitest or Jest) for backend unit tests (services, utils, controllers with mocked repos).
- Add integration tests for critical API routes (auth, orders, KYC) using a test DB or in-memory Prisma.
- Add frontend unit tests for critical hooks and forms (e.g. login, KYC steps) and optional E2E (Playwright/Cypress) for main flows.
- Move ad-hoc checks from `backend/test.ts` into named test files or a dedicated script runnable from CI.
- Document how to run tests and any required env (e.g. `TEST_DATABASE_URL`) in README or `docs/`.

## Mocking and Coverage

- No mocking strategy or coverage tool (Istanbul/c8) is in place. When adding tests, consider mocking Prisma, external APIs (Razorpay, MSG91, KRA, etc.), and the API client in frontend tests.

---

*Testing analysis: 2025-03-08*
