"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
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
  return (
    <div className="flex items-center gap-1.5">
      <label htmlFor={id} className="shrink-0 text-xs text-muted-foreground">
        {label}:
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-input bg-white px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring dark:bg-background"
      />
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

      <div className="mb-5 flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Filters
        </span>
        <div className="h-4 w-px shrink-0 bg-border/60" />
        <ReportDateField id="rep-from" label="From" value={from} onChange={setFrom} />
        <ReportDateField id="rep-to" label="To" value={to} onChange={setTo} />
        <div className="h-4 w-px shrink-0 bg-border/60" />
        <Select
          value={paymentStatus || "__all__"}
          onValueChange={(v) => setPaymentStatus(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-8 w-auto min-w-[148px] bg-white text-xs dark:bg-background">
            <SelectValue placeholder="Payment: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Payment: All</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
            <SelectItem value="REFUNDED">REFUNDED</SelectItem>
            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status || "__all__"}
          onValueChange={(v) => setStatus(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="h-8 w-auto min-w-[130px] bg-white text-xs dark:bg-background">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Status: All</SelectItem>
            <SelectItem value="PENDING">PENDING</SelectItem>
            <SelectItem value="SETTLED">SETTLED</SelectItem>
            <SelectItem value="APPLIED">APPLIED</SelectItem>
            <SelectItem value="REJECTED">REJECTED</SelectItem>
          </SelectContent>
        </Select>
        <div className="h-4 w-px shrink-0 bg-border/60" />
        <Input
          id="rep-isin"
          placeholder="ISIN contains"
          className="h-8 w-[140px] bg-white text-xs dark:bg-background"
          value={isin}
          onChange={(e) => setIsin(e.target.value)}
        />
        <Input
          id="rep-email"
          placeholder="Email contains"
          className="h-8 w-[180px] bg-white text-xs dark:bg-background"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
          {(
            [
              { value: "overview",       label: "Overview" },
              { value: "register",       label: "Orders" },
              { value: "settlement",     label: "Settlement" },
              { value: "revenue",        label: "Revenue" },
              { value: "customers",      label: "Customers" },
              { value: "rm-performance", label: "RM Performance" },
              { value: "compliance",     label: "Compliance" },
              { value: "exceptions",     label: "Exceptions" },
            ] as const
          ).map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              title={REPORT_TAB_META[value].purpose}
              className="relative shrink-0 rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
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
            orders={registerBulkQuery.data?.data ?? []}
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
            orders={registerBulkQuery.data?.data ?? []}
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
