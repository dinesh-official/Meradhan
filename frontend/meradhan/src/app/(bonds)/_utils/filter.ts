import { appSchema } from "@root/schema";
import { ratingOptions } from "../_hooks/bonds_filter_data";

/**
 * Utility to clean an array of values against valid enums.
 */
export function cleanArray<T extends string>(
    arr: unknown,
    validValues: readonly T[]
): T[] {
    if (!arr) return [];

    // Convert single string or comma-separated list into array
    if (typeof arr === "string") {
        arr = arr.split(",").map((s) => s.trim());
    }

    // Ensure it's an array before filtering
    if (!Array.isArray(arr)) return [];

    return arr.filter(
        (v): v is T =>
            typeof v === "string" && validValues.includes(v as T)
    );
}

/**
 * Validates and sanitizes bond filters.
 */
export function validateBondsFilters(rawQuery: Record<string, unknown>) {
    const cleaned = {
        search:
            typeof rawQuery.search === "string"
                ? rawQuery.search.trim()
                : undefined,

        maturity: cleanArray(
            rawQuery.maturity,
            appSchema.bonds.maturityYearEnums
        ),

        rating: cleanArray(
            rawQuery.rating,
            ratingOptions.map((o) => o.value) as readonly string[]
        ),

        coupon: cleanArray(
            rawQuery.coupon,
            appSchema.bonds.couponPercentEnums
        ),

        taxation: cleanArray(
            rawQuery.taxation,
            appSchema.bonds.taxationEnums
        ),

        interest: cleanArray(
            rawQuery.interest,
            appSchema.bonds.INTEREST_MODE_VALUES
        ),
    };

    const parsed = appSchema.bonds.bondsFilterSchema.safeParse(cleaned);

    return parsed.success ? parsed.data : cleaned;
}
