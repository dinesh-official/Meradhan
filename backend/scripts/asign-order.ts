import "@packages/config/env";

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
import { env } from "@packages/config/src/env";
import { computeBondOrderPricingData, getLastNextCouponDateBasedOnSettlementDate, getPayoutDates } from "@services/order/order-pricing-helper";
import { sendBackOfficeEmail } from "@communication/email_communication";
import {
  dateOfBirthToPdfPassword,
  getCustomerDobRawForPdf,
} from "@utils/dobPdfPassword";
import { encryptPdfBufferWithPassword } from "@utils/encryptPdfBuffer";
import { getBondInfoCalcData } from "@resource/bonds/fill-bonds-auto";
import { OrderService } from "@resource/customer/order/order.service";
import { orderSettlementQueue } from "@jobs/queue/worker_queues";
import { db } from "@core/database/database";
import { OrderSettlementService } from "@services/order/order_settlement.service";

function formatDraftOrderCustomerName(profile: {
  firstName: string;
  middleName: string;
  lastName: string;
  legalEntityName: string | null;
}): string {
  const entity = profile.legalEntityName?.trim();
  if (entity) return entity;
  const parts = [profile.firstName, profile.middleName, profile.lastName]
    .map((s) => s?.trim())
    .filter((s) => s.length > 0);
  return parts.length > 0 ? parts.join(" ") : "—";
}

function toYyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateWithDayNameForPdfOption(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return `${String(d.getDate()).padStart(2, "0")}-${months[d.getMonth()]}-${d.getFullYear()} (${dayNames[d.getDay()]})`;
}

function parseLooseDate(input: string): Date | null {
  const s = String(input ?? "").trim();
  if (!s) return null;

  // YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    const dt = new Date(y, m - 1, d, 12, 0, 0, 0);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  // DD-MMM-YYYY (03-Apr-2026)
  const ddMmmYyyy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s);
  if (ddMmmYyyy) {
    const day = Number(ddMmmYyyy[1]);
    const monKey = (ddMmmYyyy[2] ?? "").slice(0, 3).toLowerCase();
    const year = Number(ddMmmYyyy[3] ?? NaN);
    const MONTH: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const month = MONTH[monKey];
    if (month !== undefined) {
      const dt = new Date(year, month, day, 12, 0, 0, 0);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
  }

  // Fallback (e.g. ISO timestamps)
  const dt = new Date(s);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function diffDays(start: Date, end: Date): number {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 0, 0, 0, 0);
  const ms = e.getTime() - s.getTime();
  return Math.round(ms / 86_400_000);
}

/**
 * RFQ master stores `date` as DD-MMM-YYYY (e.g. 03-Apr-2026) and `quoteTime` as HH:MM or HH:MM:SS.
 * Parsing with `new Date("03-Apr-2026 12:00:00")` is unreliable; missing RFQ rows yield Invalid Date.
 */
function parseRfqMasterDateTime(
  datePart: string | null | undefined,
  quoteTimePart: string | null | undefined,
  fallback: Date,
): Date {
  const rawDate = datePart?.trim();
  if (!rawDate) {
    return fallback;
  }

  const timeRaw = quoteTimePart?.trim();
  let time = "12:00:00";
  if (timeRaw) {
    const parts = timeRaw.split(":");
    if (parts.length === 2) {
      time = `${timeRaw}:00`;
    } else {
      time = timeRaw;
    }
  }

  const ddMmmYyyy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(rawDate);
  if (ddMmmYyyy) {
    const day = Number(ddMmmYyyy[1]);
    const monKey = (ddMmmYyyy[2] ?? "").slice(0, 3).toLowerCase();
    const year = Number(ddMmmYyyy[3] ?? NaN);
    const MONTH: Record<string, number> = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };
    const month = MONTH[monKey];
    const tm = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/.exec(time);
    const hh = tm ? Number(tm[1]) : 12;
    const mm = tm ? Number(tm[2]) : 0;
    const ss = tm && tm[3] !== undefined ? Number(tm[3]) : 0;

    if (month !== undefined) {
      const out = new Date(year, month, day, hh, mm, ss);
      if (!Number.isNaN(out.getTime())) {
        return out;
      }
    }
  }

  const parsed = new Date(`${rawDate} ${time}`.trim());
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return fallback;
}

