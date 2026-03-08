# Codebase Concerns

**Analysis Date:** 2025-03-08

## Tech Debt

**NSE webhook signature verification:**
- Issue: NSE CBRICS and RFQS webhook handlers accept payloads without signature verification. Commented-out verification exists but is not enabled.
- Files: `backend/src/modules/RFQ/nse/webhook_notification.controller.ts`, `backend/src/modules/RFQ/nse/webhook_notification.routes.ts`
- Impact: Any caller can POST to webhook endpoints and inject fake notifications; stored data and downstream processing can be spoofed.
- Fix approach: Implement HMAC/signature verification using NSE-provided secret, add IP whitelisting and webhook-specific rate limiting. Uncomment and complete the existing verification block.

**Hardcoded file-access token:**
- Issue: Token `meradhan24873284sadsrFAD` is hardcoded in three places for `/files-public` URL access.
- Files: `packages/kyc-providers/pdf/helper.ts` (lines 136, 154, 173)
- Impact: Token is in version control; if backend validates it, anyone with repo access can access protected files. Rotation requires code change.
- Fix approach: Move token to environment (e.g. `FILES_PUBLIC_ACCESS_TOKEN` or equivalent), inject via env in the package, and document rotation.

**Embedded reference data in source:**
- Issue: ~190k-line array `allCompanyNameOrTyes` is committed in a single TS file; CDSL and NSDL DP lookup data (~81k lines each) exist in both a package and duplicated in frontend.
- Files: `backend/src/jobs/cron/scrap_bonds/all_company_data.ts`, `packages/dp-id-lookup/cdsl.ts`, `packages/dp-id-lookup/nsdl.ts`, `frontend/meradhan/src/app/(account)/dashboard/kyc/_utils/cdslDpid.ts`, `frontend/meradhan/src/app/(account)/dashboard/kyc/_utils/nsdlDpid.ts`
- Impact: Bloated repo, slow clones/edits, merge conflicts; DP data duplicated and can drift between package and frontend.
- Fix approach: Move company list and DP data to JSON/DB or external assets; have backend/cron consume from there. Frontend should use `dp-id-lookup` only; remove `cdslDpid.ts` and `nsdlDpid.ts` duplicates.

**Typo in exported name:**
- Issue: Export is `allCompanyNameOrTyes` (Tyes vs Types).
- Files: `backend/src/jobs/cron/scrap_bonds/all_company_data.ts`, `backend/src/jobs/cron/scrap_bonds/nsdl_bond_processor.ts`
- Impact: Naming confusion and inconsistent API.
- Fix approach: Rename to `allCompanyNameOrTypes` and update `nsdl_bond_processor.ts` import.

**Component/file naming typos:**
- Issue: Misspellings in file and component names used across imports.
- Files: `frontend/crm/.../cards/PriviewCard.tsx` (Preview), `frontend/crm/.../cards/AdharaCard.tsx` (Aadhaar), `frontend/crm/.../cards/CheckedCompances.tsx` (Compliance), `frontend/meradhan/.../CreaditRatingBadge.tsx` (Credit), `frontend/crm/.../CreaditRatingBadge.tsx`
- Impact: Harder discovery and inconsistent naming.
- Fix approach: Rename files and components (PreviewCard, AadhaarCard, CheckedCompliance, CreditRatingBadge) and update all imports.

**Aadhaar verification TODO:**
- Issue: Comment "TODO: verify aadhaar response" and unverified Digio callback response is passed to `verifyAadhaarResponseMutation`.
- Files: `frontend/meradhan/src/app/(account)/dashboard/kyc/_steps/1_IdentityValidation/1_panAndAadhar/AdharInfoForm.tsx`
- Impact: Response shape or authenticity not validated before backend verification; risk of misuse or bad data.
- Fix approach: Validate callback payload (e.g. required fields, types) and add server-side verification of Digio doc id before mutating.

**REST proxy TODO:**
- Issue: Apollo client comment suggests a future proxy for REST API calls.
- Files: `frontend/meradhan/src/core/connection/apollo-client.ts`
- Impact: None currently; only documentation of possible future work.
- Fix approach: Implement proxy when REST is introduced or remove/update comment.

## Known Bugs

**Placeholder text in PDF/orders:**
- Issue: "XXXXXXX" and "XXXXX" used as fallback text in PDF and order display.
- Files: `packages/kyc-providers/pdf/pages/Page10.tsx`, `packages/kyc-providers/pdf/Orders/OrdersPage.tsx`
- Trigger: When source data is missing or orderId split yields empty.
- Workaround: Ensure upstream data is always present or replace with a clear "N/A" or structured fallback.

## Security Considerations

**NSE webhooks (see Tech Debt):**
- Risk: Unauthenticated webhook acceptance.
- Current mitigation: Logging of IP and user-agent only.
- Recommendations: Signature verification, IP allowlist, rate limiting.

**Hardcoded file token (see Tech Debt):**
- Risk: Secret in repo and no rotation path.
- Recommendations: Env-based token and removal from source.

**TLS verification disabled:**
- Risk: HTTPS clients use `rejectUnauthorized: false`, enabling MITM.
- Files: `backend/src/jobs/cron/scrap_bonds/nsdl_bond_service.ts`, `packages/kyc-providers/src/kra/KraSDK.ts`, `packages/kyc-providers/src/NSDL/NSDLApi.ts`
- Current mitigation: Comments mention TLS; one says "TEMP FIX".
- Recommendations: Fix certificate/trust (e.g. correct CA or system store) and set `rejectUnauthorized: true`; remove temporary override.

