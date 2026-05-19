"use client";

import type { OrderReportRegisterRow } from "@root/apiGateway";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

function PayInStatusBadge({ status }: { status: PayInStatusLabel }) {
  const className =
    status === "Received"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      : status === "Pending"
        ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        : status === "Failed"
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
          : "border-border bg-muted/60 text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("font-normal", className)}>
      {status}
    </Badge>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: "amber" | "emerald" | "red" | "orange";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-400"
      : accent === "amber"
        ? "text-amber-700 dark:text-amber-400"
        : accent === "red"
          ? "text-red-700 dark:text-red-400"
          : accent === "orange"
            ? "text-orange-700 dark:text-orange-400"
            : "text-foreground";
  return (
    <Card className="min-w-[140px] flex-1 border-border/80 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-xl font-semibold tabular-nums tracking-tight", accentClass)}>
          {value}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

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

  const agingRows = useMemo(() => {
    return rows
      .filter((r) => mapPayInStatus(r.paymentStatus) === "Pending")
      .map((r) => ({
        row: r,
        hours: differenceInHours(Date.now(), new Date(r.createdAt)),
      }))
      .sort((a, b) => b.hours - a.hours);
  }, [rows]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Settlement</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Track pay-in status, settlement aging, and clearing operations.
        </p>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab} className="space-y-4">
        <TabsList className="h-9 rounded-lg bg-muted/50 p-1">
          <TabsTrigger value="pay-in" className="rounded-md text-sm">
            Pay-in Status
          </TabsTrigger>
          <TabsTrigger value="aging" className="rounded-md text-sm">
            Aging Tracker
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pay-in" className="mt-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="Pending Pay-in"
              value={formatKpiAmount(kpis.pendingAmount)}
              sub={`${kpis.pendingCount} orders`}
              accent="amber"
            />
            <KpiCard
              label="Received"
              value={formatKpiAmount(kpis.receivedAmount)}
              sub={`${kpis.receivedCount} orders`}
              accent="emerald"
            />
            <KpiCard
              label="Failed"
              value={String(kpis.failedCount)}
              sub="Requires action"
              accent="red"
            />
            <KpiCard
              label="Overdue"
              value={String(kpis.overdueCount)}
              sub="> 48 hrs pending"
              accent="orange"
            />
          </div>

          <Card className="border-border/80 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">Pay-in Completion Rate</p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  <span className="font-semibold text-foreground">{kpis.completionPct}%</span>
                  {" · "}
                  {kpis.receivedCount} received / {kpis.totalCount} total
                </p>
              </div>
              <Progress value={kpis.completionPct} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Pay-in register</CardTitle>
                <CardDescription className="text-xs">
                  Orders in the selected date range with pay-in and clearing details.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={payInFilter} onValueChange={setPayInFilter}>
                  <SelectTrigger className="h-9 w-[160px]">
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
                <span className="text-xs text-muted-foreground tabular-nums">
                  {filteredRows.length} records
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
              ) : filteredRows.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No orders match this filter.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border/80">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Order ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Customer
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          ISIN / Security
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Value (₹ Cr)
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Pay-in Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Settlement
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Clearing
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          UTR / Ref
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRows.map((r) => {
                        const payIn = mapPayInStatus(r.paymentStatus);
                        return (
                          <TableRow key={r.id} className="hover:bg-muted/30">
                            <TableCell className="font-mono text-xs">{r.orderNumber}</TableCell>
                            <TableCell className="text-sm">{customerDisplayName(r)}</TableCell>
                            <TableCell>
                              <span className="block font-mono text-xs">{r.isin}</span>
                              <span className="block max-w-[200px] truncate text-xs text-muted-foreground">
                                {r.bondName}
                              </span>
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">
                              {formatValueCr(Number(r.totalAmount))}
                            </TableCell>
                            <TableCell>
                              <PayInStatusBadge status={payIn} />
                            </TableCell>
                            <TableCell className="text-sm tabular-nums">
                              {deriveSettlementCycle(r)}
                            </TableCell>
                            <TableCell className="text-sm">{deriveClearing(r)}</TableCell>
                            <TableCell className="font-mono text-xs">{formatUtrRef(r)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="mt-0 space-y-4">
          <Card className="border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Pending pay-in aging</CardTitle>
              <CardDescription className="text-xs">
                Orders still awaiting pay-in, sorted by time since creation.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {agingRows.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No pending pay-in orders in this range.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border/80">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Order ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Customer
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          ISIN / Security
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Value (₹ Cr)
                        </TableHead>
                        <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Hours pending
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Pay-in Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agingRows.map(({ row: r, hours }) => (
                        <TableRow key={r.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono text-xs">{r.orderNumber}</TableCell>
                          <TableCell className="text-sm">{customerDisplayName(r)}</TableCell>
                          <TableCell>
                            <span className="block font-mono text-xs">{r.isin}</span>
                            <span className="block max-w-[200px] truncate text-xs text-muted-foreground">
                              {r.bondName}
                            </span>
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {formatValueCr(Number(r.totalAmount))}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right tabular-nums text-sm",
                              hours > 48 && "font-medium text-orange-600 dark:text-orange-400",
                            )}
                          >
                            {hours}h
                          </TableCell>
                          <TableCell>
                            <PayInStatusBadge status="Pending" />
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
      </Tabs>
    </div>
  );
}
