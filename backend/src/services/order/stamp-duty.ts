/** Stamp duty from total consideration when DeriData does not supply it. */
export const calculateStampDuty = (totalConsideration: number) => {
  const raw = totalConsideration * 0.000001;
  const amount = raw < 0.5 ? 0 : raw < 1.5 ? 1 : raw;
  return Number(amount.toFixed());
};

/** Reuse stamp duty saved from DeriData autofill when quantity matches; else recalculate. */
export function resolveBondStampDuty(opts: {
  totalConsideration: number;
  quantity: number;
  savedStampDuty?: number | null;
  savedPricingQuantity?: number | null;
}): number {
  const refQty =
    opts.savedPricingQuantity != null &&
    Number.isFinite(opts.savedPricingQuantity) &&
    opts.savedPricingQuantity > 0
      ? opts.savedPricingQuantity
      : 1;
  if (
    opts.savedStampDuty != null &&
    Number.isFinite(opts.savedStampDuty) &&
    opts.quantity === refQty
  ) {
    return opts.savedStampDuty;
  }
  return calculateStampDuty(opts.totalConsideration);
}
