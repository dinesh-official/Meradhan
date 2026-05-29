# Dynamic Role-Based Access Control (RBAC) — Product Specification

**Version:** 1.1  
**Date:** 2026-05-14  
**Audience:** Product managers, business stakeholders  
**Owner:** Super Admin

---

## 1. What problem does this solve?

Today, what each user role can and cannot do in the CRM is **fixed in code**. If the business decides that the Sales team should now be able to view Bond reference data, or that Relationship Managers should be able to send notifications, a developer has to make a code change and deploy it. This creates:

- Unnecessary dependency on engineering for operational decisions
- Delays when business needs change
- No visibility for non-technical stakeholders into what each role can do

This feature gives the **Super Admin** the ability to manage these access rules directly from the CRM, without any code changes.

---

## 2. What is changing?

### Today
Access rules are baked into the system. A user's role (e.g. Sales, Admin) determines what they can see and do, and that mapping cannot be changed without a code deployment.

### After this feature
Every **action** in the CRM (viewing a page, clicking a button, sending a notification, uploading a file) is registered as a named permission. The Super Admin can decide which roles are allowed to perform each action from a dedicated settings page.

Additionally, **roles themselves become configurable**. Super Admin can create new roles (e.g. "Bond Manager", "Compliance Officer"), rename existing ones, and deactivate custom roles when they are no longer needed — all without any code changes or deployments.

---

## 3. Key concepts

### Role
A category assigned to every CRM user that determines what they can access. The system starts with six built-in roles:

| Role | Typical user | Type |
|------|-------------|------|
| Viewer | Read-only observer | Built-in |
| Sales | Sales executive | Built-in |
| Relationship Manager | Client-facing RM | Built-in |
| Support | Customer support agent | Built-in |
| Admin | Team lead / operations manager | Built-in |
| Super Admin | System owner / IT admin | Built-in (protected) |

**Roles are now dynamic.** Super Admin can create new roles (e.g. "Bond Manager", "Compliance Officer") and assign permissions to them. Built-in roles can be renamed but not deleted. Super Admin can also deactivate custom roles when they are no longer needed, as long as no users are currently assigned to them.

### Action
A specific thing a user can do in the CRM. Examples:

- View the bonds list
- Upload bond reference data (XLSX)
- Create a bond margin
- Delete a customer
- Send a notification
- View notification templates
- Manage user accounts

Actions are organised by **module** (section of the CRM). Within each module there can be multiple actions, typically View / Create / Edit / Delete and any feature-specific ones.

### Module
A logical grouping of related actions. The modules match the sections of the CRM:

| Module | What it covers |
|--------|---------------|
| Dashboard | The home/summary screen |
| Leads | Lead management |
| Customers | Customer profiles and KYC |
| Bonds | Bond listings, reference data, margins |
| Orders | Order management, inventory, PG |
| RFQ Management | NSE RFQ workflows |
| Notifications | Customer messaging, templates, logs |
| Support | Support tickets |
| Reports | Business reports |
| User Management | CRM user accounts |
| Audit Logs | Activity and session history |
| Recycle Bin | Deleted item recovery |
| System (Global) | Cross-cutting settings including RBAC itself |

---

## 4. The RBAC Management page

Located under **Administration → Role Permissions** in the CRM sidebar. Visible and editable only by **Super Admin**.

### How it works — step by step

#### Step 1: Browse by module
Use the module tabs at the top to navigate to the area of the CRM you want to adjust (e.g. "Bonds").

#### Step 2: See all actions and who has them
Each action in the module is listed as a row. The **"Granted to"** column shows which roles currently have that action as compact badges. If no role has the action, it shows a dash.

```
[ Dashboard ][ Leads ][ Customers ][ Bonds ][ Notifications ][ Orders ][ ... ]

Module: Bonds

│ Action                    Granted to                          │
├───────────────────────────────────────────────────────────────┤
│ bonds.view                [Viewer][Sales][RM][Support][Admin]  ✎ Edit │
│ bonds.reference_data.upload  [Admin]                          ✎ Edit │
│ bonds.margins.view        [Admin]                             ✎ Edit │
│ bonds.margins.create      [Admin]                             ✎ Edit │
│ bonds.margins.edit        [Admin]                             ✎ Edit │
│ bonds.margins.delete      —                                   ✎ Edit │
├───────────────────────────────────────────────────────────────┤
│ + Add new action                                                      │
```

#### Step 3: Edit who has an action
Click **✎ Edit** on any action row. A small popover opens with a checkbox for every role. Tick or untick the roles you want to grant or remove.

```
  bonds.margins.create — Create bond margin
  ┌──────────────────────────────┐
  │  ☐  Viewer                  │
  │  ☐  Sales                   │
  │  ☐  Relationship Manager    │
  │  ☐  Support                 │
  │  ☑  Admin                   │
  │  ●  Super Admin (always on) │
  │                              │
  │  [ Save ]  [ Cancel ]        │
  └──────────────────────────────┘
```

