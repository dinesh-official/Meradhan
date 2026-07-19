import { truncateDecimals } from "@/global/utils/formate";
import type { BondDealAutofillResponse } from "@root/apiGateway";

export type ManualBondPricingSnapshot = {
  quantity: number;
  faceValue: number;
  cleanPrice: number;
  accruedInterestPerUnit: number;
  principalAmount: number;
  accruedInterest: number;
  totalConsideration: number;
  stampDuty: number;
  settlementAmount: number;
};

export function calculateTotalConsideration(principalAmount: number, accruedInterest: number): number {
  const principalAmountTruncated = Math.round(Number(truncateDecimals(principalAmount, 2)) * 100);
  const accruedInterestTruncated = Math.round(Number(truncateDecimals(accruedInterest, 2)) * 100);
  return (principalAmountTruncated + accruedInterestTruncated) / 100;
}


/** Stamp duty from total consideration (matches backend `stamp-duty.ts`). */
export function calculateStampDuty(totalConsideration: number): number {
  const raw = totalConsideration * 0.000001;
  const amount = raw < 0.5 ? 0 : raw < 1.5 ? 1 : raw;
  return Number(amount.toFixed());
}

/** Manual bond pricing — principal, accrued interest, stamp duty, settlement. */
export function calculateBondPricing(input: {
  faceValue: number;
  cleanPrice: number;
  accruedInterestPerUnit: number;
  quantity: number;
}): ManualBondPricingSnapshot {
  const quantity = input.quantity;
  const faceValue = input.faceValue;
  const cleanPrice = input.cleanPrice;
  const accruedInterestPerUnit = input.accruedInterestPerUnit;

  const principalAmount = (cleanPrice * faceValue * quantity) / 100;
  const accruedInterest =
    (accruedInterestPerUnit * faceValue * quantity) / 100;
  const totalConsideration = calculateTotalConsideration(principalAmount, accruedInterest);
  const stampDuty = calculateStampDuty(totalConsideration);
  const settlementAmount = totalConsideration + stampDuty;

  return {
    quantity,
    faceValue,
    cleanPrice,
    accruedInterestPerUnit,
    principalAmount,
    accruedInterest,
    totalConsideration,
    stampDuty,
    settlementAmount,
  };
}

/** DeriData supplies clean price / yield only; amounts use manual formula. */
export function resolveManualPricingFromAutofill(
  autofill: BondDealAutofillResponse | null | undefined,
): ManualBondPricingSnapshot | null {
  if (!autofill?.pricing) return null;

  const quantity =
    autofill.quantity != null && Number.isFinite(autofill.quantity) && autofill.quantity > 0
      ? autofill.quantity
      : 1;
  const cleanPrice = autofill.pricing.finalPrice;
  const faceValue = autofill.suggested?.faceValue;

  const accruedInterestPerUnit =
    autofill.pricing.accruedInterestPerUnit ??
    (autofill.pricing.totalAccruedInterest != null &&
      Number.isFinite(autofill.pricing.totalAccruedInterest) &&
      quantity > 0
      ? autofill.pricing.totalAccruedInterest / quantity
      : undefined);

  if (
    cleanPrice == null ||
    !Number.isFinite(cleanPrice) ||
    cleanPrice <= 0 ||
    faceValue == null ||
    !Number.isFinite(faceValue) ||
    faceValue <= 0 ||
    accruedInterestPerUnit == null ||
    !Number.isFinite(accruedInterestPerUnit)
  ) {
    return null;
  }

  return calculateBondPricing({
    faceValue,
    cleanPrice,
    accruedInterestPerUnit,
    quantity,
  });
}
