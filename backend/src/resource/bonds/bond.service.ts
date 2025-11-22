import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";
import { BondQueryBuilder } from "./bond_query_builder";

export class BondService {
  async getBondDetails(isin: string) {
    const data = await db.dataBase.bonds.findUnique({
      where: { isin },
    });
    return data;
  }

  async filterBonds(
    filters: z.infer<typeof appSchema.bonds.bondsFilterSchema>,
    options?: {
      page?: number | string;
      limit?: number | string;
      sortBy?: keyof ReturnType<typeof BondQueryBuilder.getSortingOptions>;
      category?: string;
      all?: string;
    }
  ) {
    const whereQuery = BondQueryBuilder.generateFilterQuery(filters);

    const sortingOptions = BondQueryBuilder.getSortingOptions();
    // Convert page and limit to numbers for calculations
    const pageNum =
      typeof options?.page === "string"
        ? parseInt(options.page, 10) || 1
        : options?.page || 1;
    const limitNum =
      typeof options?.limit === "string"
        ? parseInt(options.limit, 10) || 9
        : options?.limit || 9;
    const paginationOptions = BondQueryBuilder.getPaginationOptions(
      pageNum,
      limitNum
    );

    let orderBy = options?.sortBy
      ? sortingOptions[options.sortBy]
      : sortingOptions.default;

    const extendedQuery = whereQuery;

    if (options?.all != "YES") {
      extendedQuery.isListed = { equals: "YES" };
      extendedQuery.redemptionDate = { gte: new Date() };
      extendedQuery.creditRating = { notIn: ["D", "C"] };
    }

    if (options?.category && options.category != "all") {
      // no need to filter by redemptionDate for perpetual bonds
      if (options.category == "perpetual") {
        delete extendedQuery.redemptionDate;
        orderBy = sortingOptions.byRating;
      }

      if (options.category == "latest-release") {
        orderBy = sortingOptions.byMaturity;
      }
      extendedQuery.categories = { has: options?.category || "" };
    }

    const [data, total] = await Promise.all([
      db.dataBase.bonds.findMany({
        where: whereQuery,
        orderBy,
        ...paginationOptions,
      }),
      db.dataBase.bonds.count({
        where: whereQuery,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getLatestBonds(limit: number = 3) {
    const data = await db.dataBase.bonds.findMany({
      where: {
        isListed: { equals: "YES" },
        redemptionDate: { lte: new Date() },
        creditRating: { notIn: ["D", "C", "UnRated", ""] },
      },
      orderBy: {
        dateOfAllotment: "desc",
      },
      take: limit,
    });

    return data;
  }

  async getLatestBondsTop3(limit: number = 3) {
    const data = await db.dataBase.bonds.findMany({
      where: {
        isListed: { equals: "YES" },
        redemptionDate: { lte: new Date() },
        creditRating: { notIn: ["D", "C", "UnRated", ""] },
      },
      orderBy: {
        dateOfAllotment: "desc",
      },
      take: limit,
    });

    return data;
  }

  async getUpcomingBonds(limit: number = 6) {
    const data = await db.dataBase.bonds.findMany({
      where: {
        isListed: { equals: "YES" },
        dateOfAllotment: { gt: new Date() },
        creditRating: { notIn: ["D", "C", "UnRated", ""] },
      },
      orderBy: {
        dateOfAllotment: "asc",
      },
      take: limit,
    });

    return data;
  }
}
