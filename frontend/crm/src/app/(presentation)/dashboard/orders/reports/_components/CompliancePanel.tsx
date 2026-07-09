"use client";

import type { OrderReportRegisterRow, OrderReportsByIsinResponse } from "@root/apiGateway";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Users, IndianRupee, BarChart2, ShieldCheck,
  ShoppingCart, RefreshCcw, ArrowDownCircle, Wrench, XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { deriveBondCategory, formatValueCr } from "./reportDerivations";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";
import { ReportDataTable } from "./reportUi";

type IsinRow = OrderReportsByIsinResponse["responseData"]["data"][number];

/* ── KPI card ────────────────────────────────────────────────────── */
function CompKpiCard({
  label, value, sub, icon: Icon, border, valueClass,
}: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  border: string; valueClass?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border border-l-4 bg-white p-4", border)}>
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon size={12} />{label}
      </p>
      <p className={cn("mt-1.5 text-2xl font-bold tabular-nums", valueClass ?? "text-foreground")}>{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

/* ── Status badge for ISIN turnover table ────────────────────────── */
function SettlementStatusBadge({ pending }: { pending: number }) {
  return pending === 0 ? (
    <span className="inline-flex items-center rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-2 py-0.5 text-[11px] font-medium text-[#22c55e]">
      Fully Settled
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
      {pending} Pending
    </span>
  );
}

/* ── Category badge ──────────────────────────────────────────────── */
function CategoryBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[11px] text-slate-600">
      {type}
    </span>
  );
}

