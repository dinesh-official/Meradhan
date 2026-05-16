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
  formatIndianCurrencyCompact,
} from "./orderReportFormatters";
import {
  CheckCircle2,
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
  const accentClass = {
    default: "bg-muted/50 text-muted-foreground",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
    primary: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  }[accent];

  return (
    <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {value}
            </p>
            {sub ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
            ) : null}
          </div>
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              accentClass,
            )}
          >
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelChart({ steps }: { steps: ReturnType<typeof buildLifecycleFunnel> }) {
  const max = Math.max(steps[0]?.count ?? 1, 1);
  return (
    <div className="space-y-4 py-1">
      {steps.map((step, i) => {
        const widthPct = Math.max(28, Math.round((step.count / max) * 100));
        return (
          <div key={step.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{step.label}</span>
              <div className="flex items-center gap-2 tabular-nums">
                <span className="text-sm font-semibold">
                  {step.count.toLocaleString("en-IN")}
                </span>
                {step.dropPct != null && step.dropPct < 0 ? (
                  <span className="text-xs font-medium text-red-600 dark:text-red-400">
                    {step.dropPct.toFixed(1)}%
                  </span>
                ) : null}
              </div>
            </div>
            <div
              className="h-9 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 shadow-sm"
              style={{ width: `${widthPct}%` }}
            />
            {i < steps.length - 1 ? (
              <div className="ml-[14%] mt-1 h-3 w-px bg-border" aria-hidden />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function StatusLegend({ slices }: { slices: StatusSlice[] }) {
  return (
    <ul className="space-y-2.5">
      {slices.map((s) => (
        <li key={s.name} className="flex items-center justify-between gap-3 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="truncate text-muted-foreground">{s.name}</span>
          </span>
          <span className="shrink-0 tabular-nums font-medium">{s.pct.toFixed(0)}%</span>
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
        <Card className="border-border/80 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Daily order trend</CardTitle>
            <CardDescription className="text-xs">
              Orders and GMV by{" "}
              {groupBy === "day" ? "day" : groupBy === "week" ? "week" : "month"} (IST)
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pb-4">
            {trendData.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No data in range
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gmvFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a34a" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10 }} tickMargin={8} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} width={48} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} width={56} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid hsl(var(--border))",
                      fontSize: 12,
                    }}
                    formatter={(value: number, name: string) =>
                      name === "gmv"
                        ? [`₹${formatNumberTS(value)}`, "GMV"]
                        : [value, "Orders"]
                    }
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#16a34a"
                    fill="url(#ordersFill)"
                    strokeWidth={2}
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="gmv"
                    name="GMV"
                    stroke="#2563eb"
                    fill="url(#gmvFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Status breakdown</CardTitle>
            <CardDescription className="text-xs">Order workflow states</CardDescription>
          </CardHeader>
          <CardContent>
            {statusSlices.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No orders</p>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-[180px] w-full sm:w-[55%]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusSlices}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={2}
                      >
                        {statusSlices.map((s) => (
                          <Cell key={s.name} fill={s.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, _name: string, item) => {
                          const payload = item?.payload as StatusSlice | undefined;
                          return [
                            `${value} (${payload?.pct.toFixed(1) ?? 0}%)`,
                            payload?.name ?? "",
                          ];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="min-w-0 flex-1">
                  <StatusLegend slices={statusSlices} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Order lifecycle funnel</CardTitle>
          <CardDescription className="text-xs">
            Placed → payment → applied → settled (drop % vs previous stage)
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-2xl">
          <FunnelChart steps={funnelSteps} />
        </CardContent>
      </Card>
    </div>
  );
}
