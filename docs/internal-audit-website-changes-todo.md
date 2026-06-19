# Internal Audit — Website Changes Todo List

> **Source:** Internal audit observations (SEBI/compliance)  
> **Last updated:** 2026-06-18  
> **Scope:** Meradhan (client website), CRM (ops), Backend, KYC PDF pack

---

## Legend

- [ ] Not started
- [~] In progress
- [x] Done

---

## 1. Risk Categorization in KYC Forms

**Requirement:** Client AML risk categorization (Low / Medium / High) captured during onboarding and reflected in final KYC forms/documents shared with clients.

> **Note:** Step 5 “Risk Profiling” today is an *investment* questionnaire — not AML risk category. Do not conflate the two.

### Backend / Database
- [ ] Add `amlRiskCategory` enum (`LOW` | `MEDIUM` | `HIGH`) to Prisma schema (e.g. `CustomerProfileDataModel` or dedicated office-use table)
- [ ] Create migration for new field(s)
- [ ] Expose field on customer profile GET/PATCH APIs (CRM + internal)
- [ ] Include `amlRiskCategory` in KYC PDF data mapper payload

### CRM
- [ ] Add AML risk category field on KYC review screen (`ViewKycDataComponent` or office-use section)
- [ ] Add field to manual KYC flow (`manual-kyc` steps) for ops-assigned category
- [ ] Allow CRM user to set/update category at verification time
- [ ] Show category on customer profile / KYC summary

### Meradhan (Client)
- [ ] Decide if client selects category or only ops assigns (confirm with compliance)
- [ ] If client-facing: add capture step or sub-section during onboarding
- [ ] Show selected/assigned category in profile / downloaded KYC summary (if applicable)

### KYC PDF (`packages/kyc-providers`)
- [ ] Add “Customer risk categorization” block to appropriate page (e.g. office-use section)
- [ ] Map `amlRiskCategory` in `dataMapper.ts`
- [ ] Verify category appears on signed PDF shared with client

### QA / Compliance
- [ ] Test full flow: onboarding → CRM review → PDF generation → client download
- [ ] Confirm wording matches audit expectation (Low / Medium / High labels)

---

## 2. Mode of Receipt of Documents

**Requirement:** Client selects preferred mode (Physical or Electronic) during account opening; recorded in client records and KYC documents.

### Backend / Database
- [ ] Add `documentReceiptMode` enum (`PHYSICAL` | `ELECTRONIC`) to customer profile schema
- [ ] Create migration
- [ ] Persist value from onboarding API
- [ ] Return field in customer/KYC APIs for CRM

### Meradhan (Client)
- [ ] Add UI choice during KYC (recommended: before e-sign, after personal details)
- [ ] Copy explaining Physical vs Electronic delivery
- [ ] Validate selection is required before proceeding
- [ ] Store selection via onboarding API

### KYC PDF (`packages/kyc-providers`)
- [ ] Update `Page13.tsx` — drive Physical / ECN checkboxes from stored value (today ECN is hard-coded `checked`)
- [ ] Update `mapDataForPage13` in `dataMapper.ts`
- [ ] Update `mapDataForPage5` — replace hard-coded `documentsReceived: "e-document"` with actual selection
- [ ] Verify PDF reflects client choice for both modes

### CRM
- [ ] Display document receipt mode on KYC view and customer profile
- [ ] Allow ops to view (and edit if business rules allow)

### QA / Compliance
- [ ] Test Physical path end-to-end
- [ ] Test Electronic path end-to-end
- [ ] Confirm CRM record and PDF match selected mode

---

## 3. Online KYC Requirements

**Requirement:** (a) KRA photograph in KYC forms, (b) geo-location tagging, (c) e-Sign verification of Name, Gender, and Year of Birth.

### 3a. Client photograph from KRAs

#### Backend
- [ ] Extend KRA download handling to fetch/store client photograph (`APP_PHOTO` or equivalent from KRA response)
- [ ] Add photo field to KRA schema/types if missing (`kra.prisma`, KRA response types)
- [ ] Store photo URL/blob reference on customer KYC record
- [ ] Expose photo in KYC data APIs for CRM and PDF mapper

#### Meradhan
- [ ] On KRA path: display KRA-fetched photo for client confirmation (instead of skipping selfie only)
- [ ] Fallback: keep existing selfie flow when KRA photo unavailable

