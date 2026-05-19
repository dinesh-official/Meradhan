import type { OrderReportRegisterRow } from "@root/apiGateway";
import { differenceInHours } from "date-fns";
import { formatIndianCurrencyCompact } from "./orderReportFormatters";

export type PayInStatusLabel = "Received" | "Pending" | "Refunded" | "Failed";

export function mapPayInStatus(paymentStatus: string): PayInStatusLabel {
  const u = paymentStatus.toUpperCase();
  if (u === "COMPLETED") return "Received";
  if (u === "REFUNDED") return "Refunded";
  if (u === "CANCELLED") return "Failed";
  return "Pending";
}

export function formatValueCr(amount: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return (n / 1e7).toFixed(2);
}

export function deriveSettlementCycle(row: OrderReportRegisterRow): string {
  const created = new Date(row.createdAt).getTime();
  const updated = new Date(row.updatedAt).getTime();
  const days = Math.max(0, Math.floor((updated - created) / (24 * 60 * 60 * 1000)));
  if (row.status === "SETTLED" || row.status === "APPLIED") {
    return days <= 1 ? "T+1" : "T+2";
  }
  return days <= 1 ? "T+1" : "T+2";
}

export function deriveClearing(row: OrderReportRegisterRow): string {
  const hash = row.id + row.isin.charCodeAt(0);
  return hash % 2 === 0 ? "NSCCL" : "ICCL";
}

export function formatUtrRef(row: OrderReportRegisterRow): string {
  if (row.paymentId?.trim()) {
    const id = row.paymentId.replace(/\W/g, "");
    const tail = id.slice(-6) || id;
    return `UTR${tail.padStart(6, "0").slice(-6)}`;
  }
  return "—";
}

export function customerDisplayName(row: OrderReportRegisterRow): string {
  const { firstName, middleName, lastName } = row.customerProfile;
  return [firstName, middleName, lastName].filter(Boolean).join(" ").trim() || row.customerProfile.emailAddress;
}

export type PayInKpis = {
  pendingAmount: number;
  pendingCount: number;
  receivedAmount: number;
  receivedCount: number;
  failedCount: number;
  overdueCount: number;
  totalCount: number;
  completionPct: number;
};

export function computePayInKpis(rows: OrderReportRegisterRow[]): PayInKpis {
  let pendingAmount = 0;
  let pendingCount = 0;
  let receivedAmount = 0;
  let receivedCount = 0;
  let failedCount = 0;
  let overdueCount = 0;
  const now = Date.now();

  for (const r of rows) {
    const amount = Number(r.totalAmount);
    const payIn = mapPayInStatus(r.paymentStatus);
    if (payIn === "Received") {
      receivedAmount += amount;
      receivedCount += 1;
    } else if (payIn === "Pending") {
      pendingAmount += amount;
      pendingCount += 1;
      const hours = differenceInHours(now, new Date(r.createdAt));
      if (hours > 48) overdueCount += 1;
    } else if (payIn === "Failed") {
      failedCount += 1;
    }
  }

  const totalCount = rows.length;
  const completionPct =
    totalCount > 0 ? Math.round((receivedCount / totalCount) * 100) : 0;

  return {
    pendingAmount,
    pendingCount,
    receivedAmount,
    receivedCount,
    failedCount,
    overdueCount,
    totalCount,
    completionPct,
  };
}

export function formatKpiAmount(amount: number): string {
  return formatIndianCurrencyCompact(amount);
}
