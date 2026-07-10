"use client";

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { OrderReportsRmPerformanceRow } from "@root/apiGateway";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import {
  Bar, CartesianGrid, ComposedChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";
import { customerInitials, formatValueCr } from "./reportDerivations";
import { useMemo, useState } from "react";

/* ── Rank medal ─────────────────────────────────────────────────── */
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={16} className="text-yellow-500" />;
  if (rank === 2) return <Medal  size={16} className="text-slate-400" />;
  if (rank === 3) return <Medal  size={16} className="text-amber-600" />;
  return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
}

/* ── Mini horizontal progress bar ──────────────────────────────── */
function MiniBar({ pct, color = "hsl(var(--primary))" }: { pct: number; color?: string }) {
  return (
    <div className="h-1 w-12 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} />
    </div>
  );
}

type RmRow = OrderReportsRmPerformanceRow & {
  rank: number;
  initials: string;
  revenueCr: number;
  avgTicketCr: number;
};

function toRmRows(data: OrderReportsRmPerformanceRow[]): RmRow[] {
  return data.map((row, index) => {
    const revenueCr = Number(formatValueCr(Number(row.revenueGenerated)));
    const avgTicketCr = row.ordersHandled > 0
      ? revenueCr / row.ordersHandled
      : 0;
    return {
      ...row,
      rank: index + 1,
      initials: customerInitials(row.name),
      revenueCr,
      avgTicketCr,
      monthlyTrend: row.monthlyTrend.map((m) => ({
        ...m,
        revenue: Number(m.revenue),
      })),
    };
  });
}

function rmKey(row: Pick<RmRow, "rmId" | "name">): string {
  return row.rmId == null ? "unassigned" : String(row.rmId);
}