#### KYC PDF
- [ ] Remove or conditionalize `omitPage1PhotoAndSignature` for KRA path when photo exists
- [ ] Map KRA photo into `Page1` / `Page8` in `dataMapper.ts`

#### QA
- [ ] Test KRA onboarding path — photo appears on PDF
- [ ] Test non-KRA path — selfie photo still works

---

### 3b. Geo-location tagging during online KYC

#### Backend
- [ ] Confirm geo fields are persisted from Digio selfie response (`latitude`, `longitude` in `kyc_dump` JSON)
- [ ] Optional: normalize to dedicated DB columns for audit reporting
- [ ] Expose geo data in CRM KYC API

#### Meradhan
- [ ] Ensure location permission prompt remains mandatory (or policy-compliant) during selfie step
- [ ] Handle denied-location case per compliance policy

#### CRM
- [ ] Add geo-location display card on KYC review (lat/long, timestamp, capture step)
- [ ] Surface in `CheckedCompances` or dedicated audit section

#### KYC PDF (if required by compliance)
- [ ] Add geo stamp/line on attestation page (coordinates + datetime)
- [ ] Map from `step_1.face.response` in `dataMapper.ts`

#### QA
- [ ] Verify geo captured, visible in CRM, and on PDF (if required)

---

### 3c. e-Sign verification of Name, Gender, Year of Birth

#### Backend
- [ ] Extend `verifyEsignResponse` (or post-sign webhook) to fetch Digio document metadata
- [ ] Extract signer name, gender, year of birth from e-sign response
- [ ] Compare against KYC identity data (PAN/Aadhaar/KRA)
- [ ] Persist verification flags: `esignNameVerified`, `esignGenderVerified`, `esignYobVerified` (or JSON audit block)
- [ ] Store mismatch details for CRM review

#### Meradhan
- [ ] Show verification status after e-sign completes (success / mismatch → contact support)

#### CRM
- [ ] Display e-sign attribute verification results on KYC view
- [ ] Flag mismatches for manual review

#### KYC PDF (optional)
- [ ] Add attestation line: “e-Sign verified: Name / Gender / YOB” with date

#### QA
- [ ] Test happy path — all attributes match
- [ ] Test mismatch path — CRM flag raised

---

## 4. Online Account Closure Facility

**Requirement:** Client-facing online account closure equivalent to online account opening.

### Product / Compliance (pre-dev)
- [ ] Define closure policy: pre-conditions (zero holdings, pending orders, demat status)
- [ ] Define SLA and ops approval workflow
- [ ] Confirm regulatory retention requirements for closed accounts

### Backend / Database
- [ ] Add `CLOSED` (or `PENDING_CLOSURE`) to `AccountStatus` enum
- [ ] Create `account_closure_requests` table (customerId, reason, status, requestedAt, processedAt, processedBy)
- [ ] API: `POST /customer/account/closure-request` (client)
- [ ] API: `GET/PATCH` closure requests (CRM ops)
- [ ] Block trading/login appropriately during pending closure
- [ ] Email/notification on request submitted and processed

### Meradhan (Client)
- [ ] Add “Close account” section under profile/settings
- [ ] Closure request form (reason, acknowledgements, confirmations)
- [ ] Pre-check UI (holdings, open orders, KYC status)
- [ ] Confirmation screen + request tracking status

### CRM
- [ ] Closure requests queue / list view
- [ ] Approve / reject / mark completed actions
- [ ] Link from customer profile
- [ ] Distinguish **suspend** vs **close** clearly in UI

### QA / Compliance
- [ ] Test closure with active holdings (should block or warn)
- [ ] Test full closure → login blocked → CRM audit trail

---

## 5. Proprietary Trading Disclosure

**Requirement:** Display prescribed SEBI disclosure on website and communicate to clients.

**Suggested wording:**
> Bondnest Capital India Securities Private Limited hereby informs its clients that it undertakes proprietary trading activities in addition to client-based business. This disclosure is made pursuant to SEBI Circular No. SEBI/MRD/SE/Cir-42/2003 dated November 19, 2003.

### Meradhan (Client)
- [ ] Add exact wording to homepage (banner or footer strip — confirm placement with compliance)
- [ ] Add/update dedicated disclosure section on `/disclaimer` or new `/regulatory-disclosure` page
- [ ] Update `Footer.tsx` if disclosure should be permanently visible
- [ ] Replace `[Placeholder]` SEBI registration text in `TermsContent.tsx` / `DisclaimerContent.tsx` with `INZ000330234` (or current reg no)
- [ ] Update `public/docs/Regulatory-Disclosure.pdf` with exact circular text

