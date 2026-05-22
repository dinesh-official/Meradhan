"use client";

import type { OrderReportsRegisterResponse } from "@root/apiGateway";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";
import {
  customerFullName,
  deriveBondCategory,
  formatOrderDate,
  formatValueCr,
  mapOrderWorkflowStatus,
  parseRatingFromBondDetails,
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


type Row = OrderReportsRegisterResponse["responseData"]["data"][number];

const BOND_TYPE_BORDER: Record<string, string> = {
  "Corporate Bond": "border-l-blue-500",
  "G-Sec":          "border-l-emerald-500",
  "SDL":            "border-l-purple-500",
  "SGB":            "border-l-amber-500",
};

const BOND_TYPE_BADGE: Record<string, string> = {
  "Corporate Bond": "bg-blue-50 text-blue-700",
  "G-Sec":          "bg-emerald-50 text-emerald-700",
  "SDL":            "bg-purple-50 text-purple-700",
  "SGB":            "bg-amber-50 text-amber-700",
};

type BondTypeCard = {
  type: string;
  orders: number;
  qty: number;
  value: number;
  avgYield: string;
  settled: number;
  pending: number;
  investors: number;
};

function BondTypeCards({ cards, isLoading }: { cards: BondTypeCard[]; isLoading?: boolean }) {
  if (isLoading) return <p className="py-14 text-center text-sm text-muted-foreground">Loading…</p>;
  if (cards.length === 0) return <p className="py-14 text-center text-sm text-muted-foreground">No data for this period.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.type}
          className={cn(
            "rounded-xl border border-border border-l-[3px] bg-white p-4",
            BOND_TYPE_BORDER[card.type] ?? "border-l-slate-300",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">{card.type}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", BOND_TYPE_BADGE[card.type] ?? "bg-slate-100 text-slate-600")}>
              {card.orders} orders
            </span>
          </div>

          <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">
            ₹{(card.value / 1e7).toFixed(1)} Cr
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">Total value</p>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-4">
            {[
              { label: "Qty",       value: card.qty.toLocaleString("en-IN") },
              { label: "Avg Yield", value: card.avgYield },
              { label: "Settled",   value: card.settled, className: "text-emerald-600" },
              { label: "Pending",   value: card.pending, className: "text-amber-600" },
              { label: "Investors", value: card.investors },
            ].map(({ label, value, className }) => (
              <div key={label}>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
                <p className={cn("mt-0.5 text-sm font-semibold tabular-nums text-slate-700", className)}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function IsinSecurityCell({ isin, bondName }: { isin: string; bondName: string }) {
  return (
    <div className="space-y-0.5">
      <span className="block font-mono text-xs font-medium text-slate-800">{isin}</span>
      <span className="block max-w-[200px] truncate text-[11px] text-slate-400">{bondName}</span>
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

  const isinRows = useMemo(() => {
    if (view !== "isin") return [];
    const groups = new Map<string, { bondName: string; bondDetails: unknown; orders: Row[] }>();
    for (const r of filtered) {
      const g = groups.get(r.isin) ?? { bondName: r.bondName, bondDetails: r.bondDetails, orders: [] };
      g.orders.push(r);
      groups.set(r.isin, g);
    }
    return [...groups.entries()].map(([isin, g]) => {
      const totalValue = g.orders.reduce((s, o) => s + Number(o.totalAmount), 0);
      const totalQty = g.orders.reduce((s, o) => s + o.quantity, 0);
      const type = deriveBondCategory(g.bondName, isin);
      const rating = parseRatingFromBondDetails(g.bondDetails) ?? "—";
      const yields = g.orders
        .map((o) => parseYieldFromBondDetails(o.bondDetails))
        .filter(Boolean)
        .map((y) => parseFloat(y!));
      const avgYield = yields.length > 0
        ? `${(yields.reduce((s, y) => s + y, 0) / yields.length).toFixed(2)}%`
        : "—";
      const investors = new Set(g.orders.map((o) => o.customerProfile.emailAddress)).size;
      const settled = g.orders.filter((o) =>
        ["SETTLED", "APPLIED"].includes(o.status.toUpperCase()),
      ).length;
      const pending = g.orders.filter((o) => o.status.toUpperCase() === "PENDING").length;
      return {
        key: isin,
        cells: [
          <span key="isin" className="font-mono text-xs font-medium text-slate-800">{isin}</span>,
          <span key="sec" className="block max-w-[180px] truncate text-xs text-slate-500">{g.bondName}</span>,
          <span key="rat" className="text-xs">{rating}</span>,
          <span key="typ" className="text-xs">{type}</span>,
          <span key="ord" className="tabular-nums">{g.orders.length}</span>,
          <span key="qty" className="tabular-nums">{totalQty.toLocaleString("en-IN")}</span>,
          <span key="val" className="tabular-nums font-medium">{formatValueCr(totalValue)}</span>,
          <span key="yld" className="tabular-nums">{avgYield}</span>,
          <span key="inv" className="tabular-nums">{investors}</span>,
          <span key="stl" className="tabular-nums font-medium text-emerald-600">{settled}</span>,
          <span key="pnd" className="tabular-nums font-medium text-amber-600">{pending}</span>,
        ],
      };
    });
  }, [view, filtered]);

  const typeCards = useMemo<BondTypeCard[]>(() => {
    const groups = new Map<string, Row[]>();
    for (const r of filtered) {
      const t = deriveBondCategory(r.bondName, r.isin);
      const g = groups.get(t) ?? [];
      g.push(r);
      groups.set(t, g);
    }
    return [...groups.entries()].map(([type, orders]) => {
      const qty = orders.reduce((s, o) => s + o.quantity, 0);
      const value = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
      const yields = orders
        .map((o) => parseYieldFromBondDetails(o.bondDetails))
        .filter(Boolean)
        .map((y) => parseFloat(y!));
      const avgYield = yields.length > 0
        ? `${(yields.reduce((s, y) => s + y, 0) / yields.length).toFixed(2)}%`
        : "—";
      const investors = new Set(orders.map((o) => o.customerProfile.emailAddress)).size;
      const settled = orders.filter((o) => ["SETTLED", "APPLIED"].includes(o.status.toUpperCase())).length;
      const pending = orders.filter((o) => o.status.toUpperCase() === "PENDING").length;
      return { type, orders: orders.length, qty, value, avgYield, investors, settled, pending };
    });
  }, [filtered]);

  const groupedRows = useMemo(() => {
    const groups = new Map<string, Row[]>();
    for (const r of filtered) {
      const key = formatOrderDate(r.createdAt);
      const g = groups.get(key) ?? [];
      g.push(r);
      groups.set(key, g);
    }
    return [...groups.entries()].map(([key, orders]) => {
      const value = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
      return {
        key,
        cells: [
          <span key="l" className="text-xs font-medium">{key}</span>,
          <span key="c" className="tabular-nums">{orders.length}</span>,
          <span key="q" className="tabular-nums">{orders.reduce((s, o) => s + o.quantity, 0).toLocaleString("en-IN")}</span>,
          <span key="v" className="tabular-nums font-medium">{formatValueCr(value)}</span>,
        ],
      };
    });
  }, [filtered]);

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

  const isinColumns = [
    { key: "isin",      label: "ISIN" },
    { key: "security",  label: "Security" },
    { key: "rating",    label: "Rating" },
    { key: "type",      label: "Type" },
    { key: "orders",    label: "Orders",       align: "right" as const },
    { key: "qty",       label: "Qty",          align: "right" as const },
    { key: "value",     label: "Value (₹ Cr)", align: "right" as const },
    { key: "yield",     label: "Avg Yield",    align: "right" as const },
    { key: "investors", label: "Investors",    align: "right" as const },
    { key: "settled",   label: "Settled",      align: "right" as const },
    { key: "pending",   label: "Pending",      align: "right" as const },
  ];

  const groupColumns = [
    { key: "key",   label: view === "type" ? "Bond Type" : "Date" },
    { key: "orders", label: "Orders", align: "right" as const },
    { key: "qty",   label: "Qty",          align: "right" as const },
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
        <TabsList className="inline-flex h-8 items-center gap-0.5 rounded-lg bg-muted/60 p-0.5">
          {(["book", "isin", "type", "date"] as const).map((v) => (
            <TabsTrigger
              key={v}
              value={v}
              className="h-7 rounded-md px-3 text-xs font-medium text-muted-foreground shadow-none transition-colors data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              {v === "book" ? "Order Book" : v === "isin" ? "By ISIN" : v === "type" ? "By Bond Type" : "By Date"}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="type" className="mt-0">
          <BondTypeCards cards={typeCards} isLoading={isLoading} />
        </TabsContent>

        {(["book", "isin", "date"] as const).map((v) => (
          <TabsContent key={v} value={v} className="mt-0">
            <ReportDataTable
              columns={v === "book" ? bookColumns : v === "isin" ? isinColumns : groupColumns}
              rows={v === "book" ? bookRows : v === "isin" ? isinRows : groupedRows}
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
                v === "book" ? (
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
        ))}
      </Tabs>
    </div>
  );
}
