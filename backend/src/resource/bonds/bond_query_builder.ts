import type { DataBaseSchema } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";

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
}
