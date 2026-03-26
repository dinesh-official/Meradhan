# Entity KYC — Multipurpose Table Structure

Single table for all non-individual entity types: **Corporate**, **LLP**, **Trust**, **HUF**, **Partnership Firm**.

---

## 1. Main Table: `entity_kyc`

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| **id** | SERIAL / INT | No | Primary key |
| **customer_profile_id** | INT | No | FK → customers_profile_data.id (unique, one entity KYC per customer) |
| **entity_type** | ENUM | No | CORPORATE \| LLP \| TRUST \| HUF \| PARTNERSHIP_FIRM |
| | | | |
| **Entity details** | | | |
| entity_name | VARCHAR | No | Legal name of entity |
| pan_number | VARCHAR(10) | Yes | PAN of entity |
| pan_copy_file_url | VARCHAR | Yes | PAN document URL |
| cin_or_registration_number | VARCHAR | Yes | CIN / LLPIN / registration number |
| date_of_incorporation | TIMESTAMPTZ | Yes | Date of incorporation / registration |
| place_of_incorporation | VARCHAR | Yes | Place of incorporation |
| country_of_incorporation | VARCHAR | Yes | Country |
| date_of_commencement_of_business | TIMESTAMPTZ | Yes | Commencement date (if applicable) |
| entity_constitution_type | ENUM | Yes | PRIVATE_LIMITED, PUBLIC_LIMITED, OPC, LLP, PARTNERSHIP, TRUST, OTHER (for CORPORATE sub-type) |
| other_constitution_type | VARCHAR | Yes | When entity_constitution_type = OTHER |
| | | | |
| **Correspondence address** | | | |
| correspondence_full_address | VARCHAR | Yes | Full address single line |
| correspondence_line1 | VARCHAR | Yes | |
| correspondence_line2 | VARCHAR | Yes | |
| correspondence_city | VARCHAR | Yes | |
| correspondence_district | VARCHAR | Yes | |
| correspondence_state | VARCHAR | Yes | |
| correspondence_pin_code | VARCHAR | Yes | |
| | | | |
| **Documents (URLs)** | | | |
| certificate_of_incorporation_url | VARCHAR | Yes | |
| memorandum_copy_url | VARCHAR | Yes | |
| articles_of_association_url | VARCHAR | Yes | |
| board_resolution_copy_url | VARCHAR | Yes | |
| gst_number | VARCHAR | Yes | |
| gst_copy_url | VARCHAR | Yes | |
| balance_sheet_copy_url | VARCHAR | Yes | |
| share_holding_pattern_copy_url | VARCHAR | Yes | |
| client_master_holding_copy_url | VARCHAR | Yes | |
| certificate_of_commencement_of_biz_url | VARCHAR | Yes | |
| directors_list_copy_url | VARCHAR | Yes | |
| power_of_attorney_copy_url | VARCHAR | Yes | |
| documents_type | VARCHAR | Yes | Free text for other doc types |
| annual_income | VARCHAR | Yes | Annual income (text) |
| | | | |
| **FATCA** | | | |
| fatca_applicable | BOOLEAN | No | Default false |
| fatca_entity_name | VARCHAR | Yes | |
| fatca_country_of_incorporation | VARCHAR | Yes | |
| fatca_entity_type | ENUM | Yes | ACTIVE_NFE, PASSIVE_NFE, FINANCIAL_INSTITUTION |
| fatca_classification | VARCHAR | Yes | |
| giin | VARCHAR | Yes | Global Intermediary Identification Number |
| tax_residency_of_entity | VARCHAR | Yes | |
| declaration_by_authorised_signatory | BOOLEAN | No | Default false |
| | | | |
| **Type-specific (variable) data** | | | |
| entity_specific_data | JSONB | Yes | See section 2 below |
| | | | |
| **Audit** | | | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

**Indexes (suggested):**
- `PRIMARY KEY (id)`
- `UNIQUE (customer_profile_id)`
- `INDEX (entity_type)`
- `GIN (entity_specific_data)` — optional, for JSON queries

