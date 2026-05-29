# Dynamic RBAC — Test Plan

**Version:** 1.0  
**Date:** 2026-05-14  
**Related:** [rbac-technical-spec.md](./rbac-technical-spec.md) · [rbac-product-spec.md](./rbac-product-spec.md)

---

## 1. Purpose

Validate that dynamic RBAC:

1. Matches **current access behaviour** on day one (parity with `ROLE_PERMISSIONS` + existing middleware).
2. Enforces permissions on **backend** (403) and **frontend** (nav + buttons hidden).
3. Allows **Super Admin** to manage roles, actions, and grants without breaking the system.
4. Applies permission changes only after **re-login** (agreed policy).

---

## 2. Scope & size

| Area | Test focus |
|------|------------|
| Database | Migrations, FK, seed idempotency |
| `RbacService` | Cache, `can()`, Super Admin bypass |
| RBAC APIs | CRUD roles/actions/policies |
| Session | `permissions[]` on login |
| Per-module routes | `requirePermission` after migration |
| Frontend | Nav, `AllowOnlyView`, direct URL |
| RBAC admin UI | Popover save, role CRUD |
| Security | Cookie tamper, unauthorized manage |

**Out of scope (phase 1):** per-user overrides, real-time session push, hierarchical roles.

---

## 3. Test environments & data

### 3.1 Test users (one per built-in role)

| User label | `crm_users.role` | Password / OTP | Notes |
|------------|------------------|----------------|-------|
| `test_viewer` | VIEWER | (staging) | Read-only persona |
| `test_sales` | SALES | | Notifications, leads |
| `test_rm` | RELATIONSHIP_MANAGER | | Customers edit |
| `test_support` | SUPPORT | | Support, web audit |
| `test_admin` | ADMIN | | Most write access |
| `test_super_admin` | SUPER_ADMIN | | Full access + RBAC UI |
| `test_bond_manager` | BOND_MANAGER | | Custom role (created in QA) |

Create `test_bond_manager` during RBAC admin UI tests; assign selected bond actions only.

### 3.2 Baseline

Before module migration PRs merge, capture **baseline API responses** (status codes) for each test user on critical endpoints. After migration, responses must match unless product signed off a change.

---

## 4. Execution order (gates)

```text
Gate A  Seed + DB migrations smoke
Gate B  Parity: ROLE_PERMISSIONS ↔ RbacService (automated) — BLOCKER
Gate C  RbacService + RBAC API tests
Gate D  Session permissions tests
Gate E  Per-module backend 403 matrix (one PR at a time)
Gate F  Frontend nav + AllowOnlyView (same PR as module)
Gate G  E2E smoke per role
Gate H  RBAC admin UI
Gate I  Full UAT matrix (§8)
```

Do **not** migrate route modules until **Gate B** passes.

---

## 5. Automated tests

### 5.1 Database & seed

| ID | Test | Expected |
|----|------|----------|
| DB-01 | Run both RBAC migrations on staging DB | Success; no data loss on `crm_users` |
| DB-02 | `crm_users.role` column name unchanged | Column still named `role` |
| DB-03 | Existing users retain role values | `SALES` stays `SALES` after enum→TEXT |
| DB-04 | FK: insert user with `role = 'INVALID'` | Fails |
| DB-05 | Run `seed:rbac` twice | Row counts unchanged (idempotent) |
| DB-06 | All 6 built-in roles in `rbac_roles` | Present, `isSystem=true` |
| DB-07 | `SUPER_ADMIN` row has `isSuperAdmin=true` | Exactly one such row |

### 5.2 Parity (critical)

Compare legacy permissions to dynamic RBAC for each role:

```typescript
// Pseudocode — implement in backend/tests/rbac-parity.test.ts
for (const role of BUILT_IN_ROLES) {
  const legacyKeys = mapLegacyPermissionsToActionKeys(ROLE_PERMISSIONS[role]);
  const dynamicKeys = await rbacService.getPermissionsForRole(role);
  expect(dynamicKeys.sort()).toEqual(legacyKeys.sort());
}
```

Document any intentional diff in this file before waiving failures.

### 5.3 RbacService unit tests

| ID | Test | Expected |
|----|------|----------|
| RS-01 | `can("SALES", "notifications.send")` | true (per seed) |
| RS-02 | `can("VIEWER", "bonds.margins.create")` | false |
| RS-03 | `can("SUPER_ADMIN", any action)` | true |
| RS-04 | After policy grant + `invalidateCache()` | `can()` reflects new value |
| RS-05 | Deactivated role | Policies not returned |
| RS-06 | Custom role with one grant | Only that action allowed |

### 5.4 RBAC API integration tests

All manage endpoints require `system.rbac.manage` (Super Admin).

