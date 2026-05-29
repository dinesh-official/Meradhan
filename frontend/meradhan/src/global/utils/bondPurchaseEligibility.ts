import type { BondDetailsResponse } from "@root/apiGateway";

function isNonEmptyString(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}

/** Accepts ISO-like strings and numeric timestamps. */
function isPresentDateLike(v: unknown): boolean {
  if (v == null) return false;
  if (typeof v === "number" && !Number.isNaN(v)) return true;
  const s = String(v).trim();
  if (!s) return false;
  const t = Date.parse(s);
  return !Number.isNaN(t);
}

function isPositiveNumber(v: unknown): boolean {
  return typeof v === "number" && !Number.isNaN(v) && v > 0;
}

/** Offered / buy-side yield: `buyYield` preferred, else listing `yield`. */
function hasOfferedYield(bond: BondDetailsResponse): boolean {
  const y = bond.buyYield ?? bond.yield;
  if (y == null) return false;
  if (typeof y === "number") return !Number.isNaN(y);
  const s = String(y).trim();
  if (!s) return false;
  const n = Number(s);
  return !Number.isNaN(n);
}

export type BondPurchaseEligibility = {
  eligible: boolean;
  /** Human-readable labels for empty mandatory fields (for tooltips / QA). */
  missingFields: string[];
};

/**
 * Whether the listing "Buy" CTA can route to place-order: backend flag plus
 * mandatory pricing and calendar fields for RFQ / order flows.
 */
export function getBondPurchaseEligibility(
  bond: BondDetailsResponse
): BondPurchaseEligibility {
  const missing: string[] = [];

  if (!bond.allowForPurchase) {
    missing.push("Purchase not enabled for this bond");
  }

  if (!isPositiveNumber(bond.sellPrice)) {
    missing.push("Sell price");
  }

  if (!hasOfferedYield(bond)) {
    missing.push("Offered yield");
  }

  if (typeof bond.couponRate !== "number" || Number.isNaN(bond.couponRate)) {
    missing.push("Coupon rate");
  }

  if (!isPositiveNumber(bond.faceValue)) {
    missing.push("Face value");
  }

  if (!isPresentDateLike(bond.nextCouponDate)) {
    missing.push("Next coupon date");
  }



  if (bond.recordDays == null || Number.isNaN(Number(bond.recordDays))) {
    missing.push("Record days");
  }

  if (!isPresentDateLike(bond.recordDate)) {
    missing.push("Record date");
  }

  if (!isPresentDateLike(bond.lastCouponDate)) {
    missing.push("Last coupon date");
  }

  if (!isNonEmptyString(bond.natureOfInstrument)) {
    missing.push("Nature of instrument");
  }

  const perpetual = bond.isPerpetual === true;
  if (!perpetual && !isPresentDateLike(bond.maturityDate)) {
    missing.push("Maturity date");
  }

  if (!isPresentDateLike(bond.dateOfAllotment)) {
    missing.push("Issue / allotment date");
  }

  return {
    eligible: missing.length === 0,
    missingFields: missing,
  };
}

/** Short boolean for templates. */
export function isBondEligibleForPurchase(bond: BondDetailsResponse): boolean {
  return getBondPurchaseEligibility(bond).eligible;
}

/** True when latest CRM inventory batch lists this ISIN with quantity > 0. */
export function hasCrmInventoryAvailable(bond: BondDetailsResponse): boolean {
  const q = bond.crmAvailableQuantity;
  if (q == null) return false;
  const n = Number(q);
  return Number.isFinite(n) && n > 0;
}

/** Buy / place-order CTA: listing rules satisfied and CRM shows stock. */
export function canShowBuyNow(bond: BondDetailsResponse): boolean {
  return isBondEligibleForPurchase(bond) && hasCrmInventoryAvailable(bond);
}
