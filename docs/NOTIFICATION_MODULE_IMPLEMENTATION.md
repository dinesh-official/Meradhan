# CRM Notification Module — Implementation Specification

**Status:** Draft (architecture)  
**Owner:** Engineering  
**Scope:** Backend (`backend/`), CRM frontend (`frontend/crm/`), Postgres (Prisma)

---

## 1. Requirement summary

### 1.1 Navigation

- Add a top-level menu **Notifications** with two sub-items:
  - **Customer List** — natural-language query → customer results → optional save as a named list.
  - **Send notification** — choose a saved list, compose message, choose **notification medium** (UI: SMS + WhatsApp; **phase 1: SMS only**).

### 1.2 Customer List screen

- **Input:** Plain-English text describing which customers to fetch, e.g.  
  `Get me the list of customers whose name start with 'A'`.
- **Processing:**
  - Send text to **OpenAI API** with a constrained prompt.
  - Model output is turned into a **read-only SQL** query targeting **`customers_profile_data`** (and only approved patterns — see §4).
  - Execute query and return **customer rows as JSON** for the grid.
- **Output:** Tabular list on the page.
- **Save:** User can **persist** the current result set under a **user-defined name** (new DB entities — see §3).

### 1.3 Send notification screen

- **Saved list** dropdown (data from new tables).
- **DLT / MSG91 template + variables** (not free-form copy): user selects a **registered template** (and fills **variable placeholders** as required by that template). UX may combine a template dropdown + dynamic fields per template, or a fixed set of env-configured templates.
- **Notification medium** dropdown directly under the list: `SMS` | `WhatsApp` — **only SMS enabled** in phase 1 (WhatsApp disabled or hidden).

### 1.4 Send action

- On **Send message**, dispatch SMS via **MSG91** using the **approved DLT template** and **variable map**; send to **all customers** in the selected list whose **`customers_profile_data.phoneNo`** is present and valid (single source of truth for SMS — do not use auth table for this flow).
- Record **logs** (see §3), including template identifier and resolved variable payload as needed for audit.

### 1.5 Logging

- Persist rows in **`notification_logs`** (name as specified; exact columns in §3) including at minimum:
  - Notification medium  
  - **DLT template id / template key** + **variable values** (and optional derived full text for audit if provider returns it)  
  - Date/time  
  - Delivery status (aggregate and/or per-recipient — see §3)

### 1.6 Customer-scoped log UI

- In the **Customers** section, under row **actions**, add **Notification logs**.
- Opens a **modal / thickbox-style dialog** listing **notifications relevant to that customer** (sent campaigns that included this customer).

---

## 2. Additional database tables

Prisma models should live in `backend/databases/postgres/prisma/schema/` (new file e.g. `notification.prisma` or append to an existing module file) and map to snake_case table names consistent with the codebase.

### 2.1 `crm_notification_saved_lists`

Stores a **named list** created by a CRM user from the Customer List screen.

| Column | Type | Notes |
|--------|------|--------|
| `id` | PK | |
| `name` | String | User-visible name (unique per `created_by` recommended) |
| `created_by` | FK → CRM user | |
| `created_at` / `updated_at` | DateTime | |
| `source_prompt` | Text? | Optional: last plain-English query used to build the list (audit) |
| `is_active` | Boolean | Soft-delete or archive |

**Members:** Prefer normalization for referential integrity:

### 2.2 `crm_notification_saved_list_members`

| Column | Type | Notes |
|--------|------|--------|
| `id` | PK | |
| `saved_list_id` | FK | |
| `customer_profile_id` | FK → `customers_profile_data.id` | |
| `added_at` | DateTime | |

Unique constraint: `(saved_list_id, customer_profile_id)`.

*Alternative:* store JSON array of IDs on the list row — faster to implement but weaker integrity and harder to index; **not recommended** for production CRM.

### 2.3 `notification_logs` (broadcast / campaign header)

One row **per send action** (button click).

| Column | Type | Notes |
|--------|------|--------|
| `id` | PK | |
| `saved_list_id` | FK? | Nullable if future “ad-hoc” sends exist |
| `medium` | Enum | `SMS`, `WHATSAPP` (extensible) |
| `dlt_template_id` | String | Registered template id (MSG91 / DLT) |
| `template_variables` | Json | Key-value map sent to provider (e.g. `{{var1}}` bindings) |
| `message_preview` | Text? | Optional human-readable preview for logs / UI |
| `sent_by` | FK → CRM user | |
| `sent_at` | DateTime | Server time |
| `delivery_status` | Enum | e.g. `PENDING`, `PROCESSING`, `COMPLETED`, `PARTIAL_FAILURE`, `FAILED` — **aggregate** for the batch |
| `provider_batch_id` | String? | MSG91 request/job id if available |
| `meta` | Json? | Counts: `{ "total": n, "sent": x, "failed": y }`, errors summary |

