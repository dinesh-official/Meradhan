"use client";

import type { OrderReportsRevenueResponse } from "@root/apiGateway";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { IndianRupee, BarChart2, Calendar, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";
import { ReportDataTable, ReportKpiGrid } from "./reportUi";

const GREEN = "#22c55e";

/* ── Spread bps badge ─────────────────────────────────────────────── */
function SpreadBadge({ bps }: { bps: number | null }) {
  if (bps == null) return <span className="text-xs text-slate-400">—</span>;
  const cls =
    bps <= 30 ? "bg-emerald-50 text-emerald-700" :
    bps <= 60 ? "bg-blue-50 text-blue-700"       :
    bps <= 100 ? "bg-amber-50 text-amber-700"     :
                 "bg-red-50 text-red-600";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums", cls)}>
      {bps} bps
    </span>
  );
}

/* ── KPI card (matches reference: left border + icon) ──────────────── */
function RevKpiCard({
  label, value, sub, icon: Icon, green,
}: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  green?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-border border-l-4 bg-white p-4", green ? "border-l-[#22c55e]" : "border-l-primary/40")}>
      <p className={cn("flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground")}>
        <Icon size={12} />
        {label}
      </p>
      <p className={cn("mt-1.5 text-2xl font-bold tabular-nums", green ? "text-[#22c55e]" : "text-foreground")}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

/* ── column defs ───────────────────────────────────────────────────── */
const PNL_COLUMNS = [
  { key: "period",  label: "Period" },
  { key: "orders",  label: "Orders",       align: "right" as const },
  { key: "value",   label: "Value (₹ Cr)", align: "right" as const },
  { key: "revenue", label: "Revenue",      align: "right" as const },
  { key: "spread",  label: "Avg Spread",   align: "right" as const },
  { key: "growth",  label: "MoM Growth",   align: "right" as const },
];

function formatCleanPrice(v: number | null) {
  return v != null && Number.isFinite(v) ? v.toFixed(4) : "—";
}

export function RevenuePanel({
  data,
  isLoading,
}: {
  data: OrderReportsRevenueResponse["responseData"] | undefined;
  isLoading?: boolean;
}) {
  const [subTab, setSubTab] = useState("spread");
  const rows  = data?.rows ?? [];
  const kpis  = data?.kpis;

  /* bar chart data */
  const chartData = useMemo(() =>
    [...rows].sort((a, b) => Number(b.revenue) - Number(a.revenue))
      .slice(0, 10)
      .map((r) => ({
        isin:    r.isin.length > 10 ? `${r.isin.slice(0, 10)}…` : r.isin,
        revenue: Number(r.revenue),
      })),
  [rows]);

  /* spread table rows */
  const spreadRows = useMemo(() =>
    rows.map((r) => ({
      key: r.isin,
      cells: [
        <span key="i" className="font-mono text-xs font-medium text-primary">{r.isin}</span>,
        <span key="s" className="block max-w-[160px] truncate text-xs">{r.bondName}</span>,
        <span key="b" className="font-mono text-xs tabular-nums">{formatCleanPrice(r.buyPrice)}</span>,
        <span key="sl" className="font-mono text-xs tabular-nums">{formatCleanPrice(r.sellPrice)}</span>,
        <SpreadBadge key="sp" bps={r.spreadBps ?? null} />,
        <span key="r" className="text-xs font-semibold tabular-nums" style={{ color: GREEN }}>
          ₹{Number(r.revenue).toFixed(2)}
        </span>,
        <span key="o" className="tabular-nums text-xs text-muted-foreground">{r.orderCount}</span>,
      ],
    })),
  [rows]);

  /* P&L table rows */
  const pnlRows = useMemo(() => {
    if (!kpis) return [];
    return [
      { label: "Selected period", revenue: Number(kpis.totalRevenue), spread: kpis.avgSpreadBps },
      { label: `FY (${kpis.fyLabel})`,   revenue: Number(kpis.fyRevenue),    spread: kpis.avgSpreadBps },
      { label: `MTD (${kpis.mtdLabel})`, revenue: Number(kpis.mtdRevenue),   spread: kpis.avgSpreadBps },
    ].map((row) => ({
      key: row.label,
      cells: [
        <span key="p" className="text-sm font-semibold">{row.label}</span>,
        <span key="o" className="tabular-nums text-sm text-muted-foreground">—</span>,
        <span key="v" className="tabular-nums text-sm text-muted-foreground">—</span>,
        <span key="r" className="text-sm font-semibold tabular-nums" style={{ color: GREEN }}>
          {formatIndianCurrencyCompact(row.revenue)}
        </span>,
        <span key="s" className="tabular-nums text-sm">
          {row.spread != null ? `${row.spread} bps` : "—"}
        </span>,
        <span key="g" className="text-xs text-muted-foreground">—</span>,
      ],
    }));
  }, [kpis]);

  /* P&L trend chart – derive simple month buckets from rows if possible */
  const trendData = useMemo(() => [
    { period: "Selected", revenue: Number(kpis?.totalRevenue ?? 0), orders: rows.reduce((s, r) => s + r.orderCount, 0) },
    { period: `FY`,       revenue: Number(kpis?.fyRevenue ?? 0),    orders: 0 },
    { period: `MTD`,      revenue: Number(kpis?.mtdRevenue ?? 0),   orders: 0 },
  ], [kpis, rows]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Revenue</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Spread analysis, P&amp;L tracking, and earnings by ISIN and period.
        </p>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
        <TabsList className="mb-4 grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="spread">Spread Report</TabsTrigger>
          <TabsTrigger value="pl">P&amp;L Summary</TabsTrigger>
        </TabsList>

        {/* ── SPREAD REPORT ─────────────────────────────────────────── */}
        <TabsContent value="spread" className="space-y-4">
          <ReportKpiGrid>
            <RevKpiCard
              label="Total Revenue"
              value={`₹${Number(kpis?.totalRevenue ?? 0).toFixed(2)} Cr`}
              sub="Across all ISINs"
              icon={IndianRupee}
              green
            />
            <RevKpiCard
              label="Avg Spread"
              value={kpis?.avgSpreadBps != null ? `${kpis.avgSpreadBps} bps` : "—"}
              sub="Platform average"
              icon={BarChart2}
            />
            <RevKpiCard
              label="Revenue This FY"
              value={formatIndianCurrencyCompact(Number(kpis?.fyRevenue ?? 0))}
              sub={kpis?.fyLabel ?? "Financial year"}
              icon={Calendar}
            />
            <RevKpiCard
              label="MTD Revenue"
              value={formatIndianCurrencyCompact(Number(kpis?.mtdRevenue ?? 0))}
              sub={kpis?.mtdLabel ?? "Month to date"}
              icon={Clock}
            />
          </ReportKpiGrid>

          {/* chart + table stacked */}
          <div className="flex flex-col gap-4">
            {/* bar chart */}
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              <div className="px-4 pb-1 pt-4">
                <p className="text-sm font-semibold">Revenue by ISIN</p>
                <p className="text-xs text-slate-400">Top 10 by earnings contribution</p>
              </div>
              <div className="h-[180px] px-2 pb-4">
                {isLoading ? (
                  <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading…</p>
                ) : chartData.length === 0 ? (
                  <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No data</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} layout="vertical" margin={{ left: 16, right: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${v}Cr`}
                      />
                      <YAxis
                        type="category"
                        dataKey="isin"
                        width={105}
                        tick={{ fontSize: 9 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", borderColor: "hsl(var(--border))", fontSize: 12 }}
                        formatter={(v: number) => [`₹${v} Cr`, "Revenue"]}
                      />
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={GREEN} fillOpacity={1 - i * 0.06} />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* spread table */}
            <div>
              <ReportDataTable
                title="Spread Details"
                description="Buy / sell prices, spread in bps, and revenue per ISIN"
                columns={[
                  { key: "isin",     label: "ISIN" },
                  { key: "security", label: "Security" },
                  { key: "buy",      label: "Buy",     align: "right" as const },
                  { key: "sell",     label: "Sell",    align: "right" as const },
                  { key: "spread",   label: "Spread" },
                  { key: "revenue",  label: "Revenue", align: "right" as const },
                  { key: "orders",   label: "Orders",  align: "right" as const },
                ]}
                rows={spreadRows}
                isLoading={isLoading}
                emptyMessage="No completed orders in this range."
                recordCount={`${rows.length} ISINs`}
              />
            </div>
          </div>
        </TabsContent>

        {/* ── P&L SUMMARY ───────────────────────────────────────────── */}
        <TabsContent value="pl" className="space-y-4">
          {/* trend chart */}
          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="px-4 pb-1 pt-4">
              <p className="text-sm font-semibold">Revenue Trend</p>
              <p className="text-xs text-slate-400">Bars = revenue · Line = orders</p>
            </div>
            <div className="h-64 px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "hsl(var(--border))", fontSize: 12 }}
                  />
                  <Bar    yAxisId="left"  dataKey="revenue" fill={GREEN}                  radius={[4, 4, 0, 0]} name="Revenue (₹ Cr)" />
                  <Line  yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Orders" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <ReportDataTable
            title="P&L Summary"
            description="Spread-based platform revenue by period (completed orders, IST calendar)."
            columns={PNL_COLUMNS}
            rows={pnlRows}
            isLoading={isLoading}
            emptyMessage="No P&L data available."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