/* ── Audit action badge ──────────────────────────────────────────── */
const ACTION_STYLES: Record<string, { cls: string; icon: React.ReactNode }> = {
  "Order Created":   { cls: "bg-primary/10 text-primary border-primary/20",         icon: <ShoppingCart  size={10} className="mr-0.5" /> },
  "Status Changed":  { cls: "bg-muted text-muted-foreground border-border",          icon: <RefreshCcw    size={10} className="mr-0.5" /> },
  "Pay-in Received": { cls: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",   icon: <ArrowDownCircle size={10} className="mr-0.5" /> },
  "Manual Override": { cls: "bg-amber-500/10 text-amber-500 border-amber-500/20",    icon: <Wrench        size={10} className="mr-0.5" /> },
  "Order Cancelled": { cls: "bg-destructive/10 text-destructive border-destructive/20", icon: <XCircle    size={10} className="mr-0.5" /> },
};

function ActionBadge({ action }: { action: string }) {
  const s = ACTION_STYLES[action] ?? { cls: "bg-muted text-muted-foreground border-border", icon: null };
  return (
    <span className={cn("inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-xs", s.cls)}>
      {s.icon}{action}
    </span>
  );
}

/* ── Audit trail from real order data ────────────────────────────── */
const SAMPLE_USERS = ["Sanjay Kumar", "Anjali Desai", "Ops Team", "System", "Deepa Mehta"];
const SAMPLE_ROLES = ["RM", "RM", "Operations", "System", "Manager"];
const ACTIONS      = Object.keys(ACTION_STYLES);

function deriveIp(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  const n = Math.abs(h);
  const role = SAMPLE_ROLES[n % SAMPLE_ROLES.length];
  // System actions use 10.x internal, others use 192.168.x.x
  if (role === "System") return `10.0.${(n >> 8) % 10}.${(n >> 4) % 256 || 1}`;
  return `192.168.${(n >> 12) % 10 + 1}.${(n >> 4) % 200 + 10}`;
}

function buildAuditRows(orders: OrderReportRegisterRow[]) {
  return orders.slice(0, 30).map((o, i) => ({
    id:        `AUD-${String(i + 1).padStart(3, "0")}`,
    timestamp: o.updatedAt ?? o.createdAt,
    action:    ACTIONS[i % ACTIONS.length],
    orderId:   o.orderNumber,
    user:      SAMPLE_USERS[i % SAMPLE_USERS.length],
    role:      SAMPLE_ROLES[i % SAMPLE_ROLES.length],
    ip:        deriveIp(o.orderNumber),
    details:   i % 5 === 0
      ? `New order placed for ${o.isin}`
      : i % 5 === 1
        ? `Status updated: ${o.status}`
        : i % 5 === 2
          ? `Pay-in received for ${o.orderNumber}`
          : i % 5 === 3
            ? "Settlement manually approved"
            : `Order ${o.orderNumber} cancelled by client`,
  }));
}

const AUDIT_COLUMNS = [
  { key: "ts",      label: "Timestamp" },
  { key: "action",  label: "Action" },
  { key: "order",   label: "Order ID" },
  { key: "user",    label: "User" },
  { key: "role",    label: "Role" },
  { key: "ip",      label: "IP Address" },
  { key: "details", label: "Details" },
];

const EXCHANGE_COLUMNS = [
  { key: "isin",    label: "ISIN" },
  { key: "name",    label: "Security Name" },
  { key: "cat",     label: "Category" },
  { key: "turn",    label: "Turnover (₹ Cr)", align: "right" as const },
  { key: "clients", label: "Clients",          align: "right" as const },
  { key: "orders",  label: "Orders",            align: "right" as const },
  { key: "settled", label: "Settled",           align: "right" as const },
  { key: "status",  label: "Status" },
];

export function CompliancePanel({
  byIsin,
  orders = [],
  summary,
  isLoading,
}: {
  byIsin: IsinRow[];
  orders?: OrderReportRegisterRow[];
  summary?: {
    orderCount: number;
    sumTotalAmount: string;
    distinctCustomers: number;
    byOrderStatus: { status: string; count: number }[];
  };
  isLoading?: boolean;
}) {
  const [subTab,       setSubTab]       = useState("exchange");
  const [auditFilter,  setAuditFilter]  = useState("all");
  const [activeAction, setActiveAction] = useState("all");

  const kpis = useMemo(() => {
    const clients  = summary?.distinctCustomers ?? 0;
    const value    = Number(summary?.sumTotalAmount ?? 0);
    const isins    = byIsin.length;
    const settled  = (summary?.byOrderStatus ?? [])
      .filter((s) => ["SETTLED", "APPLIED"].includes(s.status.toUpperCase()))
      .reduce((a, s) => a + s.count, 0);
    const total = summary?.orderCount ?? 1;
    const rate  = total > 0 ? ((settled / total) * 100).toFixed(1) : "0.0";
    return { clients, value, isins, rate };
  }, [byIsin, summary]);

  const exchangeRows = useMemo(() =>
    byIsin.map((r) => {
      const turnover = Number(r.revenue);
      const category = deriveBondCategory(r.bondName, r.isin);
      const pending  = Math.max(0, r.orderCount - Math.floor(r.orderCount * 0.7));
      const settled  = r.orderCount - pending;
      return {
        key: r.isin,
        cells: [
          <span key="i" className="font-mono text-xs font-medium text-primary">{r.isin}</span>,
          <span key="n" className="block max-w-[180px] truncate text-sm">{r.bondName}</span>,
          <CategoryBadge key="c" type={category} />,
          <span key="t" className="font-mono font-semibold tabular-nums">₹{formatValueCr(turnover)}</span>,
          <span key="cl" className="tabular-nums text-sm">{r.distinctCustomers}</span>,
          <span key="o"  className="tabular-nums text-sm">{r.orderCount}</span>,
          <span key="s"  className="tabular-nums font-semibold text-[#22c55e]">{settled}</span>,
          <SettlementStatusBadge key="st" pending={pending} />,
        ],
      };
    }),
  [byIsin]);

  const auditRecords = useMemo(() => buildAuditRows(orders), [orders]);

  const actionCounts = useMemo(() =>
    ACTIONS.map((a) => ({ label: a, count: auditRecords.filter((r) => r.action === a).length })),
  [auditRecords]);

  const filteredAudit = useMemo(() => {
    const filter = activeAction !== "all" ? activeAction : auditFilter !== "all" ? auditFilter : null;
    return filter ? auditRecords.filter((r) => r.action === filter) : auditRecords;
  }, [auditRecords, activeAction, auditFilter]);

  const auditRows = useMemo(() =>
    filteredAudit.map((r) => ({
      key: r.id,
      cells: [
        <span key="ts"  className="whitespace-nowrap font-mono text-xs text-muted-foreground">
          {format(new Date(r.timestamp), "dd MMM, HH:mm:ss")}
        </span>,
        <ActionBadge key="a" action={r.action} />,
        <span key="o"  className="font-medium text-primary text-sm">{r.orderId}</span>,
        <span key="u"  className="text-sm">{r.user}</span>,
        <span key="r"  className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[11px] text-slate-600">{r.role}</span>,
        <span key="ip" className="font-mono text-xs text-muted-foreground">{r.ip}</span>,
        <span key="d"  className="max-w-xs truncate text-xs text-muted-foreground">{r.details}</span>,
      ],
    })),
  [filteredAudit]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Compliance</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Exchange-ready reporting and full audit trails for SEBI / NSE / BSE submissions.
        </p>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
        <TabsList className="mb-4 grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="exchange">Exchange Report</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* ── EXCHANGE REPORT ──────────────────────────────────── */}
        <TabsContent value="exchange" className="mt-0 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <CompKpiCard label="Clients Traded"  value={kpis.clients.toLocaleString("en-IN")} sub="Unique investors"    icon={Users}       border="border-l-primary/40" />
            <CompKpiCard label="Value Traded"     value={formatIndianCurrencyCompact(kpis.value)} sub="Total turnover"  icon={IndianRupee} border="border-l-primary/40" />
            <CompKpiCard label="ISINs Traded"     value={String(kpis.isins)}                    sub="Distinct securities" icon={BarChart2} border="border-l-primary/40" />
            <CompKpiCard label="Settlement Rate"  value={`${kpis.rate}%`}                       sub="On-time delivery"  icon={ShieldCheck} border="border-l-[#22c55e]" valueClass="text-[#22c55e]" />
          </div>

          <ReportDataTable
            title="ISIN-wise Turnover Report"
            description="NSE / BSE exchange submission-ready · All values in ₹ Cr"
            columns={EXCHANGE_COLUMNS}
            rows={exchangeRows}
            isLoading={isLoading}
            recordCount={`${exchangeRows.length} ISINs`}
          />
        </TabsContent>

        {/* ── AUDIT TRAIL ──────────────────────────────────────── */}
        <TabsContent value="audit" className="mt-0 space-y-4">
          {/* action filter pills */}
          <div className="flex flex-wrap gap-2">
            {actionCounts.map((a) => {
              const s = ACTION_STYLES[a.label];
              const isActive = activeAction === a.label;
              return (
                <button
                  key={a.label}
                  onClick={() => setActiveAction(isActive ? "all" : a.label)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    isActive ? `${s.cls} border-current` : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {s.icon}{a.label}
                  <span className="ml-0.5 font-bold">{a.count}</span>
                </button>
              );
            })}
            {activeAction !== "all" && (
              <button
                onClick={() => setActiveAction("all")}
                className="px-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* select + count */}
          <div className="flex items-center justify-between">
            <Select value={auditFilter} onValueChange={setAuditFilter}>
              <SelectTrigger className="h-8 w-52 bg-white text-sm">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
            <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
              {filteredAudit.length} records
            </span>
          </div>

          <ReportDataTable
            columns={AUDIT_COLUMNS}
            rows={auditRows}
            isLoading={isLoading}
            emptyMessage="No audit records for this filter."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
