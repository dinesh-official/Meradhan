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

  const principalAmount = (cleanPrice * faceValue * quantity) / 100;
  const accruedInterest =
    (accruedInterestPerUnit * faceValue * quantity) / 100;
  const totalConsideration = principalAmount + accruedInterest;
  const stampDuty =
    input.stampDutyOverride != null && Number.isFinite(input.stampDutyOverride)
      ? input.stampDutyOverride
      : calculateStampDuty(totalConsideration);
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
