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
  PENDING: { title: "Pending", badgeClass: "bg-orange-100 text-orange-800" },
  IN_PROGRESS: { title: "In progress", badgeClass: "bg-blue-100 text-blue-800" },
  APPLIED: { title: "In progress", badgeClass: "bg-blue-100 text-blue-800" },
  SETTLED: { title: "Settled", badgeClass: "bg-green-100 text-green-800" },
  REJECTED: { title: "Rejected", badgeClass: "bg-red-100 text-red-800" },
  EXPIRED: { title: "Expired", badgeClass: "bg-gray-200 text-gray-700" },
  CANCELLED: { title: "Cancelled", badgeClass: "bg-gray-200 text-gray-700" },
};

/** Unpaid / abandoned checkout — not a real pending lifecycle state. */
const NOT_COMPLETED_DISPLAY = {
  title: "Not completed",
  badgeClass: "bg-slate-100 text-slate-700",
} as const;

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

function isCheckoutNotCompleted(
  paymentStatus: string | null | undefined,
  orderStatus: string,
): boolean {
  const ps = paymentStatus == null ? "" : paymentStatus.trim().toUpperCase();
  if (ps === "PENDING" || ps === "CANCELLED") return true;

  const os = orderStatus.trim().toUpperCase();
  if (os === "REJECTED" && ps !== "COMPLETED" && ps !== "REFUNDED") return true;
  if (os === "PENDING" && ps !== "COMPLETED" && ps !== "REFUNDED") return true;

  return false;
}

export function getCrmOrderStatusDisplay(
  status: string,
  paymentStatus?: string | null,
): { title: string; badgeClass: string } {
  const normalized = status.trim().toUpperCase();

  // Unpaid checkout must win over raw PENDING → "Pending".
  if (isCheckoutNotCompleted(paymentStatus, status)) {
    return { ...NOT_COMPLETED_DISPLAY };
  }

  const fromConfig = ORDER_STATUS_CONFIG[normalized as CrmOrderStatus];
  if (fromConfig) {
    return { title: fromConfig.title, badgeClass: fromConfig.badgeClass };
  }

  return { title: status, badgeClass: "bg-gray-100 text-gray-800" };
}

export function getOrderStatusLabel(
  status: string,
  paymentStatus?: string | null,
): string {
  return getCrmOrderStatusDisplay(status, paymentStatus).title;
}

export function getPaymentStatusLabel(paymentStatus: string): string {
  const normalized = paymentStatus.trim().toUpperCase();
  return PAYMENT_STATUS_LABELS[normalized] ?? paymentStatus;
}
