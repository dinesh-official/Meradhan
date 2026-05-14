/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@core/database/database";
import type {
  NseCbricsParticipantModel,
  Order,

  Prisma,
} from "@databases/generated/prisma/postgres";
import { env } from "@packages/config/src/env";
import {
  generateDealId,
  generateOrderId,
} from "@resource/customer/order/order.utils";
import { PaymentService } from "@resource/customer/payment/payment.service";
import crypto from "crypto";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import type z from "zod";
import { BondService } from "@resource/bonds/bond.service";
import { AppConfigService } from "@resource/app-config/app-config.service";
import { CrmInventoryStockService } from "@resource/crm/orders/inventory_stock.service";
import type { computeBondOrderPricingData } from "@services/order/order-pricing-helper";

// PaymentStatus enum values (matches Prisma schema orders.prisma)
const PaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  REFUNDED: "REFUNDED",
  CANCELLED: "CANCELLED",
} as const;

export type TPaymentStatus = typeof PaymentStatus;

// Type definitions for order service
interface OrderWithNSEData extends Omit<Order, "customerProfile"> {
  customerProfile: {
    nseDataSet?: {
      participant: NseCbricsParticipantModel;
    } | null;
  } | null;
}

type OrderPreviewItem = z.infer<typeof appSchema.order.OrderPreviewItemSchema>;

export class OrderService {
  private payment = new PaymentService();
  private appConfig = new AppConfigService();
  private crmInventoryStock = new CrmInventoryStockService();

  private async getBondDetails(isin: string) {
    const bond = await db.dataBase.bonds.findFirst({
      where: { isin: isin },
    });

    if (!bond) {
      throw new AppError(`Bond with ISIN ${isin} not found`, {
        code: "BOND_NOT_FOUND",
      });
    }

    if (bond.maturityDate && new Date(bond.maturityDate) < new Date()) {
      throw new AppError(`Bond ${bond.bondName} has expired`, {
        code: "BOND_EXPIRED",
      });
    }

    return bond;
  }


  async createDraftOrder(userId: number, item: OrderPreviewItem) {
    const bondService = new BondService();
    const bond = await bondService.getBondOrderPricing(item.isin, item.quantity);
    if (bond.ok != true) {
      throw new Error("Failed to create draft order")
    }
    return await db.dataBase.draftOrders.create({
      data: {
        isin: item.isin,
        quantity: item.quantity,
        sellPrice: item.sellPrice || bond.pricing.cleanPrice,
        userId,
        pricingData: bond.pricing
      }
    })
  }

  async previewOrder(item: OrderPreviewItem) {
    const bondService = new BondService();
    const bondDetails = await bondService.getBondDetails(item.isin);
    await this.assertCrmInventoryForOrder(bondService, item.isin, item.quantity);
    const bond = await bondService.getBondOrderPricing(item.isin, item.quantity);

    if (!bond.ok) {
      throw new AppError("Failed to get bond order pricing", {
        code: "BOND_ORDER_PRICING_FAILED",
      });
    }

    return {
      subTotal: bond.ok ? bond.pricing.principalAmount : 0,
      stampDuty: bond.ok ? bond.pricing.stampDuty : 0,
      totalAmount: bond.ok ? bond.pricing.settlementAmount : 0,
      isin: item.isin,
      bondName: bondDetails?.bondName ?? "",
      quantity: item.quantity,
      unitPrice: bondDetails?.sellPrice ?? 0,
      faceValue: bondDetails?.faceValue ?? 0,
      bondDetails: bondDetails,
      yield: bondDetails?.yield ?? 0,
      couponRate: bondDetails?.couponRate ?? 0,
      interestPaymentFrequency: bondDetails?.interestPaymentFrequency ?? "",
      pricing: bond.ok ? bond.pricing : null,
    };
  }

  /** RFQ / deal reference sometimes stored on `metadata` (e.g. assisted onboarding). */
  private rfqFromMetadata(metadata: unknown): string | undefined {
    const v = (metadata as { rfqNumber?: unknown } | null)?.rfqNumber;
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined;
  }

