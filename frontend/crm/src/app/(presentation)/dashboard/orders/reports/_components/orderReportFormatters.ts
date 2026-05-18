import { formatNumberTS } from "@/global/utils/formate";

export const REPORT_CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#ca8a04",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
];

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
};

export function buildLifecycleFunnel(params: {
  orderCount: number;
  byPaymentStatus: { paymentStatus: string; count: number }[];
  byOrderStatus: { status: string; count: number }[];
}): FunnelStep[] {
  const placed = params.orderCount;
  const paymentDone = countByPaymentStatus(params.byPaymentStatus, ["COMPLETED"]);
  const applied = countByOrderStatus(params.byOrderStatus, ["APPLIED"]);
  const settled = countByOrderStatus(params.byOrderStatus, ["SETTLED"]);

  const raw = [
    { label: "Orders placed", count: placed },
    { label: "Payment completed", count: paymentDone },
    { label: "Applied", count: applied },
    { label: "Settled", count: settled },
  ];

  return raw.map((step, i) => {
    if (i === 0) return { ...step, dropPct: null };
    const prev = raw[i - 1].count;
    const dropPct =
      prev > 0 ? -((prev - step.count) / prev) * 100 : null;
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
    name: r.status,
    count: r.count,
    pct: (r.count / total) * 100,
    color: REPORT_CHART_COLORS[i % REPORT_CHART_COLORS.length],
  }));
}
