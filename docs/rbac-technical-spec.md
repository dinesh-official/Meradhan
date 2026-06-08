# Dynamic RBAC — Technical Implementation Specification

**Version:** 1.2  
**Date:** 2026-05-14  
**Scope:** CRM application (`frontend/crm` + `backend`)  
**Access editor:** Super Admin only  
**Session refresh policy:** Re-login required for permission changes to take effect  
**Roles:** Dynamic — Super Admin can create, rename, and deactivate roles at runtime

---

## 1. Current state (baseline)

### 1.1 Roles

Currently **static** — defined as a Prisma enum `CrmUserROLE` in `backend/databases/postgres/prisma/schema/enums.prisma` and mirrored in `packages/apiGateway/src/core/constants/role.ts`:

```
VIEWER | SALES | RELATIONSHIP_MANAGER | SUPPORT | ADMIN | SUPER_ADMIN
```

**This will change.** Roles become a database table (`RbacRole`). The Prisma enum is removed. The existing **`crm_users.role` column is kept** — only its type changes from `CrmUserROLE` enum to `String`, with a foreign key to `RbacRole.key`.

### 1.2 How permissions are enforced today

| Layer | Mechanism | Location |
|-------|-----------|----------|
| Backend route | `allowAccessMiddleware(roles[])` | `backend/src/middlewares/auth_middleware.ts` |
| Backend route | `requireNotificationAccess` | `backend/src/middlewares/notification_access_middleware.ts` |
| Backend route | `requireTemplateAdmin` | `backend/src/middlewares/notification_template_middleware.ts` |
| Backend controller | Explicit `role === "SUPER_ADMIN"` checks | `crmusers.controller.ts`, `notification.service.ts` |
| Frontend nav | `allowOnly: Permission[]` + `roles: Role[]` on `NavItem` | `navlinks.constants.ts` |
| Frontend component | `AllowOnlyView` wrapping pages/buttons | `AllowOnlyView.tsx` via `hasOneOfPermission` |
| Frontend component | Direct `cookies.role` checks | Various view components |
| Frontend permissions map | `ROLE_PERMISSIONS[role]` static constant | `role.constants.ts` |

### 1.3 Permission string format (current)

Coarse-grained: `"view:bonds"`, `"edit:orders"`, `"delete:customer"`.

### 1.4 What changes

1. The static `ROLE_PERMISSIONS` map and hardcoded middleware role lists are replaced by a **database-driven policy table**.
2. The `CrmUserROLE` Prisma enum is replaced by a **`RbacRole` table** — roles become fully dynamic.
3. The action key format becomes fine-grained: `<module>.<area>.<verb>`.
4. `crm_users.role` **stays as the column name** — type changes from Prisma enum to `String` referencing `RbacRole.key` (no rename to `roleKey`, no new column).

---

## 2. Database schema

### New file: `backend/databases/postgres/prisma/schema/rbac.prisma`

```prisma
model RbacRole {
  id            Int              @id @default(autoincrement())
  key           String           @unique   // e.g. "SALES", "BOND_MANAGER"
  label         String                     // e.g. "Sales", "Bond Manager"
  description   String?
  isSuperAdmin  Boolean          @default(false)  // exactly one row; bypasses all checks
  isSystem      Boolean          @default(false)  // built-in roles; cannot be deleted
  isActive      Boolean          @default(true)
  policies      RbacRolePolicy[]
  users         CrmUser[]        @relation("UserRole")
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt

  @@map("rbac_roles")
}

model RbacModule {
  id          Int          @id @default(autoincrement())
  key         String       @unique   // e.g. "bonds"
  label       String                 // e.g. "Bonds"
  description String?
  isActive    Boolean      @default(true)
  actions     RbacAction[]
  createdAt   DateTime     @default(now())

  @@map("rbac_modules")
}

model RbacAction {
  id          Int              @id @default(autoincrement())
  key         String           @unique   // e.g. "bonds.margins.create"
  label       String                     // e.g. "Create bond margin"
  description String?
  isGlobal    Boolean          @default(false)
  isActive    Boolean          @default(true)
  moduleId    Int
  module      RbacModule       @relation(fields: [moduleId], references: [id])
  policies    RbacRolePolicy[]
  createdAt   DateTime         @default(now())

  @@map("rbac_actions")
}

model RbacRolePolicy {
  id          Int        @id @default(autoincrement())
  actionId    Int
  action      RbacAction @relation(fields: [actionId], references: [id])
  roleId      Int
  role        RbacRole   @relation(fields: [roleId], references: [id])
  granted     Boolean    @default(false)
  updatedById Int
  updatedBy   CrmUser    @relation(fields: [updatedById], references: [id])
  updatedAt   DateTime   @updatedAt

  @@unique([actionId, roleId])
  @@map("rbac_role_policies")
}
```

