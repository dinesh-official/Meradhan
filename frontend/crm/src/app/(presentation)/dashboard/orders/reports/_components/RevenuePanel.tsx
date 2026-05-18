"use client";

import type { OrderReportsRevenueResponse } from "@root/apiGateway";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumberTS } from "@/global/utils/formate";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";

function KpiCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="min-w-[140px] flex-1 border-border/80 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function formatCleanPrice(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(4);
}

export function RevenuePanel({
  data,
  isLoading,
}: {
  data: OrderReportsRevenueResponse["responseData"] | undefined;
  isLoading?: boolean;
}) {
  const [subTab, setSubTab] = useState("spread");

  const rows = data?.rows ?? [];
  const kpis = data?.kpis;

  const chartData = useMemo(() => {
    return rows.slice(0, 10).map((r) => ({
      name: r.isin.length > 12 ? `${r.isin.slice(0, 12)}…` : r.isin,
      revenue: Number(r.revenue),
    }));
  }, [rows]);

  const pnlRows = useMemo(() => {
    if (!kpis) return [];
    return [
      {
        label: "Selected period (spread)",
        amount: Number(kpis.totalRevenue),
        note: "Completed pay-ins in filter range",
      },
      {
        label: `FY (${kpis.fyLabel})`,
        amount: Number(kpis.fyRevenue),
        note: "Indian financial year to date",
      },
      {
        label: `MTD (${kpis.mtdLabel})`,
        amount: Number(kpis.mtdRevenue),
        note: "Calendar month to date (IST)",
      },
    ];
  }, [kpis]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Revenue</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Spread analysis, P&L tracking, and earnings by ISIN and period.
        </p>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="space-y-4">
        <TabsList className="h-9 rounded-lg bg-muted/50 p-1">
          <TabsTrigger value="spread" className="rounded-md text-sm">
            Spread Report
          </TabsTrigger>
          <TabsTrigger value="pnl" className="rounded-md text-sm">
            P&L Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spread" className="mt-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Total Revenue"
              value={formatIndianCurrencyCompact(Number(kpis?.totalRevenue ?? 0))}
              sub="Across all ISINs"
            />
            <KpiCard
              label="Avg Spread"
              value={kpis?.avgSpreadBps != null ? `${kpis.avgSpreadBps} bps` : "—"}
              sub="Platform average"
            />
            <KpiCard
              label="Revenue This FY"
              value={formatIndianCurrencyCompact(Number(kpis?.fyRevenue ?? 0))}
              sub={kpis?.fyLabel ?? "Financial year"}
            />
            <KpiCard
              label="MTD Revenue"
              value={formatIndianCurrencyCompact(Number(kpis?.mtdRevenue ?? 0))}
              sub={kpis?.mtdLabel ?? "Month to date"}
            />
          </div>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Revenue by ISIN</CardTitle>
              <CardDescription className="text-xs">
                Top 10 by earnings contribution (spread on completed orders)
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4" style={{ height: 280 }}>
              {isLoading ? (
                <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>
              ) : chartData.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  No revenue data for this period.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 4, right: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => formatIndianCurrencyCompact(v)}
                    />
                    <YAxis dataKey="name" type="category" width={108} tick={{ fontSize: 9 }} />
                    <Tooltip
                      formatter={(v: number) => [formatIndianCurrencyCompact(v), "Revenue"]}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Spread Details</CardTitle>
              <CardDescription className="text-xs">
                Buy / sell prices, spread in bps, and revenue per ISIN
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
              ) : rows.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No completed orders in this range.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border/80">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          ISIN
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Security
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Buy
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Sell
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Spread
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Revenue
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Orders
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.isin} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs">{r.isin}</TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm">
                            {r.bondName}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {formatCleanPrice(r.buyPrice)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {formatCleanPrice(r.sellPrice)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {r.spreadBps != null ? `${r.spreadBps} bps` : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm font-medium">
                            {formatIndianCurrencyCompact(Number(r.revenue))}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {r.orderCount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pnl" className="mt-0 space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">P&L summary</CardTitle>
              <CardDescription className="text-xs">
                Spread-based platform revenue by period (completed orders, IST calendar).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border/80">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Period
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Spread revenue
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Notes
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pnlRows.map((row) => (
                        <TableRow key={row.label} className="hover:bg-muted/30">
                          <TableCell className="text-sm font-medium">{row.label}</TableCell>
                          <TableCell className="text-right tabular-nums text-sm font-semibold">
                            {formatIndianCurrencyCompact(row.amount)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{row.note}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableCell className="text-sm font-semibold">Avg spread (period)</TableCell>
                        <TableCell className="text-right tabular-nums text-sm font-semibold">
                          {kpis?.avgSpreadBps != null ? `${kpis.avgSpreadBps} bps` : "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          Revenue-weighted across {formatNumberTS(rows.length)} ISIN
                          {rows.length === 1 ? "" : "s"}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

