"use client";
// navbarConfig.ts
import {
  BarChart,
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
import { ModuleName, Permission } from "./role.constants";

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
    path: "/dashboard/leads",
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
            label: "Participants",
            path: "/dashboard/rfqs/nse/participants",
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
    path: "/dashboard/bonds",
    icon: FaMoneyBill,
    module: "bonds",
    allowOnly: ["view:bonds"],
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