### Change to existing `CrmUser` model (`crmusers.prisma`)

The **`role` column is retained** on `crm_users`. Only the type and relation change.

```prisma
// Before
role  CrmUserROLE  @default(VIEWER)

// After — same column name, new type + FK
role      String   @default("VIEWER")   // stores RbacRole.key, e.g. "SALES"
rbacRole  RbacRole @relation("UserRole", fields: [role], references: [key])
```

> The `CrmUserROLE` enum in `enums.prisma` is **removed** after migration.  
> Migration **alters `crm_users.role` in place** from enum → `TEXT`, preserving existing values (`VIEWER`, `SALES`, etc.). No column drop or rename.

### Migration files

Two migration files in sequence:

1. `<timestamp>_rbac_tables/migration.sql` — creates `rbac_roles`, `rbac_modules`, `rbac_actions`, `rbac_role_policies` tables, seeds built-in roles, adds FK from `crm_users.role` → `rbac_roles.key`.
2. `<timestamp>_crm_user_role_enum_to_text/migration.sql` — converts `crm_users.role` column type from enum to `TEXT` in place and drops the `CrmUserROLE` enum type (column name unchanged).

---

## 3. Action key inventory (seed data)

Every action key follows the pattern `<module>.<area>.<verb>`.

### Module: `dashboard`
| Key | Label | Default roles |
|-----|-------|---------------|
| `dashboard.view` | View dashboard | ALL |

### Module: `leads`
| Key | Label | Default roles |
|-----|-------|---------------|
| `leads.view` | View leads | SALES, ADMIN, SUPER_ADMIN |
| `leads.create` | Create lead | SALES, ADMIN, SUPER_ADMIN |
| `leads.edit` | Edit lead | SALES, ADMIN, SUPER_ADMIN |
| `leads.delete` | Delete lead | ADMIN, SUPER_ADMIN |

### Module: `customers`
| Key | Label | Default roles |
|-----|-------|---------------|
| `customers.view` | View customers | SALES, RM, SUPPORT, ADMIN, SUPER_ADMIN |
| `customers.create` | Create customer | SALES, ADMIN, SUPER_ADMIN |
| `customers.edit` | Edit customer | SALES, RM, ADMIN, SUPER_ADMIN |
| `customers.delete` | Delete customer | SUPER_ADMIN |
| `customers.kyc.view` | View customer KYC | ADMIN, SUPER_ADMIN |
| `customers.kyc.edit` | Edit customer KYC (manual) | ADMIN, SUPER_ADMIN |

### Module: `kyc`
| Key | Label | Default roles |
|-----|-------|---------------|
| `kyc.view` | View KYC data | ADMIN, SUPER_ADMIN |
| `kyc.corporate.view` | View corporate KYC | ADMIN, SUPER_ADMIN |
| `kyc.corporate.edit` | Edit corporate KYC | ADMIN, SUPER_ADMIN |

### Module: `bonds`
| Key | Label | Default roles |
|-----|-------|---------------|
| `bonds.view` | View bonds list | ALL |
| `bonds.create` | Create bond | ADMIN, SUPER_ADMIN |
| `bonds.edit` | Edit bond | ADMIN, SUPER_ADMIN |
| `bonds.auto_update.view` | View auto-update | ADMIN, SUPER_ADMIN |
| `bonds.priced_list.view` | View consolidated management | ADMIN, SUPER_ADMIN |
| `bonds.reference_data.view` | View reference data | ADMIN, SUPER_ADMIN |
| `bonds.reference_data.upload` | Upload reference data XLSX | ADMIN, SUPER_ADMIN |
| `bonds.margins.view` | View margin management | ADMIN, SUPER_ADMIN |
| `bonds.margins.create` | Create bond margin | ADMIN, SUPER_ADMIN |
| `bonds.margins.edit` | Edit bond margin | ADMIN, SUPER_ADMIN |
| `bonds.margins.delete` | Delete bond margin | SUPER_ADMIN |