### 2.4 `notification_recipient_logs` (recommended)

Per-recipient status satisfies **“delivery status”** in audit and powers the **per-customer** modal.

| Column | Type | Notes |
|--------|------|--------|
| `id` | PK | |
| `notification_log_id` | FK → `notification_logs` | |
| `customer_profile_id` | FK | |
| `phone` | String | Snapshot at send time |
| `delivery_status` | Enum | `PENDING`, `SENT`, `DELIVERED`, `FAILED`, `INVALID_NUMBER` |
| `provider_message_id` | String? | MSG91 message id if returned |
| `error_code` / `error_message` | String? | |
| `updated_at` | DateTime | |

If product insists on **exactly one table**, merge recipient fields into `notification_logs` and accept one row per recipient (no batch header) — reporting becomes harder; **two-level model is preferred**.

---

## 3. Backend APIs (REST, CRM-authenticated)

Base path suggestion: `/api/crm/notifications` (align with existing `crm` routers in `backend/main.ts`).

| # | Method | Path | Purpose |
|---|--------|------|---------|
| 1 | `POST` | `/api/crm/notifications/query-customers` | Body: `{ "prompt": string }`. Returns `{ "sql": string (debug/staging only), "rows": CustomerRow[] }` or error. **Production may omit echoing SQL.** |
| 2 | `POST` | `/api/crm/notifications/saved-lists` | Body: `{ "name": string, "customerProfileIds": number[] }`. Creates saved list + members. |
| 3 | `GET` | `/api/crm/notifications/saved-lists` | List saved lists for current user (or tenant), pagination optional. |
| 4 | `GET` | `/api/crm/notifications/saved-lists/:id` | Detail including member IDs or paginated members. |
| 5 | `PATCH` | `/api/crm/notifications/saved-lists/:id` | Rename / archive (optional). |
| 6 | `DELETE` | `/api/crm/notifications/saved-lists/:id` | Soft-delete (optional). |
| 7 | `POST` | `/api/crm/notifications/send` | Body: `{ "savedListId": number, "medium": "SMS" \| "WHATSAPP", "dltTemplateId": string, "templateVariables": Record<string, string> }`. Validates medium (SMS only in phase 1); resolves phones from `phoneNo`; calls MSG91 template API; creates `notification_logs` + `notification_recipient_logs`. |
| 8 | `GET` | `/api/crm/notifications/sms-templates` | Optional: list selectable DLT templates (from config or MSG91) for the Send screen. |
| 9 | `GET` | `/api/crm/notifications/logs` | Paginated broadcast logs (filters: date range, medium, status). |
| 10 | `GET` | `/api/crm/customers/:customerProfileId/notification-logs` | Logs where recipient = customer (for modal). Alternative: `/api/crm/notifications/logs?customerId=` |

**Auth:** CRM session required. **Role gate:** only **`SALES`**, **`ADMIN`**, and **`SUPER_ADMIN`** may call notification APIs (see §5.1). Implement via dedicated middleware or explicit role check after `allowAccessMiddleware("CRM", ...)`.

**Validation:** Zod schemas in `@root/schema` for all payloads.

**OpenAI:** Server-side only; `OPENAI_API_KEY` in env (`packages/config`).

**MSG91:** Extend beyond current `SMSCommunication.sendMsg91` (OTP **flow** API). Bulk DLT sends typically use **template id + variables** per MSG91’s SMS API for your registered templates — implement a dedicated `sendBulkSmsDlt` (or similar) aligned with MSG91 docs for template sends.

---

## 4. Natural language → SQL — architecture guardrails

**Risk:** LLM-generated SQL can be unsafe or wrong.

**Recommended approach:**

1. **Schema prompt:** Inject **only** `customers_profile_data` column list + types (from Prisma / hand-curated allowlist). **Phone for downstream SMS is `phoneNo` on this table** — NL queries do not need `customers_auth_data` for mobile resolution.
2. **Post-generation validation:**
   - Reject unless statement is a single **`SELECT`**.
   - Block keywords: `INSERT`, `UPDATE`, `DELETE`, `DROP`, `;` chaining, comments, etc.
   - Optional: allowlist of column names.
3. **Execution:** Run with **read-only** DB role or Prisma `$queryRaw` inside a transaction that cannot mutate (or use a dedicated read replica).
4. **Fallback:** If validation fails, return a friendly error and do not execute.

---

## 5. Decisions (locked)

### 5.1 Access control — roles (not a separate permission module)

