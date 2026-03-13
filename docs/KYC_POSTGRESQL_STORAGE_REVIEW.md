# KYC Data Storage Review — PostgreSQL Approach

## 1. Current State Summary

### Entity types (from `UserAccountType`)

| Type               | Stored as              | Storage location                                                    |
| ------------------ | ---------------------- | ------------------------------------------------------------------- |
| INDIVIDUAL         | Normalized tables      | Profile + PersonalInfo + Aadhaar + PAN + Address + Bank/Demat       |
| INDIVIDUAL_NRI_NRO | Same as Individual     | Same as above                                                       |
| CORPORATE          | Dedicated model        | `CorporateKycModel` + related tables                                |
| LLP                | Treated as “corporate” | Same `CorporateKycModel` with `entityConstitutionType: LLP`         |
| TRUST              | Treated as “corporate” | Same `CorporateKycModel` with `entityConstitutionType: TRUST`       |
| PARTNERSHIP_FIRM   | Treated as “corporate” | Same `CorporateKycModel` with `entityConstitutionType: PARTNERSHIP` |
| HUF                | No dedicated KYC path  | Profile only; no HUF-specific KYC table                             |

### What exists today

- **Individual KYC**: Fully normalized — `CustomerProfileDataModel`, `CustomerPersonalInfoModel`, `AADHAARCardModel`, `PanCardModel`, `AddressModel` (current + permanent), `CustomersBankAccountModel`, `CustomersDematAccountModel`, `CustomersRiskProfileModel`. Manual KYC form (steps 1–10) maps into these.
- **Corporate/LLP/Trust/Partnership**: Single `CorporateKycModel` with:
  - Entity details (name, PAN, CIN, incorporation, constitution type)
  - Correspondence address
  - Document URLs (incorporation, MoA, board resolution, GST, etc.)
  - FATCA
  - Related tables: `CorporateKycBankAccountModel`, `CorporateKycDematAccountModel`, `CorporateKycDirectorModel`, `CorporateKycPromoterModel`, `CorporateKycAuthorisedSignatoryModel`
- **KYC flow (in-progress)**: `KYC_FLOW` (kyc_dump) stores step-wise JSON; not the source of truth after submission.
- **KRA logs**: `KraDataLogs` stores request/response JSON for audit.

### Gaps

1. **HUF**: No dedicated KYC; typically needs Karta, members, family tree — not covered by current schema.
2. **Trust**: Needs trustees, settlor, beneficiaries — currently only “directors/promoters/signatories” which don’t match.
3. **LLP**: Needs partners, designated partners — currently reusing directors/signatories.
4. **Partnership**: Needs partners — same reuse as LLP.
5. **Variable fields**: Each entity type has different mandatory/optional fields; one flat “corporate” model forces many nullable columns and semantic misuse (e.g. “directors” for trustees).

---

## 2. Recommended PostgreSQL Approach

**Principle:** Keep **common fields as columns** (queryable, reportable, type-safe) and **type-specific fields** in a **JSONB** column so the number and shape of fields can vary by entity type without a new migration per type.

### Option A — Recommended: Single “Entity KYC” table + JSONB for type-specific data

- **Keep** existing **individual** KYC as-is (normalized tables).
- **Rename/repurpose** current corporate KYC into a single **Entity KYC** (non-individual) table:

**Shared (columns):**

- `id`, `customer_profile_id` (FK), `entity_type` (enum: CORPORATE, LLP, TRUST, HUF, PARTNERSHIP_FIRM)
- **Common to all:** entity name, PAN, CIN/registration number, correspondence address (or FK to shared `AddressModel`), date of incorporation/commencement, country/place of incorporation
- **FATCA:** fatca_applicable, fatca_entity_name, fatca_country, fatca_entity_type, giin, tax_residency, declaration
- **Documents:** keep key document URLs as columns (e.g. certificate_of_incorporation_url, pan_copy_file_url) or a single `document_urls JSONB` if you prefer one flexible structure
- **Common relations:** keep separate normalized tables for **bank accounts** and **demat accounts** (they are shared across entity types and you want FKs and reporting)

**Type-specific (JSONB):**

