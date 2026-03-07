import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";
import { BondQueryBuilder } from "./bond_query_builder";
import { isISIN } from "@utils/filters/convert";

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
    },
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
      limitNum,
    );

    let orderBy = options?.sortBy
      ? sortingOptions[options.sortBy]
      : sortingOptions.default;

    const extendedQuery = whereQuery;

    if (options?.all != "YES") {
      extendedQuery.isListed = { equals: "YES" };
      extendedQuery.redemptionDate = { gte: new Date() };
      extendedQuery.creditRating = { notIn: ["D", "C"] };
      console.log(isISIN(filters?.search || ""), filters?.search);

      if (isISIN(filters?.search || "")) {
        console.log("ISIN Search");
      } else {
        extendedQuery.allowForPurchase = { equals: true };
      }
    }

    if (options?.category && options.category != "all") {
      // no need to filter by redemptionDate for perpetual bonds
      if (options.category == "perpetual") {
        delete extendedQuery.redemptionDate;
        orderBy = sortingOptions.byRating;
      }

      if (options.category == "latest-release") {
        orderBy = sortingOptions.dateOfAllotment;
      }

      extendedQuery.categories = { has: options?.category || "" };
    }

    console.log(orderBy);


    const [data, total] = await Promise.all([
      db.dataBase.bonds.findMany({
        where: whereQuery,
        orderBy:
          options?.all == "YES"
            ? [
                {
                  allowForPurchase: "desc",
                },
                {
                  sortedAt: "asc",
                },
              ]
            : orderBy,
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

  async autocompleteBondSearch(query: string) {
    const data = await db.dataBase.bonds.findMany({
      where: {
        OR: [
          {
            bondName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            isin: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      take: 10,
    });

    return data;
  }

  async getLatestBonds(limit: number = 3) {
    const data = await db.dataBase.bonds.findMany({
      where: {
        isListed: { equals: "YES" },
        dateOfAllotment: { lte: new Date() },
        creditRating: {
          in: [
            "AAA",
            "AA",
            "AA+",
            "AAA(CE)",
            "AA+(CE)",
            "AA(CE)",
            "A+(CE)",
            "AAA",
            "AA+",
            "AA",
            "A+",
            "A",
            "A-",
            "BBB+",
            "BBB",
          ],
        },
      },
      orderBy: [
        {
          dateOfAllotment: "desc",
        },
        {
          creditRating: "asc",
        },
      ],
      take: limit,
    });

    return data;
  }

  async getLatestBondsTop3(limit: number = 3) {
    const data = await db.dataBase.bonds.findMany({
      where: {
        isListed: { equals: "YES" },
        dateOfAllotment: { lte: new Date() },
        creditRating: {
          in: [
            "AAA",
            "AA",
            "AA+",
            "AAA(CE)",
            "AA+(CE)",
            "AA(CE)",
            "A+(CE)",
            "AAA",
            "AA+",
            "AA",
            "A+",
            "A",
            "A-",
            "BBB+",
            "BBB",
          ],
        },
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
        creditRating: {
          in: [
            "AAA",
            "AA",
            "AA+",
            "AAA(CE)",
            "AA+(CE)",
            "AA(CE)",
            "A+(CE)",
            "AAA",
            "AA+",
            "AA",
            "A+",
            "A",
            "A-",
            "BBB+",
            "BBB",
          ],
        },
      },
      orderBy: [
        {
          dateOfAllotment: "desc",
        },
        {
          creditRating: "asc",
        },
      ],
      take: limit,
    });

    return data;
  }

  async createBond(
    bondData: z.infer<typeof appSchema.bonds.bondCreateUpdateSchema>,
  ) {
    const data = await db.dataBase.bonds.create({
      data: {
        isin: bondData.isin,
        bondName: bondData.bondName,
        instrumentName: bondData.instrumentName,
        description: bondData.description,
        issuePrice: bondData.issuePrice,
        faceValue: bondData.faceValue,
        stampDutyPercentage: bondData.stampDutyPercentage ?? 0,
        allowForPurchase: bondData.allowForPurchase ?? false,
        couponRate: bondData.couponRate,
        interestPaymentFrequency: bondData.interestPaymentFrequency,
        putCallOptionDetails: bondData.putCallOptionDetails || null,
        certificateNumbers: bondData.certificateNumbers || null,
        totalIssueSize: bondData.totalIssueSize || 0,
        registrarDetails: bondData.registrarDetails || null,
        physicalSecurityAddress: bondData.physicalSecurityAddress || null,
        defaultedInRedemption: bondData.defaultedInRedemption || null,
        debentureTrustee: bondData.debentureTrustee || null,
        creditRatingInfo: bondData.creditRatingInfo || null,
        remarks: bondData.remarks || null,
        taxStatus: bondData.taxStatus,
        creditRating: bondData.creditRating || "UnRated",
        interestPaymentMode: bondData.interestPaymentMode,
        isListed: bondData.isListed,
        ratingAgencyName: bondData.ratingAgencyName || null,
        ratingDate: bondData.ratingDate || null,
        categories: bondData.categories || [],
        sectorName: bondData.sectorName || null,
        dateOfAllotment: bondData.dateOfAllotment || null,
        redemptionDate: bondData.redemptionDate || null,
        maturityDate: bondData.maturityDate || null,
        sortedAt: bondData.sortedAt || 0,
        isConvertedDeal: bondData.isConvertedDeal || null,
        yield: bondData.yield || null,
        lastTradePrice: bondData.lastTradePrice || null,
        lastTradeYield: bondData.lastTradeYield || null,
        nextCouponDate: bondData.nextCouponDate || null,
        modeOfIssuance: bondData.modeOfIssuance || null,
        couponType: bondData.couponType || null,
        buyYield: bondData.buyYield || null,
        providerName: bondData.providerName || null,
        providerInterestDate: bondData.providerInterestDate || null,
        providerQuantity: bondData.providerQuantity || null,
        isOngoingDeal: bondData.isOngoingDeal ?? false,
        providerPrice: bondData.providerPrice || null,
        ignoreAutoUpdate: bondData.ignoreAutoUpdate ?? false,
      },
    });

    return data;
  }

  async updateBond(
    isin: string,
    bondData: z.infer<typeof appSchema.bonds.bondCreateUpdateSchema>,
  ) {
    // Check if bond exists
    const existingBond = await db.dataBase.bonds.findUnique({
      where: { isin },
    });

    if (!existingBond) {
      throw new Error(`Bond with ISIN ${isin} not found`);
    }

    const data = await db.dataBase.bonds.update({
      where: { isin },
      data: {
        bondName: bondData.bondName,
        instrumentName: bondData.instrumentName,
        description: bondData.description,
        issuePrice: bondData.issuePrice,
        faceValue: bondData.faceValue,
        stampDutyPercentage: bondData.stampDutyPercentage ?? 0,
        allowForPurchase: bondData.allowForPurchase ?? false,
        couponRate: bondData.couponRate,
        interestPaymentFrequency: bondData.interestPaymentFrequency,
        putCallOptionDetails: bondData.putCallOptionDetails || null,
        certificateNumbers: bondData.certificateNumbers || null,
        totalIssueSize: bondData.totalIssueSize || 0,
        registrarDetails: bondData.registrarDetails || null,
        physicalSecurityAddress: bondData.physicalSecurityAddress || null,
        defaultedInRedemption: bondData.defaultedInRedemption || null,
        debentureTrustee: bondData.debentureTrustee || null,
        creditRatingInfo: bondData.creditRatingInfo || null,
        remarks: bondData.remarks || null,
        taxStatus: bondData.taxStatus,
        creditRating: bondData.creditRating || "UnRated",
        interestPaymentMode: bondData.interestPaymentMode,
        isListed: bondData.isListed,
        ratingAgencyName: bondData.ratingAgencyName || null,
        ratingDate: bondData.ratingDate || null,
        categories: bondData.categories || [],
        sectorName: bondData.sectorName || null,
        dateOfAllotment: bondData.dateOfAllotment || null,
        redemptionDate: bondData.redemptionDate || null,
        maturityDate: bondData.maturityDate || null,
        sortedAt: bondData.sortedAt || 0,
        isConvertedDeal: bondData.isConvertedDeal || null,
        yield: bondData.yield || null,
        lastTradePrice: bondData.lastTradePrice || null,
        lastTradeYield: bondData.lastTradeYield || null,
        nextCouponDate: bondData.nextCouponDate || null,
        modeOfIssuance: bondData.modeOfIssuance || null,
        couponType: bondData.couponType || null,
        buyYield: bondData.buyYield || null,
        providerName: bondData.providerName || null,
        providerInterestDate: bondData.providerInterestDate || null,
        providerQuantity: bondData.providerQuantity || null,
        isOngoingDeal: bondData.isOngoingDeal ?? false,
        providerPrice: bondData.providerPrice || null,
        ignoreAutoUpdate: bondData.ignoreAutoUpdate ?? false,
      },
    });

    return data;
  }

  async getOngoingDeals() {
    const data = await db.dataBase.bonds.findMany({
      where: { isOngoingDeal: true },
    });
    return data;
  }
}
