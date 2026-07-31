import { calculateAccruedInterest, calculatePrincipalAmount, calculateTotalConsideration } from "@utils/truncateDecimals";
import { calculateStampDuty } from "./stamp-duty";

export type BondPricingInput = {
  faceValue: number;
  cleanPrice: number;
  /**
   * Accrued interest as % of face value (DeriData `accrued_int_top`),
   * same units as `cleanPrice`. Convert from DB `accruedInterest`
   * (rupee `accrued_int_bottom`) before calling when needed.
   */
  accruedInterest: number;
  quantity: number;
  /** When set, used instead of `calculateStampDuty(totalConsideration)`. */
  stampDutyOverride?: number | null;
};

export type BondPricingSnapshot = {
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

function assertFiniteNumber(value: number, field: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid ${field}`);
  }
  return value;
}
// PRINCIPLE = CLEAN_PRICE * FV/100
// ACCURET_INTERSET = ACCURET_INTERSET * QUN
// TC = PRINCIPLE + ACCURET_INTERSET
// STAMP_DYTY = EXISTING
// SETTLEMENT_AMOUNT = TC + STAMP_DYTY
export function calculateBondPricing(
  input: BondPricingInput,
): BondPricingSnapshot {
  const quantity = assertFiniteNumber(input.quantity, "quantity");
  const faceValue = assertFiniteNumber(input.faceValue, "faceValue");
  const cleanPrice = assertFiniteNumber(input.cleanPrice, "cleanPrice");
  const accruedInterestPerUnit = assertFiniteNumber(
    input.accruedInterest,
    "accruedInterest",
  );

  const principalAmount = calculatePrincipalAmount(cleanPrice, faceValue, quantity);
  const accruedInterest = calculateAccruedInterest(accruedInterestPerUnit, 1, quantity);
  const totalConsideration = calculateTotalConsideration(principalAmount, accruedInterest);
  const stampDuty =
    input.stampDutyOverride != null && Number.isFinite(input.stampDutyOverride)
      ? input.stampDutyOverride
      : calculateStampDuty(totalConsideration);
  const settlementAmount = totalConsideration + stampDuty;

  return {
    quantity,
    faceValue,
    cleanPrice,
    accruedInterestPerUnit: Number(accruedInterestPerUnit.toFixed(2)),
    principalAmount: Number(principalAmount.toFixed(2)),
    accruedInterest: Number(accruedInterest.toFixed(2)),
    totalConsideration: Number(totalConsideration.toFixed(2)),
    stampDuty,
    settlementAmount: Number(settlementAmount.toFixed(2)),
  };
}
