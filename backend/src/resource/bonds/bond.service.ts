import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";
import { BondQueryBuilder } from "./bond_query_builder";
import { isISIN } from "@utils/filters/convert";
import { computeBondOrderPricingData } from "@services/order/order-pricing-helper";
import { sendBackOfficeEmail } from "@communication/email_communication";
import { placeOrderEmailCustomer, sendPlaceOrderEmail } from "./place-order-email";
import { AppConfigService } from "@resource/app-config/app-config.service";
import { AppError } from "@utils/error/AppError";
import { env } from "@packages/config/src/env";
import { OrderPdfService } from "@resource/customer/order/order-pdf.service";

export type GetBondOrderPricingResult =
  | { ok: true; pricing: ReturnType<typeof computeBondOrderPricingData> }
  | { ok: false; reason: "not_found" }
  | { ok: false; reason: "missing_coupon_dates" };

export class BondService {
  async getBondDetails(isin: string) {
    const data = await db.dataBase.bonds.findUnique({
      where: { isin },
    });
    return data;
  }

  async getBondOrderPricing(
    isin: string,
    quantityInput?: number,
  ): Promise<GetBondOrderPricingResult> {
    const bond = await this.getBondDetails(isin);
    if (!bond) {
      return { ok: false, reason: "not_found" };
    }

    const cleanPrice = bond.sellPrice;

    const lastCouponDateStr = bond.lastCouponDate;
    const nextCouponDateStr = bond.nextCouponDate;

    if (!lastCouponDateStr || !nextCouponDateStr) {
      return { ok: false, reason: "missing_coupon_dates" };
    }

    const recordDays =
      typeof bond.recordDays === "number" && !Number.isNaN(bond.recordDays)
        ? bond.recordDays
        : 7;

    const rawQuantity = quantityInput ?? 1;
    const quantity =
      Number.isFinite(rawQuantity) && rawQuantity > 0 ? rawQuantity : 1;

    const pricing = computeBondOrderPricingData({
      faceValue: bond.faceValue,
      quantity,
      cleanPrice: cleanPrice ?? 0,
      couponRate: Number(bond.couponRate),
      lastCouponDate: lastCouponDateStr?.toISOString() ?? "",
      recordDays,
      nextCouponDate: nextCouponDateStr?.toISOString() ?? "",
    });

    return { ok: true, pricing };
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
        allCouponDates: bondData.allCouponDates ?? [],
        dayConvention: bondData.dayConvention || null,
        recordDate: bondData.recordDate || null,
        recordDays: bondData.recordDays ?? null,
        imDocumentLink: bondData.imDocumentLink || null,
        exchangeListedOn: bondData.exchangeListedOn ?? null,
        lastCouponDate: bondData.lastCouponDate || null,
        isPerpetual: bondData.isPerpetual ?? null,
        bondType: bondData.bondType ?? null,
        seniority: bondData.seniority ?? null,
        natureOfInstrument: bondData.natureOfInstrument ?? null,
        buyPrice: bondData.buyPrice ?? null,
        sellPrice: bondData.sellPrice ?? null,
        redemptionType: bondData.redemptionType || null,
        startDate: bondData.startDate || null,
        endDate: bondData.endDate || null,
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
        allCouponDates: bondData.allCouponDates ?? [],
        dayConvention: bondData.dayConvention || null,
        recordDate: bondData.recordDate || null,
        recordDays: bondData.recordDays ?? null,
        imDocumentLink: bondData.imDocumentLink || null,
        exchangeListedOn: bondData.exchangeListedOn ?? null,
        lastCouponDate: bondData.lastCouponDate || null,
        isPerpetual: bondData.isPerpetual ?? null,
        bondType: bondData.bondType ?? null,
        seniority: bondData.seniority ?? null,
        natureOfInstrument: bondData.natureOfInstrument ?? null,
        buyPrice: bondData.buyPrice ?? null,
        sellPrice: bondData.sellPrice ?? null,
        redemptionType: bondData.redemptionType || null,
        startDate: bondData.startDate || null,
        endDate: bondData.endDate || null,
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

  async placeOrder(orderData: z.infer<typeof appSchema.bonds.orderPlaceSchema>) {
    const appConfig = new AppConfigService();
    const pgMode = await appConfig.getPaymentGatewayMode();
    if (pgMode === "PAYMENT") {
      throw new AppError(
        "Orders must be completed through the Razorpay payment gateway. Please use Proceed to Pay on the order receipt.",
        { code: "ORDER_FLOW_REQUIRES_PAYMENT" },
      );
    }

    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: orderData.customerProfileId },
    });
    if (!customer) {
      throw new Error(`Customer with ID ${orderData.customerProfileId} not found`);
    }
    const data = await db.dataBase.leadsModel.create({
      data: {
        bondType: "CORPORATE",
        fullName: customer.firstName + " " + customer.lastName,
        phoneNo: customer.phoneNo ?? "",
        leadSource: "WEBSITE",
        status: "NEW",
        createdBy: customer.id,
        emailAddress: customer.emailAddress ?? "",
        exInvestmentAmount: orderData.settlementAmount,
        note: "Order placed for " + orderData.bondName + " with ISIN " + orderData.isin + " and quantity " + orderData.quantity + " at " + orderData.dealDate,
      },
    });


    // format the request date to DD-MMM-YYYY HH:MM AM/PM
    const requestDate = new Date(orderData.requestDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })


    const orderPdfService = new OrderPdfService();
    let orderPdfAttachments:
      | { filename: string; path: string }[]
      | undefined;
    try {
      const pdfFilePath = await orderPdfService.generateTempOrderPdfFile({
        userId: customer.id,
        isin: orderData.isin,
        qun: orderData.quantity,
        isReleased: false,
        requestDate: orderData.requestDate,
      });
      orderPdfAttachments = [
        {
          filename: `MERADHAN-ORDER-${orderData.isin}-${orderData.quantity}.pdf`,
          path: pdfFilePath,
        },
      ];
    } catch (e) {
      console.error("placeOrder: failed to generate order PDF for email", e);
    }

    orderData.requestDate = requestDate;

    await Promise.all([
      sendBackOfficeEmail({
        to: customer.emailAddress ?? "",
        subject: "Order Request Received – ISIN: " + orderData.isin + " | Request Date: " + requestDate,
        text: await placeOrderEmailCustomer(orderData),
        // attachments: orderPdfAttachments,
      }),
      sendBackOfficeEmail({
        to: "dl.sales@meradhan.co",
        subject: env.CBRICS_ENV === "UAT" ? `UAT Testing | Order Request | ${orderData.isin} | Qty: ${orderData.quantity} | Rs. ${orderData.faceValue * orderData.quantity} [Please DELETE this email its a test email]` : `Order Request | ${orderData.isin} | Qty: ${orderData.quantity} | Rs. ${orderData.faceValue * orderData.quantity} | Request Date: ${requestDate}`,
        text: await sendPlaceOrderEmail(orderData),
        attachments: orderPdfAttachments,
      }),
    ]);
    return { success: true, message: "Order placed successfully" };
  }
}
