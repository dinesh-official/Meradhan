"use client";

import type { ComponentType } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumberTS } from "@/global/utils/formate";
import type { OrderReportsSummaryResponse } from "@root/apiGateway";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  buildLifecycleFunnel,
  buildStatusSlices,
  countByOrderStatus,
  formatBucketLabel,
  formatIndianCurrencyCompact,
} from "./orderReportFormatters";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  IndianRupee,
  ShoppingCart,
  TrendingUp,
  XCircle,
} from "lucide-react";

type SummaryData = NonNullable<OrderReportsSummaryResponse["responseData"]>;
type StatusSlice = ReturnType<typeof buildStatusSlices>[number];

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "default" | "success" | "warning" | "danger" | "primary";
}) {
  const iconClass = {
    default: "text-muted-foreground",
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger:  "text-red-600 dark:text-red-400",
    primary: "text-blue-600 dark:text-blue-400",
  }[accent];

  const valueClass = {
    default: "text-foreground",
    success: "text-emerald-700 dark:text-emerald-300",
    warning: "text-amber-700 dark:text-amber-300",
    danger:  "text-red-700 dark:text-red-300",
    primary: "text-blue-700 dark:text-blue-300",
  }[accent];

  const borderClass = {
    default: "border-l-border",
    success: "border-l-emerald-500",
    warning: "border-l-amber-400",
    danger:  "border-l-red-500",
    primary: "border-l-blue-500",
  }[accent];

  return (
    <div className={cn("rounded-lg border border-border border-l-[3px] bg-card p-4", borderClass)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <Icon className={cn("size-4 shrink-0 opacity-70", iconClass)} aria-hidden />
      </div>
      <p className={cn("mt-2 text-2xl font-bold tabular-nums tracking-tight", valueClass)}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

function FunnelChart({ steps }: { steps: ReturnType<typeof buildLifecycleFunnel> }) {
  return (
    <div className="flex items-stretch gap-0 overflow-x-auto">
      {steps.map((step, i) => (
        <div key={step.label} className="flex flex-1 items-center">
          <div
            className={cn(
              "flex w-full flex-col justify-between rounded-xl border px-4 py-3",
              i === 0 ? "bg-muted/60" : "bg-card",
            )}
          >
            <p className="text-xs text-muted-foreground">{step.label}</p>
            <p className="mt-1.5 text-2xl font-bold tabular-nums text-foreground">
              {step.count.toLocaleString("en-IN")}
            </p>
            <p className={cn("mt-0.5 text-xs font-medium", step.dropPct != null ? "text-red-500" : "invisible")}>
              {step.dropPct != null ? `${step.dropPct.toFixed(1)}%` : "0%"}
            </p>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="mx-1.5 size-4 shrink-0 text-muted-foreground/50" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}

function StatusLegend({ slices }: { slices: StatusSlice[] }) {
  return (
    <ul className="space-y-2">
      {slices.map((s) => (
        <li key={s.name} className="flex items-center justify-between gap-2 text-xs">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="truncate font-medium text-foreground">{s.name}</span>
          </span>
          <span className="shrink-0 tabular-nums text-muted-foreground">
            {s.count.toLocaleString("en-IN")}
            <span className="ml-1 opacity-60">({s.pct.toFixed(0)}%)</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function OrderReportsOverview({
  summary,
  isLoading,
  isError,
  groupBy,
  onGroupByChange,
  onExportCsv,
  timeBucketsTruncated,
}: {
  summary: SummaryData | undefined;
  isLoading: boolean;
  isError: boolean;
  groupBy: "day" | "week" | "month";
  onGroupByChange: (v: "day" | "week" | "month") => void;
  onExportCsv: () => void;
  timeBucketsTruncated?: boolean;
}) {
  const kpis = summary?.kpis;
  const totalValue = Number(kpis?.sumTotalAmount ?? 0);
  const orderCount = kpis?.orderCount ?? 0;
  const avgTicket = orderCount > 0 ? totalValue / orderCount : 0;

  const settled = countByOrderStatus(summary?.byOrderStatus, ["SETTLED", "APPLIED"]);
  const pending = countByOrderStatus(summary?.byOrderStatus, ["PENDING"]);
  const failedCount =
    countByOrderStatus(summary?.byOrderStatus, ["REJECTED"]) +
    (summary?.byPaymentStatus ?? []).reduce(
      (s, p) =>
        String(p.paymentStatus).toUpperCase() === "CANCELLED" ? s + p.count : s,
      0,
    );

  const conversionPct =
    orderCount > 0 ? ((settled / orderCount) * 100).toFixed(1) : "0.0";

  const trendData = (summary?.timeBuckets ?? []).map((b) => ({
    bucket: b.bucket,
    orders: b.orderCount,
    gmv: Number(b.gmv),
  }));

  const statusSlices = buildStatusSlices(summary?.byOrderStatus);
  const funnelSteps = buildLifecycleFunnel({
    orderCount,
    byPaymentStatus: summary?.byPaymentStatus ?? [],
    byOrderStatus: summary?.byOrderStatus ?? [],
  });

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading dashboard…</p>;
  }
  if (isError) {
    return (
      <p className="py-8 text-center text-sm text-destructive" role="alert">
        Failed to load report summary.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Overview of order flow, settlement status, and conversion metrics.
        </p>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Trend bucket</Label>
          <Select value={groupBy} onValueChange={(v) => onGroupByChange(v as typeof groupBy)}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Daily</SelectItem>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={onExportCsv}>
          Export register CSV
        </Button>
      </div>

      {timeBucketsTruncated ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
          Time chart capped at 25k orders; KPI totals use the full selected period.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <MetricCard
          label="Total orders"
          value={orderCount.toLocaleString("en-IN")}
          icon={ShoppingCart}
          accent="primary"
        />
        <MetricCard
          label="Total value"
          value={formatIndianCurrencyCompact(totalValue)}
          sub={`GMV · ₹${formatNumberTS(totalValue)}`}
          icon={IndianRupee}
        />
        <MetricCard
          label="Avg ticket"
          value={formatIndianCurrencyCompact(avgTicket)}
          icon={TrendingUp}
        />
        <MetricCard
          label="Settled"
          value={settled.toLocaleString("en-IN")}
          icon={CheckCircle2}
          accent="success"
        />
        <MetricCard
          label="Pending"
          value={pending.toLocaleString("en-IN")}
          icon={Clock}
          accent="warning"
        />
        <MetricCard
          label="Failed / cancelled"
          value={failedCount.toLocaleString("en-IN")}
          icon={XCircle}
          accent="danger"
        />
        <MetricCard
          label="Conversion"
          value={`${conversionPct}%`}
          sub="Settled ÷ total orders"
          icon={TrendingUp}
          accent="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {groupBy === "day" ? "Daily" : groupBy === "week" ? "Weekly" : "Monthly"} order trend
            </CardTitle>
            <CardDescription className="text-xs">
              Orders (left axis) vs GMV ₹ (right axis) — IST
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pb-4">
            {trendData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data in range
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                  <XAxis
                    dataKey="bucket"
                    tick={{ fontSize: 10 }}
                    tickMargin={6}
                    tickFormatter={(v) => formatBucketLabel(v, groupBy)}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10 }}
                    width={36}
                    tickFormatter={(v: number) => v.toLocaleString("en-IN")}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10 }}
                    width={56}
                    tickFormatter={(v: number) => formatIndianCurrencyCompact(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                    labelFormatter={(v) => formatBucketLabel(String(v), groupBy)}
                    formatter={(value: number, name: string) =>
                      name === "GMV"
                        ? [formatIndianCurrencyCompact(value), "GMV"]
                        : [value.toLocaleString("en-IN"), "Orders"]
                    }
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#16a34a"
                    fill="url(#ordersFill)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="gmv"
                    name="GMV"
                    stroke="#2563eb"
                    fill="url(#gmvFill)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Status breakdown</CardTitle>
            <CardDescription className="text-xs">
              Order workflow states · {orderCount.toLocaleString("en-IN")} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusSlices.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders</p>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="relative h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusSlices}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={76}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {statusSlices.map((s) => (
                          <Cell key={s.name} fill={s.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid hsl(var(--border))",
                          fontSize: 12,
                        }}
                        formatter={(value: number, _name: string, item) => {
                          const payload = item?.payload as StatusSlice | undefined;
                          return [
                            `${value.toLocaleString("en-IN")} (${payload?.pct.toFixed(1) ?? 0}%)`,
                            payload?.name ?? "",
                          ];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* center label */}
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold tabular-nums leading-none">
                      {orderCount.toLocaleString("en-IN")}
                    </span>
                    <span className="mt-0.5 text-[10px] text-muted-foreground">orders</span>
                  </div>
                </div>
                <StatusLegend slices={statusSlices} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Order lifecycle funnel</CardTitle>
          <CardDescription className="text-xs">
            Placed → payment → applied → settled (drop % vs previous stage)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FunnelChart steps={funnelSteps} />
        </CardContent>
      </Card>
    </div>
  );
}
