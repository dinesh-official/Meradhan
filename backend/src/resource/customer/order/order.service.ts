import { db, PaymentStatus } from "@core/database/database";
import { AppError } from "@utils/error/AppError";
import { PaymentService } from "@resource/customer/payment/payment.service";
import { PaymentProviders } from "@packages/config/constants";
import { config } from "@config/config";
import type { appSchema } from "@root/schema";
import type z from "zod";
import type {
  Prisma,
  Order,
  NseCbricsParticipantModel,
} from "@databases/generated/prisma/postgres";

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
  private payment = new PaymentService(PaymentProviders.RAZORPAY);

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

  async previewOrder(item: OrderPreviewItem) {
    const bond = await this.getBondDetails(item.isin);

    const price = Number(bond.faceValue) || 1000;
    const totalPrice = price * item.quantity;
    const subTotal = totalPrice;

    const stampDutyRate = Number(config.checkout.stampDutyRate) || 0.00015;
    const stampDuty = subTotal * stampDutyRate;

    const totalAmount = subTotal + stampDuty;

    return {
      subTotal,
      stampDuty,
      totalAmount,
      isin: bond.isin,
      bondName: bond.bondName,
      quantity: item.quantity,
      unitPrice: price,
      faceValue: Number(bond.faceValue),
      bondDetails: bond,
    };
  }

  async createOrder(customerId: number, item: OrderPreviewItem) {
    const preview = await this.previewOrder(item);

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await db.dataBase.order.create({
      data: {
        customerProfileId: customerId,
        orderNumber,
        subTotal: preview.subTotal,
        stampDuty: preview.stampDuty,
        totalAmount: preview.totalAmount,
        paymentStatus: PaymentStatus.PENDING,
        status: "PENDING",
        paymentProvider: PaymentProviders.RAZORPAY,
        isin: preview.isin,
        bondName: preview.bondName,
        faceValue: preview.faceValue,
        quantity: preview.quantity,
        unitPrice: preview.unitPrice,
        bondDetails: preview.bondDetails as Prisma.InputJsonValue,
      },
    });

    const razorpayOrder = await this.payment.createOrder(
      preview.totalAmount,
      "INR",
      order.orderNumber
    );

    await db.dataBase.order.update({
      where: { id: order.id },
      data: {
        paymentOrderId: razorpayOrder.id,
      },
    });

    return {
      orderId: order.id,
      paymentOrderId: razorpayOrder.id,
      amount: preview.totalAmount,
      currency: "INR",
      key: config.razorpay.keyId,
    };
  }

  async captureOrderPayment(
    paymentOrderId: string,
    paymentId: string,
    signature?: string
  ) {
    const order = await db.dataBase.order.findUnique({
      where: { paymentOrderId },
    });

    if (!order)
      throw new AppError("Order not found", { code: "ORDER_NOT_FOUND" });
    if (order.paymentStatus === PaymentStatus.COMPLETED) {
      return { message: "Already captured", orderId: order.id };
    }

    if (signature) {
      const isValid = this.payment.verifySignature(
        paymentOrderId,
        paymentId,
        signature
      );
      if (!isValid) {
        await db.dataBase.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "REJECTED" as PaymentStatus,
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
          status: "SETTLED",
          paymentId,
          paymentMetadata: {
            signature: signature || null,
            provider: PaymentProviders.RAZORPAY,
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
          metadata: order.bondDetails as Prisma.InputJsonValue,
        },
      });
    });

    return { status: "success", orderId: order.id };
  }

  async updateOrderMetadata(
    orderId: number,
    metadata: Record<string, unknown>
  ): Promise<void> {
    await db.dataBase.order.update({
      where: { id: orderId },
      data: {
        metadata: metadata,
      },
    });
  }

  async updateOrderStatus(
    orderId: number,
    status: "PENDING" | "SETTLED" | "APPLIED" | "REJECTED"
  ): Promise<void> {
    await db.dataBase.order.update({
      where: { id: orderId },
      data: {
        status: status,
      },
    });
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
    outputData?: Record<string, unknown>,
    details?: Record<string, unknown>
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
    bondType?: string
  ) {
    const skip = (page - 1) * limit;

    const whereClause: Prisma.OrderWhereInput = {
      customerProfileId: customerId,
    };

    const countWhereClause: Prisma.OrderWhereInput = {
      customerProfileId: customerId,
    };

    if (status) {
      // Status filter is for order status, not payment status
      const validOrderStatuses = ["PENDING", "SETTLED", "APPLIED", "REJECTED"];
      if (validOrderStatuses.includes(status)) {
        whereClause.status = status;
        countWhereClause.status = status;
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

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
