import type { Order } from "@root/apiGateway";
import { dateTimeUtils } from "@/global/utils/datetime.utils";

/** Formats ISO timestamps or NSE-style date strings (e.g. DD-MM-YYYY) for display. */
export function formatOrderHistoryDate(input: string | null | undefined): string {
  if (input == null || String(input).trim() === "") return "—";
  const str = String(input).trim();
  const parsed = dateTimeUtils.parseDate(str);
  if (!parsed) return "—";
  const out = dateTimeUtils.formatDateTime(parsed, "DD MMM YYYY");
  return out && out !== "Invalid Date" ? out : "—";
}

// Helper functions to safely extract values from Record<string, unknown>
const getBondDetailString = (
  bondDetails: Record<string, unknown>,
  key: string
): string | undefined => {
  const value = bondDetails[key];
  if (value === null || value === undefined) return undefined;
  return String(value);
};

const getBondDetailBoolean = (
  bondDetails: Record<string, unknown>,
  key: string
): boolean | undefined => {
  const value = bondDetails[key];
  if (value === null || value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  return undefined;
};

const getBondDetailObject = (
  bondDetails: Record<string, unknown>,
  key: string
): Record<string, unknown> | undefined => {
  const value = bondDetails[key];
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
};

/**
 * NSE `settle_order.settleStatus` (CBRICS settlement pipeline). Same codes if passed on `Order.status` as digits.
 * 0 Pending · 1–3 In Progress · 4 Settled · 5 Reversed · 6 Expired · 7 Cannot Settle · 8 Cancelled · 9 Contact us
 */
export function displayFromNseSettleStatus(code: number): {
  text: string;
  className: string;
} | null {
  if (!Number.isInteger(code) || code < 0 || code > 9) return null;
  switch (code) {
    case 0:
      return { text: "Pending", className: "text-orange-500" };
    case 1:
    case 2:
    case 3:
      return { text: "In Progress", className: "text-blue-600" };
    case 4:
      return { text: "Settled", className: "text-green-600" };
    case 5:
      return { text: "Reversed", className: "text-violet-600" };
    case 6:
      return { text: "Expired", className: "text-gray-500" };
    case 7:
      return { text: "Cannot Settle", className: "text-red-600" };
    case 8:
      return { text: "Cancelled", className: "text-gray-600" };
    case 9:
      return { text: "Contact us", className: "text-amber-600" };
    default:
      return null;
  }
}

export type OrderStatusInput = Order["status"] | number | string;

export type PaymentStatusInput = Order["paymentStatus"] | string | undefined;

/** Checkout never finished: user left / payment failed / cancel during Razorpay (see order.service). */
function isCheckoutNotCompleted(
  paymentStatus: PaymentStatusInput,
  orderStatus: OrderStatusInput,
): boolean {
  const ps =
    paymentStatus == null ? "" : String(paymentStatus).trim().toUpperCase();
  if (ps === "CANCELLED") return true;

  const os =
    typeof orderStatus === "string"
      ? orderStatus.trim().toUpperCase()
      : typeof orderStatus === "number"
        ? String(orderStatus)
        : "";
  if (os === "REJECTED" && ps !== "COMPLETED" && ps !== "REFUNDED") return true;

  return false;
}

function parseNumericOrderStatus(status: unknown): number | null {
  if (typeof status === "number" && Number.isInteger(status) && status >= 0 && status <= 9) {
    return status;
  }
  if (typeof status === "string") {
    const t = status.trim();
    if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10);
      if (n >= 0 && n <= 9) return n;
    }
  }
  return null;
}

/** Prisma `OrderStatus` → dashboard copy (after checkout rules). */
function displayFromDbOrderStatus(u: string): { text: string; className: string } | null {
  switch (u) {
    case "PENDING":
      return { text: "Pending", className: "text-orange-500" };
    case "IN_PROGRESS":
    case "APPLIED":
      return { text: "In progress", className: "text-blue-600" };
    case "SETTLED":
      return { text: "Settled", className: "text-green-600" };
    case "REJECTED":
      return { text: "Rejected", className: "text-red-600" };
    case "EXPIRED":
      return { text: "Expired", className: "text-gray-500" };
    case "CANCELLED":
      return { text: "Cancelled", className: "text-gray-600" };
    default:
      return null;
  }
}

export function getStatusDisplay(
  status: OrderStatusInput,
  paymentStatus?: PaymentStatusInput,
  settleStatus?: number | null,
) {
  if (isCheckoutNotCompleted(paymentStatus, status)) {
    return { text: "Not completed", className: "text-slate-600" };
  }

  if (typeof status === "string") {
    const fromDb = displayFromDbOrderStatus(status.trim().toUpperCase());
    if (fromDb) return fromDb;
  }

  if (settleStatus != null) {
    const fromSettle = displayFromNseSettleStatus(settleStatus);
    if (fromSettle) return fromSettle;
  }

  const code = parseNumericOrderStatus(status);
  if (code !== null) {
    const fromCode = displayFromNseSettleStatus(code);
    if (fromCode) return fromCode;
  }

  if (typeof status === "string" && status.trim()) {
    return { text: status, className: "text-gray-600" };
  }

  return { text: String(status), className: "text-gray-600" };
}

export function getBondType(bondDetails: Order["bondDetails"]): string {
  // Try to extract bond type from bondDetails
  if (bondDetails && typeof bondDetails === "object") {
    const bondType = getBondDetailString(bondDetails, "bondType");
    if (bondType) return bondType;

    const type = getBondDetailString(bondDetails, "type");
    if (type) return type;

    // Check if it's a primary market bond (usually new issues)
    const isPrimary = getBondDetailBoolean(bondDetails, "isPrimary");
    if (isPrimary !== undefined) {
      return isPrimary ? "Primary" : "Secondary";
    }
  }
  // Default to Secondary as most bonds are secondary market
  return "Secondary";
}

export function getIssuerCode(bondDetails: Order["bondDetails"]): string {
  if (bondDetails && typeof bondDetails === "object") {
    const issuerCode = getBondDetailString(bondDetails, "issuerCode");
    if (issuerCode) return issuerCode;

    const issuer = getBondDetailObject(bondDetails, "issuer");
    if (issuer) {
      const code = getBondDetailString(issuer, "code");
      if (code) return code;

      const shortName = getBondDetailString(issuer, "shortName");
      if (shortName) return shortName;
    }
  }
  return "";
}
