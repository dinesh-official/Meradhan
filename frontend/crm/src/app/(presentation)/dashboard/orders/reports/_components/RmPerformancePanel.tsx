"use client";

import { formatIndianCurrencyCompact } from "./orderReportFormatters";
import {
  ReportDataTable,
  ReportKpiCard,
  ReportKpiGrid,
  ReportPageHeader,
} from "./reportUi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useMemo, useState } from "react";

/** Placeholder RM rows until RM attribution is stored on orders. */
const PLACEHOLDER_RMS = [
  { name: "Unassigned pool", initials: "UP", orders: 0, conversion: 0, revenue: 0, customers: 0, followUp: 0 },
];

export function RmPerformancePanel({
  orderCount,
  totalRevenue,
  customerCount,
  isLoading,
}: {
  orderCount: number;
  totalRevenue: number;
  customerCount: number;
  isLoading?: boolean;
}) {
  const [subTab, setSubTab] = useState("leaderboard");

  const rows = useMemo(() => {
    const pool = {
      name: "Platform (unassigned)",
      initials: "PF",
      orders: orderCount,
      conversion: orderCount > 0 ? 65 : 0,
      revenue: totalRevenue,
      customers: customerCount,
      followUp: 75,
    };
    return [pool, ...PLACEHOLDER_RMS.filter((r) => r.name !== "Unassigned pool")];
  }, [orderCount, totalRevenue, customerCount]);

  const tableRows = rows.map((r, i) => ({
    key: r.name,
    cells: [
      <span key="rank" className="tabular-nums text-muted-foreground">
        {i === 0 ? "—" : `#${i}`}
      </span>,
      <span key="name" className="font-medium">{r.name}</span>,
      <span key="ord" className="tabular-nums">{r.orders.toLocaleString("en-IN")}</span>,
      <span key="conv" className="tabular-nums">{r.conversion}%</span>,
      <span key="rev" className="tabular-nums">{formatIndianCurrencyCompact(r.revenue)}</span>,
      <span key="cust" className="tabular-nums">{r.customers}</span>,
      <span key="ticket" className="tabular-nums">
        {r.orders > 0 ? formatIndianCurrencyCompact(r.revenue / r.orders) : "—"}
      </span>,
      <span key="fu" className="tabular-nums">{r.followUp}%</span>,
    ],
  }));

  return (
    <div className="space-y-5">
      <ReportPageHeader
        title="RM Performance"
        description="Track relationship manager performance, conversion rates, and revenue contribution."
      />

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="h-9 rounded-lg bg-muted/50 p-1">
          <TabsTrigger value="leaderboard" className="rounded-md text-sm">
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="individual" className="rounded-md text-sm">
            Individual
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {rows.slice(0, 3).map((r) => (
              <Card key={r.name} className="border-border/80 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {r.initials}
                    </span>
                    <p className="font-medium">{r.name}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Orders</p>
                      <p className="font-semibold tabular-nums">{r.orders}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversion</p>
                      <p className="font-semibold tabular-nums">{r.conversion}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-semibold tabular-nums">
                        {formatIndianCurrencyCompact(r.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Customers</p>
                      <p className="font-semibold tabular-nums">{r.customers}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Follow-up efficiency {r.followUp}%
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <ReportDataTable
            title="Full Leaderboard"
            description="All RMs ranked by orders handled this period"
            columns={[
              { key: "rank", label: "Rank" },
              { key: "name", label: "RM Name" },
              { key: "orders", label: "Orders", align: "right" },
              { key: "conv", label: "Conversion", align: "right" },
              { key: "rev", label: "Revenue", align: "right" },
              { key: "cust", label: "Customers", align: "right" },
              { key: "ticket", label: "Avg Ticket", align: "right" },
              { key: "fu", label: "Follow-up", align: "right" },
            ]}
            rows={tableRows}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="individual" className="mt-4">
          <Card className="border-dashed border-border/80">
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Per-RM drill-down will appear when relationship managers are linked on customer
              profiles and orders.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
