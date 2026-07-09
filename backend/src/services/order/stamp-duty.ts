/** Stamp duty from principal (DeriData does not return this). */
export const calculateStampDuty = (principal: number) => {
  const raw = principal * 0.000001;
  const amount = raw < 0.5 ? 0 : raw < 1.5 ? 1 : raw;
  return Number(amount.toFixed());
};