/* ── Panel ──────────────────────────────────────────────────────── */
export function RmPerformancePanel({
  data,
  isLoading,
}: {
  data: OrderReportsRmPerformanceRow[];
  isLoading?: boolean;
}) {
  const [subTab, setSubTab] = useState("leaderboard");
  const [selectedKey, setSelectedKey] = useState("");

  const rmList = useMemo(() => toRmRows(data), [data]);

  const maxOrders  = Math.max(...rmList.map((r) => r.ordersHandled), 1);
  const maxRevenue = Math.max(...rmList.map((r) => r.revenueCr), 0.01);

  const individual = rmList.find((r) => rmKey(r) === selectedKey) ?? rmList[0];

  if (isLoading) return <p className="py-14 text-center text-sm text-muted-foreground">Loading…</p>;

  if (rmList.length === 0) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">RM Performance</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Track relationship manager performance, conversion rates, and revenue contribution.
          </p>
        </div>
        <p className="rounded-xl border border-border bg-white py-14 text-center text-sm text-muted-foreground">
          No RM performance data for the selected filters and date range.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">RM Performance</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Aggregated from orders in the selected period, grouped by each customer&apos;s assigned relationship manager.
        </p>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
        <TabsList className="mb-4 inline-flex h-8 items-center gap-0.5 rounded-lg bg-muted/60 p-0.5">
          <TabsTrigger value="leaderboard" className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground shadow-none data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="individual"  className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground shadow-none data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm">
            Individual
          </TabsTrigger>
        </TabsList>

        {/* ── LEADERBOARD ──────────────────────────────────────── */}
        <TabsContent value="leaderboard" className="mt-0 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rmList.slice(0, 3).map((r) => (
              <div key={rmKey(r)} className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {r.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{r.name}</p>
                    <div className="mt-0.5"><RankBadge rank={r.rank} /></div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: "Orders",      val: String(r.ordersHandled),         cls: "" },
                    { label: "Conversion",  val: `${r.conversionRate}%`,           cls: "text-[#22c55e]" },
                    { label: "Revenue",     val: `₹${r.revenueCr.toFixed(2)} Cr`,  cls: "" },
                    { label: "Customers",   val: String(r.customersAcquired),      cls: "" },
                  ].map((m) => (
                    <div key={m.label}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{m.label}</p>
                      <p className={cn("mt-0.5 text-lg font-bold tabular-nums", m.cls)}>{m.val}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400">Settlement rate (paid orders)</p>
                    <span className="text-xs font-semibold tabular-nums text-slate-600">{r.followUpEfficiency}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${r.followUpEfficiency}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50">
                    {["Rank","RM Name","Orders Handled","Conversion Rate","Revenue Generated","Customers","Avg Ticket","Settlement Rate"].map((h) => (
                      <th key={h} className={cn(
                        "h-10 px-4 text-[11px] font-semibold text-slate-500",
                        ["Orders Handled","Conversion Rate","Revenue Generated","Customers","Avg Ticket","Settlement Rate"].includes(h) && "text-right",
                      )}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rmList.map((r) => (
                    <tr key={rmKey(r)} className="border-b border-slate-100 bg-white last:border-0 hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3"><RankBadge rank={r.rank} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {r.initials}
                          </div>
                          <div className="min-w-0">
                            <span className="block font-medium">{r.name}</span>
                            {r.email ? (
                              <span className="block truncate text-[11px] text-muted-foreground">{r.email}</span>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <MiniBar pct={(r.ordersHandled / maxOrders) * 100} />
                          <span className="font-medium tabular-nums">{r.ordersHandled}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold tabular-nums text-[#22c55e]">{r.conversionRate}%</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <MiniBar pct={(r.revenueCr / maxRevenue) * 100} color="#22c55e" />
                          <span className="font-semibold tabular-nums">₹{r.revenueCr.toFixed(2)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.customersAcquired}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {formatIndianCurrencyCompact(Number(r.avgTicket))}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${r.followUpEfficiency}%` }} />
                          </div>
                          <span className="w-8 text-right text-xs text-muted-foreground tabular-nums">{r.followUpEfficiency}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* ── INDIVIDUAL ───────────────────────────────────────── */}
        <TabsContent value="individual" className="mt-0 space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Select RM:</span>
            <Select
              value={selectedKey || rmKey(rmList[0])}
              onValueChange={setSelectedKey}
            >
              <SelectTrigger className="h-8 w-52 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rmList.map((r) => (
                  <SelectItem key={rmKey(r)} value={rmKey(r)}>
                    <div className="flex items-center gap-2">
                      <RankBadge rank={r.rank} />
                      {r.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {individual ? (
            <>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
                {[
                  { label: "Orders Handled",  val: String(individual.ordersHandled),      cls: "",               pct: (individual.ordersHandled / maxOrders) * 100,        bar: "hsl(var(--primary))" },
                  { label: "Conversion Rate", val: `${individual.conversionRate}%`,        cls: "text-[#22c55e]", pct: individual.conversionRate,                            bar: "#22c55e" },
                  { label: "Revenue",         val: `₹${individual.revenueCr.toFixed(2)} Cr`, cls: "",             pct: (individual.revenueCr / maxRevenue) * 100,           bar: "#22c55e" },
                  { label: "Customers",       val: String(individual.customersAcquired),   cls: "",               pct: Math.min(100, individual.customersAcquired * 10),      bar: "hsl(var(--primary))" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl border border-border border-l-[3px] border-l-primary/30 bg-white px-4 pb-3 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{m.label}</p>
                    <p className={cn("mt-1 text-2xl font-bold tabular-nums", m.cls)}>{m.val}</p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, m.pct)}%`, backgroundColor: m.bar }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-border bg-white">
                <div className="px-4 pb-1 pt-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <TrendingUp size={14} className="text-primary" />
                    Monthly Performance — {individual.name}
                  </p>
                  <p className="text-xs text-slate-400">Bars = order count · Line = revenue (₹ Cr)</p>
                </div>
                <div className="h-60 px-2 pb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={individual.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left"  tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}Cr`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#ffffff", borderColor: "hsl(var(--border))", fontSize: 12 }}
                      />
                      <Bar  yAxisId="left"  dataKey="orders"  fill="hsl(var(--primary))" radius={[4,4,0,0]} name="Orders" />
                      <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Revenue (₹ Cr)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
