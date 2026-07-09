"use client";

import type { OrderReportRegisterRow } from "@root/apiGateway";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  AlertCircle, AlertTriangle, CheckCircle2, Clock,
  Info, Flame, ClipboardList,
} from "lucide-react";
import { differenceInHours, format } from "date-fns";
import { useRouter } from "next/navigation";
import { encodeId } from "@/global/utils/url.utils";
import { useMemo, useState } from "react";
import { customerFullName, mapKycLabel, mapOrderWorkflowStatus } from "./reportDerivations";

type LogFailure = { id: number; orderId: number; step: string; status: string; createdAt: string };

export type ExceptionRow = {
  id: string;
  type: string;
  orderId: number;
  orderNumber: string;
  customer: string;
  isin: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Info";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  raised: string;
  assigned: string;
};

/* ── Severity / Status style maps ────────────────────────────────── */
const SEV: Record<string, { badge: string; row: string; border: string; icon: React.ReactNode }> = {
  Critical: {
    badge:  "bg-destructive/10 text-destructive border-destructive/20",
    row:    "bg-destructive/[0.03]",
    border: "border-l-destructive/60",
    icon:   <Flame size={10} className="mr-0.5" />,
  },
  High: {
    badge:  "bg-orange-500/10 text-orange-500 border-orange-500/20",
    row:    "bg-orange-500/[0.03]",
    border: "border-l-orange-500/60",
    icon:   <AlertTriangle size={10} className="mr-0.5" />,
  },
  Medium: {
    badge:  "bg-amber-500/10 text-amber-500 border-amber-500/20",
    row:    "bg-amber-500/[0.03]",
    border: "border-l-amber-500/40",
    icon:   <AlertTriangle size={10} className="mr-0.5" />,
  },
  Info: {
    badge:  "bg-blue-500/10 text-blue-500 border-blue-500/20",
    row:    "",
    border: "border-l-blue-500/40",
    icon:   <Info size={10} className="mr-0.5" />,
  },
};

const STATUS_CLS: Record<string, string> = {
  Open:          "bg-destructive/10 text-destructive border-destructive/20",
  "In Progress": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Resolved:      "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
  Closed:        "bg-muted text-muted-foreground border-border",
};

function SevBadge({ sev }: { sev: string }) {
  const s = SEV[sev] ?? SEV.Info;
  return (
    <span className={cn("inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold", s.badge)}>
      {s.icon}{sev}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", STATUS_CLS[status] ?? STATUS_CLS.Closed)}>
      {status}
    </span>
  );
}

/* ── Exception builder ───────────────────────────────────────────── */
function buildExceptions(failures: LogFailure[], orders: OrderReportRegisterRow[]): ExceptionRow[] {
  const orderById = new Map(orders.map((o) => [o.id, o]));
  const out: ExceptionRow[] = [];

  for (const f of failures) {
    const order = orderById.get(f.orderId);
    out.push({
      id: `EXC-L${f.id}`,
      type: "Automation failure",
      orderId: f.orderId,
      orderNumber: order?.orderNumber ?? `ID ${f.orderId}`,
      customer: order ? customerFullName(order) : "—",
      isin: order?.isin ?? "—",
      description: `Failed at step ${f.step}`,
      severity: "High",
      status: "Open",
      raised: format(new Date(f.createdAt), "dd MMM, HH:mm"),
      assigned: "Ops Team",
    });
  }

  for (const o of orders) {
    const hours = differenceInHours(Date.now(), new Date(o.createdAt));
    if (o.paymentStatus === "PENDING" && hours > 24) {
      out.push({
        id: `EXC-P${o.id}`,
        type: "Orders without pay-in",
        orderId: o.id,
        orderNumber: o.orderNumber,
        customer: customerFullName(o),
        isin: o.isin,
        description: hours > 48 ? "Pay-in overdue by 48 hrs — escalation required" : "Pay-in not received within 24 hrs of confirmation",
        severity: hours > 48 ? "Critical" : "High",
        status: "Open",
        raised: format(new Date(o.createdAt), "dd MMM, HH:mm"),
        assigned: "Ops Team",
      });
    }
    const kyc = mapKycLabel(o.customerProfile.kycStatus);
    if (kyc === "Pending" || kyc === "Expired") {
      out.push({
        id: `EXC-K${o.id}`,
        type: "KYC not validated",
        orderId: o.id,
        orderNumber: o.orderNumber,
        customer: customerFullName(o),
        isin: o.isin,
        description: `Order placed with KYC in ${kyc} state`,
        severity: kyc === "Expired" ? "Critical" : "High",
        status: "In Progress",
        raised: format(new Date(o.createdAt), "dd MMM, HH:mm"),
        assigned: "Compliance",
      });
    }
    if (o.status === "REJECTED") {
      out.push({
        id: `EXC-R${o.id}`,
        type: "Order rejected",
        orderId: o.id,
        orderNumber: o.orderNumber,
        customer: customerFullName(o),
        isin: o.isin,
        description: `Workflow: ${mapOrderWorkflowStatus(o.status, o.paymentStatus)}`,
        severity: "Medium",
        status: "Closed",
        raised: format(new Date(o.createdAt), "dd MMM, HH:mm"),
        assigned: "—",
      });
    }
  }

  return out.sort((a, b) => b.raised.localeCompare(a.raised));
}

