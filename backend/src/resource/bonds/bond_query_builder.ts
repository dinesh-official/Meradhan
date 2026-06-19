import type { DataBaseSchema } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";
import { isISIN } from "@utils/filters/convert";

export class BondQueryBuilder {
  /**
   * Generate Prisma where query from bond filters
   */
  static generateFilterQuery(
    filters: z.infer<typeof appSchema.bonds.bondsFilterSchema>
  ): DataBaseSchema.BondsWhereInput {
    const conditions: DataBaseSchema.BondsWhereInput[] = [];

    if (!filters) {
      return {};
    }

    // Add each filter condition
    this.addSearchFilter(conditions, filters.search);
    this.addArrayFilter(conditions, "creditRating", filters.rating);
    this.addArrayFilter(conditions, "taxStatus", filters.taxation);
    this.addArrayFilter(conditions, "interestPaymentMode", filters.interest);
    this.addMaturityFilter(conditions, filters.maturity);
    this.addCouponFilter(conditions, filters.coupon);

    if (filters.allowForPurchase === true) {
      conditions.push({ allowForPurchase: { equals: true } });
    }

    // Combine all conditions with AND logic
    return conditions.length > 0 ? { AND: conditions } : {};
  }

  /**
   * Add search filter for ISIN, bond name, and description
   */
  private static addSearchFilter(
    conditions: DataBaseSchema.BondsWhereInput[],
    search?: string
  ): void {
    if (!search) return;

    // Exact ISIN match only
    if (isISIN(search)) {
      conditions.push({ isin: { equals: search, mode: "insensitive" } });
      return;
    }

    conditions.push({
      OR: [
        { isin: { contains: search, mode: "insensitive" } },
        { bondName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  /**
   * Add array-based filter for simple field matching
   */
  private static addArrayFilter(
    conditions: DataBaseSchema.BondsWhereInput[],
    field: keyof DataBaseSchema.BondsWhereInput,
    values?: string[]
  ): void {
    if (!values || values.length === 0) return;

    conditions.push({
      [field]: { in: values },
    } as DataBaseSchema.BondsWhereInput);
  }

  /**
   * Add maturity date range filter
   */
  private static addMaturityFilter(
    conditions: DataBaseSchema.BondsWhereInput[],
    maturity?: string[]
  ): void {
    if (!maturity || maturity.length === 0) return;

    const maturityConditions = maturity
      .map((range) => this.getMaturityDateRange(range))
      .filter((condition) => Object.keys(condition).length > 0);

    if (maturityConditions.length > 0) {
      conditions.push({ OR: maturityConditions });
    }
  }

  /**
   * Add coupon rate range filter
   */
  private static addCouponFilter(
    conditions: DataBaseSchema.BondsWhereInput[],
    coupon?: string[]
  ): void {
    if (!coupon || coupon.length === 0) return;

    const couponConditions = coupon
      .map((range) => this.getCouponRateRange(range))
      .filter((condition) => Object.keys(condition).length > 0);

    if (couponConditions.length > 0) {
      conditions.push({ OR: couponConditions });
    }
  }

  /**
   * Get maturity date range conditions
   */
  private static getMaturityDateRange(
    range: string
  ): DataBaseSchema.BondsWhereInput {
    const now = new Date();
    const currentYear = now.getFullYear();

    const maturityRanges = {
      "0-2": {
        maturityDate: {
          gte: now,
          lte: new Date(currentYear + 2, 11, 31),
        },
      },
      "2-5": {
        maturityDate: {
          gte: new Date(currentYear + 2, 0, 1),
          lte: new Date(currentYear + 5, 11, 31),
        },
      },
      "5-10": {
        maturityDate: {
          gte: new Date(currentYear + 5, 0, 1),
          lte: new Date(currentYear + 10, 11, 31),
        },
      },
      "10-20": {
        maturityDate: {
          gte: new Date(currentYear + 10, 0, 1),
          lte: new Date(currentYear + 20, 11, 31),
        },
      },
      "20+": {
        maturityDate: {
          gte: new Date(currentYear + 20, 0, 1),
        },
      },
    } as const;

    return maturityRanges[range as keyof typeof maturityRanges] || {};
  }

  /**
   * Get coupon rate range conditions
   */
  private static getCouponRateRange(
    range: string
  ): DataBaseSchema.BondsWhereInput {
    const couponRanges = {
      "4-7": {
        couponRate: { gte: 4, lte: 7 },
      },
      "8-10": {
        couponRate: { gte: 8, lte: 10 },
      },
      "10+": {
        couponRate: { gte: 10 },
      },
    } as const;

    return couponRanges[range as keyof typeof couponRanges] || {};
  }

  /**
   * Get sorting options for bonds
   */
  static getSortingOptions() {
    return {
      byRating: { creditRating: "asc" as const },
      byMaturity: { maturityDate: "asc" as const },
      byCoupon: { couponRate: "desc" as const },
      byIssuePrice: { issuePrice: "asc" as const },
      dateOfAllotment: { dateOfAllotment: "desc" as const },
      byCreatedAt: { createdAt: "desc" as const },
      default: { sortedAt: "asc" as const },
    };
  }

  /**
   * Get pagination options
   */
  static getPaginationOptions(page: number, limit: number) {
    const skip = (page - 1) * limit;
    return {
      skip,
      take: limit,
    };
  }

  // ─── User-facing "Sort by" (Yield / Rating / Tenure) ──────────────────────
  // These sorts can't all be expressed as a plain Prisma `orderBy`:
  //   - Yield   → numeric column (could be Prisma-sorted, kept here for uniformity)
  //   - Rating  → custom credit-quality order (AAA highest … SOVEREIGN lowest)
  //   - Tenure  → maturityDate − dateOfAllotment (a computed value, not a column)
  // So the service sorts the filtered set in-app with the comparator below.
  // Bonds with no comparable value always sink to the bottom, regardless of
  // direction, so an empty field never outranks a real one.

  /** Credit-quality order: lower number = higher quality (AAA best, SOVEREIGN worst). */
  private static readonly RATING_ORDER: Record<string, number> = {
    AAA: 0,
    "AA+": 1,
    AA: 2,
    "AA-": 3,
    "A+": 4,
    A: 5,
    "A-": 6,
    "BBB+": 7,
    BBB: 8,
    "BBB-": 9,
    "BB+": 10,
    BB: 11,
    "BB-": 12,
    "B+": 13,
    B: 14,
    "B-": 15,
    "C+": 16,
    C: 17,
    "C-": 18,
    UNRATED: 19,
    OTHER: 20,
    SOVEREIGN: 21,
  };

  /** Minimal bond shape needed to compute a sort value. */
  static getUserSortSelect() {
    return {
      id: true,
      yield: true,
      creditRating: true,
      maturityDate: true,
      dateOfAllotment: true,
    } as const;
  }

  /**
   * Parse a `${field}_${dir}` sort token (e.g. "yield_desc") into a validated
   * descriptor, or null if it isn't a supported user sort. `dir` is expressed
   * against the *sort value* (desc = highest value first).
   */
  static parseUserSort(
    sort?: string | string[] | null,
  ): { field: "yield" | "rating" | "tenure"; dir: "asc" | "desc" } | null {
    const raw = Array.isArray(sort) ? sort[0] : sort;
    if (!raw || typeof raw !== "string") return null;

    const lastUnderscore = raw.lastIndexOf("_");
    if (lastUnderscore <= 0) return null;
    const field = raw.slice(0, lastUnderscore);
    const dir = raw.slice(lastUnderscore + 1);

    if (field !== "yield" && field !== "rating" && field !== "tenure") return null;
    if (dir !== "asc" && dir !== "desc") return null;
    return { field, dir };
  }

  /**
   * Numeric sort value where HIGHER = ranks earlier under "desc".
   * Returns null when the bond has no comparable value for the field.
   */
  private static getUserSortValue(
    bond: {
      yield?: number | null;
      creditRating?: string | null;
      maturityDate?: Date | null;
      dateOfAllotment?: Date | null;
    },
    field: "yield" | "rating" | "tenure",
  ): number | null {
    if (field === "yield") {
      const n = Number(bond.yield);
      return Number.isFinite(n) ? n : null;
    }
    if (field === "rating") {
      const key = (bond.creditRating ?? "").toUpperCase().trim();
      const rank = this.RATING_ORDER[key];
      // Negate so a better rating (lower rank) yields a higher sort value.
      return rank === undefined ? null : -rank;
    }
    // tenure = maturityDate − dateOfAllotment (longer tenure = higher value)
    if (!bond.maturityDate || !bond.dateOfAllotment) return null;
    const ms =
      new Date(bond.maturityDate).getTime() -
      new Date(bond.dateOfAllotment).getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  /**
   * Comparator for the chosen user sort. Nulls always sort last; otherwise
   * "desc" places the highest value first.
   */
  static getUserSortComparator(userSort: {
    field: "yield" | "rating" | "tenure";
    dir: "asc" | "desc";
  }) {
    return (
      a: Parameters<typeof BondQueryBuilder.getUserSortValue>[0],
      b: Parameters<typeof BondQueryBuilder.getUserSortValue>[0],
    ): number => {
      const av = this.getUserSortValue(a, userSort.field);
      const bv = this.getUserSortValue(b, userSort.field);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return userSort.dir === "desc" ? bv - av : av - bv;
    };
  }
}