### CRM / Comms (optional)
- [ ] Include disclosure in client welcome email or account-opening confirmation (if required)

### QA / Compliance
- [ ] Legal/compliance sign-off on placement and exact wording
- [ ] Verify visible on homepage without scrolling (if audit requires prominence)

---

## 6. Mandatory Documents in Vernacular Languages

**Requirement:** Rights & Obligations, Uniform RDD, and Do's & Don'ts in vernacular languages; Downloads section (NSE-style).

**Reference:** [NSE client registration documents](https://www.nseindia.com/static/trade/members-client-registration-documents)

### Content / Ops
- [ ] Obtain official vernacular PDFs (Hindi + other languages per business decision)
- [ ] Inventory languages to support (align with NSE or state-wise requirements)
- [ ] Version-control document dates / circular references

### Meradhan (Client)
- [ ] Create `/downloads` page with sections:
  - [ ] Rights & Obligations
  - [ ] Uniform Risk Disclosure Document (RDD)
  - [ ] Do's & Don'ts
- [ ] Language selector per document (or filter by language)
- [ ] Link from `Footer.tsx` under “Explore” or new “Downloads” group
- [ ] Host files at `public/docs/downloads/{lang}/` (e.g. `hi`, `en`, `mr`, `ta`)

### KYC flow (optional enhancement)
- [ ] Surface vernacular download links during KYC consent / acknowledgement step
- [ ] Update `Page48` acknowledgement list to link to downloads page

### CRM
- [ ] No client-facing change required unless ops needs to verify client downloaded vernacular copy

### QA / Compliance
- [ ] Verify all three document types available in each required language
- [ ] Verify PDFs open correctly and match approved content
- [ ] Compare structure with NSE downloads page for audit parity

---

## Suggested implementation order

| Phase | Items | Rationale |
|-------|--------|-----------|
| **Phase 1** | #5 Proprietary disclosure, #6 Downloads page (English first) | Low engineering risk; fast compliance wins |
| **Phase 2** | #2 Document receipt mode, #1 AML risk category | Medium effort; directly fixes KYC PDF gaps |
| **Phase 3** | #6 Vernacular PDFs (content upload) | Depends on ops obtaining translated documents |
| **Phase 4** | #3 Online KYC (KRA photo, geo display, e-sign verification) | Higher integration complexity |
| **Phase 5** | #4 Online account closure | New workflow; needs product/policy sign-off first |

---

## Key files & areas (reference)

| Area | Path |
|------|------|
| Meradhan KYC steps | `frontend/meradhan/src/app/(account)/dashboard/kyc/_steps/` |
| CRM KYC review | `frontend/crm/src/app/(presentation)/dashboard/customers/view/[id]/kyc/` |
| CRM manual KYC | `frontend/crm/src/app/(presentation)/dashboard/customers/manual-kyc/` |
| KYC PDF pack | `packages/kyc-providers/pdf/` |
| PDF data mapper | `packages/kyc-providers/pdf/dataMapper.ts` |
| Customer schema | `backend/databases/postgres/prisma/schema/customer.prisma` |
| KYC dump / flow | `backend/databases/postgres/prisma/schema/kycdump.prisma` |
| KRA schema | `backend/databases/postgres/prisma/schema/kra.prisma` |
| Meradhan footer / legal | `frontend/meradhan/src/global/components/footer/Footer.tsx` |
| Static docs | `frontend/meradhan/public/docs/` |
| Account status | `customers_auth_data.accountStatus` (`ACTIVE` / `SUSPENDED` today) |

---

## Open questions for compliance / product

1. Is AML risk category **client-selected** or **ops-assigned only**?
2. Must geo-location appear on the **signed PDF**, or is CRM audit trail sufficient?
3. Which **vernacular languages** are mandatory for launch?
4. Account closure: **instant** after request or **ops-approved** workflow?
5. Should proprietary trading disclosure appear on **every page footer** or homepage only?

---

## Progress summary

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Risk categorization (AML Low/Med/High) | Not started |
| 2 | Mode of receipt (Physical/Electronic) | Not started |
| 3 | Online KYC (KRA photo, geo, e-sign verify) | Partial (geo/selfie exist; gaps remain) |
| 4 | Online account closure | Not started |
| 5 | Proprietary trading disclosure | Partial (generic text only) |
| 6 | Vernacular mandatory documents | Not started |
