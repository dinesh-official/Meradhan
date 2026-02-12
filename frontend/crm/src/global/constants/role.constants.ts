import { ROLES } from "@root/apiGateway";
export type Role = (typeof ROLES)[number];
// 2️ Define all modules (controllers)
export const MODULES = [
  "dashboard",
  "leads",
  "customer",
  "customerkyc",
  "sales",
  "rfq",
  "support",
  "reports",
  "user",
  "bin",
  "webauditlogs",
  "crmauditlogs",
  "webanalytics",
  "bonds",
  "orders",
] as const;
export type ModuleName = (typeof MODULES)[number];

// 3 Define all CRUD actions
export const ACTIONS = ["view", "create", "edit", "delete"] as const;
export type Action = (typeof ACTIONS)[number];

// 4️ Generate permission strings like "view:user" | "edit:leads"
export type Permission = `${Action}:${ModuleName}`;

// 5️ Define all valid permissions
export const PERMISSIONS: Permission[] = [
  // Dashboard
  "view:dashboard",
  "edit:bonds",
  // Leads
  "view:leads",
  "create:leads",
  "edit:leads",
  "delete:leads",

  // Customer
  "view:customer",
  "create:customer",
  "edit:customer",
  "delete:customer",
  "view:customerkyc",

  // Sales
  "view:sales",
  "create:sales",
  "edit:sales",
  "delete:sales",

  // RFQ
  "view:rfq",
  "create:rfq",
  "edit:rfq",
  "delete:rfq",

  // Support
  "view:support",
  "create:support",
  "edit:support",
  "delete:support",

  // Reports
  "view:reports",
  "create:reports",
  "edit:reports",
  "delete:reports",

  // User Management
  "view:user",
  "create:user",
  "edit:user",
  "delete:user",

  // Bin
  "view:bin",
  "create:bin",
  "edit:bin",
  "delete:bin",

  // Audit Logs
  "view:webauditlogs",
  "delete:webauditlogs",
  "view:crmauditlogs",
  "delete:crmauditlogs",

  // website analytics
  "view:webanalytics",

  "view:bonds",
  "create:bonds",

  "view:orders",
  "create:orders",
  "edit:orders",
  "delete:orders",
];

// 6️ Map roles to permissions
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: PERMISSIONS.filter(
    (p) =>
      p !== "delete:customer" &&
      p !== "delete:user"
  ),

  SUPER_ADMIN: [...PERMISSIONS], // full access including KYC view and customer delete

  SALES: [
    "view:dashboard",
    "view:leads",
    "create:leads",
    "edit:leads",
    "view:customer",
    "edit:customer",
    "view:sales",
    "create:sales",
    "edit:sales",
    // "view:rfq",
    //  'create:rfq', 'edit:rfq',
    "view:reports",
    "view:bonds",
  ],

  SUPPORT: [
    "view:dashboard",
    "view:customer",
    "view:support",
    "create:support",
    "edit:support",
    "view:reports",
    "view:webanalytics",
    "view:webauditlogs",
    "view:bonds",
  ],

  RELATIONSHIP_MANAGER: [
    "view:dashboard",
    "view:customer",
    "edit:customer",
    "view:reports",
    "view:bonds",
  ],

  VIEWER: ["view:dashboard", "view:reports", "view:webanalytics", "view:bonds"],
};

export { ROLES };