| ID | Method | Path | Actor | Expected |
|----|--------|------|-------|----------|
| API-01 | GET | `/api/crm/rbac/modules` | Super Admin | 200 + modules |
| API-02 | GET | `/api/crm/rbac/modules/:id/actions` | Super Admin | 200 + grants map |
| API-03 | PUT | `/api/crm/rbac/actions/:id/policies` | Super Admin | 200; cache invalidated |
| API-04 | POST | `/api/crm/rbac/roles` | Super Admin | 201; key uppercased |
| API-05 | DELETE | `/api/crm/rbac/roles/:id` | Super Admin, system role | 403/400 |
| API-06 | DELETE | `/api/crm/rbac/roles/:id` | Super Admin, role with users | 409/blocked |
| API-07 | GET | `/api/crm/rbac/modules` | ADMIN | 403 |
| API-08 | POST | `/api/crm/rbac/actions` | Super Admin | 201; all roles denied by default |

### 5.5 Session

| ID | Test | Expected |
|----|------|----------|
| SE-01 | Login as SALES | `responseData.role === "SALES"` |
| SE-02 | Login as SALES | `permissions` includes `bonds.view`, not `bonds.margins.delete` |
| SE-03 | Login as SUPER_ADMIN | `permissions` includes all active action keys |

---

## 6. Per-module API matrix (after migration)

Run for each module when its routes use `requirePermission`.  
Legend: **Y** = 200/ success · **N** = 403 · **—** = not applicable

### 6.1 Notifications

| Action key | Endpoint (example) | VIEWER | SALES | RM | SUPPORT | ADMIN | SA |
|------------|-------------------|:------:|:-----:|:--:|:-------:|:-----:|:--:|
| `notifications.customer_list.view` | POST query-customers | N | Y | N | N | Y | Y |
| `notifications.send` | POST send | N | Y | N | N | Y | Y |
| `notifications.lists.view` | GET lists | N | Y | N | N | Y | Y |
| `notifications.templates.create` | POST templates | N | N | N | N | Y | Y |
| `notifications.templates.delete` | DELETE template | N | N | N | N | Y | Y |

### 6.2 Bonds (margins example)

| Action key | Endpoint | VIEWER | SALES | RM | SUPPORT | ADMIN | SA |
|------------|----------|:------:|:-----:|:--:|:-------:|:-----:|:--:|
| `bonds.margins.view` | GET `/api/crm/bonds/margins` | N | N | N | N | Y | Y |
| `bonds.margins.create` | POST margins | N | N | N | N | Y | Y |
| `bonds.margins.delete` | DELETE margins/:id | N | N | N | N | N | Y |
| `bonds.reference_data.upload` | POST upsert-isin | N | N | N | N | Y | Y |

### 6.3 User management

| Action key | Endpoint | VIEWER | SALES | ADMIN | SA |
|------------|----------|:------:|:-----:|:-----:|:--:|
| `user_management.view` | GET users | N | N | Y | Y |
| `user_management.create` | POST user | N | N | Y | Y |
| `user_management.delete` | DELETE user | N | N | N | Y |

*(Extend this table for customers, orders, RFQ, audit logs, bin, system.rbac.manage as each module is migrated.)*

---

## 7. Frontend tests

### 7.1 Component / unit

| ID | Test | Expected |
|----|------|----------|
| FE-01 | `usePermissions().can` with mocked session | Matches permissions array |
| FE-02 | `AllowOnlyView` child hidden when denied | No render |
| FE-03 | Nav item without permission | Not in sidebar |
| FE-04 | Super Admin | All nav items visible |

### 7.2 E2E smoke (per role)

| ID | Persona | Steps | Expected |
|----|---------|-------|----------|
| E2E-01 | VIEWER | Open dashboard, bonds list | Visible |
| E2E-02 | VIEWER | Navigate to `/dashboard/bonds/margins` | Blocked or empty state |
| E2E-03 | SALES | Notifications → Send | Page loads |
| E2E-04 | SALES | Notifications → Templates | Blocked |
| E2E-05 | ADMIN | Bonds → Reference data upload | Upload UI visible |
| E2E-06 | SA | Administration → Role Permissions | Page loads |
| E2E-07 | BOND_MANAGER | Bonds margins only | Margins OK; reference upload N |

---

## 8. UAT matrix (sign-off checklist)

Use during pre-release UAT. Mark **P** Pass · **F** Fail · **N/A** · **S** Skip.

