"use client";

import DbTopActionCards from "@/app/(presentation)/dashboard/_components/DBTopActionCards";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LeadSourcesPiChart } from "./_components/chart/LeadSourcesPiChart";
import { SalesPerformanceChart } from "./_components/chart/SalesPerformanceChart";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import { LoginLogsHistory } from "./audit-logs/crm/logs/_login_logs/LoginLogsHistory";
import { DashboardStatsCards } from "./_components/DashboardStatsCards";
import { useMemo, useState } from "react";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";

const DashBoardView = () => {
  const [rangeDays, setRangeDays] = useState<string>("30");
  const [exporting, setExporting] = useState(false);

  const dashboardApi = useMemo(
    () => new apiGateway.crm.dashboard.CrmDashboardApi(apiClientCaller),
    []
  );
  const leadsApi = useMemo(
    () => new apiGateway.crm.crmLeads.CrmLeadApi(apiClientCaller),
    []
  );

  const toCsvRow = (values: Array<string | number | null | undefined>) =>
    values.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",");

  const handleExport = async () => {
    try {
      setExporting(true);
      const numericRange = Number(rangeDays) || 30;
      const [summaryRes, salesRes, leadsRes] = await Promise.all([
        dashboardApi.getSummary({ params: { rangeDays: numericRange } }),
        dashboardApi.getSalesPerformance({
          params: { rangeDays: numericRange },
        }),
        leadsApi.getLeadSourceSummary({ params: { rangeDays: numericRange } }),
      ]);

      const summary = summaryRes.data.responseData;
      const sales = salesRes.data.responseData;
      const leadSources = leadsRes.data.responseData;

      const lines: string[] = [];
      lines.push("Dashboard Summary");
      lines.push(
        "Metric,Total,TrendPct,CurrentWindow,PreviousWindow,RatePct,TotalUsers"
      );
      lines.push(
        toCsvRow([
          "Active Leads",
          summary?.activeLeads.total ?? 0,
          summary?.activeLeads.trendPct ?? 0,
          summary?.activeLeads.currentWindow ?? 0,
          summary?.activeLeads.previousWindow ?? 0,
          "",
          "",
        ])
      );
      lines.push(
        toCsvRow([
          "Completed Projects",
          summary?.completedProjects.total ?? 0,
          summary?.completedProjects.trendPct ?? 0,
          summary?.completedProjects.currentWindow ?? 0,
          summary?.completedProjects.previousWindow ?? 0,
          "",
          "",
        ])
      );
      lines.push(
        toCsvRow([
          "User Drop Rate",
          summary?.userDropRate.total ?? 0,
          summary?.userDropRate.trendPct ?? 0,
          summary?.userDropRate.currentWindow ?? 0,
          summary?.userDropRate.previousWindow ?? 0,
          summary?.userDropRate.ratePct ?? 0,
          summary?.userDropRate.totalUsers ?? 0,
        ])
      );
      lines.push(
        toCsvRow([
          "User Gain Rate",
          summary?.userGainRate.total ?? 0,
          summary?.userGainRate.trendPct ?? 0,
          summary?.userGainRate.currentWindow ?? 0,
          summary?.userGainRate.previousWindow ?? 0,
          summary?.userGainRate.ratePct ?? 0,
          summary?.userGainRate.totalUsers ?? 0,
        ])
      );

      lines.push("");
      lines.push("Sales Performance");
      lines.push("Date,Current,Previous");
      (sales?.data ?? []).forEach((point) => {
        lines.push(toCsvRow([point.date, point.current, point.prev]));
      });

      lines.push("");
      lines.push("Lead Sources");
      lines.push("Source,Count");
      (leadSources ?? []).forEach((item) => {
        lines.push(toCsvRow([item.source, item.count]));
      });

      const csvContent = lines.join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-export-${numericRange}d-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Dashboard Overview"
        description="Welcome back! Here's what's happening with your bond platform today."
        actions={
          <DbTopActionCards
            value={rangeDays}
            onChange={setRangeDays}
            onExport={handleExport}
            loading={exporting}
          />
        }
      />

      <DashboardStatsCards rangeDays={Number(rangeDays)} />
      <div className="gap-5 grid lg:grid-cols-7">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end items-end h-full">
            <SalesPerformanceChart rangeDays={Number(rangeDays)} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Sources</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <LeadSourcesPiChart rangeDays={Number(rangeDays)} />
          </CardContent>
        </Card>
      </div>
      <AllowOnlyView permissions={["view:crmauditlogs"]}>
        <LoginLogsHistory />
      </AllowOnlyView>
    </div>
  );
};

export default DashBoardView;