export class CrmOrdersService {
  private readonly customerOrderService = new OrderService();

  /**
   * NSE `settle_order.orderNumber` is the trade id; customer-facing `order.orderNumber` is usually MD-*.
   */
  private resolveSettleOrderTradeKey(order: {
    orderNumber: string;
    reqOrderNumber: string | null;
    metadata: unknown;
  }): string {
    const meta = (order.metadata as Record<string, unknown> | null) ?? {};
    const rfq = typeof meta.rfqNumber === "string" ? meta.rfqNumber.trim() : "";
    const req =
      order.reqOrderNumber != null && String(order.reqOrderNumber).trim() !== ""
        ? String(order.reqOrderNumber).trim()
        : "";
    return req || rfq || order.orderNumber;
  }

  async getSettlementAutomationLogGroups(search?: string) {
    const where = search?.trim()
      ? {
        OR: [
          { paymentId: { contains: search, mode: "insensitive" as const } },
          { batchId: { contains: search, mode: "insensitive" as const } },
          { step: { contains: search, mode: "insensitive" as const } },
          { message: { contains: search, mode: "insensitive" as const } },
        ],
      }
      : {};

    const rows = await db.dataBase.orderSettlementAutomationLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const grouped = rows.reduce<Record<string, typeof rows>>((acc, row) => {
      if (!acc[row.paymentId]) acc[row.paymentId] = [];
      acc[row.paymentId]!.push(row);
      return acc;
    }, {});

    return Object.entries(grouped).map(([paymentId, logs]) => ({
      paymentId,
      totalLogs: logs.length,
      latestStatus: logs[0]?.status ?? "UNKNOWN",
      latestCreatedAt: logs[0]?.createdAt ?? null,
      logs,
    }));
  }

