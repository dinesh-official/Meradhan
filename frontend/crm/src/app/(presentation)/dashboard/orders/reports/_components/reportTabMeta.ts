/** OBPP order reports — tab copy aligned with the sample dashboard. */

export type ReportTabMeta = {
  id: string;
  title: string;
  purpose: string;
  whenToUse: string;
};

export const REPORT_TAB_ORDER = [
  "overview",
  "register",
  "settlement",
  "revenue",
  "customers",
  "rm-performance",
  "compliance",
  "exceptions",
] as const;

export type ReportTabId = (typeof REPORT_TAB_ORDER)[number];

export const REPORT_TAB_META: Record<ReportTabId, ReportTabMeta> = {
  overview: {
    id: "overview",
    title: "Overview",
    purpose:
      "Single-screen view of order flow, settlement health, and conversion — like an OBPP control tower.",
    whenToUse:
      "Daily stand-ups and management reviews before drilling into Orders, Settlement, or Revenue.",
  },
  register: {
    id: "register",
    title: "Orders",
    purpose:
      "Authoritative list of every order in the date range with customer, ISIN, amounts, and statuses.",
    whenToUse:
      "Audit trails, client queries, payment reconciliation, and CSV export.",
  },
  settlement: {
    id: "settlement",
    title: "Settlement",
    purpose:
      "Track pay-in status, settlement aging, and clearing operations for orders in range.",
    whenToUse:
      "Monitoring pending pay-ins, overdue items, and UTR / clearing reconciliation.",
  },
  revenue: {
    id: "revenue",
    title: "Revenue",
    purpose:
      "Spread analysis, P&L tracking, and earnings by ISIN and period.",
    whenToUse:
      "Pricing reviews, margin monitoring, and comparing spread contribution across bonds.",
  },
  customers: {
    id: "customers",
    title: "Customers",
    purpose:
      "Ranks investors by order count and lifetime value (LTV) in the filtered period.",
    whenToUse:
      "Relationship management, concentration risk, and repeat-buyer analysis.",
  },
  "rm-performance": {
    id: "rm-performance",
    title: "RM Performance",
    purpose:
      "Relationship-manager attribution, targets, and order volume by RM.",
    whenToUse:
      "Sales leadership reviews and incentive tracking once RM mapping is enabled.",
  },
  compliance: {
    id: "compliance",
    title: "Compliance",
    purpose:
      "KYC, suitability, and regulatory checks tied to orders in the selected period.",
    whenToUse:
      "Compliance officer reviews and audit preparation.",
  },
  exceptions: {
    id: "exceptions",
    title: "Exceptions",
    purpose:
      "Failed automation steps and operational exceptions that need intervention.",
    whenToUse:
      "Support escalations and engineering triage when orders do not progress.",
  },
};
