/** Stored DB value for the “no rating” margin row (must match Prisma `rating` string). */
export const BOND_MARGIN_WITHOUT_RATING = "__WITHOUT_RATING__";

/** Allowed credit ratings for bond margin rows (display order). */
export const BOND_MARGIN_STANDARD_RATINGS = [
  "AAA",
  "AA+",
  "AA",
  "AA-",
  "A+",
  "A",
  "A-",
  "BBB+",
  "BBB",
  "BBB-",
] as const;

export type BondMarginStandardRating = (typeof BOND_MARGIN_STANDARD_RATINGS)[number];

export function isBondMarginStandardRating(
  value: string,
): value is BondMarginStandardRating {
  return (BOND_MARGIN_STANDARD_RATINGS as readonly string[]).includes(value);
}

export function isAllowedBondMarginRating(value: string): boolean {
  return (
    value === BOND_MARGIN_WITHOUT_RATING || isBondMarginStandardRating(value)
  );
}
