import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import { OrderStatus, PaymentStatus } from "@databases/generated/prisma/postgres";
import {
  generateDealId,
  generateOrderId,
} from "@resource/customer/order/order.utils";
import { CustomerProfileRepo } from "@resource/crm/customers/customer.repo";
import { BondService } from "@resource/bonds/bond.service";
import {
  generateDealPdfBuffer,
  generateOrderPdfBuffer,
  getInterestPaymentSchedule,
} from "kyc-providers";
import { fetchBankNameFromIfsc } from "@utils/razorpayIfsc";
import { getDpName } from "dp-id-lookup";
import { AppError, HttpStatus } from "@utils/error/AppError";
import crypto from "crypto";

export class CrmOrdersService {
  async getAllOrders(
    page: number = 1,
    limit: number = 10,
    status?: string,
    bondType?: string,
    search?: string,
    date?: string
  ) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.OrderWhereInput = {};

    const countWhereClause: Prisma.OrderWhereInput = {};

    if (status) {
      const validOrderStatuses = ["PENDING", "SETTLED", "APPLIED", "REJECTED"];
      if (validOrderStatuses.includes(status)) {
        whereClause.status = status as OrderStatus;
        countWhereClause.status = status as OrderStatus;
      }
    }

    if (bondType) {
      const validBondTypes = ["PRIMARY", "SECONDARY"];
      if (validBondTypes.includes(bondType.toUpperCase())) {
        const isPrimary = bondType.toUpperCase() === "PRIMARY";
        whereClause.bondDetails = {
          path: ["isPrimary"],
          equals: isPrimary,
        };
        countWhereClause.bondDetails = {
          path: ["isPrimary"],
          equals: isPrimary,
        };
      }
    }

