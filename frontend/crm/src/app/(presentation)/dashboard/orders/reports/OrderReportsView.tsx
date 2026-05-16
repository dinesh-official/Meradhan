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
import { cn } from "@/lib/utils";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { format, parse, subDays } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import OrdersSectionTabs from "../_components/OrdersSectionTabs";
import { CompliancePanel } from "./_components/CompliancePanel";
import { CustomersPanel } from "./_components/CustomersPanel";
import { ExceptionsPanel } from "./_components/ExceptionsPanel";
import { OrderReportsOverview } from "./_components/OrderReportsOverview";
import { OrdersPanel } from "./_components/OrdersPanel";
import { REPORT_TAB_META } from "./_components/reportTabMeta";
import { RmPerformancePanel } from "./_components/RmPerformancePanel";
import { SettlementPayInPanel } from "./_components/SettlementPayInPanel";
import { RevenuePanel } from "./_components/RevenuePanel";

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
  const [registerPage, setRegisterPage] = useState(1);

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
    queryKey: ["orderReports", "register", baseQuery, registerPage],
    queryFn: () =>
      reportsApi
        .getRegister({ ...baseQuery, page: registerPage, limit: 10 })
        .then((r) => r.responseData),
  });

  const registerBulkQuery = useQuery({
    queryKey: ["orderReports", "registerBulk", baseQuery],
    queryFn: () =>
      reportsApi.getRegister({ ...baseQuery, page: 1, limit: 200 }).then((r) => r.responseData),
  });

  const byIsinQuery = useQuery({
    queryKey: ["orderReports", "byIsin", baseQuery],
    queryFn: () => reportsApi.getByIsin(baseQuery as never).then((r) => r.responseData),
  });

  const revenueQuery = useQuery({
    queryKey: ["orderReports", "revenue", baseQuery],
    queryFn: () => reportsApi.getRevenue(baseQuery as never).then((r) => r.responseData),
  });

  const byCustomerQuery = useQuery({
    queryKey: ["orderReports", "byCustomer", baseQuery],
    queryFn: () =>
      reportsApi
        .getByCustomer({ ...baseQuery, page: 1, limit: 50 } as never)
        .then((r) => r.responseData),
  });

  const logFailuresQuery = useQuery({
    queryKey: ["orderReports", "logFailures", from, to],
    queryFn: () =>
      reportsApi
        .getLogFailures({ from, to, page: 1, limit: 100 })
        .then((r) => r.responseData),
  });

  const summaryForPanels = useMemo(() => {
    const s = summaryQuery.data;
    if (!s) return undefined;
    return {
      orderCount: s.kpis.orderCount,
      sumTotalAmount: s.kpis.sumTotalAmount,
      distinctCustomers: s.kpis.distinctCustomers,
      byOrderStatus: s.byOrderStatus,
    };
  }, [summaryQuery.data]);

  const exportCsv = async () => {
    const blob = await reportsApi.downloadRegisterExport(baseQuery);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `order-register-${from}-to-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container max-w-[1600px] py-6">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          OBPP order reports
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Overview of order flow, settlement status, and conversion metrics. Date range uses
          calendar days in IST (Asia/Kolkata).
        </p>
      </div>

      <OrdersSectionTabs />

      <Card className="mb-6 border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Filters</CardTitle>
          <CardDescription className="text-xs">
            Narrow all tabs by date, payment, order status, ISIN, or customer email.
          </CardDescription>
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

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="flex h-auto flex-wrap gap-1 rounded-lg bg-muted/50 p-1">
          <TabsTrigger
            value="overview"
            className="rounded-md data-[state=active]:shadow-sm"
            title={REPORT_TAB_META.overview.purpose}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger value="register" title={REPORT_TAB_META.register.purpose}>
            Orders
          </TabsTrigger>
          <TabsTrigger value="settlement" title={REPORT_TAB_META.settlement.purpose}>
            Settlement
          </TabsTrigger>
          <TabsTrigger value="revenue" title={REPORT_TAB_META.revenue.purpose}>
            Revenue
          </TabsTrigger>
          <TabsTrigger value="customers" title={REPORT_TAB_META.customers.purpose}>
            Customers
          </TabsTrigger>
          <TabsTrigger value="rm-performance" title={REPORT_TAB_META["rm-performance"].purpose}>
            RM Performance
          </TabsTrigger>
          <TabsTrigger value="compliance" title={REPORT_TAB_META.compliance.purpose}>
            Compliance
          </TabsTrigger>
          <TabsTrigger value="exceptions" title={REPORT_TAB_META.exceptions.purpose}>
            Exceptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <OrderReportsOverview
            summary={summaryQuery.data}
            isLoading={summaryQuery.isLoading}
            isError={summaryQuery.isError}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            onExportCsv={exportCsv}
            timeBucketsTruncated={summaryQuery.data?.timeBucketsTruncated}
          />
        </TabsContent>

        <TabsContent value="register" className="space-y-4">
          <OrdersPanel
            data={registerQuery.data?.data ?? []}
            meta={registerQuery.data?.meta}
            summary={summaryForPanels}
            isLoading={registerQuery.isLoading}
            onExportCsv={exportCsv}
            page={registerPage}
            onPageChange={setRegisterPage}
          />
        </TabsContent>

        <TabsContent value="settlement" className="space-y-4">
          <SettlementPayInPanel
            rows={registerBulkQuery.data?.data ?? []}
            isLoading={registerBulkQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <RevenuePanel data={revenueQuery.data} isLoading={revenueQuery.isLoading} />
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <CustomersPanel
            data={byCustomerQuery.data?.data ?? []}
            meta={byCustomerQuery.data?.meta}
            isLoading={byCustomerQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="rm-performance" className="space-y-4">
          <RmPerformancePanel
            orderCount={summaryQuery.data?.kpis.orderCount ?? 0}
            totalRevenue={Number(summaryQuery.data?.kpis.sumTotalAmount ?? 0)}
            customerCount={summaryQuery.data?.kpis.distinctCustomers ?? 0}
            isLoading={summaryQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <CompliancePanel
            byIsin={byIsinQuery.data?.data ?? []}
            summary={summaryForPanels}
            isLoading={byIsinQuery.isLoading || summaryQuery.isLoading}
          />
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <ExceptionsPanel
            failures={logFailuresQuery.data?.data ?? []}
            orders={registerBulkQuery.data?.data ?? []}
            isLoading={logFailuresQuery.isLoading || registerBulkQuery.isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
