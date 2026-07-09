"use client";

import type { OrderReportRegisterRow } from "@root/apiGateway";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { differenceInHours } from "date-fns";
import { useMemo, useState } from "react";
import {
  computePayInKpis,
  customerDisplayName,
  deriveClearing,
  deriveSettlementCycle,
  formatKpiAmount,
  formatUtrRef,
  formatValueCr,
  mapPayInStatus,
  type PayInStatusLabel,
} from "./settlementPayInHelpers";
import { formatOrderDate } from "./reportDerivations";
import { ReportDataTable, ReportKpiCard, ReportKpiGrid } from "./reportUi";

const AGING_BUCKETS = [
  { key: "lt24",    label: "Aging < 24 hrs",   color: "bg-emerald-500", textColor: "text-emerald-700", bg: "bg-emerald-50",  border: "border-l-emerald-500" },
  { key: "h2448",   label: "Aging 24–48 hrs",  color: "bg-blue-500",    textColor: "text-blue-700",    bg: "bg-blue-50",     border: "border-l-blue-500"    },
  { key: "h4872",   label: "Aging 48–72 hrs",  color: "bg-amber-400",   textColor: "text-amber-700",   bg: "bg-amber-50",    border: "border-l-amber-400"   },
  { key: "gt72",    label: "Aging > 72 hrs",   color: "bg-red-500",     textColor: "text-red-700",     bg: "bg-red-50",      border: "border-l-red-500"     },
] as const;

type BucketKey = (typeof AGING_BUCKETS)[number]["key"];

function agingBucket(hours: number): BucketKey {
  if (hours < 24) return "lt24";
  if (hours < 48) return "h2448";
  if (hours < 72) return "h4872";
  return "gt72";
}

function AgingLabel({ hours }: { hours: number }) {
  const bucket = agingBucket(hours);
  const colorClass =
    bucket === "lt24"  ? "text-emerald-600" :
    bucket === "h2448" ? "text-blue-600"    :
    bucket === "h4872" ? "text-amber-600"   :
                         "text-red-600";
  return (
    <span className={cn("text-xs font-semibold tabular-nums", colorClass)}>
      {hours}h
    </span>
  );
}

function PayInStatusBadge({ status }: { status: PayInStatusLabel }) {
  const className =
    status === "Received"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Pending"
        ? "bg-amber-100 text-amber-700"
        : status === "Failed"
          ? "bg-red-100 text-red-600"
          : "bg-slate-100 text-slate-500";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", className)}>
      {status}
    </span>
  );
}

const PAY_IN_COLUMNS = [
  { key: "order",      label: "Order ID" },
  { key: "customer",   label: "Customer" },
  { key: "isin",       label: "ISIN / Security" },
  { key: "value",      label: "Value (₹ Cr)", align: "right" as const },
  { key: "payin",      label: "Pay-in Status" },
  { key: "settlement", label: "Settlement" },
  { key: "clearing",   label: "Clearing" },
  { key: "utr",        label: "UTR / Ref" },
];

const AGING_COLUMNS = [
  { key: "order",    label: "Order ID" },
  { key: "customer", label: "Customer" },
  { key: "isin",     label: "ISIN" },
  { key: "status",   label: "Status" },
  { key: "aging",    label: "Aging" },
  { key: "rm",       label: "RM" },
  { key: "date",     label: "Date" },
  { key: "action",   label: "Action" },
];

