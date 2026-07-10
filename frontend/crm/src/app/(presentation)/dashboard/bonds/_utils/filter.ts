import { appSchema } from "@root/schema";
import { ratingOptions } from "../_hooks/bonds_filter_data";

/**
 * Converts unknown input into a validated array of allowed string values.
 */
export function toValidatedArray<T extends string>(
  input: unknown,
  validValues: readonly T[]
): T[] {
  if (!input) return [];

  const arr = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",").map((s) => s.trim())
      : [];

  return arr.filter(
    (value): value is T =>
      typeof value === "string" && validValues.includes(value as T)
  );
}

/**
 * Cleans and validates the bond filter query.
 * Uses Object.assign() for clean merging of default and parsed data.
 */
export function validateBondsFilters(rawQuery: Record<string, unknown>) {
  const { bonds } = appSchema;

  // Default clean structure
  const baseFilters = {
    search: undefined,
    maturity: [] as string[],
    rating: [] as string[],
    coupon: [] as string[],
    taxation: [] as string[],
    interest: [] as string[],
  };

  // Merge cleaned values into defaults using Object.assign()
  const cleaned = Object.assign({}, baseFilters, {
    search:
      typeof rawQuery.search === "string"
        ? rawQuery.search.trim()
        : undefined,

    maturity: toValidatedArray(rawQuery.maturity, bonds.maturityYearEnums),

    rating: toValidatedArray(
      rawQuery.rating,
      ratingOptions.map((o) => o.value) as readonly string[]
    ),

    coupon: toValidatedArray(rawQuery.coupon, bonds.couponPercentEnums),

    taxation: toValidatedArray(rawQuery.taxation, bonds.taxationEnums),

    interest: toValidatedArray(rawQuery.interest, bonds.INTEREST_MODE_VALUES),
  });

  const parsed = bonds.bondsFilterSchema.safeParse(cleaned);

  return parsed.success ? parsed.data : cleaned;
}
