import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import { OrderStatus, PaymentStatus } from "@databases/generated/prisma/postgres";
import {
  generateDealId,
  generateOrderId,
} from "@resource/customer/order/order.utils";
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
      bondDetails.instrumentName || bondDetails.bondName || "";

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

}