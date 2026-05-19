"use client";

import type { OrderReportRegisterRow } from "@root/apiGateway";
import { differenceInHours } from "date-fns";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
  customerFullName,
  mapKycLabel,
  mapOrderWorkflowStatus,
} from "./reportDerivations";
import {
  ReportDataTable,
  ReportFilterSelect,
  ReportKpiCard,
  ReportKpiGrid,
  ReportPageHeader,
  SeverityBadge,
  WorkflowStatusBadge,
} from "./reportUi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LogFailure = {
  id: number;
  orderId: number;
  step: string;
  status: string;
  createdAt: string;
};

export type ExceptionRow = {
  id: string;
  type: string;
  orderNumber: string;
  customer: string;
  isin: string;
  description: string;
  severity: "Critical" | "High" | "Medium" | "Info";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  raised: string;
  assigned: string;
};

function buildExceptions(
  failures: LogFailure[],
  orders: OrderReportRegisterRow[],
): ExceptionRow[] {
  const orderById = new Map(orders.map((o) => [o.id, o]));
  const out: ExceptionRow[] = [];

  for (const f of failures) {
    const order = orderById.get(f.orderId);
    out.push({
      id: `EXC-L${f.id}`,
      type: "Automation failure",
      orderNumber: order?.orderNumber ?? `ID ${f.orderId}`,
      customer: order ? customerFullName(order) : "—",
      isin: order?.isin ?? "—",
      description: `Failed at step ${f.step}`,
      severity: "High",
      status: "Open",
      raised: format(new Date(f.createdAt), "d MMM, HH:mm"),
      assigned: "Ops Team",
    });
  }

  for (const o of orders) {
    const hours = differenceInHours(Date.now(), new Date(o.createdAt));
    if (o.paymentStatus === "PENDING" && hours > 24) {
      out.push({
        id: `EXC-P${o.id}`,
        type: "Orders without pay-in",
        orderNumber: o.orderNumber,
        customer: customerFullName(o),
        isin: o.isin,
        description:
          hours > 48
            ? "Pay-in overdue by 48 hrs — escalation required"
            : "Pay-in not received within 24 hrs of confirmation",
        severity: hours > 48 ? "Critical" : "High",
        status: "Open",
        raised: format(new Date(o.createdAt), "d MMM, HH:mm"),
        assigned: "Ops Team",
      });
    }
    const kyc = mapKycLabel(o.customerProfile.kycStatus);
    if (kyc === "Pending" || kyc === "Expired") {
      out.push({
        id: `EXC-K${o.id}`,
        type: "KYC not validated",
        orderNumber: o.orderNumber,
        customer: customerFullName(o),
        isin: o.isin,
        description: `Order with KYC in ${kyc} state`,
        severity: kyc === "Expired" ? "Critical" : "High",
        status: "In Progress",
        raised: format(new Date(o.createdAt), "d MMM, HH:mm"),
        assigned: "Compliance",
      });
    }
    if (o.status === "REJECTED") {
      out.push({
        id: `EXC-R${o.id}`,
        type: "Order rejected",
        orderNumber: o.orderNumber,
        customer: customerFullName(o),
        isin: o.isin,
        description: `Workflow: ${mapOrderWorkflowStatus(o.status, o.paymentStatus)}`,
        severity: "Medium",
        status: "Closed",
        raised: format(new Date(o.createdAt), "d MMM, HH:mm"),
        assigned: "—",
      });
    }
  }

  return out.sort((a, b) => b.raised.localeCompare(a.raised));
}