Changes are saved per action. A confirmation toast appears after each save:

> _"Permissions updated. Affected users must re-login for changes to take effect."_

#### Important: changes take effect on re-login
Permission changes are applied when a user logs in. Users who are currently logged in will continue with their existing access until they log out and log back in.

---

## 5. Managing roles

The RBAC page has a **Roles** section alongside the Permissions section. This is where Super Admin creates and manages roles.

### What it looks like

```
┌──────────────────────────────────────────────────────────────┐
│  Roles                                      [ + Add role ]   │
├───────────────────────────────────────────────────────────────┤
│  Role name              Type        Actions                   │
├───────────────────────────────────────────────────────────────┤
│  Viewer                 Built-in    ✎ Rename                  │
│  Sales                  Built-in    ✎ Rename                  │
│  Relationship Manager   Built-in    ✎ Rename                  │
│  Support                Built-in    ✎ Rename                  │
│  Admin                  Built-in    ✎ Rename                  │
│  Super Admin            Protected   —                         │
│  Bond Manager           Custom      ✎ Rename  🗑 Deactivate   │
└───────────────────────────────────────────────────────────────┘
```

### Adding a new role
Click **+ Add role**. Enter a name (e.g. "Bond Manager") and optional description. The new role is created immediately with **no permissions** — Super Admin then uses the Permissions section to assign actions to it.

Once a new role exists, it also becomes available in:
- The **User Management** page — when creating or editing a CRM user, the new role appears in the role dropdown
- The **✎ Edit popover** in the Permissions section — a checkbox for the new role appears alongside the existing roles

### Deactivating a role
Custom roles can be deactivated when no longer needed. The system will block deactivation if any users are still assigned to that role — those users must be reassigned first. Built-in roles cannot be deactivated.

---

## 7. Adding new actions

When a new feature is built and added to the CRM, the developer registers it as a new action in the system. The Super Admin then decides which roles get access to it.

The Super Admin can also manually add new actions for a module using the **+ Add new action** button at the bottom of any module's action list. This is useful for custom workflows or features that need access control before the developer wires them up.

New actions are created with **all roles set to OFF** by default. Super Admin explicitly turns them on for the relevant roles.

---

## 8. What Super Admin can and cannot do

### Can do
- Turn any action ON or OFF for any role (except Super Admin — Super Admin always has full access)
- Add new actions to any module
- Edit the label and description of any action
- **Create new roles** — e.g. "Bond Manager", "Compliance Officer"
- **Rename built-in roles** — e.g. rename "Relationship Manager" to "RM"
- **Deactivate custom roles** — when a role is no longer needed and no users are assigned to it
- See which roles have access to each action at a glance
- View a full history of permission changes in the Audit Logs

### Cannot do
- Override permissions for an individual user (access is role-level only)
- Delete built-in roles (Viewer, Sales, RM, Support, Admin) — they can only be renamed
- Remove access from Super Admin (Super Admin always retains full access as a safety net)
- Deactivate a role that still has active users assigned to it — must reassign those users first
- Change a role's internal key after it is created (only the display label can be edited)

---

## 9. Audit trail

Every permission change is recorded in the CRM Audit Logs with:
- Who made the change (Super Admin name)
- What was changed (action name, role, old value → new value)
- When it happened

This ensures full accountability and supports compliance reviews.

---

## 10. Rollout approach

The feature is delivered in phases so there is no disruption to existing users.

| Phase | What happens | User impact |
|-------|-------------|-------------|
| **Phase 1** | Action inventory created and reviewed | None — no code changes |
| **Phase 2** | Database set up with all current permissions pre-loaded | None — system behaves identically to today |
| **Phase 3** | Backend wired to read from database instead of hard-coded rules | None — same access as today |
| **Phase 4** | Frontend reads permissions from session | None — same access as today |
| **Phase 5** | RBAC Management page available to Super Admin | Super Admin can now configure permissions |
| **Phase 6** | Cache and session handling finalised | Minor: users need to re-login after permission changes |

At the end of Phase 4, the system behaves exactly as it does today — all existing access rules are preserved. Phase 5 is when Super Admin first gains the ability to make changes.

---

## 11. RBAC Management page — UI layout (detailed)

> **Design choice — Action-centric (Option A)**  
> The page is organised around **actions**, not roles. There is no role selector dropdown. Instead, each action row shows a **"Granted to"** column with role badges. Super Admin clicks ✎ Edit on any action to open a small popover with a checkbox per role. This scales to any number of roles without adding columns or requiring horizontal scrolling.