Product default expectations from [rbac-product-spec.md §12](./rbac-product-spec.md#12-current-default-access-reference-for-sign-off).

| # | Module / area | Action (summary) | V | S | RM | Sup | A | SA | Tester | Date | Result |
|---|---------------|------------------|:-:|:-:|:-:|:---:|:--:|:-:|--------|------|--------|
| 1 | Dashboard | View | | | | | | | | | |
| 2 | Leads | View | | | | | | | | | |
| 3 | Leads | Create / Edit | | | | | | | | | |
| 4 | Leads | Delete | | | | | | | | | |
| 5 | Customers | View | | | | | | | | | |
| 6 | Customers | Create | | | | | | | | | |
| 7 | Customers | Edit | | | | | | | | | |
| 8 | Customers | Delete | | | | | | | | | |
| 9 | Customers KYC | View / Edit | | | | | | | | | |
| 10 | Bonds | View list | | | | | | | | | |
| 11 | Bonds | Create / Edit | | | | | | | | | |
| 12 | Bonds margins | View / Create / Edit | | | | | | | | | |
| 13 | Bonds margins | Delete | | | | | | | | | |
| 14 | Bonds | Reference data upload | | | | | | | | | |
| 15 | Orders | View / Create / Edit | | | | | | | | | |
| 16 | Orders | Delete | | | | | | | | | |
| 17 | RFQ | View / Manage | | | | | | | | | |
| 18 | Notifications | Send / Lists / Logs | | | | | | | | | |
| 19 | Notifications | Templates | | | | | | | | | |
| 20 | Support | Tickets | | | | | | | | | |
| 21 | Reports | View | | | | | | | | | |
| 22 | User mgmt | View / Create / Edit | | | | | | | | | |
| 23 | User mgmt | Delete | | | | | | | | | |
| 24 | Audit logs | CRM | | | | | | | | | |
| 25 | Audit logs | Web | | | | | | | | | |
| 26 | Recycle bin | View / restore | | | | | | | | | |
| 27 | RBAC | Manage permissions | | | | | | | | | |

**Expected defaults (✓ = should pass for that role):**

| Row | V | S | RM | Sup | A | SA |
|-----|:-:|:-:|:-:|:---:|:--:|:--:|
| 1, 10, 21 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 2–3, 18 | | ✓ | | | ✓ | ✓ |
| 4, 8, 13, 16, 23 | | | | | | ✓ |
| 5–7 | | ✓ | ✓/✓/— | ✓ | ✓ | ✓ |
| 9, 11–17, 19, 22, 24, 26 | | | | | ✓ | ✓ |
| 20, 25 | | | | ✓ | ✓ | ✓ |
| 27 | | | | | | ✓ |

---

## 9. RBAC admin UI tests

| ID | Test | Expected |
|----|------|----------|
| UI-01 | Open `/dashboard/administration/rbac` as SA | Page loads |
| UI-02 | Open same as ADMIN | Hidden or 403 |
| UI-03 | Switch module tab | Action list updates |
| UI-04 | ✎ Edit → toggle ADMIN on action → Save | Badge shows `[Admin]` |
| UI-05 | + Add role `QA_TEST` | Appears in popover, all actions off |
| UI-06 | Rename SALES label | Saved; key still `SALES` |
| UI-07 | Deactivate role with assigned user | Error; user count message |
| UI-08 | Deactivate empty custom role | Success |
| UI-09 | Save policies toast | Mentions re-login |

---

## 10. Re-login & cache behaviour

| ID | Test | Expected |
|----|------|----------|
| RL-01 | SA grants `bonds.margins.view` to SALES | Save succeeds |
| RL-02 | SALES **without** re-login | Still cannot access margins |
| RL-03 | SALES **after** logout + login | Can access margins |
| RL-04 | SA revokes grant; SALES still logged in | Old access until re-login |

---

## 11. Security tests

| ID | Test | Expected |
|----|------|----------|
| SEC-01 | Tamper `role` cookie; valid JWT | Middleware rejects / redirect logout |
| SEC-02 | Call migrated API without token | 401 |
| SEC-03 | VIEWER calls `PUT .../policies` | 403 |
| SEC-04 | Attempt SQLi in role key on create | 400 validation error |

---

## 12. Module migration checklist (per PR)

Copy for each migrated module (e.g. Notifications):

- [ ] Action keys registered in seed
- [ ] Routes use `requirePermission("<key>")`
- [ ] Parity test updated if new keys added
- [ ] API matrix §6 rows filled and passing
- [ ] Frontend nav `allowOnly` uses new action keys
- [ ] `AllowOnlyView` updated on module pages
- [ ] E2E smoke for SALES + ADMIN on module
- [ ] No direct `roles: ["ADMIN"]` left on nav for this module
- [ ] PR notes list any intentional behaviour change

---

## 13. Defect severity

| Severity | Definition | Example |
|----------|------------|---------|
| **S1** | Wrong user can perform destructive action | VIEWER deletes customer |
| **S2** | Wrong user blocked from required job | SALES cannot send notification |
| **S3** | UI/backend mismatch | Button visible but API 403 |
| **S4** | RBAC admin UI bug | Popover save fails silently |
| **S5** | Cosmetic / copy | Toast wording |

S1–S2 block release. S3 blocks module migration PR merge.

---

## 14. Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | | | |
| Backend Lead | | | |
| Frontend Lead | | | |
| Product | | | |

**Release criteria:** Gates A–I complete; no open S1–S2; UAT matrix ≥95% Pass on P1 rows (1–27).
