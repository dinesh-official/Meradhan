type RoutePermissionRule = {
  prefix: string;
  actionKeys: string[];
  /** When true, only an exact pathname match applies (not nested paths). */
  exact?: boolean;
};

/**
 * Longest-prefix wins. More specific routes must appear before broader ones.
 * `undefined` from {@link getRouteActionKeys} = authenticated only (no action check).
 */
const ROUTE_PERMISSION_RULES: RoutePermissionRule[] = [
  { prefix: "/dashboard/administration/rbac", actionKeys: ["system.rbac.manage"] },
  { prefix: "/dashboard/administration/impersonate", actionKeys: ["system.impersonate"] },
  { prefix: "/dashboard/tools/cbrics-manager", actionKeys: ["rfqs.manage"] },
  { prefix: "/dashboard/notifications/customer-list", actionKeys: ["notifications.customer_list.view"] },
  { prefix: "/dashboard/notifications/send", actionKeys: ["notifications.send"] },
  { prefix: "/dashboard/notifications/lists", actionKeys: ["notifications.lists.view"] },
  { prefix: "/dashboard/notifications/templates", actionKeys: ["notifications.templates.view"] },
  { prefix: "/dashboard/notifications/logs", actionKeys: ["notifications.logs.view"] },
  { prefix: "/dashboard/user-management/suspended", actionKeys: ["user_management.view"] },
  { prefix: "/dashboard/user-management", actionKeys: ["user_management.view"] },
  { prefix: "/dashboard/customers/manual-kyc", actionKeys: ["customers.kyc.edit"] },
  { prefix: "/dashboard/customers/create", actionKeys: ["customers.create"] },
  { prefix: "/dashboard/customers/view", actionKeys: ["customers.view"] },
  { prefix: "/dashboard/customers", actionKeys: ["customers.view"] },
  { prefix: "/dashboard/rfqs/nse/settle-orders/generate", actionKeys: ["rfqs.settle_orders.view"] },
  { prefix: "/dashboard/rfqs/nse/settle-orders", actionKeys: ["rfqs.settle_orders.view"] },
  { prefix: "/dashboard/rfqs/nse/settlement-dates", actionKeys: ["rfqs.settlement_dates.view", "rfqs.settlement_dates.edit"] },
  { prefix: "/dashboard/rfqs/nse/dealamend", actionKeys: ["rfqs.deals.view"] },
  { prefix: "/dashboard/rfqs/nse/deals", actionKeys: ["rfqs.deals.view"] },
  { prefix: "/dashboard/rfqs/nse/participants/create", actionKeys: ["rfqs.manage"] },
  { prefix: "/dashboard/rfqs/nse/participants", actionKeys: ["rfqs.participants.view"] },
  { prefix: "/dashboard/rfqs/nse/manage", actionKeys: ["rfqs.manage"] },
  { prefix: "/dashboard/rfqs/nse/create", actionKeys: ["rfqs.manage"] },
  { prefix: "/dashboard/rfqs/nse/webhook-notifications", actionKeys: ["rfqs.view"] },
  { prefix: "/dashboard/rfqs/nse/proposals", actionKeys: ["rfqs.proposals.view"] },
  { prefix: "/dashboard/rfqs/nse", actionKeys: ["rfqs.view"] },
  { prefix: "/dashboard/rfqs/overview", actionKeys: ["rfqs.view"] },
  { prefix: "/dashboard/orders/razorpay-routes/create", actionKeys: ["orders.view"] },
  { prefix: "/dashboard/orders/razorpay-routes", actionKeys: ["orders.view"] },
  { prefix: "/dashboard/orders/inventory-stock", actionKeys: ["orders.inventory.view"] },
  { prefix: "/dashboard/orders/reports", actionKeys: ["orders.reports.view"] },
  { prefix: "/dashboard/orders/pg-management", actionKeys: ["orders.edit"] },
  { prefix: "/dashboard/orders/payment-process-logs", actionKeys: ["orders.view"] },
  { prefix: "/dashboard/orders/draft-orders", actionKeys: ["orders.view"] },
  { prefix: "/dashboard/orders", actionKeys: ["orders.view"] },
  { prefix: "/dashboard/bonds/margins", actionKeys: ["bonds.margins.view"] },
  { prefix: "/dashboard/bonds/auto-update", actionKeys: ["bonds.auto_update.view"] },
  { prefix: "/dashboard/bonds/priced-list", actionKeys: ["bonds.priced_list.view"] },
  { prefix: "/dashboard/bonds/reference-data", actionKeys: ["bonds.reference_data.view"] },
  { prefix: "/dashboard/bonds/create", actionKeys: ["bonds.create"] },
  { prefix: "/dashboard/bonds/update", actionKeys: ["bonds.edit"] },
  { prefix: "/dashboard/bonds", actionKeys: ["bonds.view"] },
  { prefix: "/dashboard/leads/partnerships/create", actionKeys: ["leads.create"] },
  { prefix: "/dashboard/leads/partnerships", actionKeys: ["leads.view"] },
  { prefix: "/dashboard/leads/create", actionKeys: ["leads.create"] },
  { prefix: "/dashboard/leads", actionKeys: ["leads.view"] },
  { prefix: "/dashboard/bin", actionKeys: ["bin.view"] },
  { prefix: "/dashboard/audit-logs/crm", actionKeys: ["audit_logs.crm.view"] },
  { prefix: "/dashboard/audit-logs/web", actionKeys: ["audit_logs.web.view"] },
  { prefix: "/dashboard/audit-logs/meradhan", actionKeys: ["audit_logs.web.view"] },
  { prefix: "/dashboard/model-bond-form", actionKeys: ["bonds.create"] },
  { prefix: "/dashboard", actionKeys: ["dashboard.view"], exact: true },
];

