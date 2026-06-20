import type { OrderReportRegisterRow } from "@root/apiGateway";
import { format } from "date-fns";

export function formatValueCr(amount: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  return (n / 1e7).toFixed(2);
}

export function customerFullName(row: {
  customerProfile: {
    firstName: string;
    middleName: string | null;
    lastName: string;
    emailAddress: string;
  } | null;
  linkedRfqParticipantCode?: string | null;
}): string {
  if (!row.customerProfile) {
    // Participant-counterparty order — show the participant code instead.
    return row.linkedRfqParticipantCode
      ? `NSE participant ${row.linkedRfqParticipantCode}`
      : "External counterparty";
  }
  const { firstName, middleName, lastName, emailAddress } = row.customerProfile;
  const name = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
  return name || emailAddress;
}

export function customerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function deriveBondCategory(bondName: string, isin?: string): string {
  const n = bondName.toLowerCase();
  if (n.includes("goi") || n.includes("g-sec") || n.includes("government")) return "G-Sec";
  if (n.includes("sdl") || n.includes("state dev")) return "SDL";
  if (n.includes("sovereign gold") || n.includes("sgb")) return "SGB";
  if (n.includes("corporate") || n.includes("ncd") || n.includes("fd series")) return "Corporate Bond";
  if (isin?.startsWith("INF")) return "Corporate Bond";
  return "Corporate Bond";
}

export function mapOrderWorkflowStatus(
  orderStatus: string,
  paymentStatus: string,
): string {
  const o = String(orderStatus ?? "").toUpperCase();
  const p = String(paymentStatus ?? "").toUpperCase();

  if (o === "SETTLED") return "Settled";
  if (o === "APPLIED") return "In Settlement";
  if (o === "EXPIRED") return "Expired";
  if (o === "CANCELLED") return "Cancelled";
  if (o === "REJECTED") return "Expired";

  if (p === "CANCELLED" || p === "REFUNDED") return "Expired";

  if (o === "IN_PROGRESS") return "In Progress";

  if (o === "PENDING") {
    if (p === "COMPLETED") return "In Settlement";
    return "Order Initiated";
  }

  if (p === "COMPLETED") return "Deals Confirmed";

  return o
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function orderBelongsToCustomerProfile(
  order: { customerProfileId: number | null; customerProfile?: { id: number } | null },
  customerProfileId: number,
): boolean {
  if (order.customerProfileId === customerProfileId) return true;
  return order.customerProfile?.id === customerProfileId;
}

export function isActiveWorkflowStatus(label: string): boolean {
  const u = label.toLowerCase();
  return !(
    u.includes("settled") ||
    u.includes("expired") ||
    u.includes("cancelled") ||
    u.includes("reject")
  );
}

export function parseYieldFromBondDetails(bondDetails: unknown): string | null {
  if (!bondDetails || typeof bondDetails !== "object") return null;
  const bd = bondDetails as Record<string, unknown>;
  const y = bd.yield ?? bd.couponRate ?? bd.buyYield;
  const n = Number(y);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n.toFixed(2)}%`;
}

export function parseRatingFromBondDetails(bondDetails: unknown): string | null {
  if (!bondDetails || typeof bondDetails !== "object") return null;
  const bd = bondDetails as Record<string, unknown>;
  const r = bd.rating ?? bd.creditRating ?? bd.bondRating ?? bd.moodyRating ?? bd.spRating;
  return typeof r === "string" && r.trim() ? r.trim() : null;
}

export function formatOrderDate(iso: string): string {
  return format(new Date(iso), "d MMM yyyy");
}

export function maskPanPlaceholder(customerId: number): string {
  const tail = String(customerId).padStart(4, "0").slice(-4);
  return `XXXXX${tail}X`;
}

export function mapKycLabel(kyc: string | undefined | null): string {
  const u = String(kyc ?? "").toUpperCase();
  if (u.includes("VERIFIED") || u === "APPROVED") return "Verified";
  if (u.includes("PENDING") || u.includes("SUBMITTED")) return "Pending";
  if (u.includes("REJECT") || u.includes("EXPIRED")) return "Expired";
  return kyc ?? "—";
}

export function mapUserTypeLabel(userType: string | undefined | null): string {
  const u = String(userType ?? "").toUpperCase();
  if (u.includes("HNI")) return "HNI";
  if (u.includes("CORP")) return "Corporate";
  return "Individual";
}

export type RegisterRow = OrderReportRegisterRow & { bondDetails?: unknown };