  /**
   * Key into `settle_order.orderNumber` (NSE MOD trade id). Prefer explicit metadata;
   * direct-checkout orders often only have `reqOrderNumber` after deal proposal.
   */
  private settleOrderLinkKey(order: {
    metadata: unknown;
    reqOrderNumber: string | null;
  }): string | undefined {
    return this.rfqFromMetadata(order.metadata) ?? this.normalizeReqOrderNumber(order.reqOrderNumber);
  }

  private normalizeReqOrderNumber(reqOrderNumber: string | null): string | undefined {
    if (typeof reqOrderNumber === "string" && reqOrderNumber.trim().length > 0) {
      return reqOrderNumber.trim();
    }
    return undefined;
  }

  /**
   * Expected settlement from bond order pricing snapshot (stored at checkout) when
   * there is no NSE `settle_order` row or `modSettleDate` yet.
   */
  private settlementDateFromBondDetailsSnapshot(bondDetails: unknown): string | null {
    if (!bondDetails || typeof bondDetails !== "object" || Array.isArray(bondDetails)) {
      return null;
    }
    const b = bondDetails as Record<string, unknown>;
    const p = b.pricing;
    if (!p || typeof p !== "object" || Array.isArray(p)) return null;
    const sd = (p as Record<string, unknown>).settlementDate;
    if (typeof sd === "string" && sd.trim()) return sd.trim();
    return null;
  }

  private async assertCrmInventoryForOrder(
    bondService: BondService,
    isin: string,
    quantity: number,
  ) {
    const available = await bondService.getLatestCrmInventoryWholeUnitsForIsin(isin);
    const qty = Math.floor(Number(quantity));
    if (!Number.isFinite(qty) || qty < 1) {
      throw new AppError("Invalid quantity", { code: "INVALID_QUANTITY" });
    }
    if (available < 1) {
      throw new AppError(
        "This bond is not available for purchase right now (no inventory).",
        { code: "NO_INVENTORY" },
      );
    }
    if (qty > available) {
      throw new AppError(
        `Only ${available} unit(s) in stock; you requested ${qty}. Reduce quantity and try again.`,
        { code: "INSUFFICIENT_INVENTORY" },
      );
    }
  }

  async createOrder(
    customerId: number,
    item: OrderPreviewItem,
    _legacyClientOrderId?: string,
    _skipPgMode?: boolean
  ) {
    const pgMode = await this.appConfig.getPaymentGatewayMode();
    if (_skipPgMode != true) {
      if (pgMode === "INQUIRY") {
        throw new AppError(
          "Payment gateway is in inquiry-only mode. Please submit your order as an inquiry.",
          { code: "PAYMENT_GATEWAY_DISABLED" },
        );
      }
    }

    const preview = await this.previewOrder(item);
    const customerBank = await db.dataBase.customersBankAccountModel.findFirst({
      where: {
        customerProfileDataModelId: customerId,
        isPrimary: true,
      },
    });

    if (!customerBank) {
      throw new AppError("No Default Bank Account Found");
    }

    const issuerName = preview.bondName || (preview.bondDetails as { instrumentName?: string }).instrumentName || "";
    const tempOrderNumber = `MD-DIR-TEMP-${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`;

    const order = await db.dataBase.order.create({
      data: {
        customerProfileId: customerId,
        orderNumber: tempOrderNumber,
        subTotal: preview.subTotal,
        stampDuty: preview.stampDuty,
        totalAmount: preview.totalAmount,
        paymentStatus: PaymentStatus.PENDING,
        status: "PENDING",
        paymentProvider: "RAZORPAY",
        isin: preview.isin,
        bondName: preview.bondName,
        faceValue: preview.faceValue,
        quantity: preview.quantity,
        unitPrice: preview.unitPrice,
        bondDetails: {
          ...preview.bondDetails,
          pricing: preview.pricing,
        },
        metadata: {

        } as Prisma.InputJsonValue,
      },
    });

    const dealDate = new Date();
    const orderNumber = generateOrderId({
      channel: "DIR",
      action: "BUY",
      date: dealDate,
      orderSequence: order.id,
    });
    const dealId = generateDealId({
      issuerName,
      channel: "DIR",
      action: "BUY",
      date: dealDate,
      orderSequence: order.id,
    });

    await db.dataBase.order.update({
      where: { id: order.id },
      data: {
        orderNumber,
        metadata: { dealId } as Prisma.InputJsonValue,
      },
    });
    let razorpayOrder;
    if (_skipPgMode != true) {
      razorpayOrder = await this.payment.createOrder(
        preview.totalAmount,
        "INR",
        orderNumber,
        customerId,
        {
          account_number: customerBank.accountNumber,
          ifsc: customerBank.ifscCode,
          name: customerBank.accountHolderName,
        },
      );
      await db.dataBase.order.update({
        where: { id: order.id },
        data: {
          paymentOrderId: razorpayOrder.id,

        },
      });
    }

    return {
      orderId: order.id,
      orderNumber,
      paymentOrderId: razorpayOrder?.id,
      amount: preview.totalAmount,
      currency: "INR",
      key: env.RAZORPAY_KEY_ID,
    };
  }

