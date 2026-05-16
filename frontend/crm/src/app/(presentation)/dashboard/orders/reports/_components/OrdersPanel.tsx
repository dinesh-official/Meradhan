"use client";

import type { OrderReportsRegisterResponse } from "@root/apiGateway";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";
import {
  customerFullName,
  deriveBondCategory,
  formatOrderDate,
  formatValueCr,
  mapOrderWorkflowStatus,
  parseYieldFromBondDetails,
} from "./reportDerivations";
import {
  ReportDataTable,
  ReportFilterSelect,
  ReportKpiCard,
  ReportKpiGrid,
  ReportPageHeader,
  ReportPagination,
  WorkflowStatusBadge,
} from "./reportUi";
import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

type Row = OrderReportsRegisterResponse["responseData"]["data"][number];

function IsinSecurityCell({ isin, bondName }: { isin: string; bondName: string }) {
  return (
    <div>
      <span className="block font-mono text-xs">{isin}</span>
      <span className="block max-w-[200px] truncate text-xs text-muted-foreground">{bondName}</span>
    </div>
  );
}

export function OrdersPanel({
  data,
  meta,
  summary,
  isLoading,
  onExportCsv,
  page,
  onPageChange,
}: {
  data: Row[];
  meta?: OrderReportsRegisterResponse["responseData"]["meta"];
  summary?: {
    orderCount: number;
    sumTotalAmount: string;
    byOrderStatus: { status: string; count: number }[];
  };
  isLoading?: boolean;
  onExportCsv: () => void;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const [view, setView] = useState("book");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [typeFilter, setTypeFilter] = useState("__all__");

  const kpis = useMemo(() => {
    const total = meta?.total ?? summary?.orderCount ?? data.length;
    const totalValue = Number(summary?.sumTotalAmount ?? 0);
    const byStatus = summary?.byOrderStatus ?? [];
    const settled = byStatus
      .filter((s) => ["SETTLED", "APPLIED"].includes(s.status.toUpperCase()))
      .reduce((a, s) => a + s.count, 0);
    const active = byStatus
      .filter((s) => s.status.toUpperCase() === "PENDING")
      .reduce((a, s) => a + s.count, 0);
    const rate = total > 0 ? ((settled / total) * 100).toFixed(1) : "0.0";
    return { total, totalValue, settled, active, rate };
  }, [meta, summary, data.length]);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const wf = mapOrderWorkflowStatus(r.status, r.paymentStatus);
      if (statusFilter !== "__all__" && wf !== statusFilter) return false;
      const type = deriveBondCategory(r.bondName, r.isin);
      if (typeFilter !== "__all__" && type !== typeFilter) return false;
      return true;
    });
  }, [data, statusFilter, typeFilter]);

  const bookRows = useMemo(() => {
    return filtered.map((r) => {
      const wf = mapOrderWorkflowStatus(r.status, r.paymentStatus);
      const yieldStr = parseYieldFromBondDetails(r.bondDetails) ?? "—";
      return {
        key: r.id,
        cells: [
          <span key="o" className="font-mono text-xs">{r.orderNumber}</span>,
          <IsinSecurityCell key="i" isin={r.isin} bondName={r.bondName} />,
          <span key="c" className="text-sm">{customerFullName(r)}</span>,
          <span key="t" className="text-sm">{deriveBondCategory(r.bondName, r.isin)}</span>,
          <span key="q" className="tabular-nums">{r.quantity.toLocaleString("en-IN")}</span>,
          <span key="v" className="tabular-nums">{formatValueCr(Number(r.totalAmount))}</span>,
          <span key="y" className="tabular-nums text-sm">{yieldStr}</span>,
          <WorkflowStatusBadge key="s" label={wf} />,
          <span key="d" className="whitespace-nowrap text-xs text-muted-foreground">
            {formatOrderDate(r.createdAt)}
          </span>,
          <span key="rm" className="text-xs text-muted-foreground">—</span>,
        ],
      };
    });
  }, [filtered]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, { label: string; sub?: string; orders: Row[] }>();
    for (const r of filtered) {
      let key: string;
      let label: string;
      let sub: string | undefined;
      if (view === "isin") {
        key = r.isin;
        label = r.isin;
        sub = r.bondName;
      } else if (view === "type") {
        key = deriveBondCategory(r.bondName, r.isin);
        label = key;
      } else {
        key = formatOrderDate(r.createdAt);
        label = key;
      }
      const g = groups.get(key) ?? { label, sub, orders: [] };
      g.orders.push(r);
      groups.set(key, g);
    }
    return [...groups.entries()].map(([key, g]) => {
      const value = g.orders.reduce((s, o) => s + Number(o.totalAmount), 0);
      return {
        key,
        cells: [
          <span key="l" className="font-mono text-xs">{g.label}</span>,
          <span key="s" className="max-w-[220px] truncate text-sm text-muted-foreground">
            {g.sub ?? "—"}
          </span>,
          <span key="c" className="tabular-nums">{g.orders.length}</span>,
          <span key="q" className="tabular-nums">
            {g.orders.reduce((s, o) => s + o.quantity, 0).toLocaleString("en-IN")}
          </span>,
          <span key="v" className="tabular-nums font-medium">
            {formatValueCr(value)}
          </span>,
        ],
      };
    });
  }, [view, filtered]);

  const statusOptions = useMemo(() => {
    const set = new Set(data.map((r) => mapOrderWorkflowStatus(r.status, r.paymentStatus)));
    return [
      { value: "__all__", label: "All Statuses" },
      ...[...set].sort().map((s) => ({ value: s, label: s })),
    ];
  }, [data]);

  const typeOptions = useMemo(() => {
    const set = new Set(data.map((r) => deriveBondCategory(r.bondName, r.isin)));
    return [
      { value: "__all__", label: "All Types" },
      ...[...set].sort().map((t) => ({ value: t, label: t })),
    ];
  }, [data]);

  const bookColumns = [
    { key: "order", label: "Order ID" },
    { key: "isin", label: "ISIN / Security" },
    { key: "customer", label: "Customer" },
    { key: "type", label: "Type" },
    { key: "qty", label: "Qty", align: "right" as const },
    { key: "value", label: "Value (₹ Cr)", align: "right" as const },
    { key: "yield", label: "Yield", align: "right" as const },
    { key: "status", label: "Status" },
    { key: "date", label: "Date" },
    { key: "rm", label: "RM" },
  ];

  const groupColumns = [
    { key: "key", label: view === "isin" ? "ISIN" : view === "type" ? "Bond type" : "Date" },
    { key: "sub", label: "Security" },
    { key: "orders", label: "Orders", align: "right" as const },
    { key: "qty", label: "Qty", align: "right" as const },
    { key: "value", label: "Value (₹ Cr)", align: "right" as const },
  ];

  const totalPages = meta?.totalPages ?? 1;
  const total = meta?.total ?? filtered.length;

  return (
    <div className="space-y-5">
      <ReportPageHeader
        title="Orders"
        description="Detailed view of all order activity across the platform."
      />

      <ReportKpiGrid>
        <ReportKpiCard label="Total Orders" value={kpis.total.toLocaleString("en-IN")} sub="Across all statuses" />
        <ReportKpiCard
          label="Total Value"
          value={formatIndianCurrencyCompact(kpis.totalValue)}
          sub="Aggregate order value"
        />
        <ReportKpiCard
          label="Settled"
          value={kpis.settled.toLocaleString("en-IN")}
          sub={`${kpis.rate}% settlement rate`}
        />
        <ReportKpiCard
          label="Active"
          value={kpis.active.toLocaleString("en-IN")}
          sub="In-progress orders"
        />
      </ReportKpiGrid>

      <Tabs value={view} onValueChange={setView} className="space-y-4">
        <TabsList className="h-9 rounded-lg bg-muted/50 p-1">
          <TabsTrigger value="book" className="rounded-md text-sm">
            Order Book
          </TabsTrigger>
          <TabsTrigger value="isin" className="rounded-md text-sm">
            By ISIN
          </TabsTrigger>
          <TabsTrigger value="type" className="rounded-md text-sm">
            By Bond Type
          </TabsTrigger>
          <TabsTrigger value="date" className="rounded-md text-sm">
            By Date
          </TabsTrigger>
        </TabsList>

        <TabsContent value={view} className="mt-0">
          <ReportDataTable
            title={view === "book" ? undefined : undefined}
            columns={view === "book" ? bookColumns : groupColumns}
            rows={view === "book" ? bookRows : groupedRows}
            isLoading={isLoading}
            toolbar={
              <>
                <ReportFilterSelect
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  placeholder="All Statuses"
                  options={statusOptions}
                />
                <ReportFilterSelect
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                  placeholder="All Types"
                  options={typeOptions}
                />
                <Button variant="outline" size="sm" onClick={onExportCsv}>
                  Export CSV
                </Button>
              </>
            }
            recordCount={`${filtered.length} orders`}
            footer={
              view === "book" ? (
                <ReportPagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  onPageChange={onPageChange}
                />
              ) : null
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