export function SettlementPayInPanel({
  rows,
  isLoading,
}: {
  rows: OrderReportRegisterRow[];
  isLoading?: boolean;
}) {
  const [payInFilter, setPayInFilter] = useState<string>("__all__");
  const [subTab, setSubTab] = useState("pay-in");

  const kpis = useMemo(() => computePayInKpis(rows), [rows]);

  const filteredRows = useMemo(() => {
    if (payInFilter === "__all__") return rows;
    return rows.filter((r) => mapPayInStatus(r.paymentStatus) === payInFilter);
  }, [rows, payInFilter]);

  const payInRows = useMemo(() =>
    filteredRows.map((r) => {
      const payIn = mapPayInStatus(r.paymentStatus);
      return {
        key: r.id,
        cells: [
          <span key="o" className="font-mono text-xs font-medium text-slate-800">{r.orderNumber}</span>,
          <span key="c" className="text-sm">{customerDisplayName(r)}</span>,
          <div key="i" className="space-y-0.5">
            <span className="block font-mono text-xs font-medium text-slate-800">{r.isin}</span>
            <span className="block max-w-[200px] truncate text-[11px] text-slate-400">{r.bondName}</span>
          </div>,
          <span key="v" className="tabular-nums font-medium">{formatValueCr(Number(r.totalAmount))}</span>,
          <PayInStatusBadge key="p" status={payIn} />,
          <span key="s" className="text-xs tabular-nums">{deriveSettlementCycle(r)}</span>,
          <span key="cl" className="text-xs">{deriveClearing(r)}</span>,
          <span key="u" className="font-mono text-xs text-slate-500">{formatUtrRef(r)}</span>,
        ],
      };
    }),
  [filteredRows]);

  const agingData = useMemo(() => {
    return rows
      .filter((r) => mapPayInStatus(r.paymentStatus) === "Pending")
      .map((r) => ({ row: r, hours: differenceInHours(Date.now(), new Date(r.createdAt)) }))
      .sort((a, b) => b.hours - a.hours);
  }, [rows]);

  const bucketCounts = useMemo(() => {
    const counts: Record<BucketKey, number> = { lt24: 0, h2448: 0, h4872: 0, gt72: 0 };
    for (const { hours } of agingData) counts[agingBucket(hours)]++;
    return counts;
  }, [agingData]);

  const agingRows = useMemo(() =>
    agingData.map(({ row: r, hours }) => ({
      key: r.id,
      cells: [
        <span key="o" className="font-mono text-xs font-medium text-slate-800">{r.orderNumber}</span>,
        <span key="c" className="text-sm">{customerDisplayName(r)}</span>,
        <span key="i" className="font-mono text-xs font-medium text-slate-800">{r.isin}</span>,
        <PayInStatusBadge key="s" status="Pending" />,
        <AgingLabel key="h" hours={hours} />,
        <span key="rm" className="text-xs text-slate-400">—</span>,
        <span key="d" className="whitespace-nowrap text-xs text-slate-500">{formatOrderDate(r.createdAt)}</span>,
        <span key="a" className="inline-flex cursor-pointer items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 hover:bg-blue-100">
          Follow up
        </span>,
      ],
    })),
  [agingData]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Settlement</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Track pay-in status, settlement aging, and clearing operations.
        </p>
      </div>

      <ReportKpiGrid>
        <ReportKpiCard
          label="Pending Pay-in"
          value={formatKpiAmount(kpis.pendingAmount)}
          sub={`${kpis.pendingCount} orders`}
          valueClassName="text-amber-700"
        />
        <ReportKpiCard
          label="Received"
          value={formatKpiAmount(kpis.receivedAmount)}
          sub={`${kpis.receivedCount} orders`}
          valueClassName="text-emerald-700"
        />
        <ReportKpiCard
          label="Failed"
          value={String(kpis.failedCount)}
          sub="Requires action"
          valueClassName="text-red-700"
        />
        <ReportKpiCard
          label="Overdue"
          value={String(kpis.overdueCount)}
          sub="> 48 hrs pending"
          valueClassName="text-orange-700"
        />
      </ReportKpiGrid>

      {/* completion rate */}
      <div className="rounded-xl border border-border bg-white px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-700">Pay-in Completion Rate</p>
          <p className="text-sm tabular-nums text-muted-foreground">
            <span className="font-semibold text-foreground">{kpis.completionPct}%</span>
            {" · "}
            {kpis.receivedCount} received / {kpis.totalCount} total
          </p>
        </div>
        <Progress value={kpis.completionPct} className="mt-3 h-1.5" />
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="space-y-4">
        <TabsList className="inline-flex h-8 items-center gap-0.5 rounded-lg bg-muted/60 p-0.5">
          <TabsTrigger
            value="pay-in"
            className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground shadow-none transition-colors data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Pay-in Status
          </TabsTrigger>
          <TabsTrigger
            value="aging"
            className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground shadow-none transition-colors data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            Aging Tracker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pay-in" className="mt-0">
          <ReportDataTable
            columns={PAY_IN_COLUMNS}
            rows={payInRows}
            isLoading={isLoading}
            emptyMessage="No orders match this filter."
            recordCount={`${filteredRows.length} records`}
            toolbar={
              <Select value={payInFilter} onValueChange={setPayInFilter}>
                <SelectTrigger className="h-8 w-auto min-w-[140px] bg-white text-xs dark:bg-background">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Statuses</SelectItem>
                  <SelectItem value="Received">Received</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            }
          />
        </TabsContent>

        <TabsContent value="aging" className="mt-0 space-y-4">
          {/* bucket KPI cards */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {AGING_BUCKETS.map((b) => {
              const count = bucketCounts[b.key];
              const pct = agingData.length > 0 ? Math.round((count / agingData.length) * 100) : 0;
              return (
                <div key={b.key} className={cn("rounded-xl border border-border border-l-[3px] bg-white p-4", b.border)}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{b.label}</p>
                  <p className={cn("mt-2 text-2xl font-bold tabular-nums", b.textColor)}>{count}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{pct}% of total</p>
                </div>
              );
            })}
          </div>

          {/* aging distribution */}
          <div className="rounded-xl border border-border bg-white px-4 py-3">
            <p className="mb-3 text-sm font-medium text-slate-700">Aging Distribution</p>
            <div className="flex h-2 w-full overflow-hidden rounded-full">
              {AGING_BUCKETS.map((b) => {
                const pct = agingData.length > 0 ? (bucketCounts[b.key] / agingData.length) * 100 : 0;
                return pct > 0 ? (
                  <div key={b.key} className={cn("h-full", b.color)} style={{ width: `${pct}%` }} />
                ) : null;
              })}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
              {AGING_BUCKETS.map((b) => (
                <span key={b.key} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className={cn("inline-block size-2 rounded-full", b.color)} />
                  {b.label.replace("Aging ", "")}
                </span>
              ))}
            </div>
          </div>

          <ReportDataTable
            columns={AGING_COLUMNS}
            rows={agingRows}
            isLoading={isLoading}
            emptyMessage="No pending pay-in orders in this range."
            recordCount={`${agingData.length} pending`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
