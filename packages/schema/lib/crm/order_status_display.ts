export const CRM_ORDER_STATUS_VALUES = [
  "PENDING",
  "IN_PROGRESS",
  "APPLIED",
  "SETTLED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
] as const;

export type CrmOrderStatus = (typeof CRM_ORDER_STATUS_VALUES)[number];

export const ORDER_STATUS_CONFIG: Record<
  CrmOrderStatus,
  { title: string; badgeClass: string }
> = {
  PENDING: {
    title: "Not completed",
    badgeClass: "border border-slate-200 bg-slate-100 text-slate-700",
  },
  IN_PROGRESS: {
    title: "In progress",
    badgeClass: "border border-blue-200 bg-blue-50 text-blue-700",
  },
  APPLIED: {
    title: "In progress",
    badgeClass: "border border-blue-200 bg-blue-50 text-blue-700",
  },
  SETTLED: {
    title: "Settled",
    badgeClass: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    title: "Rejected",
    badgeClass: "border border-rose-200 bg-rose-50 text-rose-700",
  },
  EXPIRED: {
    title: "Expired",
    badgeClass: "border border-slate-200 bg-slate-100 text-slate-700",
  },
  CANCELLED: {
    title: "Cancelled",
    badgeClass: "border border-slate-200 bg-slate-100 text-slate-700",
  },
};

const FALLBACK_BADGE =
  "border border-slate-200 bg-slate-50 text-slate-600" as const;

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

/** Map DB order status → display title + badge class. */
export function getCrmOrderStatusDisplay(status: string): {
  title: string;
  badgeClass: string;
} {
  const key = status.trim().toUpperCase() as CrmOrderStatus;
  const fromConfig = ORDER_STATUS_CONFIG[key];
  if (fromConfig) return fromConfig;
  return { title: status, badgeClass: FALLBACK_BADGE };
}

export function getOrderStatusLabel(status: string): string {
  return getCrmOrderStatusDisplay(status).title;
}

export function getPaymentStatusLabel(paymentStatus: string): string {
  const normalized = paymentStatus.trim().toUpperCase();
  return PAYMENT_STATUS_LABELS[normalized] ?? paymentStatus;
}