export function ExceptionsPanel({
  failures,
  orders,
  isLoading,
}: {
  failures: LogFailure[];
  orders: OrderReportRegisterRow[];
  isLoading?: boolean;
}) {
  const [severityFilter, setSeverityFilter] = useState("__all__");
  const [statusFilter, setStatusFilter] = useState("__all__");
  const [subTab, setSubTab] = useState("all");

  const exceptions = useMemo(() => buildExceptions(failures, orders), [failures, orders]);

  const filtered = useMemo(() => {
    return exceptions.filter((e) => {
      if (subTab === "pending" && e.status !== "Open" && e.status !== "In Progress") return false;
      if (severityFilter !== "__all__" && e.severity !== severityFilter) return false;
      if (statusFilter !== "__all__" && e.status !== statusFilter) return false;
      return true;
    });
  }, [exceptions, severityFilter, statusFilter, subTab]);

  const kpis = useMemo(() => {
    const open = exceptions.filter((e) => e.status === "Open").length;
    const critical = exceptions.filter((e) => e.severity === "Critical").length;
    const inProgress = exceptions.filter((e) => e.status === "In Progress").length;
    const resolved = exceptions.filter((e) => e.status === "Resolved" || e.status === "Closed").length;
    return { open, critical, inProgress, resolved };
  }, [exceptions]);

  const severityCounts = useMemo(() => {
    const c = { Critical: 0, High: 0, Medium: 0, Info: 0 };
    for (const e of exceptions) {
      if (e.severity in c) c[e.severity as keyof typeof c] += 1;
    }
    return c;
  }, [exceptions]);

  const tableRows = filtered.map((e) => ({
    key: e.id,
    cells: [
      <span key="id" className="font-mono text-xs">{e.id}</span>,
      <span key="t" className="text-sm">{e.type}</span>,
      <span key="o" className="font-mono text-xs">{e.orderNumber}</span>,
      <span key="c" className="text-sm">{e.customer}</span>,
      <span key="i" className="font-mono text-xs">{e.isin}</span>,
      <span key="d" className="max-w-[220px] text-sm text-muted-foreground">{e.description}</span>,
      <SeverityBadge key="s" severity={e.severity} />,
      <WorkflowStatusBadge key="st" label={e.status} />,
      <span key="r" className="whitespace-nowrap text-xs text-muted-foreground">{e.raised}</span>,
      <span key="a" className="text-xs">{e.assigned}</span>,
    ],
  }));

  return (
    <div className="space-y-5">
      <ReportPageHeader
        title="Exceptions"
        description="Operational risk flags, KYC issues, settlement failures, and manual intervention cases."
      />

      <ReportKpiGrid>
        <ReportKpiCard label="Open" value={String(kpis.open)} sub="Require immediate action" />
        <ReportKpiCard label="Critical" value={String(kpis.critical)} sub="Highest priority" valueClassName="text-red-700 dark:text-red-400" />
        <ReportKpiCard label="In Progress" value={String(kpis.inProgress)} sub="Being investigated" />
        <ReportKpiCard label="Resolved" value={String(kpis.resolved)} sub="Closed or resolved" />
      </ReportKpiGrid>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="h-9 rounded-lg bg-muted/50 p-1">
          <TabsTrigger value="all" className="rounded-md text-sm">
            All Exceptions
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-md text-sm">
            Pending Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value={subTab} className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Critical {severityCounts.Critical} · High {severityCounts.High} · Medium{" "}
            {severityCounts.Medium} · Info {severityCounts.Info}
          </p>
          <ReportDataTable
            columns={[
              { key: "id", label: "ID" },
              { key: "type", label: "Type" },
              { key: "order", label: "Order" },
              { key: "customer", label: "Customer" },
              { key: "isin", label: "ISIN" },
              { key: "desc", label: "Description" },
              { key: "sev", label: "Severity" },
              { key: "status", label: "Status" },
              { key: "raised", label: "Raised" },
              { key: "assigned", label: "Assigned" },
            ]}
            rows={tableRows}
            isLoading={isLoading}
            toolbar={
              <>
                <ReportFilterSelect
                  value={severityFilter}
                  onValueChange={setSeverityFilter}
                  placeholder="All Severity"
                  options={[
                    { value: "__all__", label: "All Severity" },
                    { value: "Critical", label: "Critical" },
                    { value: "High", label: "High" },
                    { value: "Medium", label: "Medium" },
                    { value: "Info", label: "Info" },
                  ]}
                />
                <ReportFilterSelect
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                  placeholder="All Statuses"
                  options={[
                    { value: "__all__", label: "All Statuses" },
                    { value: "Open", label: "Open" },
                    { value: "In Progress", label: "In Progress" },
                    { value: "Resolved", label: "Resolved" },
                    { value: "Closed", label: "Closed" },
                  ]}
                />
              </>
            }
            recordCount={`${filtered.length} exceptions`}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