### Module: `orders`
| Key | Label | Default roles |
|-----|-------|---------------|
| `orders.view` | View orders | ADMIN, SUPER_ADMIN |
| `orders.create` | Create order | ADMIN, SUPER_ADMIN |
| `orders.edit` | Edit order / PG management | ADMIN, SUPER_ADMIN |
| `orders.delete` | Delete order | SUPER_ADMIN |
| `orders.inventory.view` | View inventory stock | ADMIN, SUPER_ADMIN |
| `orders.inventory.edit` | Edit inventory | ADMIN, SUPER_ADMIN |
| `orders.inventory.delete` | Delete inventory item | SUPER_ADMIN |
| `orders.reports.view` | View order reports | ADMIN, SUPER_ADMIN |

### Module: `rfqs`
| Key | Label | Default roles |
|-----|-------|---------------|
| `rfqs.view` | View RFQ overview | ADMIN, SUPER_ADMIN |
| `rfqs.manage` | Manage NSE RFQs | ADMIN, SUPER_ADMIN |
| `rfqs.deals.view` | View deal book | ADMIN, SUPER_ADMIN |
| `rfqs.settle_orders.view` | View settle orders | ADMIN, SUPER_ADMIN |
| `rfqs.proposals.view` | View proposals | ADMIN, SUPER_ADMIN |
| `rfqs.settlement_dates.view` | View settlement dates | ADMIN, SUPER_ADMIN |
| `rfqs.settlement_dates.edit` | Edit settlement numbers | ADMIN, SUPER_ADMIN |
| `rfqs.participants.view` | View participants | ADMIN, SUPER_ADMIN |

### Module: `notifications`
| Key | Label | Default roles |
|-----|-------|---------------|
| `notifications.customer_list.view` | Query customer list (NL) | SALES, ADMIN, SUPER_ADMIN |
| `notifications.lists.view` | View notification lists | SALES, ADMIN, SUPER_ADMIN |
| `notifications.lists.create` | Create notification list | SALES, ADMIN, SUPER_ADMIN |
| `notifications.lists.delete` | Delete notification list | ADMIN, SUPER_ADMIN |
| `notifications.lists.members.remove` | Remove member from list | SALES, ADMIN, SUPER_ADMIN |
| `notifications.send` | Send notification | SALES, ADMIN, SUPER_ADMIN |
| `notifications.templates.view` | View templates | ADMIN, SUPER_ADMIN |
| `notifications.templates.create` | Create template | ADMIN, SUPER_ADMIN |
| `notifications.templates.edit` | Edit template | ADMIN, SUPER_ADMIN |
| `notifications.templates.delete` | Delete template | ADMIN, SUPER_ADMIN |
| `notifications.logs.view` | View notification logs | SALES, ADMIN, SUPER_ADMIN |

### Module: `support`
| Key | Label | Default roles |
|-----|-------|---------------|
| `support.view` | View support tickets | SUPPORT, ADMIN, SUPER_ADMIN |
| `support.create` | Create ticket | SUPPORT, ADMIN, SUPER_ADMIN |
| `support.edit` | Edit ticket | SUPPORT, ADMIN, SUPER_ADMIN |

### Module: `reports`
| Key | Label | Default roles |
|-----|-------|---------------|
| `reports.view` | View reports | SALES, SUPPORT, RM, ADMIN, SUPER_ADMIN |

### Module: `user_management`
| Key | Label | Default roles |
|-----|-------|---------------|
| `user_management.view` | View CRM users | ADMIN, SUPER_ADMIN |
| `user_management.create` | Create CRM user | ADMIN, SUPER_ADMIN |
| `user_management.edit` | Edit CRM user | ADMIN, SUPER_ADMIN |
| `user_management.delete` | Delete CRM user | SUPER_ADMIN |

### Module: `audit_logs`
| Key | Label | Default roles |
|-----|-------|---------------|
| `audit_logs.crm.view` | View CRM audit logs | ADMIN, SUPER_ADMIN |
| `audit_logs.crm.delete` | Delete CRM audit logs | SUPER_ADMIN |
| `audit_logs.web.view` | View website audit logs | SUPPORT, ADMIN, SUPER_ADMIN |
| `audit_logs.web.delete` | Delete website audit logs | SUPER_ADMIN |
| `audit_logs.web.analytics` | View website analytics | SUPPORT, ADMIN, SUPER_ADMIN |

