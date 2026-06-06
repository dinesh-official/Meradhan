-- RBAC seed data — generated from rbac.seed-data.ts
-- Safe to re-run: uses INSERT ... ON CONFLICT DO UPDATE
-- Requires: rbac tables migrated + at least one crm_users row

BEGIN;

-- ─── Roles ───────────────────────────────────────────────────────────────
INSERT INTO rbac_roles (key, label, description, "isSuperAdmin", "isSystem", "isActive", "createdAt", "updatedAt")
VALUES (
  'SUPER_ADMIN',
  'Super Admin',
  'Full access to all actions',
  true,
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  "isSuperAdmin" = EXCLUDED."isSuperAdmin",
  "isSystem" = EXCLUDED."isSystem",
  "isActive" = true,
  "updatedAt" = NOW();

INSERT INTO rbac_roles (key, label, description, "isSuperAdmin", "isSystem", "isActive", "createdAt", "updatedAt")
VALUES (
  'ADMIN',
  'Admin',
  'Administrative access',
  false,
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  "isSuperAdmin" = EXCLUDED."isSuperAdmin",
  "isSystem" = EXCLUDED."isSystem",
  "isActive" = true,
  "updatedAt" = NOW();

INSERT INTO rbac_roles (key, label, description, "isSuperAdmin", "isSystem", "isActive", "createdAt", "updatedAt")
VALUES (
  'SALES',
  'Sales',
  NULL,
  false,
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  "isSuperAdmin" = EXCLUDED."isSuperAdmin",
  "isSystem" = EXCLUDED."isSystem",
  "isActive" = true,
  "updatedAt" = NOW();

INSERT INTO rbac_roles (key, label, description, "isSuperAdmin", "isSystem", "isActive", "createdAt", "updatedAt")
VALUES (
  'SUPPORT',
  'Support',
  NULL,
  false,
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  "isSuperAdmin" = EXCLUDED."isSuperAdmin",
  "isSystem" = EXCLUDED."isSystem",
  "isActive" = true,
  "updatedAt" = NOW();

INSERT INTO rbac_roles (key, label, description, "isSuperAdmin", "isSystem", "isActive", "createdAt", "updatedAt")
VALUES (
  'RELATIONSHIP_MANAGER',
  'Relationship Manager',
  NULL,
  false,
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  "isSuperAdmin" = EXCLUDED."isSuperAdmin",
  "isSystem" = EXCLUDED."isSystem",
  "isActive" = true,
  "updatedAt" = NOW();

INSERT INTO rbac_roles (key, label, description, "isSuperAdmin", "isSystem", "isActive", "createdAt", "updatedAt")
VALUES (
  'VIEWER',
  'Viewer',
  NULL,
  false,
  true,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  "isSuperAdmin" = EXCLUDED."isSuperAdmin",
  "isSystem" = EXCLUDED."isSystem",
  "isActive" = true,
  "updatedAt" = NOW();

-- ─── Modules ─────────────────────────────────────────────────────────────
INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('dashboard', 'Dashboard', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('leads', 'Leads', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('customers', 'Customers', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('kyc', 'KYC', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('bonds', 'Bonds', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('orders', 'Orders', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('rfqs', 'RFQs', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('notifications', 'Notifications', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('support', 'Support', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('reports', 'Reports', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('user_management', 'User Management', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('audit_logs', 'Audit Logs', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('bin', 'Recycle Bin', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

INSERT INTO rbac_modules (key, label, "isActive", "createdAt")
VALUES ('system', 'System', true, NOW())
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isActive" = true;

-- ─── Actions ─────────────────────────────────────────────────────────────
INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'dashboard.view',
  'View dashboard',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'dashboard'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'leads.view',
  'View leads',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'leads'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'leads.create',
  'Create lead',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'leads'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'leads.edit',
  'Edit lead',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'leads'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'leads.delete',
  'Delete lead',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'leads'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'customers.view',
  'View customers',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'customers'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'customers.create',
  'Create customer',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'customers'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'customers.edit',
  'Edit customer',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'customers'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'customers.delete',
  'Delete customer',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'customers'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'customers.kyc.view',
  'View customer KYC',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'customers'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'customers.kyc.edit',
  'Edit customer KYC (manual)',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'customers'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'kyc.view',
  'View KYC data',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'kyc'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'kyc.corporate.view',
  'View corporate KYC',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'kyc'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'kyc.corporate.edit',
  'Edit corporate KYC',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'kyc'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.view',
  'View bonds list',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.create',
  'Create bond',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.edit',
  'Edit bond',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.auto_update.view',
  'View auto-update',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.priced_list.view',
  'View consolidated management',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.reference_data.view',
  'View reference data',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.reference_data.upload',
  'Upload reference data XLSX',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.margins.view',
  'View margin management',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.margins.create',
  'Create bond margin',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.margins.edit',
  'Edit bond margin',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bonds.margins.delete',
  'Delete bond margin',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bonds'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'orders.view',
  'View orders',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'orders'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'orders.create',
  'Create order',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'orders'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'orders.edit',
  'Edit order / PG management',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'orders'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'orders.delete',
  'Delete order',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'orders'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'orders.inventory.view',
  'View inventory stock',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'orders'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'orders.inventory.edit',
  'Edit inventory',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'orders'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'orders.inventory.delete',
  'Delete inventory item',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'orders'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'orders.reports.view',
  'View order reports',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'orders'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'rfqs.view',
  'View RFQ overview',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'rfqs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'rfqs.manage',
  'Manage NSE RFQs',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'rfqs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'rfqs.deals.view',
  'View deal book',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'rfqs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'rfqs.settle_orders.view',
  'View settle orders',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'rfqs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'rfqs.proposals.view',
  'View proposals',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'rfqs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'rfqs.settlement_dates.view',
  'View settlement dates',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'rfqs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'rfqs.settlement_dates.edit',
  'Edit settlement numbers',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'rfqs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'rfqs.participants.view',
  'View participants',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'rfqs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.customer_list.view',
  'Query customer list (NL)',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.lists.view',
  'View notification lists',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.lists.create',
  'Create notification list',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.lists.delete',
  'Delete notification list',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.lists.members.remove',
  'Remove member from list',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.send',
  'Send notification',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.templates.view',
  'View templates',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.templates.create',
  'Create template',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.templates.edit',
  'Edit template',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.templates.delete',
  'Delete template',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'notifications.logs.view',
  'View notification logs',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'notifications'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'support.view',
  'View support tickets',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'support'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'support.create',
  'Create ticket',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'support'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'support.edit',
  'Edit ticket',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'support'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'reports.view',
  'View reports',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'reports'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'user_management.view',
  'View CRM users',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'user_management'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'user_management.create',
  'Create CRM user',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'user_management'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'user_management.edit',
  'Edit CRM user',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'user_management'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'user_management.delete',
  'Delete CRM user',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'user_management'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'audit_logs.crm.view',
  'View CRM audit logs',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'audit_logs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'audit_logs.crm.delete',
  'Delete CRM audit logs',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'audit_logs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'audit_logs.web.view',
  'View website audit logs',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'audit_logs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'audit_logs.web.delete',
  'Delete website audit logs',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'audit_logs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'audit_logs.web.analytics',
  'View website analytics',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'audit_logs'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bin.view',
  'View recycle bin',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bin'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bin.restore',
  'Restore deleted items',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bin'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'bin.purge',
  'Permanently delete',
  NULL,
  false,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'bin'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'system.rbac.manage',
  'Manage role permissions',
  NULL,
  true,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'system'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'system.rbac.view',
  'View role permissions',
  NULL,
  true,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'system'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

INSERT INTO rbac_actions (key, label, description, "isGlobal", "isActive", "moduleId", "createdAt")
SELECT
  'system.impersonate',
  'Impersonate user',
  NULL,
  true,
  true,
  m.id,
  NOW()
FROM rbac_modules m
WHERE m.key = 'system'
ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  "isGlobal" = EXCLUDED."isGlobal",
  "isActive" = true,
  "moduleId" = EXCLUDED."moduleId";

-- ─── Role policies ───────────────────────────────────────────────────────
INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('VIEWER', 'SALES', 'RELATIONSHIP_MANAGER', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'dashboard.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'leads.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'leads.create'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'leads.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'leads.delete'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'RELATIONSHIP_MANAGER', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'customers.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'customers.create'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'RELATIONSHIP_MANAGER', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'customers.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'customers.delete'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'customers.kyc.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'customers.kyc.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'kyc.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'kyc.corporate.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'kyc.corporate.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('VIEWER', 'SALES', 'RELATIONSHIP_MANAGER', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.create'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.auto_update.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.priced_list.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.reference_data.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.reference_data.upload'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.margins.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.margins.create'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.margins.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bonds.margins.delete'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'orders.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'orders.create'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'orders.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'orders.delete'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'orders.inventory.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'orders.inventory.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'orders.inventory.delete'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'orders.reports.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'rfqs.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'rfqs.manage'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'rfqs.deals.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'rfqs.settle_orders.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'rfqs.proposals.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'rfqs.settlement_dates.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'rfqs.settlement_dates.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'rfqs.participants.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.customer_list.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.lists.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.lists.create'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.lists.delete'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.lists.members.remove'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.send'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.templates.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.templates.create'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.templates.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.templates.delete'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'notifications.logs.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPPORT', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'support.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPPORT', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'support.create'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPPORT', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'support.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SALES', 'SUPPORT', 'RELATIONSHIP_MANAGER', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'reports.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'user_management.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'user_management.create'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'user_management.edit'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'user_management.delete'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'audit_logs.crm.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'audit_logs.crm.delete'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPPORT', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'audit_logs.web.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'audit_logs.web.delete'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPPORT', 'ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'audit_logs.web.analytics'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bin.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('ADMIN', 'SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bin.restore'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'bin.purge'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'system.rbac.manage'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'system.rbac.view'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

INSERT INTO rbac_role_policies ("actionId", "roleId", granted, "updatedById", "updatedAt")
SELECT
  a.id,
  r.id,
  r.key IN ('SUPER_ADMIN'),
  COALESCE(
  (SELECT id FROM crm_users WHERE role = 'SUPER_ADMIN'::"CrmUserROLE" LIMIT 1),
  (SELECT id FROM crm_users ORDER BY id ASC LIMIT 1)
),
  NOW()
FROM rbac_actions a
CROSS JOIN rbac_roles r
WHERE a.key = 'system.impersonate'
ON CONFLICT ("actionId", "roleId") DO UPDATE SET
  granted = EXCLUDED.granted,
  "updatedById" = EXCLUDED."updatedById",
  "updatedAt" = EXCLUDED."updatedAt";

COMMIT;