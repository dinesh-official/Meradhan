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
    title: "Pending",
    badgeClass: "border border-amber-200 bg-amber-50 text-amber-700",
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

/** Unpaid / abandoned checkout — not a real pending lifecycle state. */
const NOT_COMPLETED_DISPLAY = {
  title: "Not completed",
  badgeClass: "border border-slate-200 bg-slate-100 text-slate-700",
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

/**
 * Display-only: Razorpay + payment COMPLETED + order PENDING → In progress.
 * Does not mutate DB status.
 */
function resolveDisplayStatus(
  status: string,
  paymentStatus?: string | null,
  paymentProvider?: string | null,
): string {
  const normalized = status.trim().toUpperCase();
  const provider =
    paymentProvider == null ? "" : paymentProvider.trim().toUpperCase();
  const payStatus =
    paymentStatus == null ? "" : paymentStatus.trim().toUpperCase();

  if (
    normalized === "PENDING" &&
    provider === "RAZORPAY" &&
    payStatus === "COMPLETED"
  ) {
    return "IN_PROGRESS";
  }

  return normalized;
}

export function getCrmOrderStatusDisplay(
  status: string,
  paymentStatus?: string | null,
  paymentProvider?: string | null,
): { title: string; badgeClass: string } {
  // Unpaid checkout must win over raw PENDING → "Pending".
  if (isCheckoutNotCompleted(paymentStatus, status)) {
    return { ...NOT_COMPLETED_DISPLAY };
  }

  const displayStatus = resolveDisplayStatus(
    status,
    paymentStatus,
    paymentProvider,
  );

  const fromConfig = ORDER_STATUS_CONFIG[displayStatus as CrmOrderStatus];
  if (fromConfig) {
    return { title: fromConfig.title, badgeClass: fromConfig.badgeClass };
  }

  return { title: status, badgeClass: "border border-slate-200 bg-slate-50 text-slate-600" };
}

export function getOrderStatusLabel(
  status: string,
  paymentStatus?: string | null,
  paymentProvider?: string | null,
): string {
  return getCrmOrderStatusDisplay(status, paymentStatus, paymentProvider).title;
}

export function getPaymentStatusLabel(paymentStatus: string): string {
  const normalized = paymentStatus.trim().toUpperCase();
  return PAYMENT_STATUS_LABELS[normalized] ?? paymentStatus;
}