### Module: `bin`
| Key | Label | Default roles |
|-----|-------|---------------|
| `bin.view` | View recycle bin | ADMIN, SUPER_ADMIN |
| `bin.restore` | Restore deleted items | ADMIN, SUPER_ADMIN |
| `bin.purge` | Permanently delete | SUPER_ADMIN |

### Module: `system` (global)
| Key | Label | Default roles | isGlobal |
|-----|-------|---------------|----------|
| `system.rbac.manage` | Manage role permissions | SUPER_ADMIN | true |
| `system.rbac.view` | View role permissions | SUPER_ADMIN | true |

---

## 4. Backend implementation

### 4.1 Folder structure

```
backend/src/resource/crm/rbac/
  rbac.service.ts       ← RbacService (cache + policy resolver)
  rbac.controller.ts    ← Express controllers
  rbac.routes.ts        ← Route definitions

backend/src/middlewares/
  require_permission_middleware.ts   ← replaces hardcoded role arrays
```

### 4.2 `RbacService` (`rbac.service.ts`)

Roles are now dynamic strings. The cache is keyed by `roleKey: string`.

```typescript
class RbacService {
  // roleKey → Set<actionKey>
  private cache: Map<string, Set<string>> | null = null;
  // roleKey → isSuperAdmin flag
  private superAdminRoles: Set<string> | null = null;

  async loadCache(): Promise<void> {
    // Load super-admin role keys
    const superRoles = await db.dataBase.rbacRole.findMany({
      where: { isSuperAdmin: true, isActive: true },
      select: { key: true },
    });
    this.superAdminRoles = new Set(superRoles.map(r => r.key));

    // Load granted policies
    const policies = await db.dataBase.rbacRolePolicy.findMany({
      where: { granted: true, action: { isActive: true }, role: { isActive: true } },
      select: { role: { select: { key: true } }, action: { select: { key: true } } },
    });
    const map = new Map<string, Set<string>>();
    for (const p of policies) {
      if (!map.has(p.role.key)) map.set(p.role.key, new Set());
      map.get(p.role.key)!.add(p.action.key);
    }
    this.cache = map;
  }

  invalidateCache(): void {
    this.cache = null;
    this.superAdminRoles = null;
  }

  async can(roleKey: string, actionKey: string): Promise<boolean> {
    if (!this.superAdminRoles) await this.loadCache();
    if (this.superAdminRoles!.has(roleKey)) return true;   // super admin bypass
    if (!this.cache) await this.loadCache();
    return this.cache!.get(roleKey)?.has(actionKey) ?? false;
  }

  async getPermissionsForRole(roleKey: string): Promise<string[]> {
    if (!this.superAdminRoles) await this.loadCache();
    if (this.superAdminRoles!.has(roleKey)) {
      const all = await db.dataBase.rbacAction.findMany({
        where: { isActive: true }, select: { key: true },
      });
      return all.map(a => a.key);
    }
    if (!this.cache) await this.loadCache();
    return [...(this.cache!.get(roleKey) ?? [])];
  }

  async listRoles(): Promise<RbacRole[]> {
    return db.dataBase.rbacRole.findMany({
      where: { isActive: true },
      orderBy: { id: "asc" },
    });
  }
}

export const rbacService = new RbacService();   // singleton
```

### 4.3 `requirePermission` middleware

`req.session.role` is now a plain `string` (the `RbacRole.key` value), not a typed enum.

```typescript
// backend/src/middlewares/require_permission_middleware.ts
export function requirePermission(actionKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const roleKey = req.session?.role;           // string, e.g. "SALES"
    if (!roleKey) return res.status(401).json({ message: "Unauthorized" });
    const allowed = await rbacService.can(roleKey, actionKey);
    if (!allowed) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
```

**Usage in routes:**
```typescript
// Before (hardcoded)
router.post("/margins", allowAccessMiddleware(["ADMIN", "SUPER_ADMIN"]), controller.create);

// After (dynamic)
router.post("/margins", allowAccessMiddleware("CRM"), requirePermission("bonds.margins.create"), controller.create);
```

Note: `allowAccessMiddleware("CRM")` still validates the JWT and sets `req.session`. `requirePermission` handles the fine-grained action check.

### 4.4 Session endpoint change (`auth.controller.ts`)

Extend the session response to include the resolved permission keys:

```typescript
// In session controller, after loading user:
const permissions = await rbacService.getPermissionsForRole(user.role);
res.json({ responseData: { ...user, permissions } });
```

### 4.5 CRUD APIs for Super Admin

All routes prefixed `/api/crm/rbac/`, protected by `allowAccessMiddleware("CRM") + requirePermission("system.rbac.manage")`.

| Method | Path | Controller method | What |
|--------|------|-------------------|------|
**Role management**

| Method | Path | Controller method | What |
|--------|------|-------------------|------|
| `GET` | `/roles` | `listRoles` | All active roles (id, key, label, isSuperAdmin, isSystem) |
| `POST` | `/roles` | `createRole` | Create new role; key auto-uppercased; all action policies default to denied |
| `PATCH` | `/roles/:id` | `updateRole` | Edit label / description (key is immutable after creation) |
| `DELETE` | `/roles/:id` | `deactivateRole` | Soft-delete — sets `isActive: false`; blocked if `isSystem: true` or if any users still carry that role |

**Action and policy management**

| Method | Path | Controller method | What |
|--------|------|-------------------|------|
| `GET` | `/modules` | `listModules` | All modules with action count |
| `GET` | `/modules/:moduleId/actions` | `listActions` | Actions + full grants map (all roles) per action |
| `POST` | `/actions` | `createAction` | Add new action to a module; all roles default to denied |
| `PATCH` | `/actions/:id` | `updateAction` | Edit label / description |
| `PUT` | `/actions/:id/policies` | `saveActionPolicies` | Save grants for all roles on one action; triggers `invalidateCache()` |

### 4.6 Route migration order

Migrate one module at a time. Each module migration is an isolated PR.

1. **Notifications** — replace `requireNotificationAccess` + `requireTemplateAdmin`
2. **Bonds margins** — replace `allowAccessMiddleware(["ADMIN"])`
3. **User management** — replace controller-level `SUPER_ADMIN` checks
4. **Customers / KYC** — replace route arrays and controller checks
5. **RFQs** — replace settlement-dates admin check
6. **Remaining** — all other `allowAccessMiddleware("CRM")` routes that need finer control

### 4.7 Seed script

`backend/src/seeds/rbac.seed.ts`

```typescript
// Inserts all RbacModule, RbacAction, and RbacRolePolicy rows
// from the inventory table in Section 3.
// Uses upsert — safe to run multiple times.
// Run: bun run seed:rbac
```

---

## 5. Frontend implementation

### 5.1 Session type change

```typescript
// packages/apiGateway/src/types/response.types.ts
type UserSessionDataResponse = {
  // ...existing fields
  permissions: string[];   // ← new: resolved action keys for this role
};
```

### 5.2 Permission resolution hook

```typescript
// frontend/crm/src/hooks/usePermissions.hook.ts
export function usePermissions() {
  const { cookies } = useAppCookie();
  // cookies.session.permissions is the array from session endpoint
  const permissions: string[] = cookies.session?.permissions ?? [];

  const can = useCallback((actionKey: string) => {
    if (cookies.role === "SUPER_ADMIN") return true;
    return permissions.includes(actionKey);
  }, [permissions, cookies.role]);

  const canAny = useCallback((keys: string[]) =>
    keys.some(k => can(k)), [can]);

  return { can, canAny, permissions };
}
```

### 5.3 `AllowOnlyView` migration

```tsx
// Old: reads from ROLE_PERMISSIONS static constant via hasOneOfPermission
// New: reads from session permissions via usePermissions
<AllowOnlyView actionKey="bonds.margins.create">
  <CreateMarginButton />
</AllowOnlyView>
```

The `AllowOnlyView` component is updated internally to use `usePermissions().can(actionKey)`. Existing `allowOnly` permission string usages are mapped to new action keys during migration.

### 5.4 Nav guard migration

`generateNavItemsByRole` in `role.utils.ts` changes to filter nav items by `permissions.includes(item.allowOnly)` instead of `ROLE_PERMISSIONS[role].includes(...)`.

Nav `roles: Role[]` field is removed from `NavItem` over time as all items migrate to action keys.

### 5.5 `ROLE_PERMISSIONS` constant

Not deleted — kept as a **TypeScript type reference** for compile-time checks. Its runtime usage is removed.

---

## 6. Super Admin RBAC UI

### 6.1 Route

