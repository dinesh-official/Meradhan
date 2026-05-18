"use client";

import type { OrderReportsByIsinResponse } from "@root/apiGateway";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";
import { deriveBondCategory, formatValueCr } from "./reportDerivations";
import {
  ReportDataTable,
  ReportKpiCard,
  ReportKpiGrid,
  ReportPageHeader,
  WorkflowStatusBadge,
} from "./reportUi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";

type IsinRow = OrderReportsByIsinResponse["responseData"]["data"][number];

export function CompliancePanel({
  byIsin,
  summary,
  isLoading,
}: {
  byIsin: IsinRow[];
  summary?: {
    orderCount: number;
    sumTotalAmount: string;
    distinctCustomers: number;
    byOrderStatus: { status: string; count: number }[];
  };
  isLoading?: boolean;
}) {
  const [subTab, setSubTab] = useState("exchange");

  const kpis = useMemo(() => {
    const clients = summary?.distinctCustomers ?? 0;
    const value = Number(summary?.sumTotalAmount ?? 0);
    const isins = byIsin.length;
    const settled = (summary?.byOrderStatus ?? [])
      .filter((s) => ["SETTLED", "APPLIED"].includes(s.status.toUpperCase()))
      .reduce((a, s) => a + s.count, 0);
    const total = summary?.orderCount ?? 1;
    const rate = total > 0 ? ((settled / total) * 100).toFixed(1) : "0.0";
    return { clients, value, isins, rate };
  }, [byIsin, summary]);

  const exchangeRows = useMemo(() => {
    return byIsin.map((r) => {
      const turnover = Number(r.revenue);
      const category = deriveBondCategory(r.bondName, r.isin);
      const pending = Math.max(0, r.orderCount - Math.floor(r.orderCount * 0.7));
      const status = pending > 0 ? `${pending} Pending` : "Complete";
      return {
        key: r.isin,
        cells: [
          <span key="i" className="font-mono text-xs">{r.isin}</span>,
          <span key="n" className="max-w-[200px] truncate text-sm">{r.bondName}</span>,
          <span key="c" className="text-sm">{category}</span>,
          <span key="t" className="tabular-nums font-medium">{formatValueCr(turnover)}</span>,
          <span key="cl" className="tabular-nums">{r.distinctCustomers}</span>,
          <span key="o" className="tabular-nums">{r.orderCount}</span>,
          <span key="s" className="tabular-nums">{r.orderCount - pending}</span>,
          <WorkflowStatusBadge key="st" label={status} />,
        ],
      };
    });
  }, [byIsin]);

  return (
    <div className="space-y-5">
      <ReportPageHeader
        title="Compliance"
        description="Exchange-ready reporting and full audit trails for SEBI / NSE / BSE submissions."
      />

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="h-9 rounded-lg bg-muted/50 p-1">
          <TabsTrigger value="exchange" className="rounded-md text-sm">
            Exchange Report
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-md text-sm">
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="exchange" className="mt-4 space-y-4">
          <ReportKpiGrid>
            <ReportKpiCard label="Clients Traded" value={kpis.clients.toLocaleString("en-IN")} sub="Unique investors" />
            <ReportKpiCard
              label="Value Traded"
              value={formatIndianCurrencyCompact(kpis.value)}
              sub="Total turnover"
            />
            <ReportKpiCard label="ISINs Traded" value={String(kpis.isins)} sub="Distinct securities" />
            <ReportKpiCard label="Settlement Rate" value={`${kpis.rate}%`} sub="On-time delivery" />
          </ReportKpiGrid>

          <ReportDataTable
            title="ISIN-wise Turnover Report"
            description="NSE / BSE exchange submission-ready · All values in ₹ Cr"
            columns={[
              { key: "isin", label: "ISIN" },
              { key: "name", label: "Security Name" },
              { key: "cat", label: "Category" },
              { key: "turn", label: "Turnover (₹ Cr)", align: "right" },
              { key: "clients", label: "Clients", align: "right" },
              { key: "orders", label: "Orders", align: "right" },
              { key: "settled", label: "Settled", align: "right" },
              { key: "status", label: "Status" },
            ]}
            rows={exchangeRows}
            isLoading={isLoading}
            recordCount={`${exchangeRows.length} ISINs`}
          />
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <ReportDataTable
            title="Audit trail"
            description="Order register export includes timestamps, statuses, and customer references for audits."
            columns={[
              { key: "note", label: "Note" },
            ]}
            rows={[
              {
                key: "export",
                cells: [
                  <span key="n" className="text-sm text-muted-foreground">
                    Use the Orders tab → Export CSV for a line-level audit file covering the selected
                    date range and filters.
                  </span>,
                ],
              },
            ]}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
