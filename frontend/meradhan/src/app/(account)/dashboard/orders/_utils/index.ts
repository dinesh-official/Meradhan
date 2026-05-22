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

/** True when the dashboard Status column shows "Settled" (deal sheet is available). */
export function isOrderSettled(
  status: OrderStatusInput,
  paymentStatus?: PaymentStatusInput,
  settleStatus?: number | null,
): boolean {
  return getStatusDisplay(status, paymentStatus, settleStatus).text === "Settled";
}

/** Strip every leading coupon token (e.g. `10.00% ` then `10% `) from NSE-style instrument text. */
const COUPON_LEADING_REPEAT_RE = /^(?:\s*[\d.,]+%\s*)+/i;

function stripDateOfMaturitySuffix(s: string): {
  rest: string;
  maturityFromText?: string;
} {
  const re = /\s*DATE OF MATURITY\s+(\d{1,2}[/-]\d{1,2}[/-]\d{4})\s*$/i;
  const m = re.exec(s);
  if (!m) return { rest: s };
  return { rest: s.slice(0, m.index).trimEnd(), maturityFromText: m[1] };
}

/**
 * Normalizes long instrument / bondName strings: duplicate leading coupons and
 * trailing `DATE OF MATURITY DD/MM/YYYY` (common in NSE descriptions).
 */
function sanitizeBondTitleBody(raw: string): {
  body: string;
  embeddedMaturityDdMmYyyy?: string;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { body: "" };

  const s = trimmed.replace(COUPON_LEADING_REPEAT_RE, "").trim();
  const { rest, maturityFromText } = stripDateOfMaturitySuffix(s);
  let body = rest.trim();
  if (!body && maturityFromText) body = "—";
  if (!body) body = trimmed;

  return { body, embeddedMaturityDdMmYyyy: maturityFromText };
}

function parseNumericUnknown(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const t = v.trim().replace(/,/g, "");
    if (t === "") return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function bondDetailsRecord(order: Order): Record<string, unknown> {
  if (order.bondDetails && typeof order.bondDetails === "object" && !Array.isArray(order.bondDetails)) {
    return order.bondDetails as Record<string, unknown>;
  }
  return {};
}

/**
 * Settlement date for display: NSE-linked `order.settlementDate` when present, otherwise
 * checkout snapshot `bondDetails.pricing.settlementDate` (orders not yet linked to `settle_order`).
 */
export function getOrderSettlementDateInput(order: Order): string | undefined {
  const top = order.settlementDate;
  if (top != null && String(top).trim() !== "") return String(top).trim();
  const b = bondDetailsRecord(order);
  const p = b.pricing;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const sd = (p as Record<string, unknown>).settlementDate;
    if (typeof sd === "string" && sd.trim()) return sd.trim();
  }
  return undefined;
}

function getBondIssuerDisplayName(b: Record<string, unknown>): string {
  const issuerName = getBondDetailString(b, "issuerName");
  if (issuerName?.trim()) return issuerName.trim();

  const issuer = getBondDetailObject(b, "issuer");
  if (issuer) {
    const longName = getBondDetailString(issuer, "longName");
    if (longName?.trim()) return longName.trim();
    const shortName = getBondDetailString(issuer, "shortName");
    if (shortName?.trim()) return shortName.trim();
  }

  const inst = getBondDetailString(b, "instrumentName");
  if (inst?.trim()) return inst.trim();

  return "";
}

/** Maturity as DD/MM/YYYY (bond snapshot / API JSON). */
export function formatMaturityDdMmYyyy(raw: string | undefined): string {
  if (raw == null || String(raw).trim() === "") return "—";
  const s = String(raw).trim();
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const yyyy = d.getUTCFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  const m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(s);
  if (m) {
    return `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[3]}`;
  }
  return "—";
}

/** Offered / snapshot yield from order `bondDetails` (`buyYield` preferred, else listing `yield`). */
export function formatOrderYieldPercent(order: Order): string {
  const b = bondDetailsRecord(order);
  const y =
    parseNumericUnknown(b.buyYield) ??
    parseNumericUnknown(b.yield) ??
    parseNumericUnknown(b.lastTradeYield);
  if (y == null || !Number.isFinite(y) || y < 0) return "—";
  return `${y.toFixed(2)}%`;
}

/**
 * Security column lines: ISIN (muted), coupon% + bondName + issuer/name (bold), maturity DD/MM/YYYY (muted).
 * titleLine format: `{coupon%} {bondName} {namePart}` — any absent segment is omitted.
 */
export function getSecurityNameColumnLines(order: Order): {
  isin: string;
  titleLine: string;
  maturityLine: string;
} {
  const b = bondDetailsRecord(order);
  const isin = (order.isin && String(order.isin).trim()) || "—";

  const couponRaw =
    parseNumericUnknown(b.couponRate) ??
    parseNumericUnknown(b.coupon) ??
    parseNumericUnknown(b.interestRate);
  const couponStr =
    couponRaw != null && couponRaw >= 0 ? `${couponRaw.toFixed(2)}%` : "";

  let namePart = getBondIssuerDisplayName(b);
  if (!namePart) namePart = String(order.bondName || "").trim();
  if (!namePart) namePart = "—";

  const { body: cleanedName, embeddedMaturityDdMmYyyy } = sanitizeBondTitleBody(
    namePart === "—" ? "" : namePart,
  );
  if (namePart !== "—") {
    namePart = cleanedName.trim() || "—";
  }

  // bondName sits between coupon and the issuer-derived namePart: "9.00% <bondName> <namePart>"
  const bondName = String(order.bondName || "").trim();
  const titleParts = [couponStr, bondName, namePart !== "—" ? namePart : ""].filter(Boolean);
  const titleLine = titleParts.join(" ").trim() || "—";

  const matRaw =
    getBondDetailString(b, "maturityDateIst") ??
    getBondDetailString(b, "maturityDate") ??
    getBondDetailString(b, "maturityDateOnly");
  let maturityLine = formatMaturityDdMmYyyy(matRaw);
  if (maturityLine === "—" && embeddedMaturityDdMmYyyy) {
    maturityLine = formatMaturityDdMmYyyy(embeddedMaturityDdMmYyyy);
  }

  return { isin, titleLine, maturityLine };
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
