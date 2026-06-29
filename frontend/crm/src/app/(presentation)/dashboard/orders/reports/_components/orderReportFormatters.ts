import { formatNumberTS } from "@/global/utils/formate";
import { getOrderStatusLabel } from "@/global/constants/order";

export const REPORT_CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#ca8a04",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
];

export const STATUS_COLOR_MAP: Record<string, string> = {
  SETTLED:   "#16a34a",
  APPLIED:   "#2563eb",
  PENDING:   "#ca8a04",
  REJECTED:  "#dc2626",
  CANCELLED: "#94a3b8",
  CREATED:   "#7c3aed",
  EXPIRED:   "#64748b",
};

export function formatBucketLabel(bucket: string, groupBy: "day" | "week" | "month"): string {
  // bucket may be a full ISO string (2026-04-30T00:00:00.000Z) or plain yyyy-MM-dd / yyyy-MM
  const d = new Date(bucket);
  if (Number.isNaN(d.getTime())) return bucket;
  if (groupBy === "month") {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  // day or week
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatIndianCurrencyCompact(value: number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `₹${(n / 1e7).toFixed(1)} Cr`;
  if (abs >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
  if (abs >= 1e3) return `₹${(n / 1e3).toFixed(1)} K`;
  return `₹${formatNumberTS(n)}`;
}

export function countByOrderStatus(
  rows: { status: string; count: number }[] | undefined,
  statuses: string[],
): number {
  if (!rows?.length) return 0;
  const set = new Set(statuses.map((s) => s.toUpperCase()));
  return rows.reduce(
    (sum, r) => (set.has(String(r.status).toUpperCase()) ? sum + r.count : sum),
    0,
  );
}

export function countByPaymentStatus(
  rows: { paymentStatus: string; count: number }[] | undefined,
  statuses: string[],
): number {
  if (!rows?.length) return 0;
  const set = new Set(statuses.map((s) => s.toUpperCase()));
  return rows.reduce(
    (sum, r) =>
      set.has(String(r.paymentStatus).toUpperCase()) ? sum + r.count : sum,
    0,
  );
}

export type FunnelStep = {
  label: string;
  count: number;
  dropPct: number | null;
  subLabel?: string;
};

export function buildLifecycleFunnel(params: {
  orderCount: number;
  byPaymentStatus: { paymentStatus: string; count: number }[];
  byOrderStatus: { status: string; count: number }[];
}): FunnelStep[] {
  const placed          = params.orderCount;
  const razorpayDone    = countByPaymentStatus(params.byPaymentStatus, ["COMPLETED"]);
  const applied         = countByOrderStatus(params.byOrderStatus, ["APPLIED"]);
  const settled         = countByOrderStatus(params.byOrderStatus, ["SETTLED"]);

  // Orders that progressed to APPLIED/SETTLED via any payment method (including non-PG)
  const progressedOrders = applied + settled;
  // Total payment received = Razorpay completions + non-PG orders that already progressed
  const paymentDone = Math.max(razorpayDone, progressedOrders);

  // In progress = payment received but not yet applied or settled
  const inProgress = Math.max(0, paymentDone - progressedOrders);

  const raw = [
    { label: "Orders placed",        count: placed,               subLabel: undefined },
    { label: "Payment received",     count: paymentDone,          subLabel: razorpayDone < progressedOrders ? `${razorpayDone} via PG · ${progressedOrders - razorpayDone} other` : undefined },
    { label: "Applied + In Progress", count: applied + inProgress, subLabel: `${applied} applied · ${inProgress} in progress` },
    { label: "Settled",              count: settled,              subLabel: undefined },
  ];

  return raw.map((step, i) => {
    if (i === 0) return { ...step, dropPct: null };
    const prev = raw[i - 1].count;
    const dropPct = prev > 0 ? -((prev - step.count) / prev) * 100 : null;
    return { ...step, dropPct };
  });
}

export type StatusSlice = {
  name: string;
  count: number;
  pct: number;
  color: string;
};

export function buildStatusSlices(
  rows: { status: string; count: number }[] | undefined,
): StatusSlice[] {
  const list = rows ?? [];
  const total = list.reduce((s, r) => s + r.count, 0);
  if (total === 0) return [];
  return list.map((r, i) => ({
    name: getOrderStatusLabel(r.status),
    count: r.count,
    pct: (r.count / total) * 100,
    color:
      STATUS_COLOR_MAP[r.status.toUpperCase()] ??
      REPORT_CHART_COLORS[i % REPORT_CHART_COLORS.length],
  }));
}