---

## 2. Child Tables (unchanged concept, new FK to `entity_kyc`)

### 2.1 `entity_kyc_bank_accounts`

| Column | Type | Nullable |
|--------|------|----------|
| id | SERIAL | No |
| entity_kyc_id | INT | No (FK → entity_kyc.id, ON DELETE CASCADE) |
| account_holder_name | VARCHAR | No |
| account_number | VARCHAR | No |
| bank_name | VARCHAR | No |
| ifsc_code | VARCHAR | No |
| branch | VARCHAR | Yes |
| bank_proof_file_urls | JSONB | Yes (array of URLs) |
| is_primary_account | BOOLEAN | No (default false) |
| created_at | TIMESTAMPTZ | No |
| updated_at | TIMESTAMPTZ | No |

### 2.2 `entity_kyc_demat_accounts`

| Column | Type | Nullable |
|--------|------|----------|
| id | SERIAL | No |
| entity_kyc_id | INT | No (FK → entity_kyc.id, ON DELETE CASCADE) |
| depository | ENUM (NSDL, CDSL) | No |
| account_type | VARCHAR | Yes (SOLO, JOINT, CORPORATE) |
| dp_id | VARCHAR | No |
| client_id | VARCHAR | No |
| account_holder_name | VARCHAR | No |
| demat_proof_file_url | VARCHAR | Yes |
| is_primary | BOOLEAN | No (default false) |
| created_at | TIMESTAMPTZ | No |
| updated_at | TIMESTAMPTZ | No |

---

## 3. `entity_specific_data` JSONB — Shape by Entity Type

Stored in column **entity_specific_data**. Validate in application (e.g. Zod) per `entity_type`.

### CORPORATE

```json
{
  "directors": [
    { "fullName": "", "pan": "", "designation": "", "din": "", "email": "", "mobile": "" }
  ],
  "promoters": [
    { "fullName": "", "pan": "", "designation": "", "din": "", "email": "", "mobile": "" }
  ],
  "authorisedSignatories": [
    { "fullName": "", "pan": "", "designation": "", "din": "", "email": "", "mobile": "" }
  ]
}
```

### LLP

```json
{
  "partners": [
    { "fullName": "", "pan": "", "designation": "", "email": "", "mobile": "" }
  ],
  "designatedPartners": [
    { "fullName": "", "pan": "", "designation": "", "email": "", "mobile": "" }
  ]
}
```

### TRUST

```json
{
  "settlor": { "fullName": "", "pan": "", "relationship": "" },
  "trustees": [
    { "fullName": "", "pan": "", "designation": "", "email": "", "mobile": "" }
  ],
  "beneficiaries": [
    { "fullName": "", "relationship": "", "shareOrDescription": "" }
  ]
}
```

### HUF

```json
{
  "karta": { "fullName": "", "pan": "", "dateOfBirth": "", "email": "", "mobile": "" },
  "members": [
    { "fullName": "", "relationshipWithKarta": "", "pan": "" }
  ]
}
```

### PARTNERSHIP_FIRM

```json
{
  "partners": [
    { "fullName": "", "pan": "", "designation": "", "email": "", "mobile": "", "profitSharePercent": "" }
  ]
}
```

---

## 4. Relationship Diagram

```
CustomerProfileDataModel (1) ────── (1) EntityKycModel
                                            │
                                            ├── (many) EntityKycBankAccountModel
                                            └── (many) EntityKycDematAccountModel
```

- **Individual / NRI:** No row in `entity_kyc`; they use existing profile + personal info + aadhaar + pan + address + bank + demat.
- **Corporate / LLP / Trust / HUF / Partnership:** One row per customer in `entity_kyc` with `entity_type` and `entity_specific_data` filled as above.

---

## 5. Enum Additions

**New enum (if not reusing existing):**

- `EntityKycType`: CORPORATE | LLP | TRUST | HUF | PARTNERSHIP_FIRM

Existing enums **EntityConstitutionType** and **CorporateEntityType** (FATCA) remain for use in the main table columns where applicable.