const SORTED_RULES = [...ROUTE_PERMISSION_RULES].sort(
  (a, b) => b.prefix.length - a.prefix.length,
);

function normalizePath(pathname: string): string {
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? pathname;
  return path || "/";
}

/** Regex rules for dynamic customer sub-routes. */
function matchDynamicCustomerRoute(path: string): string[] | undefined {
  if (/\/customers\/[^/]+\/manual-kyc$/.test(path)) {
    return ["customers.kyc.edit"];
  }
  if (/\/customers\/[^/]+\/corporate-kyc$/.test(path)) {
    return ["kyc.corporate.view"];
  }
  if (/\/customers\/view\/[^/]+\/update$/.test(path)) {
    return ["customers.edit"];
  }
  if (/\/customers\/view\/[^/]+\/kyc$/.test(path)) {
    return ["customers.kyc.view"];
  }
  if (/\/customers\/view\/[^/]+\/corporate-kyc$/.test(path)) {
    return ["customers.kyc.view"];
  }
  if (/\/customers\/view\/[^/]+\/profile$/.test(path)) {
    return ["customers.view"];
  }
  if (/\/leads\/partnerships\/[^/]+\/update$/.test(path)) {
    return ["leads.edit"];
  }
  if (/\/leads\/[^/]+\/update$/.test(path)) {
    return ["leads.edit"];
  }
  return undefined;
}

/**
 * Returns action keys required for a dashboard path (user needs any one).
 * `undefined` = authenticated only, no action-key check (e.g. profile).
 */
export function getRouteActionKeys(pathname: string): string[] | undefined {
  const path = normalizePath(pathname);

  if (path === "/dashboard/profile") {
    return undefined;
  }

  const dynamic = matchDynamicCustomerRoute(path);
  if (dynamic) {
    return dynamic;
  }

  for (const rule of SORTED_RULES) {
    if (rule.exact) {
      if (path === rule.prefix) return rule.actionKeys;
      continue;
    }
    if (path === rule.prefix || path.startsWith(`${rule.prefix}/`)) {
      return rule.actionKeys;
    }
  }

  return undefined;
}

export function hasRoutePermission(
  pathname: string,
  permissions: string[],
  role: string | undefined,
): boolean {
  if (role === "SUPER_ADMIN") return true;

  const required = getRouteActionKeys(pathname);
  if (!required?.length) return true;

  return required.some((key) => permissions.includes(key));
}