`/dashboard/administration/rbac` — protected by `can("system.rbac.manage")`.

Two sub-sections within the page:
- **Permissions** — manage which roles can perform which actions (existing design)
- **Roles** — create, rename, and deactivate roles

### 6.2 API Gateway additions

```typescript
// packages/apiGateway/src/core/api/crm/rbac.api.ts

// Roles
listRoles()                        // returns RbacRole[]
createRole(payload: { key, label, description? })
updateRole(roleId, payload: { label?, description? })
deactivateRole(roleId)

// Actions + policies
listModules()
listActions(moduleId)              // returns actions with grants: Record<string, boolean>  (roleKey → granted)
createAction(payload: { moduleId, key, label, description? })
updateAction(actionId, payload: { label?, description? })
saveActionPolicies(actionId, grants: Record<string, boolean>)  // roleKey → granted
```

### 6.3 Page layout (Option A — action-centric)

No role selector dropdown. The page is organised by module tabs. Each action row has a **"Granted to"** column showing role badges. The Super Admin clicks ✎ to open an inline popover with a checkbox per role.

```
Search actions: [ _____________ ]

[ Module tabs: Dashboard | Customers | KYC | Bonds | RFQs | ... | Global ]

┌──────────────────────────────────────────────────────────────────────┐
│ Action key                  Label                  Granted to        │
├──────────────────────────────────────────────────────────────────────┤
│ bonds.margins.view          View bond margins      [Admin]        ✎  │
│ bonds.margins.create        Create bond margin     [Admin]        ✎  │
│ bonds.margins.edit          Edit bond margin       [Admin]        ✎  │
│ bonds.margins.delete        Delete bond margin     —              ✎  │
├──────────────────────────────────────────────────────────────────────┤
│ + Add new action                                                      │
└──────────────────────────────────────────────────────────────────────┘

  ✎ Edit popover (bonds.margins.create):
  ┌──────────────────────────────────────────┐
  │  ☐  Viewer                              │
  │  ☐  Sales                               │
  │  ☐  Relationship Manager                │
  │  ☐  Support                             │
  │  ☑  Admin                               │
  │  ☐  Bond Manager        ← dynamic role  │
  │  ●  Super Admin (always on, disabled)   │
  │  [ Save ]   [ Cancel ]                   │
  └──────────────────────────────────────────┘
  (Roles in the popover are loaded dynamically from GET /roles — 
   new roles added by Super Admin appear here automatically)
```

### 6.4 "Add new action" dialog

Fields: Module (dropdown), Action key (text — auto-prefixed with module key), Label, Description.  
On save: `POST /api/crm/rbac/actions` → new action appears in the table with all roles set to denied.

### 6.5 "Manage Roles" section (new sub-page within the RBAC page)

```
┌──────────────────────────────────────────────────────────────────┐
│  Roles                                          [ + Add role ]   │
├──────────────────────────────────────────────────────────────────┤
│  Key                  Label               Type      Actions      │
├──────────────────────────────────────────────────────────────────┤
│  VIEWER               Viewer              System    ✎            │
│  SALES                Sales               System    ✎            │
│  RELATIONSHIP_MANAGER Relationship Mgr    System    ✎            │
│  SUPPORT              Support             System    ✎            │
│  ADMIN                Admin               System    ✎            │
│  SUPER_ADMIN          Super Admin         System    (protected)  │
│  BOND_MANAGER         Bond Manager        Custom    ✎  🗑        │
└──────────────────────────────────────────────────────────────────┘
```

Rules:
- **System roles** (`isSystem: true`) — label can be edited; key and type cannot; cannot be deleted
- **Super Admin role** (`isSuperAdmin: true`) — no edit, no delete; always shown as protected
- **Custom roles** — label and description editable; can be deactivated (soft delete) only when no users are assigned that role; key is immutable after creation
- **+ Add role** — opens a dialog: Key (uppercase, e.g. `BOND_MANAGER`), Label, Description. On save, the new role immediately appears in the permissions Edit popovers with all actions denied.

### 6.6 Save behaviour

Saves are **per action** (triggered from the ✎ Edit popover, not a full-page save button):

`PUT /api/crm/rbac/actions/:actionId/policies` — body: `{ grants: { "VIEWER": false, "SALES": false, "ADMIN": true, "BOND_MANAGER": false } }`

