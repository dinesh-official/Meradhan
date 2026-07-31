"use client";

import type { OrderReportRegisterRow, OrderReportsByCustomerResponse } from "@root/apiGateway";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Download, Mail, CreditCard, Users, Crown, UserCheck, RefreshCw, Search } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
  customerFullName,
  customerInitials,
  formatOrderDate,
  formatValueCr,
  mapKycLabel,
  mapOrderWorkflowStatus,
  mapUserTypeLabel,
  maskPanPlaceholder,
  orderBelongsToCustomerProfile,
  parseYieldFromBondDetails,
  isActiveWorkflowStatus,
} from "./reportDerivations";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";
import { encodeId } from "@/global/utils/url.utils";
import OrderStatusBadge from "@/global/elements/wrapper/badges/OrderStatusBadge";
import { KycStatusBadge, ReportDataTable } from "./reportUi";

type Row = OrderReportsByCustomerResponse["responseData"]["data"][number];

const TYPE_COLORS: Record<string, string> = {
  HNI:        "#f59e0b",
  Corporate:  "hsl(var(--primary))",
  Individual: "#94a3b8",
};

/* ── Customer type badge ─────────────────────────────────────────── */
function TypeBadge({ type }: { type: string }) {
  const cls =
    type === "HNI"       ? "bg-amber-50 text-amber-700"  :
    type === "Corporate" ? "bg-blue-50 text-blue-700"    :
                           "bg-slate-100 text-slate-600";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", cls)}>
      {type}
    </span>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────── */
function CustomerAvatar({ name, type }: { name: string; type: string }) {
  const color = TYPE_COLORS[type] ?? "#94a3b8";
  return (
    <div
      className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {customerInitials(name)}
    </div>
  );
}

/* ── KPI card matching reference style ───────────────────────────── */
function CustKpiCard({
  label, value, sub, icon: Icon, accent, valueClass,
}: {
  label: string; value: string; sub: React.ReactNode;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent: string; valueClass?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border border-l-4 bg-white p-4", accent)}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon size={12} />
        {label}
      </p>
      <p className={cn("mt-1.5 text-2xl font-bold tabular-nums", valueClass ?? "text-foreground")}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

/* ── Customer detail panel ───────────────────────────────────────── */
function CustomerDetail({
  row,
  orders,
}: {
  row: Row;
  orders: OrderReportRegisterRow[];
}) {
  const name     = [row.customer?.firstName, row.customer?.lastName].filter(Boolean).join(" ") || "—";
  const email    = row.customer?.emailAddress ?? "—";
  const kyc      = mapKycLabel(row.customer?.kycStatus);
  const type     = mapUserTypeLabel(row.customer?.userType);
  const invested = Number(row.lifetimeValue);
  const avgTicket = row.orderCount > 0 ? invested / row.orderCount : 0;
  const last     = row.lastOrderAt ? format(new Date(row.lastOrderAt), "dd MMM yyyy") : "—";
  const isRepeat = row.orderCount > 1;

  /* Filter orders belonging to this customer */
  const custOrders = useMemo(
    () => orders.filter((o) => orderBelongsToCustomerProfile(o, row.customerProfileId)),
    [orders, row.customerProfileId],
  );

  const orderStats = useMemo(() => {
    let settled = 0;
    let pending = 0;
    let totalVal = 0;
    for (const o of custOrders) {
      totalVal += Number(o.totalAmount);
      const wf = mapOrderWorkflowStatus(o.status);
      if (wf === "Settled") settled += 1;
      else if (isActiveWorkflowStatus(wf)) pending += 1;
    }
    return { settled, pending, totalVal };
  }, [custOrders]);

  const orderRows = useMemo(() =>
    custOrders.map((o) => {
      const yld = parseYieldFromBondDetails(o.bondDetails) ?? "—";
      return {
        key: o.id,
        onClick: () => window.open(`/dashboard/orders/${encodeId(o.id)}`, "_blank"),
        cells: [
          <span key="on" className="font-mono text-xs font-medium text-primary">{o.orderNumber}</span>,
          <div key="i" className="space-y-0.5">
            <span className="block font-mono text-xs font-medium text-slate-800">{o.isin}</span>
            <span className="block max-w-[160px] truncate text-[11px] text-slate-400">{o.bondName}</span>
          </div>,
          <span key="d" className="whitespace-nowrap text-xs text-slate-500">{formatOrderDate(o.createdAt)}</span>,
          <span key="v" className="tabular-nums font-medium">{formatValueCr(Number(o.totalAmount))}</span>,
          <span key="y" className="tabular-nums text-xs">{yld}</span>,
          <OrderStatusBadge
            key="s"
            status={o.status}
          />,
        ],
      };
    }),
  [custOrders]);

  const exportCsv = () => {
    const header = ["Order ID", "ISIN", "Security", "Date", "Value (Cr)", "Yield", "Status"];
    const csvRows = custOrders.map((o) => [
      o.orderNumber,
      o.isin,
      `"${o.bondName}"`,
      formatOrderDate(o.createdAt),
      formatValueCr(Number(o.totalAmount)),
      parseYieldFromBondDetails(o.bondDetails) ?? "—",
      mapOrderWorkflowStatus(o.status),
    ]);
    const csv = [header, ...csvRows].map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${customerFullName(custOrders[0] ?? { customerProfile: { firstName: name, middleName: null, lastName: "", emailAddress: email } })}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* profile card */}
        <div className="overflow-hidden rounded-xl border border-border bg-white">
          <div className="flex flex-col items-center gap-3 px-4 pb-5 pt-6 text-center">
            <div
              className="flex size-16 items-center justify-center rounded-full text-2xl font-bold"
              style={{ backgroundColor: `${TYPE_COLORS[type] ?? "#94a3b8"}20`, color: TYPE_COLORS[type] ?? "#94a3b8" }}
            >
              {customerInitials(name)}
            </div>
            <div>
              <h2 className="text-lg font-bold">{name}</h2>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                <KycStatusBadge status={kyc} />
                <TypeBadge type={type} />
                {isRepeat && (
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Repeat
                  </span>
                )}
              </div>
            </div>
            <div className="w-full space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail size={13} /><span className="truncate">{email}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CreditCard size={13} /><span className="font-mono">{maskPanPlaceholder(row.customerProfileId)}</span>
              </div>
            </div>
            <div className="w-full border-t border-border pt-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Assigned RM</p>
              <p className="mt-0.5 text-sm font-semibold">—</p>
            </div>
          </div>
        </div>

        {/* investment summary */}
        <div className="overflow-hidden rounded-xl border border-border bg-white lg:col-span-2">
          <div className="px-4 pb-1 pt-4">
            <p className="text-sm font-semibold">Investment Summary</p>
            <p className="text-xs text-slate-400">Lifetime portfolio activity</p>
          </div>
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Total Orders",   val: String(row.orderCount),               cls: "" },
                { label: "Total Invested", val: `₹${formatValueCr(invested)} Cr`,     cls: "text-[#22c55e]" },
                { label: "Settled",        val: String(orderStats.settled),            cls: "text-[#22c55e]" },
                { label: "Avg Ticket",     val: formatIndianCurrencyCompact(avgTicket), cls: "" },
              ].map((m) => (
                <div key={m.label} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className={cn("mt-1 text-xl font-bold", m.cls)}>{m.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
              {[
                { label: "Customer Type",   node: <TypeBadge type={type} /> },
                { label: "KYC Status",      node: <KycStatusBadge status={kyc} /> },
                { label: "Last Order",      node: <p className="mt-0.5 text-sm font-medium">{last}</p> },
                { label: "Investor Status", node: <p className="mt-0.5 text-sm font-medium">{isRepeat ? "Repeat Investor" : "New Investor"}</p> },
              ].map((d) => (
                <div key={d.label}>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{d.label}</p>
                  {d.node}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* orders table */}
      <ReportDataTable
        title="Order History"
        description={`${custOrders.length} orders · ₹${formatValueCr(orderStats.totalVal)} Cr total · ${orderStats.settled} settled · ${orderStats.pending} pending`}
        columns={[
          { key: "order",  label: "Order ID" },
          { key: "isin",   label: "ISIN / Security" },
          { key: "date",   label: "Date" },
          { key: "value",  label: "Value (₹ Cr)", align: "right" as const },
          { key: "yield",  label: "Yield",        align: "right" as const },
          { key: "status", label: "Status" },
        ]}
        rows={orderRows}
        emptyMessage="No orders found for this customer in the selected period."
        toolbar={
          custOrders.length > 0 ? (
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={exportCsv}>
              <Download size={13} /> Export CSV
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

/* ── Main panel ──────────────────────────────────────────────────── */
const COLUMNS = [
  { key: "customer", label: "Customer" },
  { key: "pan",      label: "PAN" },
  { key: "kyc",      label: "KYC" },
  { key: "type",     label: "Type" },
  { key: "orders",   label: "Orders",          align: "right" as const },
  { key: "invested", label: "Invested (₹ Cr)", align: "right" as const },
  { key: "avg",      label: "Avg Ticket",      align: "right" as const },
  { key: "pending",  label: "Pending",         align: "right" as const },
  { key: "rm",       label: "RM" },
  { key: "last",     label: "Last Order" },
];

export function CustomersPanel({
  data,
  meta,
  orders = [],
  isLoading,
}: {
  data: Row[];
  meta?: OrderReportsByCustomerResponse["responseData"]["meta"];
  orders?: OrderReportRegisterRow[];
  isLoading?: boolean;
}) {
  const [search,     setSearch]     = useState("");
  const [kycFilter,  setKycFilter]  = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected,   setSelected]   = useState<Row | null>(null);

  const kpis = useMemo(() => {
    const total   = meta?.total ?? data.length;
    const hni     = data.filter((r) => mapUserTypeLabel(r.customer?.userType) === "HNI").length;
    const corp    = data.filter((r) => mapUserTypeLabel(r.customer?.userType) === "Corporate").length;
    const ind     = total - hni - corp;
    const hniCount = data.filter((r) => Number(r.lifetimeValue) >= 5_000_000).length;
    const repeat  = data.filter((r) => r.orderCount > 1).length;
    const repeatPct = total > 0 ? ((repeat / total) * 100).toFixed(1) : "0.0";
    const now     = new Date();
    const newThisMonth = data.filter((r) => {
      if (!r.lastOrderAt) return false;
      const d = new Date(r.lastOrderAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { total, hni, corp, ind, hniCount, repeat, repeatPct, newThisMonth };
  }, [data, meta]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((r) => {
      const name  = [r.customer?.firstName, r.customer?.lastName].filter(Boolean).join(" ").toLowerCase();
      const email = (r.customer?.emailAddress ?? "").toLowerCase();
      if (q && !name.includes(q) && !email.includes(q)) return false;
      if (kycFilter  !== "all" && mapKycLabel(r.customer?.kycStatus)   !== kycFilter)  return false;
      if (typeFilter !== "all" && mapUserTypeLabel(r.customer?.userType) !== typeFilter) return false;
      return true;
    });
  }, [data, search, kycFilter, typeFilter]);

  const tableRows = useMemo(() =>
    filtered.map((r) => {
      const name     = [r.customer?.firstName, r.customer?.lastName].filter(Boolean).join(" ") || "—";
      const email    = r.customer?.emailAddress ?? "—";
      const kyc      = mapKycLabel(r.customer?.kycStatus);
      const type     = mapUserTypeLabel(r.customer?.userType);
      const invested = Number(r.lifetimeValue);
      const avgTicket = r.orderCount > 0 ? invested / r.orderCount : 0;
      const last     = r.lastOrderAt ? format(new Date(r.lastOrderAt), "dd MMM yyyy") : "—";
      const pendingCount = orders.filter((o) => {
        if (!orderBelongsToCustomerProfile(o, r.customerProfileId)) return false;
        return isActiveWorkflowStatus(mapOrderWorkflowStatus(o.status));
      }).length;
      return {
        key: r.customerProfileId,
        onClick: () => setSelected(r),
        cells: [
          <div key="c" className="flex cursor-pointer items-center gap-2.5">
            <CustomerAvatar name={name} type={type} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight">{name}</p>
              <p className="truncate text-xs leading-tight text-muted-foreground">{email}</p>
            </div>
          </div>,
          <span key="pan" className="font-mono text-xs">{maskPanPlaceholder(r.customerProfileId)}</span>,
          <KycStatusBadge key="kyc" status={kyc} />,
          <TypeBadge key="type" type={type} />,
          <span key="ord" className="tabular-nums">{r.orderCount}</span>,
          <span key="inv" className="tabular-nums font-semibold">{formatValueCr(invested)}</span>,
          <span key="avg" className="tabular-nums text-xs text-muted-foreground">{formatIndianCurrencyCompact(avgTicket)} Cr</span>,
          <span key="pen" className="tabular-nums text-amber-500">{pendingCount || "—"}</span>,
          <span key="rm"  className="text-xs text-muted-foreground">—</span>,
          <span key="last" className="whitespace-nowrap text-xs text-muted-foreground">{last}</span>,
        ],
      };
    }),
  [filtered, orders]);

  const selectedName = selected
    ? [selected.customer?.firstName, selected.customer?.lastName].filter(Boolean).join(" ") || "Customer"
    : "";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Customers</h2>
        <p className="mt-1 text-sm text-muted-foreground">Investor profiles, KYC status, and order history.</p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <CustKpiCard
          label="Total Customers"
          value={kpis.total.toLocaleString("en-IN")}
          sub={
            <span className="flex flex-wrap gap-2">
              {[
                { label: "HNI",  count: kpis.hni,  color: "#f59e0b" },
                { label: "Corp", count: kpis.corp, color: "hsl(var(--primary))" },
                { label: "Ind",  count: kpis.ind,  color: "#94a3b8" },
              ].map((b) => (
                <span key={b.label} className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: b.color }} />
                  {b.count} {b.label}
                </span>
              ))}
            </span>
          }
          icon={Users}
          accent="border-l-primary/40"
        />
        <CustKpiCard
          label="HNI Customers"
          value={kpis.hniCount.toLocaleString("en-IN")}
          sub="Invested > ₹50 L"
          icon={Crown}
          accent="border-l-amber-500/60"
          valueClass="text-amber-500"
        />
        <CustKpiCard
          label="New This Month"
          value={kpis.newThisMonth.toLocaleString("en-IN")}
          sub={`Onboarded in ${format(new Date(), "MMM yyyy")}`}
          icon={UserCheck}
          accent="border-l-primary/40"
          valueClass="text-primary"
        />
        <CustKpiCard
          label="Repeat Investors"
          value={`${kpis.repeatPct}%`}
          sub={`${kpis.repeat} with 2+ orders`}
          icon={RefreshCw}
          accent="border-l-[#22c55e]"
          valueClass="text-[#22c55e]"
        />
      </div>

      {/* filter bar + table */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
          <div className="relative min-w-48 flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, PAN…"
              className="h-8 bg-white pl-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={kycFilter} onValueChange={setKycFilter}>
            <SelectTrigger className="h-8 w-36 bg-white text-sm">
              <SelectValue placeholder="KYC Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All KYC</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-36 bg-white text-sm">
              <SelectValue placeholder="Customer Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Individual">Individual</SelectItem>
              <SelectItem value="HNI">HNI</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
            </SelectContent>
          </Select>
          <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
            {filtered.length} customers
          </span>
        </div>

        <ReportDataTable
          columns={COLUMNS}
          rows={tableRows}
          isLoading={isLoading}
          emptyMessage="No customers match this filter."
        />
        <p className="px-1 text-xs text-muted-foreground">Click any row to view customer detail</p>
      </div>

      {/* full-screen customer detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="flex h-screen max-h-screen! w-screen max-w-[100vw]! flex-col gap-0 overflow-hidden rounded-none p-0">
          <DialogHeader className="shrink-0 border-b border-border px-6 py-4">
            <DialogTitle className="text-lg font-semibold">{selectedName}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {selected && <CustomerDetail row={selected} orders={orders} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