| Decision | Detail |
|----------|--------|
| **Who may use Notifications** | CRM roles **`SALES`**, **`ADMIN`**, and **`SUPER_ADMIN`** only — for **Customer List**, **Send notification**, and **Notification logs** on the customer row. |
| **Implementation** | **Backend:** Reject with `403` if `req.session.role` is not one of `SALES`, `ADMIN`, `SUPER_ADMIN`. **Frontend:** Show Notifications nav items and customer action only when the logged-in user’s role is in that set (derive from session / same source as other CRM role checks). |
| **Note** | Does **not** require a new `notifications` module in `role.constants.ts` unless you later want finer-grained sub-actions; **role allowlist is sufficient** for v1. |

### 5.2 DLT / MSG91

| Decision | Detail |
|----------|--------|
| **Messaging model** | **Template + variables** (DLT-registered templates), not free-form body text. |
| **UX** | Template selector + inputs for template variables; backend sends `dltTemplateId` + `templateVariables` to MSG91. |

### 5.3 Phone number for SMS

| Decision | Detail |
|----------|--------|
| **Canonical field** | **`customers_profile_data.phoneNo`** for resolving recipients and logging snapshot. |

### 5.4 Remaining open questions (product / ops)

1. **WhatsApp:** Future provider (Meta Cloud API vs third party)? Out of scope for phase 1; `medium` enum reserved.
2. **Consent:** Should sends filter by **marketing opt-in** (e.g. `whatsAppNotificationAllow` or a dedicated SMS flag) on profile/auth?
3. **Rate limits:** Max recipients per send, daily org cap, OpenAI token budget.
4. **PII in logs:** Retention / redaction policy for `template_variables` and `message_preview`.

---

## 6. Frontend implementation plan (`frontend/crm`)

### 6.1 Navigation

- Update `src/global/constants/navlinks.constants.ts`:
  - Add **Notifications** with `children`: **Customer List** → `/dashboard/notifications/customer-list`, **Send notification** → `/dashboard/notifications/send`.
- **Visibility:** Gate the whole **Notifications** block (and **Notification logs** customer action) for roles **`SALES`**, **`ADMIN`**, **`SUPER_ADMIN`** only — use a small helper (e.g. `canAccessNotifications(role)`) or conditional `allowOnly` pattern consistent with the app; **no new permission module required** for v1 (see §5.1).

### 6.2 Routes & pages (App Router)

| Route | Purpose |
|-------|---------|
| `/dashboard/notifications/customer-list` | Textarea + submit → table + “Save list” (name modal) + export optional |
| `/dashboard/notifications/send` | Dropdown (saved lists) + medium + **template + variable fields** + Send |

Use existing UI primitives (shadcn/Radix), TanStack Query for mutations, toast feedback.

### 6.3 API integration

- Server actions or route handlers calling backend via existing `apiServerCaller` / rewrites (`/api/server/...`) — follow patterns used by other CRM dashboard pages.
- Types from `@root/apiGateway` / schema package after endpoints are defined.

### 6.4 Customer list — “Notification logs” action

- Extend `CustomerTableActions.tsx` (or shared actions component): new item **Notification logs**.
- Opens **Dialog** (thickbox-style = large modal) listing entries from `GET .../notification-logs` (§3), columns: date/time, medium, template id / variable summary, delivery status (per campaign or per recipient row).

### 6.5 UX details

- Loading states for NL query (OpenAI + SQL can be slow).
- Confirm dialog before bulk send with recipient **count** and **template summary**.
- Disable WhatsApp option or show “Coming soon”.
- Validate **`phoneNo`** presence for each row before counting as sendable; show how many excluded (missing/invalid mobile).

---

## 7. Implementation phases

| Phase | Deliverable |
|-------|-------------|
| **P0** | Prisma migrations + tables; CRM routes + middleware; saved list CRUD; NL→SQL service with validation; query endpoint |
| **P1** | Send SMS via MSG91 **DLT template + variables**; broadcast + recipient logs |
| **P2** | Customer modal + list logs API; admin log viewer page optional |
| **P3** | WhatsApp medium; retries; webhooks from MSG91 for delivery receipts |

---

## 8. Environment variables (additions)

| Variable | Purpose |
|----------|---------|
| `OPENAI_API_KEY` | NL → SQL |
| `OPENAI_MODEL` | e.g. `gpt-4.1-mini` (cost/latency tradeoff) |
| `MSG91_AUTH_KEY` | Existing — reuse for template SMS API |
| `MSG91_DLT_SENDER_ID` or template config | As required by MSG91 for DLT template sends (align with `packages/config`) |
| Optional JSON / multi-env | Map of **template id → variable schema** for UI validation (labels, required keys) |

---

## 9. References in repo

- Customer table: `CustomerProfileDataModel` → `@@map("customers_profile_data")` in `backend/databases/postgres/prisma/schema/customer.prisma`.
- MSG91 (current OTP flow): `backend/src/communication/sms_communication.ts`.
- Env validation: `packages/config/src/env.ts`.
- CRM menu pattern: `frontend/crm/src/global/constants/navlinks.constants.ts`.

---

*End of document.*
