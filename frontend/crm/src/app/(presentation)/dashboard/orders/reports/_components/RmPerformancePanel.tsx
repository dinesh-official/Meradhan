"use client";

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import {
  Bar, CartesianGrid, ComposedChart, Line,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";
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

/* ── RM data generation ─────────────────────────────────────────── */
const RM_NAMES = [
  "Sanjay Kumar", "Anjali Desai", "Deepa Mehta",
  "Vikram Reddy", "Priya Patel",
];

type RmRow = {
  name: string; initials: string; rank: number;
  ordersHandled: number; conversionRate: number;
  revenueGenerated: number; customersAcquired: number;
  avgTicket: number; followUpEfficiency: number;
  monthlyTrend: { month: string; orders: number; revenue: number }[];
};

function buildRmList(orderCount: number, totalRevenue: number, customerCount: number): RmRow[] {
  const weights = [0.30, 0.25, 0.20, 0.15, 0.10];
  return RM_NAMES.map((name, i) => {
    const w = weights[i];
    const orders = Math.max(1, Math.round(orderCount * w));
    const revenue = parseFloat((totalRevenue / 1e7 * w).toFixed(2));
    return {
      name,
      initials: name.split(" ").map((n) => n[0]).join(""),
      rank: i + 1,
      ordersHandled: orders,
      conversionRate: parseFloat((68 - i * 2.5).toFixed(1)),
      revenueGenerated: revenue,
      customersAcquired: Math.max(1, Math.round(customerCount * w)),
      avgTicket: orders > 0 ? parseFloat((revenue / orders).toFixed(2)) : 0,
      followUpEfficiency: parseFloat((82 - i * 3.5).toFixed(1)),
      monthlyTrend: [
        { month: "Feb", orders: Math.round(orders * 0.7), revenue: parseFloat((revenue * 0.7).toFixed(2)) },
        { month: "Mar", orders: Math.round(orders * 0.8), revenue: parseFloat((revenue * 0.8).toFixed(2)) },
        { month: "Apr", orders: Math.round(orders * 0.9), revenue: parseFloat((revenue * 0.9).toFixed(2)) },
        { month: "May", orders,                           revenue },
      ],
    };
  });
}

/* ── Panel ──────────────────────────────────────────────────────── */
export function RmPerformancePanel({
  orderCount,
  totalRevenue,
  customerCount,
  isLoading,
}: {
  orderCount: number;
  totalRevenue: number;
  customerCount: number;
  isLoading?: boolean;
}) {
  const [subTab, setSubTab]     = useState("leaderboard");
  const [selectedRm, setSelectedRm] = useState("");

  const rmList = useMemo(
    () => buildRmList(orderCount, totalRevenue, customerCount),
    [orderCount, totalRevenue, customerCount],
  );

  const maxOrders  = Math.max(...rmList.map((r) => r.ordersHandled), 1);
  const maxRevenue = Math.max(...rmList.map((r) => r.revenueGenerated), 1);

  const individual = rmList.find((r) => r.name === selectedRm) ?? rmList[0];

  if (isLoading) return <p className="py-14 text-center text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">RM Performance</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Track relationship manager performance, conversion rates, and revenue contribution.
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
          {/* top performer cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rmList.slice(0, 3).map((r) => (
              <div key={r.name} className="rounded-xl border border-border bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {r.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{r.name}</p>
                    <div className="mt-0.5"><RankBadge rank={r.rank} /></div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: "Orders",      val: String(r.ordersHandled),         cls: "" },
                    { label: "Conversion",  val: `${r.conversionRate}%`,           cls: "text-[#22c55e]" },
                    { label: "Revenue",     val: `₹${r.revenueGenerated} Cr`,     cls: "" },
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
                    <p className="text-[11px] text-slate-400">Follow-up efficiency</p>
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
                    {["Rank","RM Name","Orders Handled","Conversion Rate","Revenue Generated","Customers","Avg Ticket","Follow-up"].map((h) => (
                      <th key={h} className={cn(
                        "h-10 px-4 text-[11px] font-semibold text-slate-500",
                        ["Orders Handled","Conversion Rate","Revenue Generated","Customers","Avg Ticket","Follow-up"].includes(h) && "text-right",
                      )}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rmList.map((r) => (
                    <tr key={r.name} className="border-b border-slate-100 bg-white last:border-0 hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3"><RankBadge rank={r.rank} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {r.initials}
                          </div>
                          <span className="font-medium">{r.name}</span>
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
                          <MiniBar pct={(r.revenueGenerated / maxRevenue) * 100} color="#22c55e" />
                          <span className="font-semibold tabular-nums">₹{r.revenueGenerated}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.customersAcquired}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">₹{r.avgTicket} Cr</td>
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
          {/* RM selector */}
          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Select RM:</span>
            <Select value={selectedRm || rmList[0].name} onValueChange={setSelectedRm}>
              <SelectTrigger className="h-8 w-52 bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rmList.map((r) => (
                  <SelectItem key={r.name} value={r.name}>
                    <div className="flex items-center gap-2">
                      <RankBadge rank={r.rank} />
                      {r.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 4 KPI cards with progress bars */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            {[
              { label: "Orders Handled",  val: String(individual.ordersHandled),     cls: "",               pct: (individual.ordersHandled / maxOrders) * 100,        bar: "hsl(var(--primary))" },
              { label: "Conversion Rate", val: `${individual.conversionRate}%`,       cls: "text-[#22c55e]", pct: individual.conversionRate,                            bar: "#22c55e" },
              { label: "Revenue",         val: `₹${individual.revenueGenerated} Cr`, cls: "",               pct: (individual.revenueGenerated / maxRevenue) * 100,     bar: "#22c55e" },
              { label: "Customers",       val: String(individual.customersAcquired), cls: "",               pct: 75,                                                    bar: "hsl(var(--primary))" },
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

          {/* monthly performance chart */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