/* ── Table with colored row borders ─────────────────────────────── */
const TH = "h-10 px-4 text-[11px] font-semibold text-slate-500 whitespace-nowrap text-left";

function ExcTable({ rows, columns }: {
  rows: ExceptionRow[];
  columns: { key: string; label: string; render: (r: ExceptionRow) => React.ReactNode }[];
}) {
  if (rows.length === 0) {
    return <p className="py-12 text-center text-sm text-muted-foreground">No exceptions match this filter.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-slate-50">
            {columns.map((c) => <th key={c.key} className={TH}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const s = SEV[r.severity] ?? SEV.Info;
            return (
              <tr key={r.id} className={cn("border-b border-slate-100 border-l-2 last:border-b-0 hover:bg-muted/50 transition-colors", s.border, s.row)}>
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">{c.render(r)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Panel ───────────────────────────────────────────────────────── */
export function ExceptionsPanel({
  failures,
  orders,
  isLoading,
}: {
  failures: LogFailure[];
  orders: OrderReportRegisterRow[];
  isLoading?: boolean;
}) {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [activeSev,      setActiveSev]      = useState("all");
  const [subTab,         setSubTab]         = useState("all");
  const router = useRouter();

  const exceptions = useMemo(() => buildExceptions(failures, orders), [failures, orders]);

  const kpis = useMemo(() => ({
    open:       exceptions.filter((e) => e.status === "Open").length,
    critical:   exceptions.filter((e) => e.severity === "Critical").length,
    inProgress: exceptions.filter((e) => e.status === "In Progress").length,
    resolved:   exceptions.filter((e) => e.status === "Resolved" || e.status === "Closed").length,
  }), [exceptions]);

  const sevCounts = useMemo(() => {
    const c = { Critical: 0, High: 0, Medium: 0, Info: 0 };
    for (const e of exceptions) if (e.severity in c) c[e.severity as keyof typeof c]++;
    return c;
  }, [exceptions]);

  const filtered = useMemo(() => {
    const sev = activeSev !== "all" ? activeSev : severityFilter !== "all" ? severityFilter : null;
    return exceptions.filter((e) => {
      if (sev && e.severity !== sev) return false;
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      return true;
    });
  }, [exceptions, activeSev, severityFilter, statusFilter]);

  const pendingExc = useMemo(() =>
    exceptions
      .filter((e) => e.status === "Open" || e.status === "In Progress")
      .sort((a, b) => {
        const order = { Critical: 0, High: 1, Medium: 2, Info: 3 };
        return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
      }),
  [exceptions]);

  const pendingCount = kpis.open + kpis.inProgress;

  if (isLoading) return <p className="py-14 text-center text-sm text-muted-foreground">Loading…</p>;

  const ALL_COLUMNS = [
    { key: "id",       label: "ID",          render: (r: ExceptionRow) => <span className="font-mono text-xs text-primary">{r.id}</span> },
    { key: "type",     label: "Type",         render: (r: ExceptionRow) => <span className="text-xs font-semibold">{r.type}</span> },
    { key: "order",    label: "Order",        render: (r: ExceptionRow) => <span className="font-medium text-sm">{r.orderNumber}</span> },
    { key: "customer", label: "Customer",     render: (r: ExceptionRow) => <span className="text-sm">{r.customer}</span> },
    { key: "isin",     label: "ISIN",         render: (r: ExceptionRow) => <span className="font-mono text-xs text-muted-foreground">{r.isin}</span> },
    { key: "desc",     label: "Description",  render: (r: ExceptionRow) => <span className="block max-w-[180px] truncate text-xs text-muted-foreground" title={r.description}>{r.description}</span> },
    { key: "sev",      label: "Severity",     render: (r: ExceptionRow) => <SevBadge sev={r.severity} /> },
    { key: "status",   label: "Status",       render: (r: ExceptionRow) => <StatusBadge status={r.status} /> },
    { key: "raised",   label: "Raised",       render: (r: ExceptionRow) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.raised}</span> },
    { key: "assigned", label: "Assigned",     render: (r: ExceptionRow) => <span className="text-xs">{r.assigned}</span> },
  ];

  const PENDING_COLUMNS = [
    { key: "id",       label: "Exception ID", render: (r: ExceptionRow) => <span className="font-mono text-xs text-primary">{r.id}</span> },
    { key: "type",     label: "Issue Type",   render: (r: ExceptionRow) => <span className="text-xs font-semibold">{r.type}</span> },
    { key: "order",    label: "Order",        render: (r: ExceptionRow) => <span className="font-medium text-sm">{r.orderNumber}</span> },
    { key: "assigned", label: "Assigned To",  render: (r: ExceptionRow) => <span className="text-sm">{r.assigned}</span> },
    { key: "raised",   label: "Raised",       render: (r: ExceptionRow) => <span className="whitespace-nowrap text-xs text-muted-foreground">{r.raised}</span> },
    { key: "sev",      label: "Priority",     render: (r: ExceptionRow) => <SevBadge sev={r.severity} /> },
    { key: "status",   label: "Status",       render: (r: ExceptionRow) => <StatusBadge status={r.status} /> },
    {
      key: "action", label: "Action",
      render: (r: ExceptionRow) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 border-primary/30 px-3 text-xs text-primary hover:bg-primary/5"
          onClick={() => router.push(`/dashboard/orders/${encodeId(r.orderId)}`)}
        >
          <ClipboardList size={11} /> Take Action
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exceptions</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Operational risk flags, KYC issues, settlement failures, and manual intervention cases.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Open",        val: kpis.open,       sub: "Require immediate action", border: "border-l-destructive/60",   valCls: "text-destructive",  icon: <AlertCircle  size={12} className="text-destructive" /> },
          { label: "Critical",    val: kpis.critical,   sub: "Highest priority",          border: "border-l-orange-500/60",    valCls: "text-orange-500",   icon: <Flame        size={12} className="text-orange-500" /> },
          { label: "In Progress", val: kpis.inProgress, sub: "Being investigated",         border: "border-l-amber-500/60",     valCls: "text-amber-500",    icon: <Clock        size={12} className="text-amber-500" /> },
          { label: "Resolved",    val: kpis.resolved,   sub: "Closed or resolved",         border: "border-l-[#22c55e]",        valCls: "text-[#22c55e]",    icon: <CheckCircle2 size={12} className="text-[#22c55e]" /> },
        ].map((k) => (
          <div key={k.label} className={cn("rounded-xl border border-border border-l-4 bg-white px-4 pb-3 pt-3", k.border)}>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {k.icon} {k.label}
            </div>
            <div className={cn("mt-1 text-3xl font-bold tabular-nums", k.valCls)}>{k.val}</div>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{k.sub}</p>
          </div>
        ))}
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
        <TabsList className="mb-4 grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="all">All Exceptions</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Actions
            {pendingCount > 0 && (
              <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── ALL EXCEPTIONS ───────────────────────────────────── */}
        <TabsContent value="all" className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="h-8 w-36 bg-white text-sm"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-36 bg-white text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-1.5 ml-1">
              {(["Critical", "High", "Medium", "Info"] as const).map((sev) => {
                const s = SEV[sev];
                const isActive = activeSev === sev;
                return (
                  <button
                    key={sev}
                    onClick={() => setActiveSev(isActive ? "all" : sev)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                      isActive ? `${s.badge} border-current` : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {s.icon}{sev} {sevCounts[sev]}
                  </button>
                );
              })}
            </div>
            <span className="ml-auto rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted-foreground">
              {filtered.length} exceptions
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <ExcTable rows={filtered} columns={ALL_COLUMNS} />
          </div>
        </TabsContent>

        {/* ── PENDING ACTIONS ──────────────────────────────────── */}
        <TabsContent value="pending">
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="border-b border-border px-4 pb-2 pt-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <AlertCircle size={14} className="text-destructive" /> Action Queue
              </p>
              <p className="text-xs text-slate-400">Open and in-progress exceptions requiring operator attention</p>
            </div>
            <ExcTable rows={pendingExc} columns={PENDING_COLUMNS} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