    if (search) {
      whereClause.OR = [
        {
          customerProfile: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { emailAddress: { contains: search, mode: "insensitive" } },
            ],
          },
        },
        { bondName: { contains: search, mode: "insensitive" } },
        { orderNumber: { contains: search, mode: "insensitive" } },
        {
          bondDetails: {
            path: ["issuerCode"],
            string_contains: search,
          },
        },
      ];
      countWhereClause.OR = whereClause.OR;
    }

    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
      countWhereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [orders, total] = await Promise.all([
      db.dataBase.order.findMany({
        where: whereClause,
        include: {
          customerProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              emailAddress: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.dataBase.order.count({
        where: countWhereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getOrderById(orderId: number) {
    const order = await db.dataBase.order.findUnique({
      where: { id: orderId },
      include: {
        customerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            emailAddress: true,
            phoneNo: true,
          },
        },
        orderLogs: {
          orderBy: { createdAt: "desc" },
        },
        customerBonds: true,
      },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    // Check if order exists
    const existingOrder = await db.dataBase.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    // Update order status
    const updatedOrder = await db.dataBase.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        customerProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            emailAddress: true,
            phoneNo: true,
          },
        },
        orderLogs: {
          orderBy: { createdAt: "desc" },
        },
        customerBonds: true,
      },
    });

    return updatedOrder;
  }


  async getRfqByOrderNumber(orderNumber: string) {
    const rfq = await db.dataBase.settleOrderModel.findFirst({
      where: {
        orderNumber: {
          equals: orderNumber,
        },
      },
    });
    return rfq;
  }

  async getReceiptPdfOptions(orderNumber: string) {
    return db.dataBase.crmOrderReceiptPdfOptions.findUnique({
      where: { orderNumber },
    });
  }

  async upsertReceiptPdfOptions(
    orderNumber: string,
    data: {
      accruedInterestDays?: number | null;
      settlementNumber?: string | null;
      settlementDateTime?: string | null;
      lastInterestPaymentDateRaw?: string | null;
      lastInterestPaymentDate?: string | null;
      interestPaymentDates?: string | null;
      nonAmortizedBond?: boolean;
      amortizedPrincipalPaymentDates?: string | null;
    },
  ) {
    const opt = <T>(v: T | undefined | null) =>
      v === undefined ? undefined : v;
    return db.dataBase.crmOrderReceiptPdfOptions.upsert({
      where: { orderNumber },
      create: {
        orderNumber,
        accruedInterestDays: opt(data.accruedInterestDays) ?? undefined,
        settlementNumber: opt(data.settlementNumber) ?? undefined,
        settlementDateTime: opt(data.settlementDateTime) ?? undefined,
        lastInterestPaymentDateRaw: opt(data.lastInterestPaymentDateRaw) ?? undefined,
        lastInterestPaymentDate: opt(data.lastInterestPaymentDate) ?? undefined,
        interestPaymentDates: opt(data.interestPaymentDates) ?? undefined,
        nonAmortizedBond: data.nonAmortizedBond ?? true,
        amortizedPrincipalPaymentDates:
          opt(data.amortizedPrincipalPaymentDates) ?? undefined,
      },
      update: {
        accruedInterestDays: opt(data.accruedInterestDays),
        settlementNumber: opt(data.settlementNumber),
        settlementDateTime: opt(data.settlementDateTime),
        lastInterestPaymentDateRaw: opt(data.lastInterestPaymentDateRaw),
        lastInterestPaymentDate: opt(data.lastInterestPaymentDate),
        interestPaymentDates: opt(data.interestPaymentDates),
        nonAmortizedBond: data.nonAmortizedBond,
        amortizedPrincipalPaymentDates: opt(data.amortizedPrincipalPaymentDates),
      },
    });
  }

  async getCustomerByOrderNumber(orderNumber: string) {
    const order = await db.dataBase.order.findFirst({
      where: {
        reqOrderNumber: {
          equals: orderNumber,
        },
      },
      include: {
        customerProfile: {
          include: {
            bankAccounts: true,
            dematAccounts: true,
            panCard: true,
            aadhaarCard: true,
          }
        }
      }
    });
    return order;
  }


  async createOrderFromRfq(
    orderNumber: string,
    customerId: number,
    options?: { orderSide?: "BUY" | "SELL" },
  ) {
    const existingOrder = await this.getCustomerByOrderNumber(orderNumber);
    if (existingOrder) {
      throw new Error(`Customer already exists for order number ${orderNumber}`);
    }

    const customerProfile = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      select: { kycStatus: true },
    });
    if (!customerProfile) {
      throw new Error("Customer not found");
    }
    if (customerProfile.kycStatus !== "VERIFIED") {
      throw new Error("Only customers with verified KYC can be assigned to an order");
    }

    const rfq = await this.getRfqByOrderNumber(orderNumber);

    if (!rfq) {
      throw new Error(`Rfq not found for order number ${orderNumber}`);
    }



    const bondDetails = await db.dataBase.bonds.findFirst({
      where: {
        isin: rfq.symbol,
      },
    });

    if (!bondDetails) {
      throw new Error(`Bond details not found for symbol ${rfq.symbol}`);
    }

    const negotation = await db.dataBase.rFQNegotiation.findFirst({
      where: {
        tradeNumber: rfq.orderNumber,
      },
    });


    if (!negotation) {
      throw new Error(`Negotiation not found for order number ${rfq.orderNumber}`);
    }

    const dealDate =
      rfq.createdAt instanceof Date ? rfq.createdAt : new Date(rfq.createdAt);

    const resolveAction = (): "BUY" | "SELL" | "BOTH" => {
      if (options?.orderSide === "BUY" || options?.orderSide === "SELL") {
        return options.orderSide;
      }
      if (negotation.buySell === "B") return "BUY";
      if (negotation.buySell === "S") return "SELL";
      return "BOTH";
    };
    const action = resolveAction();
    const idAction = action === "BOTH" ? "BUY" : action;

    const tempOrderNumber = `MD-ASSIST-TEMP-${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`;

    const order = await db.dataBase.order.create({
      data: {
        bondDetails: bondDetails,
        faceValue: bondDetails.faceValue,
        quantity: Number(rfq.modQuantity) || 0,
        unitPrice: rfq.price.toNumber(),
        isin: bondDetails.isin,
        bondName: bondDetails.bondName,
        orderNumber: tempOrderNumber,
        stampDuty: negotation.acceptedAccruedInterest || 0,
        subTotal: negotation.acceptedConsideration || 0,
        totalAmount: negotation.acceptedConsideration || 0,
        customerProfileId: customerId,
        paymentId: rfq.orderNumber,
        paymentOrderId: rfq.orderNumber,
        reqOrderNumber: rfq.orderNumber,
        metadata: { rfqNumber: rfq.orderNumber } as Prisma.InputJsonValue,
        paymentStatus: PaymentStatus.PENDING,
        paymentProvider: "CUSTOM",
        status: OrderStatus.SETTLED,
        customerBonds: {
          create: {
            customerProfileId: customerId,
            isin: bondDetails.isin,
            bondName: bondDetails.bondName,
            faceValue: bondDetails.faceValue,
            quantity: Number(rfq.modQuantity) || 0,
            purchasePrice: rfq.price.toNumber(),
          },
        },
      },
    });

    const issuerName =
      bondDetails.bondName || bondDetails.instrumentName || "";

    const finalOrderNumber = generateOrderId({
      channel: "ASSIST",
      action: idAction,
      date: dealDate,
      orderSequence: order.id,
    });
    const dealId = generateDealId({
      issuerName,
      channel: "ASSIST",
      action: idAction,
      date: dealDate,
      orderSequence: order.id,
    });

    const updated = await db.dataBase.order.update({
      where: { id: order.id },
      data: {
        orderNumber: finalOrderNumber,
        metadata: {
          ...((order.metadata as Record<string, unknown>) ?? {}),
          dealId,
          rfqNumber: rfq.orderNumber,
          clientOrderSide: idAction,
        } as Prisma.InputJsonValue,
      },
    });
    return updated;
  }

  /**
   * Builds the CRM order receipt PDF (settlement / RFQ) as a buffer.
   * @throws AppError NOT_FOUND when order or bond is missing
   */
  async generateOrderReceiptPdfBuffer(
    orderNumber: string,
    pdfQuery: Record<string, string | undefined>,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const order = await this.getCustomerByOrderNumber(orderNumber);
    if (!order) {
      throw new AppError("No order found for this settlement. Assign a customer first.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "ORDER_NOT_FOUND",
      });
    }

    const customerRepo = new CustomerProfileRepo();
    const bondService = new BondService();
    const user = await customerRepo.getFullCustomerProfile(order.customerProfileId);
    const getUserPrimaryBankAccount = await db.dataBase.customersBankAccountModel.findFirst({
      where: {
        customerProfileDataModelId: order.customerProfileId,
        isPrimary: true,
      },
    });
    const primaryDematAccount = await db.dataBase.customersDematAccountModel.findFirst({
      where: {
        customerProfileDataModelId: order.customerProfileId,
        isPrimary: true,
      },
    });
    const bond = await bondService.getBondDetails(order.isin);
    if (!bond) {
      throw new AppError(`Bond not found for ISIN: ${order.isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
        code: "BOND_NOT_FOUND",
      });
    }

    const settleOrder = await this.getRfqByOrderNumber(orderNumber);
    const negotation = await db.dataBase.rFQNegotiation.findFirst({
      where: {
        tradeNumber: settleOrder?.orderNumber,
      },
    });
    const rfqDetails = await db.dataBase.rFQMasterISIN.findFirst({
      where: {
        number: negotation?.rfqNumber,
      },
    });
    const metadata = (order.metadata as Record<string, unknown> | null) ?? {};
    const orderDateForPdf: Date = new Date(`${rfqDetails?.date} ${rfqDetails?.quoteTime ?? "12:00:00"}`.trim());
    const [bankName, dpName] = await Promise.all([
      settleOrder?.ifscCode
        ? fetchBankNameFromIfsc(settleOrder.ifscCode)
        : Promise.resolve(null),
      settleOrder?.dpId ? Promise.resolve(getDpName(settleOrder.dpId)) : Promise.resolve(undefined),
    ]);

    const accessType: Record<string, string> = {
      "1": `One to Many (OTM) on RFQ Platform of the Exchange`,
      "2": `One to One (OTO) on RFQ Platform of the Exchange`,
      "3": `Inter Scheme Transfer (IST) on RFQ Platform of the Exchange`,
    };
    const accessKey = rfqDetails?.access != null ? String(rfqDetails.access) : undefined;
    const accessTypeText = accessKey ? accessType[accessKey] : undefined;

    const orderDateForSchedule = orderDateForPdf ? new Date(orderDateForPdf) : new Date();
    const interestSchedule = getInterestPaymentSchedule({
      orderDate: orderDateForSchedule,
      maturityDate: bond.maturityDate ?? null,
      interestPaymentFrequency: bond.interestPaymentFrequency,
      paymentDayOfMonth: 20,
      nextCouponDate:
        bond.nextCouponDate != null && String(bond.nextCouponDate).trim() !== ""
          ? new Date(bond.nextCouponDate)
          : undefined,
    });

    const accruedInterestDaysParam =
      pdfQuery.accruedInterestDays != null ? Number(pdfQuery.accruedInterestDays) : undefined;
    const settlementNumberParam =
      typeof pdfQuery.settlementNumber === "string" && pdfQuery.settlementNumber.trim() !== ""
        ? pdfQuery.settlementNumber.trim()
        : undefined;
    const settlementDateTimeParam =
      typeof pdfQuery.settlementDateTime === "string" && pdfQuery.settlementDateTime.trim() !== ""
        ? pdfQuery.settlementDateTime.trim()
        : undefined;
    const lastInterestPaymentDateParam =
      typeof pdfQuery.lastInterestPaymentDate === "string" &&
      pdfQuery.lastInterestPaymentDate.trim() !== ""
        ? pdfQuery.lastInterestPaymentDate.trim()
        : undefined;
    const interestPaymentDatesParam =
      typeof pdfQuery.interestPaymentDates === "string" && pdfQuery.interestPaymentDates.trim() !== ""
        ? pdfQuery.interestPaymentDates
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
    const nonAmortizedBondParam = pdfQuery.nonAmortizedBond === "false" ? false : true;
    const amortizedPrincipalPaymentDatesParam =
      typeof pdfQuery.amortizedPrincipalPaymentDates === "string" &&
      pdfQuery.amortizedPrincipalPaymentDates.trim() !== ""
        ? pdfQuery.amortizedPrincipalPaymentDates.trim()
        : undefined;

    const buffer = await generateOrderPdfBuffer({
      user,
      orderId: order.orderNumber,
      bond,
      qun:
        settleOrder?.modQuantity != null
          ? Number(settleOrder.modQuantity)
          : order.quantity,
      isReleased: true,
      orderData: {
        createdAt: orderDateForPdf.toISOString(),
        subTotal:
          settleOrder?.value != null
            ? Number(settleOrder.value)
            : Number(order.totalAmount),
        stampDuty:
          settleOrder?.stampDutyAmount != null
            ? Number(settleOrder.stampDutyAmount)
            : Number(order.stampDuty),
        totalAmount:
          settleOrder?.modConsideration != null
            ? Number(settleOrder.modConsideration)
            : Number(order.totalAmount),
        price: Number(settleOrder?.price ?? 0),
        metadata: {
          dealId: (metadata.dealId as string) ?? undefined,
          clientOrderSide: (metadata.clientOrderSide as "BUY" | "SELL") ?? undefined,
          rfqNumber: (metadata.rfqNumber as string) ?? undefined,
          orderType: accessTypeText ?? "One To One (OTO) on RFQ Platform of the Exchange",
          interestPaymentDates:
            interestPaymentDatesParam?.length
              ? interestPaymentDatesParam
              : interestSchedule.dates.length > 0
                ? interestSchedule.dates
                : undefined,
          interestPaymentFrequencyLabel: interestSchedule.frequencyLabel,
          settlementOrderNumber: negotation?.rfqNumber ?? settleOrder?.orderNumber ?? undefined,
          settlementDate: orderDateForPdf,
          valueDate: bond.maturityDate
            ? new Date(bond.maturityDate).toISOString()
            : undefined,
          accruedInterest: settleOrder?.modAccrInt != null ? Number(settleOrder.modAccrInt) : undefined,
          accruedInterestDays: accruedInterestDaysParam,
          settlementNumber:
            settlementNumberParam ?? (settleOrder as { settlementNo?: string } | undefined)?.settlementNo,
          settlementDateTime: settlementDateTimeParam,
          lastInterestPaymentDate: lastInterestPaymentDateParam,
          nonAmortizedBond: nonAmortizedBondParam,
          amortizedPrincipalPaymentDates: amortizedPrincipalPaymentDatesParam,
          settlementBank: settleOrder
            ? {
                bankName: getUserPrimaryBankAccount?.bankName ?? bankName ?? undefined,
                ifscCode: getUserPrimaryBankAccount?.ifscCode ?? settleOrder.ifscCode ?? undefined,
                accountNo: getUserPrimaryBankAccount?.accountNumber ?? settleOrder.accountNo ?? undefined,
              }
            : undefined,
          settlementDemat: settleOrder
            ? {
                dpName: primaryDematAccount?.depositoryParticipantName ?? dpName ?? undefined,
                dpId: primaryDematAccount?.dpId ?? settleOrder.dpId ?? undefined,
                benId: primaryDematAccount?.clientId ?? settleOrder.benId ?? undefined,
              }
            : undefined,
          settleOrder: settleOrder
            ? {
                id: settleOrder.id,
                orderNumber: settleOrder.orderNumber,
                symbol: settleOrder.symbol,
                buySell: negotation?.buySell,
                buyParticipantLoginId: settleOrder.buyParticipantLoginId,
                sellParticipantLoginId: settleOrder.sellParticipantLoginId,
                buyerRefNo: settleOrder.buyerRefNo,
                sellerRefNo: settleOrder.sellerRefNo,
                buyBackofficeLoginId: settleOrder.buyBackofficeLoginId,
                sellBackofficeLoginId: settleOrder.sellBackofficeLoginId,
                buyBrokerLoginId: settleOrder.buyBrokerLoginId,
                sellBrokerLoginId: settleOrder.sellBrokerLoginId,
                source: settleOrder.source,
                modSettleDate: settleOrder.modSettleDate,
                modQuantity: settleOrder.modQuantity,
                modAccrInt: settleOrder.modAccrInt,
                modConsideration: settleOrder.modConsideration,
                settlementNo: settleOrder.settlementNo,
                stampDutyAmount: settleOrder.stampDutyAmount,
                stampDutyBearer: settleOrder.stampDutyBearer,
                buyerFundPayinObligation: settleOrder.buyerFundPayinObligation,
                sellerFundPayoutObligation: settleOrder.sellerFundPayoutObligation,
                fundPayinRefId: settleOrder.fundPayinRefId,
                settleStatus: settleOrder.settleStatus,
                secPayinQuantity: settleOrder.secPayinQuantity,
                secPayinRemarks: settleOrder.secPayinRemarks,
                secPayinTime: settleOrder.secPayinTime,
                fundsPayinAmount: settleOrder.fundsPayinAmount,
                fundsPayinRemarks: settleOrder.fundsPayinRemarks,
                fundsPayinTime: settleOrder.fundsPayinTime,
                payoutRemarks: settleOrder.payoutRemarks,
                payoutTime: settleOrder.payoutTime,
                ifscCode: getUserPrimaryBankAccount?.ifscCode ?? settleOrder.ifscCode ?? undefined,
                accountNo: getUserPrimaryBankAccount?.accountNumber ?? settleOrder.accountNo ?? undefined,
                utrNumber: settleOrder.utrNumber,
                dpId: primaryDematAccount?.dpId ?? settleOrder.dpId ?? undefined,
                benId: primaryDematAccount?.clientId ?? settleOrder.benId ?? undefined,
              }
            : undefined,
        },
      },
    });

    return {
      buffer,
      filename: `order-receipt-${order.orderNumber}.pdf`,
    };
  }

  /**
   * Builds the CRM deal sheet PDF (draft / pre-settlement) as a buffer.
   * @throws AppError NOT_FOUND when order or bond is missing
   */
  async generateDealSheetPdfBuffer(
    orderNumber: string,
    pdfQuery: Record<string, string | undefined>,
  ): Promise<{ buffer: Buffer; filename: string }> {
    const order = await this.getCustomerByOrderNumber(orderNumber);
    if (!order) {
      throw new AppError("No order found for this settlement. Assign a customer first.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "ORDER_NOT_FOUND",
      });
    }

    const customerRepo = new CustomerProfileRepo();
    const bondService = new BondService();
    const user = await customerRepo.getFullCustomerProfile(order.customerProfileId);
    const bond = await bondService.getBondDetails(order.isin);
    if (!bond) {
      throw new AppError(`Bond not found for ISIN: ${order.isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
        code: "BOND_NOT_FOUND",
      });
    }

    const settleOrder = await this.getRfqByOrderNumber(orderNumber);
    const getUserPrimaryBankAccount = await db.dataBase.customersBankAccountModel.findFirst({
      where: {
        customerProfileDataModelId: order.customerProfileId,
        isPrimary: true,
      },
    });
    const primaryDematAccount = await db.dataBase.customersDematAccountModel.findFirst({
      where: {
        customerProfileDataModelId: order.customerProfileId,
        isPrimary: true,
      },
    });
    const negotation = await db.dataBase.rFQNegotiation.findFirst({
      where: {
        tradeNumber: settleOrder?.orderNumber,
      },
    });
    const rfqDetails = await db.dataBase.rFQMasterISIN.findFirst({
      where: {
        number: negotation?.rfqNumber,
      },
    });
    const metadata = (order.metadata as Record<string, unknown> | null) ?? {};
    const orderDateForPdf: Date = new Date(
      `${rfqDetails?.date} ${rfqDetails?.quoteTime ?? "12:00:00"}`.trim(),
    );

    const [bankName, dpName] = await Promise.all([
      settleOrder?.ifscCode
        ? fetchBankNameFromIfsc(getUserPrimaryBankAccount?.ifscCode ?? settleOrder.ifscCode ?? undefined)
        : Promise.resolve(null),
      settleOrder?.dpId
        ? Promise.resolve(getDpName(primaryDematAccount?.dpId ?? settleOrder.dpId ?? undefined))
        : Promise.resolve(undefined),
    ]);

    const accessType: Record<string, string> = {
      "1": "One to Many (OTM) on RFQ Platform of the Exchange",
      "2": "One to One (OTO) on RFQ Platform of the Exchange",
      "3": "Inter Scheme Transfer (IST) on RFQ Platform of the Exchange",
    };
    const accessKey = rfqDetails?.access != null ? String(rfqDetails.access) : undefined;
    const accessTypeText = accessKey ? accessType[accessKey] : undefined;

    const interestSchedule = getInterestPaymentSchedule({
      orderDate: orderDateForPdf,
      maturityDate: bond.maturityDate ?? null,
      interestPaymentFrequency: bond.interestPaymentFrequency,
      paymentDayOfMonth: 20,
      nextCouponDate:
        bond.nextCouponDate != null && String(bond.nextCouponDate).trim() !== ""
          ? new Date(bond.nextCouponDate)
          : undefined,
    });

    const accruedInterestDaysParam =
      pdfQuery.accruedInterestDays != null ? Number(pdfQuery.accruedInterestDays) : undefined;
    const settlementNumberParam =
      typeof pdfQuery.settlementNumber === "string" && pdfQuery.settlementNumber.trim() !== ""
        ? pdfQuery.settlementNumber.trim()
        : undefined;
    const settlementDateTimeParam =
      typeof pdfQuery.settlementDateTime === "string" && pdfQuery.settlementDateTime.trim() !== ""
        ? pdfQuery.settlementDateTime.trim()
        : undefined;
    const lastInterestPaymentDateParam =
      typeof pdfQuery.lastInterestPaymentDate === "string" &&
      pdfQuery.lastInterestPaymentDate.trim() !== ""
        ? pdfQuery.lastInterestPaymentDate.trim()
        : undefined;
    const interestPaymentDatesParamDeal =
      typeof pdfQuery.interestPaymentDates === "string" && pdfQuery.interestPaymentDates.trim() !== ""
        ? pdfQuery.interestPaymentDates
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;
    const nonAmortizedBondParamDeal = pdfQuery.nonAmortizedBond === "false" ? false : true;
    const amortizedPrincipalPaymentDatesParamDeal =
      typeof pdfQuery.amortizedPrincipalPaymentDates === "string" &&
      pdfQuery.amortizedPrincipalPaymentDates.trim() !== ""
        ? pdfQuery.amortizedPrincipalPaymentDates.trim()
        : undefined;

    const buffer = await generateDealPdfBuffer({
      user,
      orderId: order.orderNumber,
      bond,
      qun:
        settleOrder?.modQuantity != null
          ? Number(settleOrder.modQuantity)
          : order.quantity,
      isReleased: false,
      orderData: {
        createdAt: orderDateForPdf.toISOString(),
        subTotal:
          settleOrder?.value != null
            ? Number(settleOrder.value)
            : Number(order.totalAmount),
        stampDuty:
          settleOrder?.stampDutyAmount != null
            ? Number(settleOrder.stampDutyAmount)
            : Number(order.stampDuty),
        totalAmount:
          settleOrder?.modConsideration != null
            ? Number(settleOrder.modConsideration)
            : Number(order.totalAmount),
        price: Number(settleOrder?.price ?? 0),
        metadata: {
          dealId: (metadata.dealId as string) ?? undefined,
          clientOrderSide: (metadata.clientOrderSide as "BUY" | "SELL") ?? undefined,
          rfqNumber: (metadata.rfqNumber as string) ?? undefined,
          orderType: accessTypeText ?? "One To One (OTO) on RFQ Platform of the Exchange",
          interestPaymentDates:
            interestPaymentDatesParamDeal?.length
              ? interestPaymentDatesParamDeal
              : interestSchedule.dates.length > 0
                ? interestSchedule.dates
                : undefined,
          interestPaymentFrequencyLabel: interestSchedule.frequencyLabel,
          settlementOrderNumber: negotation?.rfqNumber ?? settleOrder?.orderNumber ?? undefined,
          settlementDate: orderDateForPdf,
          valueDate: bond.maturityDate
            ? new Date(bond.maturityDate).toISOString()
            : undefined,
          accruedInterest:
            settleOrder?.modAccrInt != null ? Number(settleOrder.modAccrInt) : undefined,
          accruedInterestDays: accruedInterestDaysParam,
          settlementNumber:
            settlementNumberParam ??
            (settleOrder as { settlementNo?: string } | undefined)?.settlementNo,
          settlementDateTime: settlementDateTimeParam,
          lastInterestPaymentDate: lastInterestPaymentDateParam,
          nonAmortizedBond: nonAmortizedBondParamDeal,
          amortizedPrincipalPaymentDates: amortizedPrincipalPaymentDatesParamDeal,
          settlementBank: settleOrder
            ? {
                bankName: getUserPrimaryBankAccount?.bankName ?? bankName ?? undefined,
                ifscCode: getUserPrimaryBankAccount?.ifscCode ?? settleOrder.ifscCode ?? undefined,
                accountNo: getUserPrimaryBankAccount?.accountNumber ?? settleOrder.accountNo ?? undefined,
              }
            : undefined,
          settlementDemat: settleOrder
            ? {
                dpName: primaryDematAccount?.depositoryParticipantName ?? dpName ?? undefined,
                dpId: primaryDematAccount?.dpId ?? settleOrder.dpId ?? undefined,
                benId: primaryDematAccount?.clientId ?? settleOrder.benId ?? undefined,
              }
            : undefined,
          settleOrder: settleOrder
            ? {
                id: settleOrder.id,
                orderNumber: settleOrder.orderNumber,
                symbol: settleOrder.symbol,
                buySell: negotation?.buySell,
                buyParticipantLoginId: settleOrder.buyParticipantLoginId,
                sellParticipantLoginId: settleOrder.sellParticipantLoginId,
                buyerRefNo: settleOrder.buyerRefNo,
                sellerRefNo: settleOrder.sellerRefNo,
                buyBackofficeLoginId: settleOrder.buyBackofficeLoginId,
                sellBackofficeLoginId: settleOrder.sellBackofficeLoginId,
                buyBrokerLoginId: settleOrder.buyBrokerLoginId,
                sellBrokerLoginId: settleOrder.sellBrokerLoginId,
                source: settleOrder.source,
                modSettleDate: settleOrder.modSettleDate,
                modQuantity: settleOrder.modQuantity,
                modAccrInt: settleOrder.modAccrInt,
                modConsideration: settleOrder.modConsideration,
                settlementNo: settleOrder.settlementNo,
                stampDutyAmount: settleOrder.stampDutyAmount,
                stampDutyBearer: settleOrder.stampDutyBearer,
                buyerFundPayinObligation: settleOrder.buyerFundPayinObligation,
                sellerFundPayoutObligation: settleOrder.sellerFundPayoutObligation,
                fundPayinRefId: settleOrder.fundPayinRefId,
                settleStatus: settleOrder.settleStatus,
                secPayinQuantity: settleOrder.secPayinQuantity,
                secPayinRemarks: settleOrder.secPayinRemarks,
                secPayinTime: settleOrder.secPayinTime,
                fundsPayinAmount: settleOrder.fundsPayinAmount,
                fundsPayinRemarks: settleOrder.fundsPayinRemarks,
                fundsPayinTime: settleOrder.fundsPayinTime,
                payoutRemarks: settleOrder.payoutRemarks,
                payoutTime: settleOrder.payoutTime,
                ifscCode: getUserPrimaryBankAccount?.ifscCode ?? settleOrder.ifscCode ?? undefined,
                accountNo: getUserPrimaryBankAccount?.accountNumber ?? settleOrder.accountNo ?? undefined,
                utrNumber: settleOrder.utrNumber,
                dpId: primaryDematAccount?.dpId ?? settleOrder.dpId ?? undefined,
                benId: primaryDematAccount?.clientId ?? settleOrder.benId ?? undefined,
              }
            : undefined,
        },
      },
    });

    return {
      buffer,
      filename: `deal-sheet-${order.orderNumber}.pdf`,
    };
  }

}