"use client";
// navbarConfig.ts
import {
  BarChart,
  Bell,
  Briefcase,
  ClipboardList,
  HelpCircle,
  PieChart,
  Shield,
  ShoppingCart,
  Trash2,
  User,
  Users
} from "lucide-react";
import React from "react";
import { FaMoneyBill } from "react-icons/fa";
import { ModuleName, Permission, Role } from "./role.constants";

/**
 * Define the structure of nested navigation items (up to 4 levels)
 */
export interface NavItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<{ className: string; size?: number }>;
  module?: ModuleName;
  children?: NavItem[]; // nested submenus
  allowOnly?: Permission[];
  /** If set, only these CRM roles see the item (checked with allowOnly when both exist). */
  roles?: Role[];
  section?: boolean;
}

/**
 * NAV_ITEMS with 4-level nesting
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: PieChart,
    module: "dashboard",
    allowOnly: ["view:dashboard"],
  },

  {
    label: "Leads",
    icon: Users,
    allowOnly: ["view:leads"],
    // path: "/dashboard/leads",
    children: [
      {
        label: "All Leads",
        path: "/dashboard/leads",
        module: "leads",
        allowOnly: ["view:leads"],
      },
      {
        label: "Partners & Distributors",
        path: "/dashboard/leads/partnerships",
        module: "leads",
        allowOnly: ["view:leads"],
      },
    ],
  },

  {
    label: "Notifications",
    icon: Bell,
    roles: ["SALES", "ADMIN", "SUPER_ADMIN"],
    children: [
      {
        label: "Customer List",
        path: "/dashboard/notifications/customer-list",
      },
      {
        label: "Send Notification",
        path: "/dashboard/notifications/send",
      },
      {
        label: "Notification Lists",
        path: "/dashboard/notifications/lists",
      },
      {
        label: "Templates",
        path: "/dashboard/notifications/templates",
      },
      {
        label: "Logs",
        path: "/dashboard/notifications/logs",
      },
    ],
  },

  {
    label: "Customers",
    icon: User,
    allowOnly: ["view:customer"],
    path: "/dashboard/customers",
    // children: [
    //   {
    //     label: "Customers List",
    //     path: "/dashboard/customers",
    //     module: "customer",
    //     allowOnly: ["view:customer"],
    //   },
    //   {
    //     label: "Create Customer",
    //     path: "/dashboard/customers/create",
    //     module: "customer",
    //     allowOnly: ["create:customer"],
    //   },
    // ],
  },

  {
    label: "RFQ Management",
    icon: ClipboardList,
    module: "rfq",
    allowOnly: ["view:rfq"],
    children: [
      {
        label: "Overview",
        path: "/dashboard/rfqs/overview",
        module: "rfq",
        allowOnly: ["view:rfq"],
      },
      {
        label: "NSE RFQs",
        allowOnly: ["view:rfq"],
        children: [
          {
            label: "Manage RFQs",
            path: "/dashboard/rfqs/nse",
            module: "rfq",
            allowOnly: ["edit:rfq"],
          },
          {
            label: "Deal Book",
            path: "/dashboard/rfqs/nse/deals",
            module: "rfq",
            allowOnly: ["edit:rfq"],
          },
          {
            label: "Settle Orders",
            path: "/dashboard/rfqs/nse/settle-orders",
            module: "rfq",
            allowOnly: ["view:rfq"],
          },
          {
            label: "Proposal Management",
            path: "/dashboard/rfqs/nse/proposals",
            module: "rfq",
            allowOnly: ["view:rfq"],
          },
          {
            label: "Settlement Dates",
            path: "/dashboard/rfqs/nse/settlement-dates",
            module: "rfq",
            allowOnly: ["view:rfq"],
          },
          {
            label: "Participants",
            path: "/dashboard/rfqs/nse/participants",
            module: "rfq",
            allowOnly: ["view:rfq"],
          },
          {
            label: "NSE webhook notifications",
            path: "/dashboard/rfqs/nse/webhook-notifications",
            module: "rfq",
            allowOnly: ["view:rfq"],
          },
          // {
          //     label: 'Add Participant',
          //     path: '/dashboard/rfqs/nse/participants/create',
          //     module: 'rfq',
          //     allowOnly: ['create:rfq'],
          // },
        ],
      },
    ],
  },

  {
    label: "Orders",
    icon: ShoppingCart,
    module: "orders",
    allowOnly: ["view:orders", "edit:orders", "create:orders"],
    children: [
      {
        label: "View Orders",
        path: "/dashboard/orders",
        module: "orders",
        allowOnly: ["view:orders"],
      },
      {
        label: "PG Management",
        path: "/dashboard/orders/pg-management",
        module: "orders",
        allowOnly: ["view:orders"],
      },
      {
        label: "Payment Process Logs",
        path: "/dashboard/orders/payment-process-logs",
        module: "orders",
        allowOnly: ["view:orders"],
      },
      {
        label: "Inventory stock",
        path: "/dashboard/orders/inventory-stock",
        module: "orders",
        allowOnly: ["view:orders"],
      },
    ],
  },

  // {
  //   label: "Sales",
  //   icon: ShoppingCart,
  //   path: "#",
  //   module: "sales",
  //   allowOnly: ["view:sales"],
  // },

  {
    label: "Support Tickets",
    icon: HelpCircle,
    allowOnly: ["view:support"],
    children: [
      {
        label: "Manage Tickets",
        path: "#",
        module: "support",
        allowOnly: ["view:support", "edit:support", "create:support"],
      },
      {
        label: "New Ticket",
        path: "#",
        module: "support",
        allowOnly: ["create:support"],
      },
    ],
  },
  {
    label: "Bonds",
    // path: "/dashboard/bonds",
    icon: FaMoneyBill,
    module: "bonds",
    allowOnly: ["view:bonds"],
    children: [
      {
        label: "All Bonds",
        path: "/dashboard/bonds",
        module: "bonds",
        allowOnly: ["view:bonds"],
      },
      {
        label: "Auto-update (sale-ready)",
        path: "/dashboard/bonds/auto-update",
        module: "bonds",
        allowOnly: ["view:bonds"],
      },
      {
        label: "Consolidated Management",
        path: "/dashboard/bonds/priced-list",
        module: "bonds",
        allowOnly: ["view:bonds"],
      },
      {
        label: "Reference Data Management",
        path: "/dashboard/bonds/reference-data",
        module: "bonds",
        allowOnly: ["view:bonds"],
      },
      {
        label: "Margin Management",
        path: "/dashboard/bonds/margins",
        module: "bonds",
        allowOnly: ["edit:bonds"],
        roles: ["ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    label: "Reports",
    icon: BarChart,
    path: "#",
    module: "reports",
    allowOnly: ["view:reports"],
  },

  {
    label: "Administration",
    section: true,
    allowOnly: [
      "view:user",
      "create:user",
      "edit:user",
      "view:bin",
      "view:webanalytics",
      "view:webauditlogs",
    ],
  },

  {
    label: "User Management",
    icon: Briefcase,
    allowOnly: ["view:user", "create:user", "edit:user"],
    path: "/dashboard/user-management",
  },

  {
    label: "Audit Logs",
    icon: Shield,
    allowOnly: ["view:webauditlogs", "view:crmauditlogs"],
    children: [
      {
        label: "CRM Logs",
        module: "crmauditlogs",
        allowOnly: ["view:crmauditlogs"],
        children: [
          {
            label: "Activity History",
            path: "/dashboard/audit-logs/crm/logs",
            module: "crmauditlogs",
            allowOnly: ["view:crmauditlogs"],
          },
          {
            label: "Session History",
            path: "/dashboard/audit-logs/crm/authentication",
            module: "crmauditlogs",
            allowOnly: ["view:crmauditlogs"],
          },
          // {
          //     label: 'Session Analytics',
          //     path: '#',
          //     module: 'crmauditlogs',
          //     allowOnly: ['view:crmauditlogs'],
          // }
        ],
      },
      {
        label: "Website Logs",
        module: "webauditlogs",
        allowOnly: ["view:webauditlogs"],
        children: [
          {
            label: "Activity Logs",
            path: "/dashboard/audit-logs/meradhan",
            module: "webauditlogs",
            allowOnly: ["view:webauditlogs"],
          },
          {
            label: "Session Logs",
            path: "/dashboard/audit-logs/meradhan/session",
            module: "webauditlogs",
            allowOnly: ["view:webauditlogs"],
          },
        ],
      },
    ],
  },
  // {
  //     label: 'Website Analytics',
  //     path: '#',
  //     icon: Earth,
  //     module: 'bin',
  //     allowOnly: ['view:webanalytics']
  // },
  {
    label: "Recycle Bin",
    path: "/dashboard/bin",
    icon: Trash2,
    module: "bin",
    allowOnly: ["create:bin", "view:bin", "edit:bin", "delete:bin"],
  },
];
