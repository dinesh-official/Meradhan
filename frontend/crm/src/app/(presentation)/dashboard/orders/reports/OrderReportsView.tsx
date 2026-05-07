"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { formatNumberTS } from "@/global/utils/formate";
import { cn } from "@/lib/utils";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { format, parse, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import OrdersSectionTabs from "../_components/OrdersSectionTabs";

const PIE_COLORS = ["#2563eb", "#16a34a", "#ca8a04", "#dc2626", "#7c3aed"];

function SummaryBadge({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-md border bg-white border-border px-2.5 py-1.5 text-xs">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-semibold tabular-nums leading-tight">{value}</div>
    </div>
  );
}

function TabSummaryRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-3 flex flex-wrap gap-2", className)}>{children}</div>;
}

function TabChartCard({
  title,
  subtitle,
  height = 220,
  children,
}: {
  title: string;
  subtitle?: string;
  height?: number;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="py-2 pb-0">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        {subtitle ? <p className="text-[11px] text-muted-foreground pt-0.5">{subtitle}</p> : null}
      </CardHeader>
      <CardContent className="pb-2" style={{ height }}>
        {children}
      </CardContent>
    </Card>
  );
}

function defaultFromTo() {
  const to = new Date();
  const from = subDays(to, 30);
  return { from: format(from, "yyyy-MM-dd"), to: format(to, "yyyy-MM-dd") };
}