**Load test credentials:**
- Risk: JWT and cookie with real-looking payload committed in load test.
- Files: `tests/backendload.test.ts`
- Recommendations: Use env or generated tokens for load tests; avoid committing real or long-lived tokens.

## Performance Bottlenecks

**Large in-memory arrays:**
- Problem: Loading 190k+ company records and 81k+ DP records in process memory.
- Files: `backend/src/jobs/cron/scrap_bonds/all_company_data.ts`, `nsdl_bond_processor.ts`; `packages/dp-id-lookup/cdsl.ts`, `nsdl.ts`; frontend `cdslDpid.ts`, `nsdlDpid.ts`
- Cause: All data parsed and held in memory; frontend bundles duplicate DP data.
- Improvement path: Externalize data (DB/JSON/CDN), use streaming or chunked processing for cron; single source (dp-id-lookup) for frontend with lazy load or API if needed.

**Large type/const files:**
- Problem: Single files with 1.7k+ and 1.3k+ lines for RFQ/cbrics types.
- Files: `backend/src/modules/RFQ/nse/rfq.types.ts`, `backend/src/modules/RFQ/nse/cbrics.types.ts`
- Cause: Monolithic type definitions.
- Improvement path: Split by domain or feature; consider codegen from API/schema.

## Fragile Areas

**NSE webhook controller:**
- Files: `backend/src/modules/RFQ/nse/webhook_notification.controller.ts`
- Why fragile: No auth; any change to payload shape can break consumers; no schema validation shown.
- Safe modification: Add signature verification and request validation before changing payload handling; add tests.

**Order controller and service:**
- Files: `backend/src/resource/crm/orders/orders.controller.ts` (~982 lines), `backend/src/resource/crm/orders/orders.service.ts`
- Why fragile: Many branches and throw paths; PDF generation and external calls; large surface area.
- Safe modification: Refactor into smaller functions/services; add unit tests for parsing and business rules; integration tests for PDF and orders flow.

**KYC and bond forms (frontend):**
- Files: `frontend/crm/src/app/(presentation)/dashboard/bonds/create/_components/BondForm.tsx` (~1337 lines), `frontend/meradhan/.../PersonalDetails.tsx`, manual-kyc and corporate-kyc flows
- Why fragile: Large forms, shared state, file upload and S3; multiple `return null` branches.
- Safe modification: Break forms into smaller components and hooks; centralize validation; add tests for critical paths.

**PDF generation (kyc-providers):**
- Files: `packages/kyc-providers/pdf/` (dataMapper, Stamp, Orders, pages)
- Why fragile: Base64 image in Stamp component; token-based file fetch; many page components.
- Safe modification: Avoid large inline assets; use env for token; add tests for data mapping and URL generation.

**NSDL bond scraper:**
- Files: `backend/src/jobs/cron/scrap_bonds/nsdl_bond_service.ts`, `nsdl_bond_processor.ts`
- Why fragile: Scraping NSDL HTML, TLS disabled, dependency on `all_company_data` structure and naming.
- Safe modification: Add retries and backoff; fix TLS; validate scraped data; consider official API if available.

## Scaling Limits

**Cron bond scrape:**
- Current: Fetches NSDL XLS, processes with in-memory company lookup from 190k entries.
- Limit: Memory and CPU spike during run; single-process.
- Scaling path: Chunk company lookup (DB or indexed JSON), optional queue for row processing, separate worker for scrape.

**DP lookup (frontend):**
- Current: Two ~81k-line arrays (CDSL, NSDL) in frontend bundle or package.
- Limit: Bundle size and parse time.
- Scaling path: Server-side or CDN API for DP lookup; or lazy load / code-split the lookup module.

## Dependencies at Risk

**No specific deprecated packages identified in this pass.** Recommend running `npm outdated` / `pnpm outdated` and checking for known vulnerabilities (e.g. `npm audit`) per workspace.

## Missing Critical Features

**Webhook security (see Tech Debt):**
- Problem: No signature verification or IP allowlist for NSE webhooks.
- Blocks: Safe production use of webhook-driven flows.

**Aadhaar response verification (see Tech Debt):**
- Problem: Digio callback not validated before triggering verify mutation.
- Blocks: Robust KYC flow and audit trail.

## Test Coverage Gaps

**Untested areas:**
- Most of backend: only `backend/src/services/refq/nse/test/cbrics.test.ts` and `tests/backendload.test.ts` found; cbrics test creates real DB records (integration-style).
- Frontend: no `.test.*`/`.spec.*` files under frontends.
- NSE webhook handlers: no tests; high risk given missing auth.
- Order service/controller: complex logic and many throw paths with no unit tests.
- KYC flows (manual, corporate, Aadhaar/PAN): no automated tests.
- PDF generation and file URL helpers in kyc-providers: no tests.

**Files:** `backend/src/modules/RFQ/nse/webhook_notification.controller.ts`, `backend/src/resource/crm/orders/orders.service.ts`, `frontend/meradhan/.../AdharInfoForm.tsx`, `packages/kyc-providers/pdf/helper.ts`, and most feature modules under frontend/crm and frontend/meradhan.

**Risk:** Regressions in orders, KYC, and webhooks can reach production unnoticed.

**Priority:** High for webhooks and orders; high for KYC flows; medium for PDF and helpers.

---

*Concerns audit: 2025-03-08*
