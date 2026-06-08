"use client";
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
import { ModuleName, Role } from "./role.constants";

export interface NavItem {
  label: string;
  path?: string;
  icon?: React.ComponentType<{ className: string; size?: number }>;
  module?: ModuleName;
  children?: NavItem[];
  /** RBAC action keys — visible if user has any of these (from session permissions). */
  actionKeys?: string[];
  roles?: Role[];
  section?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: PieChart,
    module: "dashboard",
    actionKeys: ["dashboard.view"],
  },

  {
    label: "Leads",
    icon: Users,
    actionKeys: ["leads.view", "leads.create", "leads.edit"],
    children: [
      {
        label: "All Leads",
        path: "/dashboard/leads",
        module: "leads",
        actionKeys: ["leads.view"],
      },
      {
        label: "Partners & Distributors",
        path: "/dashboard/leads/partnerships",
        module: "leads",
        actionKeys: ["leads.view"],
      },
    ],
  },

  {
    label: "Notifications",
    icon: Bell,
    actionKeys: [
      "notifications.customer_list.view",
      "notifications.lists.view",
      "notifications.send",
      "notifications.templates.view",
      "notifications.logs.view",
    ],
    children: [
      {
        label: "Customer List",
        path: "/dashboard/notifications/customer-list",
        actionKeys: ["notifications.customer_list.view"],
      },
      {
        label: "Send Notification",
        path: "/dashboard/notifications/send",
        actionKeys: ["notifications.send"],
      },
      {
        label: "Notification Lists",
        path: "/dashboard/notifications/lists",
        actionKeys: ["notifications.lists.view"],
      },
      {
        label: "Templates",
        path: "/dashboard/notifications/templates",
        actionKeys: ["notifications.templates.view"],
      },
      {
        label: "Logs",
        path: "/dashboard/notifications/logs",
        actionKeys: ["notifications.logs.view"],
      },
    ],
  },

  {
    label: "Customers",
    icon: User,
    path: "/dashboard/customers",
    actionKeys: ["customers.view", "customers.create", "customers.edit"],
  },

  {
    label: "RFQ Management",
    icon: ClipboardList,
    module: "rfq",
    actionKeys: [
      "rfqs.view",
      "rfqs.manage",
      "rfqs.deals.view",
      "rfqs.settle_orders.view",
      "rfqs.proposals.view",
      "rfqs.settlement_dates.view",
      "rfqs.participants.view",
    ],
    children: [
      {
        label: "Overview",
        path: "/dashboard/rfqs/overview",
        module: "rfq",
        actionKeys: ["rfqs.view"],
      },
      {
        label: "NSE RFQs",
        actionKeys: ["rfqs.view", "rfqs.manage"],
        children: [
          {
            label: "Manage RFQs",
            path: "/dashboard/rfqs/nse",
            module: "rfq",
            actionKeys: ["rfqs.manage"],
          },
          {
            label: "Deal Book",
            path: "/dashboard/rfqs/nse/deals",
            module: "rfq",
            actionKeys: ["rfqs.deals.view"],
          },
          {
            label: "Settle Orders",
            path: "/dashboard/rfqs/nse/settle-orders",
            module: "rfq",
            actionKeys: ["rfqs.settle_orders.view"],
          },
          {
            label: "Proposal Management",
            path: "/dashboard/rfqs/nse/proposals",
            module: "rfq",
            actionKeys: ["rfqs.proposals.view"],
          },
          {
            label: "Settlement Dates",
            path: "/dashboard/rfqs/nse/settlement-dates",
            module: "rfq",
            actionKeys: ["rfqs.settlement_dates.view", "rfqs.settlement_dates.edit"],
          },
          {
            label: "Participants",
            path: "/dashboard/rfqs/nse/participants",
            module: "rfq",
            actionKeys: ["rfqs.participants.view"],
          },
          {
            label: "NSE webhook notifications",
            path: "/dashboard/rfqs/nse/webhook-notifications",
            module: "rfq",
            actionKeys: ["rfqs.view"],
          },
        ],
      },
    ],
  },

  {
    label: "Orders",
    icon: ShoppingCart,
    module: "orders",
    actionKeys: [
      "orders.view",
      "orders.create",
      "orders.edit",
      "orders.inventory.view",
      "orders.reports.view",
    ],
    children: [
      {
        label: "View Orders",
        path: "/dashboard/orders",
        module: "orders",
        actionKeys: ["orders.view"],
      },
      {
        label: "PG Management",
        path: "/dashboard/orders/pg-management",
        module: "orders",
        actionKeys: ["orders.edit"],
      },
      {
        label: "Payment Process Logs",
        path: "/dashboard/orders/payment-process-logs",
        module: "orders",
        actionKeys: ["orders.view"],
      },
      {
        label: "Draft orders",
        path: "/dashboard/orders/draft-orders",
        module: "orders",
        actionKeys: ["orders.view"],
      },
      {
        label: "Inventory stock",
        path: "/dashboard/orders/inventory-stock",
        module: "orders",
        actionKeys: ["orders.inventory.view"],
      },
      {
        label: "Order reports",
        path: "/dashboard/orders/reports",
        module: "orders",
        actionKeys: ["orders.reports.view"],
      },
    ],
  },

  {
    label: "Support Tickets",
    icon: HelpCircle,
    actionKeys: ["support.view", "support.create", "support.edit"],
    children: [
      {
        label: "Manage Tickets",
        path: "#",
        module: "support",
        actionKeys: ["support.view", "support.edit", "support.create"],
      },
      {
        label: "New Ticket",
        path: "#",
        module: "support",
        actionKeys: ["support.create"],
      },
    ],
  },

  {
    label: "Bonds",
    icon: FaMoneyBill,
    module: "bonds",
    actionKeys: [
      "bonds.view",
      "bonds.create",
      "bonds.edit",
      "bonds.auto_update.view",
      "bonds.priced_list.view",
      "bonds.reference_data.view",
      "bonds.margins.view",
    ],
    children: [
      {
        label: "All Bonds",
        path: "/dashboard/bonds",
        module: "bonds",
        actionKeys: ["bonds.view"],
      },
      {
        label: "Auto-update (sale-ready)",
        path: "/dashboard/bonds/auto-update",
        module: "bonds",
        actionKeys: ["bonds.auto_update.view"],
      },
      {
        label: "Consolidated Management",
        path: "/dashboard/bonds/priced-list",
        module: "bonds",
        actionKeys: ["bonds.priced_list.view"],
      },
      {
        label: "Reference Data Management",
        path: "/dashboard/bonds/reference-data",
        module: "bonds",
        actionKeys: ["bonds.reference_data.view"],
      },
      {
        label: "Margin Management",
        path: "/dashboard/bonds/margins",
        module: "bonds",
        actionKeys: ["bonds.margins.view"],
      },
    ],
  },

  {
    label: "Reports",
    icon: BarChart,
    path: "#",
    module: "reports",
    actionKeys: ["reports.view"],
  },

  {
    label: "Administration",
    section: true,
    actionKeys: [
      "user_management.view",
      "user_management.create",
      "user_management.edit",
      "bin.view",
      "audit_logs.web.analytics",
      "audit_logs.web.view",
      "audit_logs.crm.view",
      "system.rbac.manage",
    ],
  },

  {
    label: "User Management",
    icon: Briefcase,
    path: "/dashboard/user-management",
    actionKeys: ["user_management.view", "user_management.create", "user_management.edit"],
  },

  {
    label: "Role Permissions",
    icon: Shield,
    path: "/dashboard/administration/rbac",
    actionKeys: ["system.rbac.manage"],
  },

  {
    label: "Impersonate User",
    icon: User,
    path: "/dashboard/administration/impersonate",
    actionKeys: ["system.impersonate"],
  },

  {
    label: "Audit Logs",
    icon: Shield,
    actionKeys: ["audit_logs.web.view", "audit_logs.crm.view"],
    children: [
      {
        label: "CRM Logs",
        module: "crmauditlogs",
        actionKeys: ["audit_logs.crm.view"],
        children: [
          {
            label: "Activity History",
            path: "/dashboard/audit-logs/crm/logs",
            module: "crmauditlogs",
            actionKeys: ["audit_logs.crm.view"],
          },
          {
            label: "Session History",
            path: "/dashboard/audit-logs/crm/authentication",
            module: "crmauditlogs",
            actionKeys: ["audit_logs.crm.view"],
          },
        ],
      },
      {
        label: "Website Logs",
        module: "webauditlogs",
        actionKeys: ["audit_logs.web.view"],
        children: [
          {
            label: "Activity Logs",
            path: "/dashboard/audit-logs/meradhan",
            module: "webauditlogs",
            actionKeys: ["audit_logs.web.view"],
          },
          {
            label: "Session Logs",
            path: "/dashboard/audit-logs/meradhan/session",
            module: "webauditlogs",
            actionKeys: ["audit_logs.web.view"],
          },
        ],
      },
    ],
  },

  {
    label: "Recycle Bin",
    path: "/dashboard/bin",
    icon: Trash2,
    module: "bin",
    actionKeys: ["bin.view", "bin.restore", "bin.purge"],
  },
];
