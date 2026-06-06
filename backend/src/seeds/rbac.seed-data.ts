/** RBAC seed inventory — mirrors docs/rbac-technical-spec.md §3 */

export const RBAC_BUILTIN_ROLES = [
  {
    key: "SUPER_ADMIN",
    label: "Super Admin",
    description: "Full access to all actions",
    isSuperAdmin: true,
    isSystem: true,
  },
  {
    key: "ADMIN",
    label: "Admin",
    description: "Administrative access",
    isSuperAdmin: false,
    isSystem: true,
  },
  {
    key: "SALES",
    label: "Sales",
    isSuperAdmin: false,
    isSystem: true,
  },
  {
    key: "SUPPORT",
    label: "Support",
    isSuperAdmin: false,
    isSystem: true,
  },
  {
    key: "RELATIONSHIP_MANAGER",
    label: "Relationship Manager",
    isSuperAdmin: false,
    isSystem: true,
  },
  {
    key: "VIEWER",
    label: "Viewer",
    isSuperAdmin: false,
    isSystem: true,
  },
] as const;

const ALL = [
  "VIEWER",
  "SALES",
  "RELATIONSHIP_MANAGER",
  "SUPPORT",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type RbacSeedAction = {
  key: string;
  label: string;
  isGlobal?: boolean;
  /** Role keys granted by default */
  defaultRoles: readonly string[];
};

export type RbacSeedModule = {
  key: string;
  label: string;
  actions: RbacSeedAction[];
};

export const RBAC_SEED_MODULES: RbacSeedModule[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    actions: [
      { key: "dashboard.view", label: "View dashboard", defaultRoles: ALL },
    ],
  },
  {
    key: "leads",
    label: "Leads",
    actions: [
      {
        key: "leads.view",
        label: "View leads",
        defaultRoles: ["SALES", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "leads.create",
        label: "Create lead",
        defaultRoles: ["SALES", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "leads.edit",
        label: "Edit lead",
        defaultRoles: ["SALES", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "leads.delete",
        label: "Delete lead",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "customers",
    label: "Customers",
    actions: [
      {
        key: "customers.view",
        label: "View customers",
        defaultRoles: [
          "SALES",
          "RELATIONSHIP_MANAGER",
          "SUPPORT",
          "ADMIN",
          "SUPER_ADMIN",
        ],
      },
      {
        key: "customers.create",
        label: "Create customer",
        defaultRoles: ["SALES", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "customers.edit",
        label: "Edit customer",
        defaultRoles: [
          "SALES",
          "RELATIONSHIP_MANAGER",
          "ADMIN",
          "SUPER_ADMIN",
        ],
      },
      {
        key: "customers.delete",
        label: "Delete customer",
        defaultRoles: ["SUPER_ADMIN"],
      },
      {
        key: "customers.kyc.view",
        label: "View customer KYC",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "customers.kyc.edit",
        label: "Edit customer KYC (manual)",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "kyc",
    label: "KYC",
    actions: [
      {
        key: "kyc.view",
        label: "View KYC data",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "kyc.corporate.view",
        label: "View corporate KYC",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "kyc.corporate.edit",
        label: "Edit corporate KYC",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "bonds",
    label: "Bonds",
    actions: [
      { key: "bonds.view", label: "View bonds list", defaultRoles: ALL },
      {
        key: "bonds.create",
        label: "Create bond",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bonds.edit",
        label: "Edit bond",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bonds.auto_update.view",
        label: "View auto-update",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bonds.priced_list.view",
        label: "View consolidated management",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bonds.reference_data.view",
        label: "View reference data",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bonds.reference_data.upload",
        label: "Upload reference data XLSX",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bonds.margins.view",
        label: "View margin management",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bonds.margins.create",
        label: "Create bond margin",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bonds.margins.edit",
        label: "Edit bond margin",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bonds.margins.delete",
        label: "Delete bond margin",
        defaultRoles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "orders",
    label: "Orders",
    actions: [
      {
        key: "orders.view",
        label: "View orders",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "orders.create",
        label: "Create order",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "orders.edit",
        label: "Edit order / PG management",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "orders.delete",
        label: "Delete order",
        defaultRoles: ["SUPER_ADMIN"],
      },
      {
        key: "orders.inventory.view",
        label: "View inventory stock",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "orders.inventory.edit",
        label: "Edit inventory",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "orders.inventory.delete",
        label: "Delete inventory item",
        defaultRoles: ["SUPER_ADMIN"],
      },
      {
        key: "orders.reports.view",
        label: "View order reports",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "rfqs",
    label: "RFQs",
    actions: [
      {
        key: "rfqs.view",
        label: "View RFQ overview",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "rfqs.manage",
        label: "Manage NSE RFQs",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "rfqs.deals.view",
        label: "View deal book",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "rfqs.settle_orders.view",
        label: "View settle orders",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "rfqs.proposals.view",
        label: "View proposals",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "rfqs.settlement_dates.view",
        label: "View settlement dates",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "rfqs.settlement_dates.edit",
        label: "Edit settlement numbers",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "rfqs.participants.view",
        label: "View participants",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "notifications",
    label: "Notifications",
    actions: [
      {
        key: "notifications.customer_list.view",
        label: "Query customer list (NL)",
        defaultRoles: ["SALES", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "notifications.lists.view",
        label: "View notification lists",
        defaultRoles: ["SALES", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "notifications.lists.create",
        label: "Create notification list",
        defaultRoles: ["SALES", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "notifications.lists.delete",
        label: "Delete notification list",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "notifications.lists.members.remove",
        label: "Remove member from list",
        defaultRoles: ["SALES", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "notifications.send",
        label: "Send notification",
        defaultRoles: ["SALES", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "notifications.templates.view",
        label: "View templates",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "notifications.templates.create",
        label: "Create template",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "notifications.templates.edit",
        label: "Edit template",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "notifications.templates.delete",
        label: "Delete template",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "notifications.logs.view",
        label: "View notification logs",
        defaultRoles: ["SALES", "ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "support",
    label: "Support",
    actions: [
      {
        key: "support.view",
        label: "View support tickets",
        defaultRoles: ["SUPPORT", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "support.create",
        label: "Create ticket",
        defaultRoles: ["SUPPORT", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "support.edit",
        label: "Edit ticket",
        defaultRoles: ["SUPPORT", "ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    actions: [
      {
        key: "reports.view",
        label: "View reports",
        defaultRoles: [
          "SALES",
          "SUPPORT",
          "RELATIONSHIP_MANAGER",
          "ADMIN",
          "SUPER_ADMIN",
        ],
      },
    ],
  },
  {
    key: "user_management",
    label: "User Management",
    actions: [
      {
        key: "user_management.view",
        label: "View CRM users",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "user_management.create",
        label: "Create CRM user",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "user_management.edit",
        label: "Edit CRM user",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "user_management.delete",
        label: "Delete CRM user",
        defaultRoles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "audit_logs",
    label: "Audit Logs",
    actions: [
      {
        key: "audit_logs.crm.view",
        label: "View CRM audit logs",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "audit_logs.crm.delete",
        label: "Delete CRM audit logs",
        defaultRoles: ["SUPER_ADMIN"],
      },
      {
        key: "audit_logs.web.view",
        label: "View website audit logs",
        defaultRoles: ["SUPPORT", "ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "audit_logs.web.delete",
        label: "Delete website audit logs",
        defaultRoles: ["SUPER_ADMIN"],
      },
      {
        key: "audit_logs.web.analytics",
        label: "View website analytics",
        defaultRoles: ["SUPPORT", "ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "bin",
    label: "Recycle Bin",
    actions: [
      {
        key: "bin.view",
        label: "View recycle bin",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bin.restore",
        label: "Restore deleted items",
        defaultRoles: ["ADMIN", "SUPER_ADMIN"],
      },
      {
        key: "bin.purge",
        label: "Permanently delete",
        defaultRoles: ["SUPER_ADMIN"],
      },
    ],
  },
  {
    key: "system",
    label: "System",
    actions: [
      {
        key: "system.rbac.manage",
        label: "Manage role permissions",
        isGlobal: true,
        defaultRoles: ["SUPER_ADMIN"],
      },
      {
        key: "system.rbac.view",
        label: "View role permissions",
        isGlobal: true,
        defaultRoles: ["SUPER_ADMIN"],
      },
      {
        key: "system.impersonate",
        label: "Impersonate user",
        isGlobal: true,
        defaultRoles: ["SUPER_ADMIN"],
      },
    ],
  },
];
