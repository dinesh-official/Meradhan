import type { Order } from "@root/apiGateway";
import {
  formatInrMoneyDisplay,
  formatYtmDisplay,
} from "@/global/utils/pricingDecimalDisplay";

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

export function getBondRating(bondDetails: Order["bondDetails"]): string {
  if (bondDetails && typeof bondDetails === "object") {
    const rating =
      getBondDetailString(bondDetails, "rating") ||
      getBondDetailString(bondDetails, "creditRating") ||
      getBondDetailString(bondDetails, "bondRating");
    if (rating) return rating;
  }
  return "";
}

function pricingNumber(
  pricing: Record<string, unknown> | undefined,
  key: string,
): number | undefined {
  const v = pricing?.[key];
  if (v == null) return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
  if (value == null) return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function formatInrList(n: number | undefined | null, digits = 2): string {
  if (digits !== 2) {
    if (n == null || !Number.isFinite(n)) return "—";
    return `₹${n.toLocaleString("en-IN", {
      minimumFractionDigits: digits,
      maximumFractionDigits: 10,
    })}`;
  }
  return formatInrMoneyDisplay(n);
}

export function formatYtmList(n: number | undefined | null): string {
  return formatYtmDisplay(n);
}

/** Pricing fields for CRM orders list (from checkout snapshot + order scalars). */
export function getOrderListPricing(order: {
  quantity: number;
  totalAmount: string | number;
  stampDuty?: string | number | null;
  bondDetails?: Record<string, unknown> | null;
}) {
  const bondDetails = (order.bondDetails ?? {}) as Record<string, unknown>;
  const pricing = bondDetails.pricing as Record<string, unknown> | undefined;

  const cleanPrice = pricingNumber(pricing, "cleanPrice");
  const ytm =
    pricingNumber(pricing, "yield") ?? asFiniteNumber(bondDetails.yield);
  const settlementAmount =
    pricingNumber(pricing, "settlementAmount") ??
    asFiniteNumber(order.totalAmount);
  const stampDuty =
    pricingNumber(pricing, "stampDuty") ?? asFiniteNumber(order.stampDuty);

  return {
    cleanPrice,
    ytm,
    settlementAmount,
    quantity: order.quantity,
    stampDuty,
  };
}

/** Format deal/settlement business dates for the orders list. */
export function formatOrderBusinessDate(value: unknown): string {
  if (value == null || String(value).trim() === "") return "—";
  const s = String(value).trim();
  if (/^\d{1,2}-[A-Za-z]{3}-\d{4}$/i.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    // Prefer date-only display for ISO-ish values
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }
  return s;
}

export function getOrderListDates(order: {
  createdAt: string;
  metadata?: Record<string, unknown> | null;
  bondDetails?: Record<string, unknown> | null;
}) {
  const meta = (order.metadata ?? {}) as Record<string, unknown>;
  const pricing = (order.bondDetails as Record<string, unknown> | undefined)
    ?.pricing as Record<string, unknown> | undefined;

  const dealDate =
    meta.dealDate ?? pricing?.dealDate ?? null;
  const settlementDate =
    meta.settlementDate ?? pricing?.settlementDate ?? null;

  return {
    dealDate: formatOrderBusinessDate(dealDate),
    settlementDate: formatOrderBusinessDate(settlementDate),
  };
}