  async getSettlementAutomationLogs(paymentId?: string | null) {
    if (!paymentId) return [];
    return db.dataBase.orderSettlementAutomationLog.findMany({
      where: { paymentId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

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

    const searchTrimmed = search?.trim();
    if (searchTrimmed) {
      const q = searchTrimmed;
      const numericId = /^\d+$/.test(q) ? Number(q) : null;
      /** e.g. "sourav bapari" → each token must match some name field (first / middle / last). */
      const nameTokens = q.split(/\s+/).filter((t) => t.length > 0);

      const customerMatchesToken = (token: string) =>
        ({
          OR: [
            { firstName: { contains: token, mode: "insensitive" as const } },
            { middleName: { contains: token, mode: "insensitive" as const } },
            { lastName: { contains: token, mode: "insensitive" as const } },
          ],
        }) satisfies Prisma.CustomerProfileDataModelWhereInput;

      const customerSearchConditions: Prisma.OrderWhereInput[] =
        nameTokens.length >= 2
          ? [
            {
              customerProfile: {
                AND: nameTokens.map((token) => customerMatchesToken(token)),
              },
            },
            {
              customerProfile: {
                emailAddress: { contains: q, mode: "insensitive" },
              },
            },
          ]
          : [
            {
              customerProfile: {
                OR: [
                  { firstName: { contains: q, mode: "insensitive" } },
                  { middleName: { contains: q, mode: "insensitive" } },
                  { lastName: { contains: q, mode: "insensitive" } },
                  { emailAddress: { contains: q, mode: "insensitive" } },
                ],
              },
            },
          ];

      whereClause.OR = [
        ...customerSearchConditions,
        { bondName: { contains: q, mode: "insensitive" } },
        { orderNumber: { contains: q, mode: "insensitive" } },
        { isin: { contains: q, mode: "insensitive" } },
        { paymentId: { contains: q, mode: "insensitive" } },
        { paymentOrderId: { contains: q, mode: "insensitive" } },
        { reqOrderNumber: { contains: q, mode: "insensitive" } },
        {
          metadata: {
            path: ["rfqNumber"],
            string_contains: q,
          },
        },
        ...(numericId != null ? [{ id: numericId }] : []),
        {
          bondDetails: {
            path: ["issuerCode"],
            string_contains: q,
          },
        },
        {
          bondDetails: {
            path: ["rating"],
            string_contains: q,
          },
        },
        {
          bondDetails: {
            path: ["creditRating"],
            string_contains: q,
          },
        },
        {
          bondDetails: {
            path: ["bondRating"],
            string_contains: q,
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

    const settlementAutomationLogs = await this.getSettlementAutomationLogs(order.paymentId);

    return {
      ...order,
      settlementAutomationLogs,
    };
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

  async autofillReceiptPdfOptions(
    orderNumber: string,
    input: { settlementDate: string },
  ): Promise<{
    accruedInterestDays: number;
    settlementNumber: string | null;
    lastInterestPaymentDateRaw: string | null;
    lastInterestPaymentDate: string | null;
    interestPaymentDates: string[] | null;
  }> {
    const order = await this.getCustomerByOrderNumber(orderNumber);
    if (!order) {
      throw new AppError("No order found for this settlement. Assign a customer first.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "ORDER_NOT_FOUND",
      });
    }

    const bondService = new BondService();
    const bond = await bondService.getBondDetails(order.isin);
    if (!bond) {
      throw new AppError(`Bond not found for ISIN: ${order.isin}`, {
        statusCode: HttpStatus.NOT_FOUND,
        code: "BOND_NOT_FOUND",
      });
    }

    const recordDays =
      typeof bond.recordDays === "number" && !Number.isNaN(bond.recordDays)
        ? bond.recordDays
        : 7;
    console.log(bond.maturityDate);

    const couponDates = await getLastNextCouponDateBasedOnSettlementDate(bond.isin, bond.maturityDate!)
    console.log(couponDates);

    const pricingData = computeBondOrderPricingData({
      isin: bond.isin,
      faceValue: bond.faceValue,
      quantity: order.quantity,
      cleanPrice: Number(order.unitPrice),
      couponRate: bond.couponRate,
      lastCouponDate: (couponDates?.lastCouponDate || "").toString(),
      recordDays: recordDays,
      nextCouponDate: couponDates?.nextCouponDate || "",
    })

    const bondData = await getBondInfoCalcData(order.isin);

    console.log(pricingData);


    const settlementDt = parseLooseDate(input.settlementDate);
    if (!settlementDt) {
      throw new AppError("Invalid settlementDate. Expected YYYY-MM-DD.", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }

    const settleOrder = await this.getRfqByOrderNumber(orderNumber);
    const negotiation = settleOrder?.orderNumber
      ? await db.dataBase.rFQNegotiation.findFirst({
        where: { tradeNumber: settleOrder.orderNumber },
      })
      : null;
    const rfqDetails = negotiation?.rfqNumber
      ? await db.dataBase.rFQMasterISIN.findFirst({
        where: { number: negotiation.rfqNumber },
      })
      : null;

    const fallbackOrderDate =
      order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    const orderDateForPdf = parseRfqMasterDateTime(
      rfqDetails?.date,
      rfqDetails?.quoteTime,
      fallbackOrderDate,
    );



    // Latest coupon date on/before settlement date.
    let lastPayment = couponDates.lastCouponDate ? new Date(couponDates.lastCouponDate || '') : undefined;
    if (!lastPayment) lastPayment = orderDateForPdf;
    console.log("DATE", (input.settlementDate));

    const interestPaymentDates = await getPayoutDates(bond.isin, new Date(input.settlementDate));
    console.log(interestPaymentDates);

    return {
      accruedInterestDays: pricingData.recordDays,
      settlementNumber: settleOrder?.settlementNo || "",
      lastInterestPaymentDateRaw: bondData.payload.Last_IP_Date,
      lastInterestPaymentDate: bondData.payload.Last_IP_Date,
      interestPaymentDates: interestPaymentDates || null,
    };
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
        OR: [
          { reqOrderNumber: { equals: orderNumber } },
          { orderNumber: { equals: orderNumber } },
        ],
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
    options?: { orderSide?: "BUY" | "SELL", skipExistsCheck?: boolean },
  ) {
    if (!options?.skipExistsCheck) {
      const existingOrder = await this.getCustomerByOrderNumber(orderNumber);
      if (existingOrder) {
        throw new Error(`Customer already exists for order number ${orderNumber}`);
      }
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

    const issuerName = bondDetails.bondName || bondDetails.instrumentName || "";

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

    const settleOrder = await this.getRfqByOrderNumber(
      this.resolveSettleOrderTradeKey(order),
    );

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
    console.log(rfqDetails?.date, rfqDetails?.quoteTime,);


    const fallbackOrderDate =
      order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    const orderDateForPdf = pdfQuery.dealDate ? new Date(pdfQuery.dealDate) : parseRfqMasterDateTime(
      rfqDetails?.date,
      rfqDetails?.quoteTime,
      fallbackOrderDate,
    );
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
          settlementDate: (pdfQuery?.settlementDate || rfqDetails?.settlementDate || settleOrder?.modSettleDate) ?? undefined as string | undefined,
          payoutTime: (settleOrder?.payoutTime || settlementDateTimeParam || settleOrder?.modSettleDate) ?? undefined as string | undefined,
          settlementType: rfqDetails?.settlementType ?? 0,
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

    const settleOrder = await this.getRfqByOrderNumber(
      this.resolveSettleOrderTradeKey(order),
    );

    // Settlement status
    // 0 = Settlement Pending
    // 1 = Securities Payin Done
    // 2 = Funds Payin Done
    // 3 = Payin Completed
    // 4 = Payout Done Successfully
    // 5 = Payin reversed
    // 6 = Settle order expired
    // 7 = Order not settleable
    // 8 = Settlement of order cancelled
    // 9 = Document not received for unregistered participant

    const validSettlementStatus = {
      0: "Settlement Pending",
      1: "Securities Payin Done",
      2: "Funds Payin Done",
      3: "Payin Completed",
      4: "Payout Done Successfully",
      5: "Payin reversed",
      6: "Settle order expired",
      7: "Order not settleable",
      8: "Settlement of order cancelled",
      9: "Document not received for unregistered participant",
    }

    if (settleOrder?.settleStatus !== 4) {
      if (env.CBRICS_ENV === "PROD") {
        throw new AppError(`Settlement is not completed. Please wait for the settlement to complete. ${validSettlementStatus[settleOrder?.settleStatus as keyof typeof validSettlementStatus] ?? "Unknown"}`, {
          statusCode: HttpStatus.BAD_REQUEST,
          code: "SETTLEMENT_NOT_COMPLETED",
        });
      }
    }

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
    const fallbackOrderDateDeal =
      order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
    const orderDateForPdf = parseRfqMasterDateTime(
      rfqDetails?.date,
      rfqDetails?.quoteTime,
      fallbackOrderDateDeal,
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
          settlementType: rfqDetails?.settlementType ?? 0,
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
          settlementDate: rfqDetails?.settlementDate || settleOrder?.modSettleDate,
          payoutTime: settleOrder?.payoutTime || settlementDateTimeParam || settleOrder?.modSettleDate,
          valueDate: bond.maturityDate
            ? new Date(bond.maturityDate).toISOString()
            : undefined,
          accruedInterest: settleOrder?.modAccrInt != null ? Number(settleOrder.modAccrInt) : undefined,
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

  /**
   * Same behavior as POST /api/crm/orders/send-pdf-email/:orderNumber (CRM + automation).
   * @throws AppError for validation / NOT_FOUND / encryption failures
   */
  async sendPdfEmailToClient(
    orderNumber: string,
    body: {
      pdfType: "order" | "deal";
      subject: string;
      messageBody: string;
      toEmail?: string;
      accruedInterestDays?: number | string;
      settlementNumber?: string;
      settlementDateTime?: string;
      settlementDate?: Date;
      dealDate?: Date,
      lastInterestPaymentDate?: string;
      interestPaymentDates?: string;
      nonAmortizedBond?: boolean;
      amortizedPrincipalPaymentDates?: string;
    },
  ): Promise<{ messageId: string }> {
    const pdfType = body.pdfType;
    if (pdfType !== "order" && pdfType !== "deal") {
      throw new AppError("pdfType must be either 'order' or 'deal'", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }

    console.log(body);


    const subject = String(body.subject ?? "").trim();
    const messageBody = String(body.messageBody ?? "").trim();
    const fromEmail = env.SMTP_SENDER;

    if (!subject) {
      throw new AppError("Subject is required", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }
    if (!messageBody) {
      throw new AppError("Message body is required", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const accruedInterestDaysParam =
      body.accruedInterestDays != null ? Number(body.accruedInterestDays) : undefined;

    const settlementNumberParam =
      typeof body.settlementNumber === "string" && body.settlementNumber.trim() !== ""
        ? body.settlementNumber.trim()
        : undefined;
    const settlementDateTimeParam =
      typeof body.settlementDateTime === "string" && body.settlementDateTime.trim() !== ""
        ? body.settlementDateTime?.toString().trim()
        : undefined;
    const lastInterestPaymentDateParam =
      typeof body.lastInterestPaymentDate === "string" &&
        body.lastInterestPaymentDate.trim() !== ""
        ? body.lastInterestPaymentDate.trim()
        : undefined;

    const pdfQuery: Record<string, string | undefined> = {
      accruedInterestDays: String(accruedInterestDaysParam),
    };
    if (settlementNumberParam) pdfQuery.settlementNumber = settlementNumberParam;
    if (settlementDateTimeParam) pdfQuery.settlementDateTime = settlementDateTimeParam;
    if (lastInterestPaymentDateParam) {
      pdfQuery.lastInterestPaymentDate = lastInterestPaymentDateParam;
    }
    if (typeof body.interestPaymentDates === "string" && body.interestPaymentDates.trim() !== "") {
      pdfQuery.interestPaymentDates = body.interestPaymentDates.trim();
    }
    pdfQuery.nonAmortizedBond = body.nonAmortizedBond === false ? "false" : "true";
    if (
      typeof body.amortizedPrincipalPaymentDates === "string" &&
      body.amortizedPrincipalPaymentDates.trim() !== ""
    ) {
      pdfQuery.amortizedPrincipalPaymentDates = body.amortizedPrincipalPaymentDates.trim();
    }
    if (body.settlementDate) {
      pdfQuery.settlementDate = body.settlementDate.toISOString();
    }
    if (body.dealDate) {
      pdfQuery.dealDate = body.dealDate.toISOString();
    }



    const order = await this.getCustomerByOrderNumber(orderNumber);
    if (!order) {
      throw new AppError("No order found for this settlement. Assign a customer first.", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "ORDER_NOT_FOUND",
      });
    }

    const customerRepo = new CustomerProfileRepo();
    const user = await customerRepo.getFullCustomerProfile(order.customerProfileId);
    console.log(pdfQuery);

    let buffer: Buffer;
    let filename: string;
    const generated =
      pdfType === "deal"
        ? await this.generateDealSheetPdfBuffer(orderNumber, pdfQuery)
        : await this.generateOrderReceiptPdfBuffer(orderNumber, pdfQuery);
    buffer = generated.buffer;
    filename = generated.filename;

    const recipientEmail =
      String(body.toEmail ?? "").trim() || order.customerProfile?.emailAddress;
    if (!recipientEmail || !emailPattern.test(recipientEmail)) {
      throw new AppError("Recipient email is missing or invalid", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "BAD_REQUEST",
      });
    }

    const dobRaw = getCustomerDobRawForPdf(user);
    const pdfPassword = dateOfBirthToPdfPassword(dobRaw);
    if (!pdfPassword) {
      throw new AppError(
        "Customer date of birth is required to password-protect the PDF. Ensure PAN/Aadhaar or personal info DOB is on file.",
        {
          statusCode: HttpStatus.BAD_REQUEST,
          code: "BAD_REQUEST",
        },
      );
    }
    try {
      buffer = encryptPdfBufferWithPassword(buffer, pdfPassword);
    } catch (encErr) {
      console.error("PDF encryption failed:", encErr);
      throw new AppError(
        encErr instanceof Error
          ? encErr.message
          : "Failed to encrypt PDF. Install qpdf (e.g. brew install qpdf) or set QPDF_BIN.",
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: "PDF_ENCRYPT_FAILED",
        },
      );
    }

    const htmlBody = messageBody
      .split("\n")
      .map((line) => line.trim())
      .join("<br/>");
    const messageId = await sendBackOfficeEmail({
      to: recipientEmail,
      from: fromEmail,
      subject,
      html: htmlBody,
      text: messageBody,
      attachments: [
        {
          filename,
          content: buffer,
          contentType: "application/pdf",
        },
      ],
    });

    return { messageId };
  }

  /** Meradhan checkout drafts (`draft_orders`) for CRM inspection of stored pricing JSON. */
  async listDraftOrdersForCrm(): Promise<{
    data: Array<{
      id: number;
      isin: string;
      quantity: number;
      sellPrice: number;
      userId: number;
      customerName: string;
      status: OrderStatus;
      createdAt: string;
      updatedAt: string;
      pricingData: Record<string, unknown> | null;
    }>;
  }> {
    const rows = (await db.dataBase.draftOrders.findMany({
      orderBy: { createdAt: "desc" },
      take: 500,
    })) as Array<{
      id: number;
      isin: string;
      quantity: number;
      sellPrice: number;
      userId: number;
      pricingData: Prisma.JsonValue;
      status: OrderStatus;
      createdAt: Date;
      updatedAt: Date;
    }>;
    const userIds = [...new Set(rows.map((r) => r.userId))];
    const profiles =
      userIds.length === 0
        ? []
        : await db.dataBase.customerProfileDataModel.findMany({
          where: { id: { in: userIds } },
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            legalEntityName: true,
          },
        });
    const customerNameByUserId = new Map<number, string>();
    for (const p of profiles) {
      customerNameByUserId.set(p.id, formatDraftOrderCustomerName(p));
    }

    const isins = [...new Set(rows.map((r) => r.isin))];
    const bondRows =
      isins.length === 0
        ? []
        : await db.dataBase.bonds.findMany({
          where: { isin: { in: isins } },
          select: { isin: true, buyYield: true, yield: true },
        });
    const yieldByIsin = new Map<string, number>();
    for (const b of bondRows) {
      const raw = b.yield ?? b.buyYield;
      if (raw != null && Number.isFinite(Number(raw))) {
        yieldByIsin.set(b.isin, Number(raw));
      }
    }

    return {
      data: rows.map((r) => {
        let pricingData: Record<string, unknown> | null =
          r.pricingData == null ||
            typeof r.pricingData !== "object" ||
            Array.isArray(r.pricingData)
            ? null
            : { ...(r.pricingData as Record<string, unknown>) };

        const snapshotYield = pricingData?.yield;
        const hasYield =
          snapshotYield != null &&
          snapshotYield !== "" &&
          Number.isFinite(Number(snapshotYield));
        if (!hasYield) {
          const bondYield = yieldByIsin.get(r.isin);
          if (bondYield != null) {
            pricingData = { ...(pricingData ?? {}), yield: bondYield };
          }
        }

        return {
          id: r.id,
          isin: r.isin,
          quantity: Number(r.quantity),
          sellPrice: Number(r.sellPrice),
          userId: r.userId,
          customerName: customerNameByUserId.get(r.userId) ?? "—",
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          pricingData,
        };
      }),
    };
  }

  /**
   * CRM: create a Meradhan `order` for the draft owner (PG mode skipped), delete the draft,
   * then run NSE **add ISIN** (`OrderSettlementService.addIsinToSettlement`) to open the RFQ
   * and persist `metadata.rfqNumber` on the order (same first step as automated settlement).
   */
  async createOrderFromDraftForCrm(draftId: number): Promise<{
    orderId: number;
    orderNumber: string;
    paymentOrderId?: string;
    amount: number;
    currency: string;
    key: string;
    /** NSE RFQ master number after add-ISIN (same step as post-payment settlement). */
    rfqNumber?: string;
  }> {
    if (!Number.isFinite(draftId) || draftId < 1) {
      throw new AppError("Invalid draft id", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "INVALID_DRAFT_ID",
      });
    }

    const draft = await db.dataBase.draftOrders.findUnique({
      where: { id: draftId },
    });
    if (!draft) {
      throw new AppError("Draft order not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "DRAFT_ORDER_NOT_FOUND",
      });
    }

    const draftRow = draft as typeof draft & { status: OrderStatus };
    if (draftRow.status !== OrderStatus.PENDING) {
      throw new AppError(
        `This draft cannot be converted (status: ${String(draftRow.status)}).`,
        {
          statusCode: HttpStatus.BAD_REQUEST,
          code: "DRAFT_ORDER_NOT_PENDING",
        },
      );
    }

    const qty = Math.round(Number(draft.quantity));
    if (!Number.isFinite(qty) || qty < 1) {
      throw new AppError("Invalid draft quantity", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "INVALID_DRAFT_QUANTITY",
      });
    }

    const item: { isin: string; quantity: number; sellPrice?: number } = {
      isin: draft.isin,
      quantity: qty,
    };
    const sell = Number(draft.sellPrice);
    if (Number.isFinite(sell)) {
      item.sellPrice = sell;
    }

    const result = await this.customerOrderService.createOrder(
      draft.userId,
      item,
      undefined,
      true,
    );

    try {
      await db.dataBase.draftOrders.delete({ where: { id: draftId } });
    } catch (err) {
      console.error(
        "[createOrderFromDraftForCrm] Order created but failed to delete draft",
        draftId,
        err,
      );
    }

    const order = await this.customerOrderService.getOrderWithNSEData(
      result.orderId,
    );
    if (!order) {
      throw new AppError("Order not found after create", {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: "ORDER_NOT_FOUND_AFTER_CREATE",
      });
    }

    // const paymentId = (result.paymentOrderId && String(result.paymentOrderId)) || `order-${result.orderId}`;
    const orderService = new OrderService();

    await orderService.updateOrderStatus(order.id, "APPLIED");
    const settlementService = new OrderSettlementService();
    await settlementService.seedOrderStages(order.id, { isNetBanking: false });
    const settlementJobId = `order-settlement-${order.id}`;
    const existingJob = await orderSettlementQueue.getJob(settlementJobId);
    if (!existingJob) {
      await orderSettlementQueue.add(
        {
          type: "orderSettlement",
          id: order.id,
          isNetBanking: false,
        },
        { jobId: settlementJobId },
      );
    }
    return result;
  }

  /** CRM: mark a checkout draft as cancelled (no new order). */
  async cancelDraftOrderForCrm(draftId: number): Promise<{
    id: number;
    status: OrderStatus;
  }> {
    if (!Number.isFinite(draftId) || draftId < 1) {
      throw new AppError("Invalid draft id", {
        statusCode: HttpStatus.BAD_REQUEST,
        code: "INVALID_DRAFT_ID",
      });
    }

    const draft = await db.dataBase.draftOrders.findUnique({
      where: { id: draftId },
    });
    if (!draft) {
      throw new AppError("Draft order not found", {
        statusCode: HttpStatus.NOT_FOUND,
        code: "DRAFT_ORDER_NOT_FOUND",
      });
    }

    const draftRow = draft as typeof draft & { status: OrderStatus };
    if (draftRow.status === OrderStatus.CANCELLED) {
      return { id: draft.id, status: OrderStatus.CANCELLED };
    }
    if (
      draftRow.status !== OrderStatus.PENDING &&
      draftRow.status !== OrderStatus.IN_PROGRESS
    ) {
      throw new AppError(
        "Only pending or in-progress drafts can be cancelled.",
        {
          statusCode: HttpStatus.BAD_REQUEST,
          code: "DRAFT_NOT_CANCELLABLE",
        },
      );
    }

    const updated = await db.dataBase.draftOrders.update({
      where: { id: draftId },
      data: { status: OrderStatus.CANCELLED },
    });

    return {
      id: updated.id,
      status: (updated as { status: OrderStatus }).status,
    };
  }
}

interface AssignOrderToCustomerInput {
  customerProfileId: number;
  isin: string;
  orderNumber: string;
  dryRun?: boolean;
}

async function createOrderForCustomer(input: AssignOrderToCustomerInput) {
  const { customerProfileId, isin, orderNumber, dryRun = false } = input;

  const customer = await db.dataBase.customerProfileDataModel.findUnique({
    where: { id: customerProfileId },
    select: {
      id: true,
      userName: true,
      firstName: true,
      lastName: true,
      emailAddress: true,
      kycStatus: true,
      isDeleted: true,
      bankAccounts: {
        where: { isPrimary: true },
        select: { id: true, bankName: true, accountNumber: true, ifscCode: true },
      },
    },
  });

  if (!customer) {
    throw new Error(`Customer profile not found: id=${customerProfileId}`);
  }
  if (customer.isDeleted) {
    throw new Error(`Customer ${customerProfileId} is marked deleted. Aborting.`);
  }
  if (customer.bankAccounts.length === 0) {
    throw new Error(
      `Customer ${customerProfileId} has no primary bank account. createOrder will fail.`,
    );
  }

  const bond = await db.dataBase.bonds.findFirst({
    where: { isin },
    select: { isin: true, bondName: true, sellPrice: true, faceValue: true, maturityDate: true },
  });
  if (!bond) {
    throw new Error(`Bond not found for ISIN ${isin}`);
  }

  const orderService = new CrmOrdersService();

  console.log("── Customer ─────────────────────────────────");
  console.log({
    id: customer.id,
    userName: customer.userName,
    name: [customer.firstName, customer.lastName].filter(Boolean).join(" "),
    email: customer.emailAddress,
    kycStatus: customer.kycStatus,
    primaryBank: customer.bankAccounts[0]?.bankName,
  });
  console.log("── Bond ─────────────────────────────────────");
  console.log({
    isin: bond.isin,
    bondName: bond.bondName,
    sellPrice: bond.sellPrice,
    faceValue: bond.faceValue,
    maturityDate: bond.maturityDate,
  });


  if (dryRun) {
    console.log("\n[dryRun=true] No order written.");
    return;
  }

  const result = await orderService.createOrderFromRfq(
    orderNumber,
    customer.id,
    { orderSide: "BUY", skipExistsCheck: true },
  );

  console.log("\n✅ Order created");
  console.log(result);

  const saved = await db.dataBase.order.findUnique({
    where: { id: result.id },
    select: {
      id: true,
      orderNumber: true,
      customerProfileId: true,
      isin: true,
      bondName: true,
      quantity: true,
      totalAmount: true,
      status: true,
      paymentStatus: true,
      paymentOrderId: true,
      metadata: true,
      createdAt: true,
    },
  });
  console.log("\n── Persisted row ────────────────────────────");
  console.log(saved);
}

async function main() {
  // ────────────────────────────────────────────────────────────────────
  // EDIT THESE BEFORE RUNNING
  // ────────────────────────────────────────────────────────────────────
  const CUSTOMER_PROFILE_UCC = "MD1HRXWON"; // UCC of the customer to create the order for
  const ISIN = "INE0NES07329"; // ISIN of the bond to order
  const ORDER_NUMBER = "260611990005114"; // Order number of the order to create
  const DRY_RUN = false; // true to skip actual order creation
  // ────────────────────────────────────────────────────────────────────

  const Customer = await db.dataBase.customerProfileDataModel.findUnique({
    where: { userName: CUSTOMER_PROFILE_UCC },
    select: { id: true },
  });

  if (!Customer) {
    throw new Error(`Customer not found for UCC ${CUSTOMER_PROFILE_UCC}`);
  }


  await db.dataBase.$connect();
  try {
    await createOrderForCustomer({
      customerProfileId: Customer?.id,
      isin: ISIN,
      orderNumber: ORDER_NUMBER,
      dryRun: DRY_RUN,
    });
  } finally {
    await db.dataBase.$disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Script failed:", err);
  process.exit(1);
});