### Full screen wireframe

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Role Permissions                                                             │
│  Configure which roles can perform each action.                              │
│  Changes take effect when affected users next log in.                        │
│                                                                              │
│  Search actions: [ _________________________________ ]                       │
│                                                                              │
│  [ Dashboard ][ Leads ][ Customers ][ Bonds ][ Notifications ][ ... ][Global]│
│                                                                              │
│  Module: Bonds                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │ Action key                  Label                  Granted to          │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │ bonds.view                  View bonds list        [Viewer][Sales]     │  │
│  │                                                    [RM][Support][Admin] ✎ │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │ bonds.reference_data.upload Upload reference data  [Admin]            ✎ │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │ bonds.margins.view          View margin management [Admin]            ✎ │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │ bonds.margins.create        Create bond margin     [Admin]            ✎ │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │ bonds.margins.edit          Edit bond margin       [Admin]            ✎ │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │ bonds.margins.delete        Delete bond margin     —                  ✎ │  │
│  ├────────────────────────────────────────────────────────────────────────┤  │
│  │ + Add new action                                                       │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Edit popover (opens when ✎ is clicked)

```
  bonds.margins.create — "Create bond margin"
  ┌──────────────────────────────┐
  │  ☐  Viewer                  │
  │  ☐  Sales                   │
  │  ☐  Relationship Manager    │
  │  ☐  Support                 │
  │  ☑  Admin                   │
  │  ●  Super Admin (always on) │
  │                              │
  │  [ Save ]   [ Cancel ]       │
  └──────────────────────────────┘
```

After clicking Save, the badge list on the row updates immediately and a toast confirms: _"Permissions updated. Affected users must re-login for changes to take effect."_

### Key UI behaviours

| Behaviour | Detail |
|-----------|--------|
| **No role dropdown** | The page shows all actions and all their current role grants at once — no switching between roles to understand the full picture |
| **Action key visible** | The technical key (e.g. `bonds.margins.create`) is shown alongside the human label so developers and Super Admin share the same reference |
| **Module tabs** | One tab per module. "Global" tab at the end for system-wide actions (e.g. RBAC management itself) |
| **"Granted to" badges** | Compact role tags on each row. A dash `—` means no role has this action yet |
| **✎ Edit popover** | Opens inline next to the row; checkbox per role; Super Admin row is always checked and disabled |
| **Search** | Filters action rows across all modules by label or key |
| **+ Add new action** | Opens a dialog: module, key, label, description. All roles default to unchecked. Super Admin assigns in the same step |
| **Super Admin** | Always shown as checked and greyed out in every popover — cannot be unchecked |
| **Audit trail** | Every Save records the actor, action key, and before/after role list in the CRM Audit Logs |

---

## 12. Current default access (reference for sign-off)

> **Note:** This is a sign-off reference table for product and business stakeholders — not the UI layout.  
> It shows which roles have each action when the system goes live. Super Admin can change these at any time after launch using the RBAC Management page described in Section 9.

| Module / Action | Viewer | Sales | RM | Support | Admin | Super Admin |
|----------------|:------:|:-----:|:--:|:-------:|:-----:|:-----------:|
| **Dashboard** — View | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Leads** — View | | ✓ | | | ✓ | ✓ |
| **Leads** — Create / Edit | | ✓ | | | ✓ | ✓ |
| **Leads** — Delete | | | | | ✓ | ✓ |
| **Customers** — View | | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Customers** — Create | | ✓ | | | ✓ | ✓ |
| **Customers** — Edit | | ✓ | ✓ | | ✓ | ✓ |
| **Customers** — Delete | | | | | | ✓ |
| **Customers KYC** — View / Edit | | | | | ✓ | ✓ |
| **Bonds** — View | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Bonds** — Create / Edit | | | | | ✓ | ✓ |
| **Bonds Margins** — View / Create / Edit | | | | | ✓ | ✓ |
| **Bonds Margins** — Delete | | | | | | ✓ |
| **Bond Reference Data** — Upload | | | | | ✓ | ✓ |
| **Orders** — View / Create / Edit | | | | | ✓ | ✓ |
| **Orders** — Delete | | | | | | ✓ |
| **RFQ Management** — View / Manage | | | | | ✓ | ✓ |
| **Notifications** — Send / Lists / Logs | | ✓ | | | ✓ | ✓ |
| **Notifications** — Templates | | | | | ✓ | ✓ |
| **Support Tickets** | | | | ✓ | ✓ | ✓ |
| **Reports** — View | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **User Management** — View / Create / Edit | | | | | ✓ | ✓ |
| **User Management** — Delete | | | | | | ✓ |
| **Audit Logs** — CRM | | | | | ✓ | ✓ |
| **Audit Logs** — Web | | | | ✓ | ✓ | ✓ |
| **Recycle Bin** | | | | | ✓ | ✓ |
| **Role Permissions** — Manage | | | | | | ✓ |

---

## 13. Questions for business sign-off before development starts

1. Are there any roles in the table above where the current default access is **wrong** and should be corrected from day one?
2. Are there any **new roles** being planned that should be included in the initial inventory?
3. Should **Admin** be able to see (read-only) the RBAC page, or should it be completely hidden from everyone except Super Admin?
4. Is there a compliance or security requirement to **notify users by email** when their role's permissions change?
