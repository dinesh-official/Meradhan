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

const ORDER_STATUS_TEXT: Record<string, { text: string; className: string }> = {
  PENDING: { text: "Not completed", className: "text-slate-600" },
  IN_PROGRESS: { text: "In progress", className: "text-blue-600" },
  APPLIED: { text: "In progress", className: "text-blue-600" },
  SETTLED: { text: "Settled", className: "text-green-600" },
  REJECTED: { text: "Rejected", className: "text-red-600" },
  EXPIRED: { text: "Expired", className: "text-gray-500" },
  CANCELLED: { text: "Cancelled", className: "text-gray-600" },
};

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

/** Map `Order.status` → display text. Optionally falls back to NSE settle codes. */
export function getStatusDisplay(
  status: OrderStatusInput,
  settleStatus?: number | null,
) {
  if (typeof status === "string") {
    const key = status.trim().toUpperCase();
    if (ORDER_STATUS_TEXT[key]) return ORDER_STATUS_TEXT[key];
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

/** True when `Order.status` is SETTLED (deal sheet is available). */
export function isOrderSettled(status: OrderStatusInput): boolean {
  if (typeof status !== "string") return false;
  return status.trim().toUpperCase() === "SETTLED";
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
 * checkout snapshot `bondDetails.pricing.settlementDate` / metadata.
 */
export function getOrderSettlementDateInput(order: Order): string | undefined {
  const top = order.settlementDate;
  if (top != null && String(top).trim() !== "") return String(top).trim();
  const fromPricing = getOrderPricingSettlementDateInput(order);
  if (fromPricing) return fromPricing;
  const meta = order.metadata;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const sd = (meta as Record<string, unknown>).settlementDate;
    if (typeof sd === "string" && sd.trim()) return sd.trim();
  }
  return undefined;
}

/** Trade (deal) date: API `dealDate`, then pricing snapshot, then metadata. */
export function getOrderTradeDateInput(order: Order): string | undefined {
  const top = order.dealDate;
  if (top != null && String(top).trim() !== "") return String(top).trim();
  const b = bondDetailsRecord(order);
  const p = b.pricing;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const dd = (p as Record<string, unknown>).dealDate;
    if (typeof dd === "string" && dd.trim()) return dd.trim();
  }
  const meta = order.metadata;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const dd = (meta as Record<string, unknown>).dealDate;
    if (typeof dd === "string" && dd.trim()) return dd.trim();
  }
  return undefined;
}

/** Settlement date from checkout `bondDetails.pricing.settlementDate`. */
export function getOrderPricingSettlementDateInput(order: Order): string | undefined {
  const b = bondDetailsRecord(order);
  const p = b.pricing;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const sd = (p as Record<string, unknown>).settlementDate;
    if (typeof sd === "string" && sd.trim()) return sd.trim();
  }
  return undefined;
}

/** Accrued interest (₹): API field, then checkout `bondDetails.pricing` snapshot. */
export function getOrderAccruedInterest(order: Order): number | null {
  if (order.accruedInterest != null && Number.isFinite(order.accruedInterest)) {
    return order.accruedInterest;
  }
  const b = bondDetailsRecord(order);
  const p = b.pricing;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    return parseNumericUnknown((p as Record<string, unknown>).accruedInterest);
  }
  return null;
}

/** Settlement amount (₹): API field, then pricing snapshot, then `totalAmount`. */
export function getOrderSettlementAmount(order: Order): number | null {
  if (order.settlementAmount != null && Number.isFinite(order.settlementAmount)) {
    return order.settlementAmount;
  }
  const b = bondDetailsRecord(order);
  const p = b.pricing;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const fromPricing = parseNumericUnknown(
      (p as Record<string, unknown>).settlementAmount,
    );
    if (fromPricing != null) return fromPricing;
  }
  return parseNumericUnknown(order.totalAmount);
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

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Maturity as DD MMM YYYY (e.g. 31 Dec 2026). */
export function formatMaturityDdMmYyyy(raw: string | undefined): string {
  if (raw == null || String(raw).trim() === "") return "—";
  const s = String(raw).trim();
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const mon = MONTH_ABBR[d.getUTCMonth()];
    const yyyy = d.getUTCFullYear();
    return `${dd} ${mon} ${yyyy}`;
  }
  // Handle DD/MM/YYYY or DD-MM-YYYY strings
  const m = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(s);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mon = MONTH_ABBR[parseInt(m[2], 10) - 1] ?? m[2];
    return `${dd} ${mon} ${m[3]}`;
  }
  return "—";
}

/** User-facing yield from order snapshot (`pricing.yield` or listing `yield` only). */
export function formatOrderYieldPercent(order: Order): string {
  const b = bondDetailsRecord(order);
  const pricing = b.pricing;
  const pricingYield =
    pricing != null &&
      typeof pricing === "object" &&
      !Array.isArray(pricing)
      ? parseNumericUnknown((pricing as Record<string, unknown>).yield)
      : null;
  const y =
    pricingYield ??
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

  const bondName = String(order.bondName || "").trim();
  const titleParts = [couponStr, bondName].filter(Boolean);
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