function parseReportDay(value: string): Date | undefined {
  const d = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function ReportDateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
}) {
  const selected = parseReportDay(value);
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "h-9 w-full min-w-0 justify-start text-left font-normal",
              !selected && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" aria-hidden />
            <span className="truncate">{selected ? format(selected, "yyyy-MM-dd") : "Pick date"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(d) => {
              if (d) onChange(format(d, "yyyy-MM-dd"));
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function OrderReportsView() {
  const { from: defFrom, to: defTo } = defaultFromTo();
  const [from, setFrom] = useState(defFrom);
  const [to, setTo] = useState(defTo);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isin, setIsin] = useState("");
  const [email, setEmail] = useState("");
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  const reportsApi = useMemo(
    () => new apiGateway.crm.crmOrderReportsApi(apiClientCaller),
    [],
  );

  const baseQuery = useMemo(
    () => ({
      from,
      to,
      ...(paymentStatus ? { paymentStatus: paymentStatus as never } : {}),
      ...(status ? { status: status as never } : {}),
      ...(isin.trim() ? { isin: isin.trim() } : {}),
      ...(email.trim() ? { email: email.trim() } : {}),
    }),
    [from, to, paymentStatus, status, isin, email],
  );

  const summaryQuery = useQuery({
    queryKey: ["orderReports", "summary", baseQuery, groupBy],
    queryFn: () =>
      reportsApi.getSummary({ ...baseQuery, groupBy }).then((r) => r.responseData),
  });

  const registerQuery = useQuery({
    queryKey: ["orderReports", "register", baseQuery],
    queryFn: () =>
      reportsApi.getRegister({ ...baseQuery, page: 1, limit: 100 }).then((r) => r.responseData),
  });

  const byIsinQuery = useQuery({
    queryKey: ["orderReports", "byIsin", baseQuery],
    queryFn: () => reportsApi.getByIsin(baseQuery as never).then((r) => r.responseData),
  });

  const funnelQuery = useQuery({
    queryKey: ["orderReports", "funnel", baseQuery],
    queryFn: () => reportsApi.getFunnel(baseQuery).then((r) => r.responseData),
  });

  const byCustomerQuery = useQuery({
    queryKey: ["orderReports", "byCustomer", baseQuery],
    queryFn: () =>
      reportsApi
        .getByCustomer({ ...baseQuery, page: 1, limit: 50 } as never)
        .then((r) => r.responseData),
  });

  const holdingsQuery = useQuery({
    queryKey: ["orderReports", "holdings", baseQuery],
    queryFn: () => reportsApi.getHoldings(baseQuery).then((r) => r.responseData),
  });

  const logFailuresQuery = useQuery({
    queryKey: ["orderReports", "logFailures", from, to],
    queryFn: () =>
      reportsApi
        .getLogFailures({ from, to, page: 1, limit: 100 })
        .then((r) => r.responseData),
  });

  const settlementQuery = useQuery({
    queryKey: ["orderReports", "settlement", from, to],
    queryFn: () =>
      reportsApi.getSettlementAutomation({ from, to }).then((r) => r.responseData),
  });

  const lifecycleQuery = useQuery({
    queryKey: ["orderReports", "lifecycle", baseQuery],
    queryFn: () =>
      reportsApi
        .getLifecycle({ ...baseQuery, page: 1, limit: 50 } as never)
        .then((r) => r.responseData),
  });

  const topIsinChart = useMemo(() => {
    const rows = byIsinQuery.data?.data ?? [];
    return rows.slice(0, 12).map((r) => ({
      name: r.isin.length > 12 ? `${r.isin.slice(0, 12)}…` : r.isin,
      revenue: Number(r.revenue),
      orders: r.orderCount,
    }));
  }, [byIsinQuery.data]);

  const registerPageStats = useMemo(() => {
    const rows = registerQuery.data?.data ?? [];
    let pageGmv = 0;
    let qty = 0;
    const customers = new Set<number>();
    for (const r of rows) {
      pageGmv += Number(r.totalAmount);
      qty += r.quantity;
      customers.add(r.customerProfileId);
    }
    return { pageGmv, qty, distinctCustomersOnPage: customers.size, rowCount: rows.length };
  }, [registerQuery.data]);

  const bondTabChart = useMemo(() => {
    const rows = byIsinQuery.data?.data ?? [];
    return rows.slice(0, 14).map((r) => ({
      name: r.isin.length > 14 ? `${r.isin.slice(0, 14)}…` : r.isin,
      revenue: Number(r.revenue),
      orders: r.orderCount,
    }));
  }, [byIsinQuery.data]);

  const bondTotals = useMemo(() => {
    const rows = byIsinQuery.data?.data ?? [];
    return rows.reduce(
      (acc, r) => ({
        revenue: acc.revenue + Number(r.revenue),
        orders: acc.orders + r.orderCount,
        units: acc.units + r.unitsSold,
      }),
      { revenue: 0, orders: 0, units: 0 },
    );
  }, [byIsinQuery.data]);

  const customerTabChart = useMemo(() => {
    const rows = [...(byCustomerQuery.data?.data ?? [])].sort(
      (a, b) => Number(b.lifetimeValue) - Number(a.lifetimeValue),
    );
    return rows.slice(0, 12).map((r) => {
      const email = r.customer?.emailAddress ?? `id:${r.customerProfileId}`;
      const short = email.length > 22 ? `${email.slice(0, 22)}…` : email;
      return { name: short, ltv: Number(r.lifetimeValue), orders: r.orderCount };
    });
  }, [byCustomerQuery.data]);

  const customerPageTotals = useMemo(() => {
    const rows = byCustomerQuery.data?.data ?? [];
    return rows.reduce(
      (acc, r) => ({
        ltv: acc.ltv + Number(r.lifetimeValue),
        orders: acc.orders + r.orderCount,
      }),
      { ltv: 0, orders: 0 },
    );
  }, [byCustomerQuery.data]);

  const funnelBarData = useMemo(() => {
    const cells = funnelQuery.data?.cells ?? [];
    return [...cells]
      .sort((a, b) => b.count - a.count)
      .slice(0, 16)
      .map((c) => ({
        name: `${c.paymentStatus} / ${c.status}`.length > 36
          ? `${`${c.paymentStatus} / ${c.status}`.slice(0, 34)}…`
          : `${c.paymentStatus} / ${c.status}`,
        count: c.count,
      }));
  }, [funnelQuery.data]);

  const funnelTotal = useMemo(
    () => (funnelQuery.data?.cells ?? []).reduce((s, c) => s + c.count, 0),
    [funnelQuery.data],
  );

  const holdingsTotals = useMemo(() => {
    const rows = holdingsQuery.data?.data ?? [];
    return {
      rows: rows.length,
      units: rows.reduce((s, r) => s + r.units, 0),
      positions: rows.reduce((s, r) => s + r.positionCount, 0),
    };
  }, [holdingsQuery.data]);

  const holdingsChart = useMemo(() => {
    const rows = [...(holdingsQuery.data?.data ?? [])].sort((a, b) => b.units - a.units);
    return rows.slice(0, 12).map((r) => ({
      name: r.isin.length > 14 ? `${r.isin.slice(0, 14)}…` : r.isin,
      units: r.units,
      positions: r.positionCount,
    }));
  }, [holdingsQuery.data]);

  const logFailuresByStep = useMemo(() => {
    const rows = logFailuresQuery.data?.data ?? [];
    const map = new Map<string, number>();
    for (const r of rows) {
      map.set(r.step, (map.get(r.step) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name: name.length > 28 ? `${name.slice(0, 28)}…` : name,
        count,
      }));
  }, [logFailuresQuery.data]);

  const settlementBarData = useMemo(() => {
    const rows = settlementQuery.data?.byStep ?? [];
    return rows.map((s) => ({
      name: `${s.step} (${s.status})`.length > 32
        ? `${`${s.step} (${s.status})`.slice(0, 30)}…`
        : `${s.step} (${s.status})`,
      count: s.count,
    }));
  }, [settlementQuery.data]);

  const settlementStepTotals = useMemo(() => {
    const rows = settlementQuery.data?.byStep ?? [];
    return rows.reduce((s, r) => s + r.count, 0);
  }, [settlementQuery.data]);

  const lifecycleLatencyBuckets = useMemo(() => {
    const rows = lifecycleQuery.data?.data ?? [];
    const buckets = [
      { name: "< 1s", min: 0, max: 1000 },
      { name: "1–5s", min: 1000, max: 5000 },
      { name: "5–30s", min: 5000, max: 30_000 },
      { name: "30s–2m", min: 30_000, max: 120_000 },
      { name: "> 2m", min: 120_000, max: Number.POSITIVE_INFINITY },
    ];
    const counts = buckets.map((b) => ({ name: b.name, count: 0 }));
    let withLatency = 0;
    let sumMs = 0;
    for (const r of rows) {
      const ms = r.approxMsToFirstLog;
      if (ms == null) continue;
      withLatency += 1;
      sumMs += ms;
      for (let i = 0; i < buckets.length; i++) {
        const b = buckets[i];
        if (ms >= b.min && ms < b.max) {
          counts[i].count += 1;
          break;
        }
      }
    }
    const avgMs = withLatency ? Math.round(sumMs / withLatency) : null;
    return { counts, withLatency, avgMs, pageRows: rows.length };
  }, [lifecycleQuery.data]);

  const exportCsv = async () => {
    const blob = await reportsApi.downloadRegisterExport(baseQuery);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-register-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const kpis = summaryQuery.data?.kpis;

  return (
    <div className="container py-4">
      <h1 className="text-2xl font-semibold mb-1">Order reports</h1>
      <p className="text-muted-foreground text-sm mb-4">
        Read-only analytics. Date range uses calendar days in IST (Asia/Kolkata).
      </p>

      <OrdersSectionTabs />

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ReportDateField id="rep-from" label="From (IST calendar day)" value={from} onChange={setFrom} />
          <ReportDateField id="rep-to" label="To (IST calendar day)" value={to} onChange={setTo} />
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label className="text-xs">Payment status</Label>
            <Select
              value={paymentStatus || "__all__"}
              onValueChange={(v) => setPaymentStatus(v === "__all__" ? "" : v)}
            >
              <SelectTrigger className="h-9 w-full min-w-0">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                <SelectItem value="REFUNDED">REFUNDED</SelectItem>
                <SelectItem value="CANCELLED">CANCELLED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label className="text-xs">Order status</Label>
            <Select value={status || "__all__"} onValueChange={(v) => setStatus(v === "__all__" ? "" : v)}>
              <SelectTrigger className="h-9 w-full min-w-0">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All</SelectItem>
                <SelectItem value="PENDING">PENDING</SelectItem>
                <SelectItem value="SETTLED">SETTLED</SelectItem>
                <SelectItem value="APPLIED">APPLIED</SelectItem>
                <SelectItem value="REJECTED">REJECTED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label htmlFor="rep-isin" className="text-xs">
              ISIN contains
            </Label>
            <Input
              id="rep-isin"
              className="h-9 w-full min-w-0"
              value={isin}
              onChange={(e) => setIsin(e.target.value)}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="rep-email" className="text-xs">
              Customer email contains
            </Label>
            <Input
              id="rep-email"
              className="h-9 w-full min-w-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
          <TabsTrigger value="by-isin">By bond</TabsTrigger>
          <TabsTrigger value="by-customer">By customer</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="failures">Log failures</TabsTrigger>
          <TabsTrigger value="settlement">Settlement</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex flex-wrap items-end gap-4 mb-2">
            <div className="space-y-1">
              <Label>Chart bucket</Label>
              <Select
                value={groupBy}
                onValueChange={(v) => setGroupBy(v as "day" | "week" | "month")}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportCsv()}>
              Download CSV (register)
            </Button>
          </div>

          {summaryQuery.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {summaryQuery.isError && (
            <p className="text-sm text-destructive">Failed to load summary.</p>
          )}

          {kpis && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Orders
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-2xl font-semibold">
                  {(kpis.orderCount)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Distinct customers
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-2xl font-semibold">
                  {(kpis.distinctCustomers)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    GMV (total amount)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-2xl font-semibold">
                  ₹{formatNumberTS(Number(kpis.sumTotalAmount))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Units (qty sum)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-2xl font-semibold">
                  {(kpis.sumQuantity)}
                </CardContent>
              </Card>
            </div>
          )}

          {summaryQuery.data?.timeBucketsTruncated ? (
            <p className="text-xs text-amber-700">
              Time chart capped at 25k orders; totals in KPIs remain full period.
            </p>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">GMV by period</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summaryQuery.data?.timeBuckets ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="gmv" name="GMV" stroke="#2563eb" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Orders by period</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={summaryQuery.data?.timeBuckets ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="orderCount"
                      name="Orders"
                      stroke="#16a34a"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Top ISINs by revenue</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topIsinChart} layout="vertical" margin={{ left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#2563eb" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment status mix</CardTitle>
              </CardHeader>
              <CardContent className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summaryQuery.data?.byPaymentStatus ?? []}
                      dataKey="count"
                      nameKey="paymentStatus"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {(summaryQuery.data?.byPaymentStatus ?? []).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="register" className="space-y-3">
          <TabSummaryRow>
            <SummaryBadge
              label="Total orders"
              value={(registerQuery.data?.meta.total ?? 0)}
            />
            <SummaryBadge
              label="Page GMV (sample)"
              value={`₹${formatNumberTS(registerPageStats.pageGmv)}`}
            />
            <SummaryBadge label="Qty" value={(registerPageStats.qty)} />
            <SummaryBadge
              label="Customers on page"
              value={(registerPageStats.distinctCustomersOnPage)}
            />
          </TabSummaryRow>
          <div className="grid gap-3 lg:grid-cols-2">
            <TabChartCard
              title="Payment status (all matching)"
              subtitle="Same filters as the table; from summary API, not only the first page."
              height={240}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summaryQuery.data?.byPaymentStatus ?? []}
                    dataKey="count"
                    nameKey="paymentStatus"
                    cx="50%"
                    cy="50%"
                    outerRadius={78}
                    label={({ paymentStatus, count }) => `${paymentStatus}: ${count}`}
                  >
                    {(summaryQuery.data?.byPaymentStatus ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </TabChartCard>
            <TabChartCard
              title="Order status (all matching)"
              subtitle="Distribution of order workflow states in the selected range."
              height={240}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summaryQuery.data?.byOrderStatus ?? []} margin={{ left: 4, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={56} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Orders" fill="#64748b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabChartCard>
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Order register (first 100)</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportCsv()}>
                Export CSV
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2">Order #</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">ISIN</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Pay</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(registerQuery.data?.data ?? []).map((r) => (
                    <tr key={r.id} className="border-b border-border/60">
                      <td className="p-2 font-mono text-xs">{r.orderNumber}</td>
                      <td className="p-2 whitespace-nowrap text-xs">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2 text-xs">
                        <div>{r.customerProfile.emailAddress}</div>
                        <div className="text-muted-foreground">
                          {r.customerProfile.firstName} {r.customerProfile.lastName}
                        </div>
                      </td>
                      <td className="p-2 font-mono text-xs">{r.isin}</td>
                      <td className="p-2">{r.quantity}</td>
                      <td className="p-2">₹{formatNumberTS(Number(r.totalAmount))}</td>
                      <td className="p-2 text-xs">{r.paymentStatus}</td>
                      <td className="p-2 text-xs">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-isin" className="space-y-3">
          <TabSummaryRow>
            <SummaryBadge label="ISINs in result" value={byIsinQuery.data?.data.length ?? 0} />
            <SummaryBadge label="Total orders" value={(bondTotals.orders)} />
            <SummaryBadge label="Total units" value={(bondTotals.units)} />
            <SummaryBadge
              label="Total revenue"
              value={`₹${formatNumberTS(bondTotals.revenue)}`}
            />
          </TabSummaryRow>
          <TabChartCard
            title="Top bonds by revenue"
            subtitle="Up to 14 ISINs; full list is in the table below."
            height={260}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bondTabChart} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={108} tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v: number) => [`₹${formatNumberTS(v)}`, "Revenue"]} />
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabChartCard>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Bond performance</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2">ISIN</th>
                    <th className="p-2">Bond</th>
                    <th className="p-2">Orders</th>
                    <th className="p-2">Units</th>
                    <th className="p-2">Customers</th>
                    <th className="p-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {(byIsinQuery.data?.data ?? []).map((r) => (
                    <tr key={r.isin} className="border-b border-border/60">
                      <td className="p-2 font-mono text-xs">{r.isin}</td>
                      <td className="p-2 max-w-[200px] truncate">{r.bondName}</td>
                      <td className="p-2">{r.orderCount}</td>
                      <td className="p-2">{r.unitsSold}</td>
                      <td className="p-2">{r.distinctCustomers}</td>
                      <td className="p-2">₹{formatNumberTS(Number(r.revenue))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-customer" className="space-y-3">
          <TabSummaryRow>
            <SummaryBadge
              label="Customers (total)"
              value={(byCustomerQuery.data?.meta.total ?? 0)}
            />
            <SummaryBadge label="Rows on page" value={byCustomerQuery.data?.data.length ?? 0} />
            <SummaryBadge
              label="Page LTV sum"
              value={`₹${formatNumberTS(customerPageTotals.ltv)}`}
            />
            <SummaryBadge label="Page orders sum" value={(customerPageTotals.orders)} />
          </TabSummaryRow>
          <TabChartCard
            title="Top customers by LTV (this page)"
            subtitle="Up to 12 profiles by lifetime value in the current page."
            height={260}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerTabChart} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={112} tick={{ fontSize: 9 }} />
                <Tooltip
                  formatter={(v: number, key: string) =>
                    key === "ltv" ? [`₹${formatNumberTS(v)}`, "LTV"] : [v, "Orders"]
                  }
                />
                <Bar dataKey="ltv" name="LTV" fill="#7c3aed" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabChartCard>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Customer summary</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2">Id</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">KYC</th>
                    <th className="p-2">Orders</th>
                    <th className="p-2">LTV</th>
                    <th className="p-2">Fav ISIN</th>
                  </tr>
                </thead>
                <tbody>
                  {(byCustomerQuery.data?.data ?? []).map((r) => (
                    <tr key={r.customerProfileId} className="border-b border-border/60">
                      <td className="p-2">{r.customerProfileId}</td>
                      <td className="p-2 text-xs">{r.customer?.emailAddress ?? "—"}</td>
                      <td className="p-2 text-xs">{r.customer?.kycStatus ?? "—"}</td>
                      <td className="p-2">{r.orderCount}</td>
                      <td className="p-2">₹{formatNumberTS(Number(r.lifetimeValue))}</td>
                      <td className="p-2 font-mono text-xs">{r.favouriteIsin ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-3">
          <TabSummaryRow>
            <SummaryBadge label="Orders in funnel" value={(funnelTotal)} />
            <SummaryBadge
              label="Combinations"
              value={(funnelQuery.data?.cells.length ?? 0)}
            />
          </TabSummaryRow>
          <TabChartCard
            title="Largest payment × order pairs"
            subtitle="Up to 16 rows, sorted by count."
            height={280}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelBarData} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 8 }} />
                <Tooltip />
                <Bar dataKey="count" name="Orders" fill="#0d9488" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabChartCard>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment status × order status</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2">Payment</th>
                    <th className="p-2">Order</th>
                    <th className="p-2">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(funnelQuery.data?.cells ?? []).map((c, i) => (
                    <tr key={i} className="border-b border-border/60">
                      <td className="p-2">{c.paymentStatus}</td>
                      <td className="p-2">{c.status}</td>
                      <td className="p-2">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-3">
          <TabSummaryRow>
            <SummaryBadge label="ISIN rows" value={holdingsTotals.rows} />
            <SummaryBadge label="Total units" value={(holdingsTotals.units)} />
            <SummaryBadge label="Position rows" value={(holdingsTotals.positions)} />
          </TabSummaryRow>
          <TabChartCard
            title="Units by ISIN (top 12)"
            subtitle="Same data as the table: positions with purchase date in range, grouped by ISIN."
            height={260}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={holdingsChart} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="units" name="Units" fill="#0891b2" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabChartCard>
          <Card>
            <CardHeader className="space-y-2">
              <CardTitle className="text-sm">Holdings — customer bond positions in range</CardTitle>
              <CardDescription className="text-xs leading-relaxed space-y-2 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">What it is:</span> Each row in the
                  CustomerBonds table is one customer&apos;s position in a bond (ISIN, quantity, etc.).
                  This report includes only positions whose{" "}
                  <span className="font-medium text-foreground">purchase date</span> falls in your
                  selected IST date range, then groups by ISIN.
                </p>
                <p>
                  <span className="font-medium text-foreground">When to use it:</span> See which
                  bonds actually accumulated on customer books after orders and settlement; compare
                  to the Register / By bond tabs when order counts and inventory do not line up
                  (partial fills, timing, or cancelled orders).
                </p>
                <p>
                  <span className="font-medium text-foreground">Columns:</span>{" "}
                  <em>Positions</em> = how many CustomerBonds rows matched for that ISIN in the range;{" "}
                  <em>Units</em> = sum of quantities across those rows.
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2">ISIN</th>
                    <th className="p-2">Bond</th>
                    <th className="p-2">Positions</th>
                    <th className="p-2">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {(holdingsQuery.data?.data ?? []).map((r) => (
                    <tr key={r.isin} className="border-b border-border/60">
                      <td className="p-2 font-mono text-xs">{r.isin}</td>
                      <td className="p-2 max-w-[220px] truncate">{r.bondName}</td>
                      <td className="p-2">{r.positionCount}</td>
                      <td className="p-2">{r.units}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failures" className="space-y-3">
          <TabSummaryRow>
            <SummaryBadge
              label="Total failures"
              value={formatNumberTS(logFailuresQuery.data?.meta.total ?? 0)}
            />
            <SummaryBadge label="Rows on page" value={logFailuresQuery.data?.data.length ?? 0} />
            <SummaryBadge
              label="Distinct steps (page)"
              value={formatNumberTS(logFailuresByStep.length)}
            />
          </TabSummaryRow>
          <TabChartCard
            title="Failures by step (this page)"
            subtitle="Counts from the loaded page only."
            height={240}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={logFailuresByStep} margin={{ left: 4, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={64} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Failures" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabChartCard>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Order log failures (no raw JSON)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2">Id</th>
                    <th className="p-2">Order id</th>
                    <th className="p-2">Step</th>
                    <th className="p-2">At</th>
                  </tr>
                </thead>
                <tbody>
                  {(logFailuresQuery.data?.data ?? []).map((r) => (
                    <tr key={r.id} className="border-b border-border/60">
                      <td className="p-2">{r.id}</td>
                      <td className="p-2">{r.orderId}</td>
                      <td className="p-2 font-mono text-xs">{r.step}</td>
                      <td className="p-2 text-xs whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlement" className="space-y-3">
          <TabSummaryRow>
            <SummaryBadge label="Step/status rows" value={settlementQuery.data?.byStep.length ?? 0} />
            <SummaryBadge
              label="Runs (sum of counts)"
              value={(settlementStepTotals)}
            />
            <SummaryBadge label="Recent log rows" value={settlementQuery.data?.recent.length ?? 0} />
          </TabSummaryRow>
          <TabChartCard
            title="Settlement runs by step + status"
            subtitle="Each bar is one step/status bucket from the aggregate table."
            height={260}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={settlementBarData} layout="vertical" margin={{ left: 4, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={128} tick={{ fontSize: 8 }} />
                <Tooltip />
                <Bar dataKey="count" name="Count" fill="#475569" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabChartCard>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Settlement automation — by step</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2">Step</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {(settlementQuery.data?.byStep ?? []).map((s, i) => (
                    <tr key={i} className="border-b border-border/60">
                      <td className="p-2 font-mono text-xs">{s.step}</td>
                      <td className="p-2">{s.status}</td>
                      <td className="p-2">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent rows (max 100)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2">Payment</th>
                    <th className="p-2">Batch</th>
                    <th className="p-2">Step</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {(settlementQuery.data?.recent ?? []).map((r) => (
                    <tr key={r.id} className="border-b border-border/60">
                      <td className="p-2 font-mono text-xs">{r.paymentId}</td>
                      <td className="p-2 font-mono text-xs">{r.batchId}</td>
                      <td className="p-2 text-xs">{r.step}</td>
                      <td className="p-2 text-xs">{r.status}</td>
                      <td className="p-2 text-xs max-w-[240px] truncate">{r.message ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-3">
          <TabSummaryRow>
            <SummaryBadge
              label="Orders (total)"
              value={(lifecycleQuery.data?.meta.total ?? 0)}
            />
            <SummaryBadge label="Rows on page" value={lifecycleLatencyBuckets.pageRows} />
            <SummaryBadge
              label="With latency"
              value={(lifecycleLatencyBuckets.withLatency)}
            />
            <SummaryBadge
              label="Avg Δ ms (page)"
              value={
                lifecycleLatencyBuckets.avgMs != null
                  ? formatNumberTS(lifecycleLatencyBuckets.avgMs)
                  : "—"
              }
            />
          </TabSummaryRow>
          <TabChartCard
            title="Time to first success log"
            subtitle="Bucketed Δ ms for rows on this page that have a value."
            height={240}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lifecycleLatencyBuckets.counts} margin={{ left: 4, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Orders" fill="#9333ea" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabChartCard>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Order lifecycle (approx. first success log)</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="p-2">Order #</th>
                    <th className="p-2">Created</th>
                    <th className="p-2">Pay</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">First log</th>
                    <th className="p-2">Δ ms</th>
                  </tr>
                </thead>
                <tbody>
                  {(lifecycleQuery.data?.data ?? []).map((r) => (
                    <tr key={r.orderId} className="border-b border-border/60">
                      <td className="p-2 font-mono text-xs">{r.orderNumber}</td>
                      <td className="p-2 text-xs whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="p-2 text-xs">{r.paymentStatus}</td>
                      <td className="p-2 text-xs">{r.status}</td>
                      <td className="p-2 text-xs whitespace-nowrap">
                        {r.firstSuccessLogAt
                          ? new Date(r.firstSuccessLogAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="p-2 text-xs">
                        {r.approxMsToFirstLog != null ? r.approxMsToFirstLog : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
