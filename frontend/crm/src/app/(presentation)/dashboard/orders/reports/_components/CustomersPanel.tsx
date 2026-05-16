"use client";

import type { OrderReportsByCustomerResponse } from "@root/apiGateway";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";
import {
  customerInitials,
  formatValueCr,
  mapKycLabel,
  mapUserTypeLabel,
  maskPanPlaceholder,
} from "./reportDerivations";
import {
  KycStatusBadge,
  ReportDataTable,
  ReportFilterSelect,
  ReportKpiCard,
  ReportKpiGrid,
  ReportPageHeader,
} from "./reportUi";
import { format } from "date-fns";
import { useMemo, useState } from "react";

type Row = OrderReportsByCustomerResponse["responseData"]["data"][number];

export function CustomersPanel({
  data,
  meta,
  isLoading,
}: {
  data: Row[];
  meta?: OrderReportsByCustomerResponse["responseData"]["meta"];
  isLoading?: boolean;
}) {
  const [kycFilter, setKycFilter] = useState("__all__");
  const [typeFilter, setTypeFilter] = useState("__all__");

  const kpis = useMemo(() => {
    const total = meta?.total ?? data.length;
    const hni = data.filter((r) => mapUserTypeLabel(r.customer?.userType) === "HNI").length;
    const corp = data.filter((r) => mapUserTypeLabel(r.customer?.userType) === "Corporate").length;
    const ind = total - hni - corp;
    const hniInvested = data
      .filter((r) => Number(r.lifetimeValue) >= 5_000_000)
      .length;
    const repeat = data.filter((r) => r.orderCount > 1).length;
    const repeatPct = total > 0 ? ((repeat / total) * 100).toFixed(1) : "0.0";
    return { total, hni, corp, ind, hniInvested, repeatPct };
  }, [data, meta]);

  const filtered = useMemo(() => {
    return data.filter((r) => {
      const kyc = mapKycLabel(r.customer?.kycStatus);
      const type = mapUserTypeLabel(r.customer?.userType);
      if (kycFilter !== "__all__" && kyc !== kycFilter) return false;
      if (typeFilter !== "__all__" && type !== typeFilter) return false;
      return true;
    });
  }, [data, kycFilter, typeFilter]);

  const tableRows = useMemo(() => {
    return filtered.map((r) => {
      const name = [r.customer?.firstName, r.customer?.lastName].filter(Boolean).join(" ") || "—";
      const email = r.customer?.emailAddress ?? "—";
      const kyc = mapKycLabel(r.customer?.kycStatus);
      const type = mapUserTypeLabel(r.customer?.userType);
      const invested = Number(r.lifetimeValue);
      const avgTicket = r.orderCount > 0 ? invested / r.orderCount : 0;
      const last = r.lastOrderAt ? format(new Date(r.lastOrderAt), "d MMM yyyy") : "—";
      return {
        key: r.customerProfileId,
        cells: [
          <div key="c" className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {customerInitials(name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>,
          <span key="pan" className="font-mono text-xs">{maskPanPlaceholder(r.customerProfileId)}</span>,
          <KycStatusBadge key="kyc" status={kyc} />,
          <span key="type" className="text-sm">{type}</span>,
          <span key="ord" className="tabular-nums">{r.orderCount}</span>,
          <span key="inv" className="tabular-nums font-medium">{formatValueCr(invested)}</span>,
          <span key="avg" className="tabular-nums text-muted-foreground">
            {formatIndianCurrencyCompact(avgTicket)}
          </span>,
          <span key="pen" className="tabular-nums">—</span>,
          <span key="rm" className="text-xs text-muted-foreground">—</span>,
          <span key="last" className="whitespace-nowrap text-xs text-muted-foreground">{last}</span>,
        ],
      };
    });
  }, [filtered]);

  const kycOptions = useMemo(() => {
    const set = new Set(data.map((r) => mapKycLabel(r.customer?.kycStatus)));
    return [{ value: "__all__", label: "All KYC" }, ...[...set].map((k) => ({ value: k, label: k }))];
  }, [data]);

  const typeOptions = useMemo(() => {
    const set = new Set(data.map((r) => mapUserTypeLabel(r.customer?.userType)));
    return [{ value: "__all__", label: "All Types" }, ...[...set].map((t) => ({ value: t, label: t }))];
  }, [data]);

  return (
    <div className="space-y-5">
      <ReportPageHeader
        title="Customers"
        description="Investor profiles, KYC status, and order history."
      />

      <ReportKpiGrid>
        <ReportKpiCard
          label="Total Customers"
          value={kpis.total.toLocaleString("en-IN")}
          sub={`${kpis.hni} HNI · ${kpis.corp} Corp · ${kpis.ind} Ind`}
        />
        <ReportKpiCard
          label="HNI Customers"
          value={kpis.hniInvested.toLocaleString("en-IN")}
          sub="Invested > ₹50 L (page)"
        />
        <ReportKpiCard label="On this page" value={data.length.toLocaleString("en-IN")} sub="Filtered period" />
        <ReportKpiCard
          label="Repeat Investors"
          value={`${kpis.repeatPct}%`}
          sub="More than one order"
        />
      </ReportKpiGrid>

      <ReportDataTable
        description="Click any row to view customer detail"
        columns={[
          { key: "customer", label: "Customer" },
          { key: "pan", label: "PAN" },
          { key: "kyc", label: "KYC" },
          { key: "type", label: "Type" },
          { key: "orders", label: "Orders", align: "right" },
          { key: "invested", label: "Invested (₹ Cr)", align: "right" },
          { key: "avg", label: "Avg Ticket", align: "right" },
          { key: "pending", label: "Pending", align: "right" },
          { key: "rm", label: "RM" },
          { key: "last", label: "Last Order" },
        ]}
        rows={tableRows}
        isLoading={isLoading}
        toolbar={
          <>
            <ReportFilterSelect
              value={kycFilter}
              onValueChange={setKycFilter}
              placeholder="All KYC"
              options={kycOptions}
            />
            <ReportFilterSelect
              value={typeFilter}
              onValueChange={setTypeFilter}
              placeholder="All Types"
              options={typeOptions}
            />
          </>
        }
        recordCount={`${filtered.length} customers`}
      />
    </div>
  );
}