Body keys are **role keys** (dynamic strings from `RbacRole.key`), not a fixed enum.  
Backend updates all `RbacRolePolicy` rows for that action + calls `rbacService.invalidateCache()`.  
Toast: _"Permissions updated. Affected users must re-login for changes to take effect."_  
The badge list on the action row updates immediately in the UI (optimistic update).

### 6.7 Audit trail

Every `RbacRolePolicy` row update writes `updatedById` + `updatedAt`. The existing CRM audit log surface reads these rows.

---

## 7. Cache and session lifecycle

```
Super Admin saves → DB updated → invalidateCache()
                                       ↓
Next user login  → session endpoint → rbacService.getPermissionsForRole(role)
                                       ↓ (cache miss: reloads from DB)
                 ← { permissions: [...] } embedded in session response
                                       ↓
Frontend stores permissions in cookie/context
All can() calls read from that array — no per-action DB hit
```

Active sessions that are already logged in continue with their previous permissions until they re-login. This is the agreed behaviour.

---

## 8. Non-goals (Phase 1)

- Per-user permission overrides
- Time-bound or conditional grants
- Real-time session invalidation / websocket push
- Hierarchical roles (role inheriting permissions from another role)

---

## 9. Testing strategy

Full test plan: **[rbac-test-plan.md](./rbac-test-plan.md)**

Summary:

| Gate | What | Blocker? |
|------|------|----------|
| A | DB migrations + seed smoke | Yes |
| B | **Parity:** `ROLE_PERMISSIONS` ↔ `RbacService` (automated) | **Yes — before route migration** |
| C | RbacService unit + RBAC API tests | Yes |
| D | Session `permissions[]` on login | Yes |
| E–F | Per-module API 403 + frontend nav (each migration PR) | Per PR |
| G–H | E2E role smoke + RBAC admin UI | Pre-release |
| I | UAT matrix (27 rows × 6 roles) | Pre-release |

Key policies to test explicitly:

- Super Admin bypass (`isSuperAdmin` / all actions).
- Permission changes apply only after **re-login**.
- Backend 403 and frontend visibility stay in sync.
- `crm_users.role` column unchanged; FK to `rbac_roles.key`.

---

## 10. File change summary

| File | Change type |
|------|-------------|
| `backend/databases/postgres/prisma/schema/rbac.prisma` | New (`RbacRole`, `RbacModule`, `RbacAction`, `RbacRolePolicy`) |
| `backend/databases/postgres/prisma/schema/enums.prisma` | Modified — remove `CrmUserROLE` enum |
| `backend/databases/postgres/prisma/schema/crmusers.prisma` | Modified — keep `role` column; change type from `CrmUserROLE` to `String` FK → `RbacRole.key` |
| `backend/databases/postgres/prisma/migrations/<ts>_rbac_tables/` | New |
| `backend/databases/postgres/prisma/migrations/<ts>_crm_user_role_enum_to_text/` | New — alters `crm_users.role` type in place (no column rename) |
| `backend/src/seeds/rbac.seed.ts` | New |
| `backend/src/resource/crm/rbac/rbac.service.ts` | New |
| `backend/src/resource/crm/rbac/rbac.controller.ts` | New |
| `backend/src/resource/crm/rbac/rbac.routes.ts` | New |
| `backend/src/middlewares/require_permission_middleware.ts` | New |
| `backend/src/resource/crm/auth/auth.controller.ts` | Modified — add `permissions` to session response |
| `backend/src/resource/crm/notifications/notification.routes.ts` | Modified — replace middleware |
| `backend/src/resource/crm/bonds/bond_margin.routes.ts` | Modified — replace middleware |
| *(other route files — one per migration sprint)* | Modified |
| `packages/apiGateway/src/types/response.types.ts` | Modified — add `permissions` field |
| `packages/apiGateway/src/core/api/crm/rbac.api.ts` | New |
| `frontend/crm/src/hooks/usePermissions.hook.ts` | New |
| `frontend/crm/src/global/utils/role.utils.ts` | Modified — use session permissions |
| `frontend/crm/src/global/elements/permissions/AllowOnlyView.tsx` | Modified — use `usePermissions` |
| `frontend/crm/src/global/constants/navlinks.constants.ts` | Modified — migrate to action keys |
| `frontend/crm/src/app/(presentation)/dashboard/administration/rbac/` | New page |
| `frontend/crm/src/global/constants/navlinks.constants.ts` | Modified — add RBAC nav entry |