- Add one column: `entity_specific_data JSONB`.
  - **CORPORATE:** `{ directors: [...], promoters: [...], authorisedSignatories: [...] }` (or keep existing director/promoter/signatory tables and use JSONB only for extra fields).
  - **LLP:** `{ partners: [{ name, pan, designation, ... }], designatedPartners: [...] }`.
  - **TRUST:** `{ trustees: [...], settlor: {...}, beneficiaries: [...] }`.
  - **HUF:** `{ karta: {...}, members: [...] }`.
  - **PARTNERSHIP_FIRM:** `{ partners: [...] }`.

**PostgreSQL benefits:**

- **Indexing:** `CREATE INDEX idx_entity_kyc_entity_type ON entity_kyc(entity_type);` and, if needed, GIN on `entity_specific_data` for JSON queries.
- **Constraints:** CHECK on `entity_type` and NOT NULL on common columns; validation of JSONB structure in application (e.g. Zod) per `entity_type`.
- **Reporting:** Common fields (PAN, name, address, FATCA) remain SQL-friendly; type-specific reporting can use `entity_specific_data->'partners'` etc.

**Migration path:**

1. Add `entity_type` (and optionally `entity_specific_data`) to existing `CorporateKycModel` (or new `EntityKycModel`).
2. Backfill `entity_type` from current `entityConstitutionType` / customer `userType`.
3. For types that need different structures (Trust, LLP, HUF), introduce and fill `entity_specific_data`; optionally deprecate or repurpose director/promoter/signatory tables for CORPORATE only.

### Option B — Alternative: Keep current tables + one JSONB “extension”

- Leave **Individual** and **Corporate** (and related) tables as they are.
- Add a single **optional** table: e.g. `EntityKycExtension (customer_profile_id, entity_type, type_specific_data JSONB)`.
- Use it only for **Trust, LLP, HUF, Partnership** where the current director/promoter/signatory model doesn’t fit.
- **Corporate** keeps using directors/promoters/signatories; others use `type_specific_data` (trustees, partners, karta/members).

**Pros:** Minimal change; clear separation. **Cons:** Two places to look for non-individual KYC (main corporate table vs extension).

### Option C — Not recommended: Separate table per entity type

- Tables: `CorporateKyc`, `LLPKyc`, `TrustKyc`, `HUFKyc`, `PartnershipKyc`.
- **Cons:** Many migrations, duplicated “common” columns, complex routing and reporting across tables.

### Option D — Avoid: Pure EAV or many nullable columns

- EAV (entity–attribute–value) or one table with 100+ nullable columns is hard to query and maintain; avoid for core KYC.

---

## 3. Suggested Schema Additions (Option A in Prisma terms)

```prisma
// In enums.prisma – ensure entity type aligns with UserAccountType for non-individual
enum EntityKycType {
  CORPORATE
  LLP
  TRUST
  HUF
  PARTNERSHIP_FIRM
}

// In corporatekyc.prisma (or new entitykyc.prisma)
model CorporateKycModel {  // or rename to EntityKycModel
  // ... existing columns ...
  entityType         EntityKycType?  // NEW: explicit type (default from userType or entityConstitutionType)
  entitySpecificData Json?           // NEW: type-specific structures (partners, trustees, karta, etc.)
  // ...
}
```

- **Application layer:** Validate and type `entitySpecificData` per `entityType` (e.g. Zod schemas for Trust, LLP, HUF, Partnership) and keep common fields in columns.

---

## 4. Summary

- **Individual / NRI:** Keep current normalized design.
- **Corporate / LLP / Trust / Firm / HUF:** Use **one Entity KYC table** with:
  - **Columns** for common fields (entity name, PAN, address, incorporation, FATCA, document URLs) and normalized **bank/demat** relations.
  - **JSONB** for type-specific structures (directors, promoters, signatories, partners, trustees, karta, members) so the number of fields can vary by type without new columns.
- **PostgreSQL:** Use enum for `entity_type`, indexes on it and optionally GIN on JSONB; enforce structure and required fields in application (Zod) per entity type.

This keeps the DB simple, queryable, and reportable while supporting variable fields per entity type in a single, maintainable model.
