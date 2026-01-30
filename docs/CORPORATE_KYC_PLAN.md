# Corporate KYC – Work Plan

MeraDhan currently supports **Individual KYC** (PAN, Aadhaar, face, personal info, bank, demat, risk profile). This document outlines the plan to add **Corporate KYC** for customers with `userType` = CORPORATE (and optionally TRUST, HUF, LLP, PARTNERSHIP_FIRM).

---

## Current state

- **Customer** has `userType` (`INDIVIDUAL` | `CORPORATE` | `TRUST` | `HUF` | `LLP` | `PARTNERSHIP_FIRM`).
- **KYC flow** is individual-only: `KycDataStorage` (step_1 PAN+Aadhaar+face, step_2 personal info, step_3 banks, step_4 demat, step_5 risk, step_6 terms).
- **saveKycToCustomer** assumes individual structure; no branch for corporate.
- **CRM KYC view** shows individual cards (PAN, Aadhaar, address, bank, demat, risk). No corporate view yet.
- **KRA worker** is individual-focused (PAN enquiry/register/modify/download). KRA may have a separate flow for non-individuals (body corporate).

---

## Phase 1 – Types & data model

| Task | Description                                                                                                                                                                                                                                                                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | Define **CorporateKycDataStorage** type: company name, company PAN, incorporation/registration number, date of incorporation, registered address, business type, directors, authorized signatories (name, PAN, Aadhaar, designation), board resolution, document URLs (incorporation cert, PAN copy, etc.). |
| 1.2  | Decide storage: same **KYC_FLOW** with `data` shape by `userType`, or separate table (e.g. `corporate_kyc_flow`). Recommended: same `KYC_FLOW`, use a `kycType: "INDIVIDUAL" \| "CORPORATE"` in JSON or infer from customer.userType.                                                                       |
| 1.3  | Optional: add **companyName** (or similar) to `CustomerProfileDataModel` if you want to store company name separately from firstName.                                                                                                                                                                       |

---

## Phase 2 – Backend API & save flow

| Task | Description                                                                                                                                                                                                                                                                                                                |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1  | **Get KYC**: When fetching KYC for a customer, if `userType` is CORPORATE (or other non-individual), return corporate KYC structure (from same `KYC_FLOW.data` or corporate table).                                                                                                                                        |
| 2.2  | **Set KYC**: Allow saving corporate KYC steps (e.g. `setKycData` with step names like `corporate_1_company`, `corporate_2_directors`, etc.) or new route `setCorporateKycData`.                                                                                                                                            |
| 2.3  | **saveCorporateKycToCustomer**: New method (or branch in existing) that maps corporate KYC data to customer profile: e.g. company name → firstName or companyName, company PAN → panCard (with entity flag), registered address → currentAddress/permanentAddress. Do not run individual-only steps (Aadhaar, face match). |
| 2.4  | **KRA**: Check KRA docs for non-individual/body corporate flow. If supported, add corporate KRA worker or branch in existing worker; if not, corporate KYC may not trigger KRA until clarified.                                                                                                                            |

---

## Phase 3 – CRM UI (Corporate KYC view & form)

| Task | Description                                                                                                                                                                                                            |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1  | **Branch by userType**: In customer KYC view, if `customer.userType` is CORPORATE (or TRUST, HUF, LLP, PARTNERSHIP_FIRM), render **CorporateKycView** instead of individual **ViewKycDataComponent**.                  |
| 3.2  | **CorporateKycView**: Read-only view showing company name, company PAN, incorporation details, registered address, directors, authorized signatories, document status. Reuse card layout pattern from individual view. |
| 3.3  | **Corporate KYC form** (new or under manual KYC): Multi-step form to capture company details, directors, signatories, and document uploads. Submit to same or new API (setKycData / setCorporateKycData).              |

---

## Phase 4 – Client app (optional)

| Task | Description                                                                                                                                           |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1  | If corporate users sign up from meradhan app, add corporate KYC flow there (steps for company PAN, incorporation, directors, signatories, documents). |
| 4.2  | Route corporate users to corporate KYC steps instead of individual PAN/Aadhaar flow.                                                                  |

---

## Non-individual userTypes

Treat the same as corporate for KYC flow unless you need entity-specific fields:

- **CORPORATE**: Company PAN, incorporation certificate, directors, signatories.
- **TRUST**: Trust deed, trustees, PAN of trust.
- **HUF**: HUF deed, Karta, members, HUF PAN.
- **LLP**: LLP agreement, designated partners, LLPIN.
- **PARTNERSHIP_FIRM**: Partnership deed, partners, firm PAN.

You can start with **CORPORATE** only and extend to others later.

---

## Files to add/change (summary)

| Area          | File(s)                                                              | Action                                               |
| ------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| Backend types | `backend/src/services/customer/kyc/kyc.d.ts` or `corporate-kyc.d.ts` | Add CorporateKycDataStorage                          |
| Backend save  | `customer_kyc_manager.service.ts`                                    | Branch by userType or add saveCorporateKycToCustomer |
| Backend API   | kyc_store.controller.ts, kyc.routes                                  | Support corporate steps or new route                 |
| CRM view      | `CustomerKycView.tsx`                                                | Branch: CORPORATE → CorporateKycView                 |
| CRM           | `CorporateKycView.tsx` (new)                                         | Corporate KYC read-only cards                        |
| CRM form      | New form component(s)                                                | Corporate KYC edit/create                            |
| KRA           | KraWorker, KraWorker.service                                         | Optional: corporate/non-individual flow              |

---

## Done in this pass

- **CorporateKycDataStorage** type in `backend/src/services/customer/kyc/kyc.d.ts`: company name, company PAN, registration, address, directors, documents.
- **CorporateKycView** in CRM (`view/[id]/kyc/_components/CorporateKycView.tsx`): when `userType` is CORPORATE / TRUST / HUF / LLP / PARTNERSHIP_FIRM, show Corporate KYC section (placeholder + KYC status + KRA logs). Exported `isNonIndividual()` for branching.
- **CustomerKycView** branches on `data.userType`: non-individual → CorporateKycView, else ViewKycDataComponent. Title shows "Corporate KYC - …" for non-individual.
- **docs/CORPORATE_KYC_PLAN.md**: full work plan (types, API, save flow, CRM UI, KRA).