  async captureOrderPayment(
    paymentOrderId: string,
    paymentId: string,
    signature?: string,
  ) {
    const order = await db.dataBase.order.findUnique({
      where: { paymentOrderId },
    });

    if (!order)
      throw new AppError("Order not found", { code: "ORDER_NOT_FOUND" });
    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      return { message: "Already captured", id: order.id };
    }

    if (signature) {
      const isValid = this.payment.verifySignature(
        paymentOrderId,
        paymentId,
        signature,
      );
      if (!isValid) {
        await db.dataBase.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "CANCELLED",
            status: "REJECTED",
          },
        });
        throw new AppError("Invalid payment signature", {
          code: "PAYMENT_VERIFICATION_FAILED",
        });
      }
    }

    await db.dataBase.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
          status: "APPLIED",
          paymentId,
          paymentMetadata: {
            signature: signature || null,
            provider: "RAZORPAY",
          },
        },
      });

      await tx.customerBonds.create({
        data: {
          customerProfileId: order.customerProfileId,
          orderId: order.id,
          isin: order.isin,
          bondName: order.bondName,
          faceValue: order.faceValue,
          quantity: order.quantity,
          purchasePrice: order.unitPrice,
          metadata: {
            ...(order.metadata as any),
            ...(order.bondDetails as any),
          },
        },
      });

      await this.crmInventoryStock.applyPaidOrderInventoryDecrement(tx, {
        isin: order.isin,
        quantity: order.quantity,
      });
    });

    return { status: "success", orderId: order.id };
  }

  async cancelOrder(orderId: string) {
    await db.dataBase.order.update({
      where: { orderNumber: orderId },
      data: {
        status: "REJECTED",
        paymentStatus: PaymentStatus.CANCELLED,
      },
    });

    return {
      status: "success",
      orderId: orderId,
    };
  }

  async getOrderById(orderId: number) {
    return await db.dataBase.order.findUnique({
      where: { id: orderId },
    });
  }

  async getOrderByPaymentOrderId(paymentOrderId: string) {
    return await db.dataBase.order.findUnique({
      where: { paymentOrderId },
    });
  }

  async updateOrderMetadata(
    orderId: number,
    metadata: Record<string, any>,
  ): Promise<void> {
    const existong = await db.dataBase.order.findUnique({ where: { id: orderId } })
    await db.dataBase.order.update({
      where: { id: orderId },
      data: {
        metadata: {
          ...(existong?.metadata as any),
          ...metadata,
        },
      },
    });
  }

  async updateOrderStatus(
    orderId: number,
    status: "PENDING" | "SETTLED" | "APPLIED" | "REJECTED" | "IN_PROGRESS",
  ): Promise<void> {
    await db.dataBase.order.update({
      where: { id: orderId },
      data: {
        status: status,
      },
    });
  }

  async updateOrderStatusByOrderNo(
    orderNumber: string,
    status: "PENDING" | "SETTLED" | "APPLIED" | "REJECTED",
  ): Promise<number> {
    const { id } = await db.dataBase.order.update({
      where: { orderNumber },
      data: {
        status: status,
      },
    });
    return id;
  }

  async getOrderWithNSEData(orderId: number): Promise<OrderWithNSEData | null> {
    return (await db.dataBase.order.findUnique({
      where: { id: orderId },
      include: {
        customerProfile: {
          include: {
            nseDataSet: {
              include: {
                participant: true,
              },
            },
          },
        },
      },
    })) as OrderWithNSEData | null;
  }

  async addOrderLog(
    orderId: number,
    step: string,
    status: "SUCCESS" | "FAILED" | "PENDING",
    outputData?: Record<string, any>,
    details?: Record<string, any>,
  ): Promise<void> {
    await db.dataBase.orderLogs.create({
      data: {
        orderId,
        step,
        status,
        outputData,
        details,
      },
    });
  }

  async getOrderLogs(orderId: number) {
    return await db.dataBase.orderLogs.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOrderHistory(
    customerId: number,
    page: number = 1,
    limit: number = 10,
    status?: string,
    bondType?: string,
  ) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.OrderWhereInput = {
      customerProfileId: customerId,
    };

    const countWhereClause: Prisma.OrderWhereInput = {
      customerProfileId: customerId,
    };

    if (status) {
      const u = status.trim().toUpperCase();
      /** Matches Prisma `OrderStatus` + synthetic `NOT_COMPLETED` (checkout / payment abandoned). */
      if (u === "NOT_COMPLETED") {
        const notCompleted = {
          OR: [
            { paymentStatus: "CANCELLED" as const },
            {
              AND: [
                { status: "REJECTED" as const },
                { paymentStatus: { notIn: ["COMPLETED" as const, "REFUNDED" as const] } },
              ],
            },
          ],
        };
        Object.assign(whereClause, notCompleted);
        Object.assign(countWhereClause, notCompleted);
      } else {
        const validOrderStatuses = [
          "PENDING",
          "SETTLED",
          "APPLIED",
          "REJECTED",
          "EXPIRED",
          "CANCELLED",
          "IN_PROGRESS",
        ] as const;
        if ((validOrderStatuses as readonly string[]).includes(u)) {
          whereClause.status = u as (typeof validOrderStatuses)[number];
          countWhereClause.status = u as (typeof validOrderStatuses)[number];
        }
      }
    }

    if (bondType) {
      // Filter by bond type stored in bondDetails JSON
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

    const [orders, total] = await Promise.all([
      db.dataBase.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.dataBase.order.count({
        where: countWhereClause,
      }),
    ]);

    const rfqKeys = [
      ...new Set(
        orders
          .map((o) => this.settleOrderLinkKey(o))
          .filter((v): v is string => v != null && v.length > 0),
      ),
    ];

    const settleByRfq = new Map<
      string,
      { settleStatus: number; modSettleDate: string | null }
    >();
    if (rfqKeys.length > 0) {
      const settleRows = await db.dataBase.settleOrderModel.findMany({
        where: { orderNumber: { in: rfqKeys } },
        select: { orderNumber: true, settleStatus: true, modSettleDate: true },
      });
      for (const row of settleRows) {
        if (!settleByRfq.has(row.orderNumber)) {
          settleByRfq.set(row.orderNumber, {
            settleStatus: row.settleStatus,
            modSettleDate: row.modSettleDate ?? null,
          });
        }
      }
    }

    const data = orders.map((order) => {
      const linkKey = this.settleOrderLinkKey(order);
      const info = linkKey != null ? settleByRfq.get(linkKey) : undefined;
      const settleStatus = info?.settleStatus ?? null;
      const nseSettle =
        info?.modSettleDate != null && String(info.modSettleDate).trim() !== ""
          ? String(info.modSettleDate).trim()
          : null;
      const snapshotSettle = this.settlementDateFromBondDetailsSnapshot(order.bondDetails);
      const settlementDate = nseSettle ?? snapshotSettle;
      return { ...order, settleStatus, settlementDate };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
