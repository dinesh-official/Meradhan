import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import { OrderStatus, PaymentStatus } from "@databases/generated/prisma/postgres";
import { env } from "@root/config/env";
import { AppError, HttpStatus } from "@utils/error/AppError";
import axios from "axios";

type RazorpayPayment = {
  id: string;
  amount?: number;
  currency?: string;
  status?: string; // created | authorized | captured | failed | refunded
  method?: string;
  order_id?: string;
};

/**
 * On-demand verification of a single order's Razorpay payment.
 *
 * This is the manual, one-order equivalent of the hourly
 * `PaymentReconciliationService`: an operator clicks "Verify Razorpay
 * Payment" on the CRM order page, we ask Razorpay for the current payment
 * status and update `paymentStatus` / `status` on the order accordingly.
 *
 * Intentionally scoped to the status update only — it does NOT queue
 * settlement (that stays owned by the reconciliation cron / webhook).
 */
export class OrderPaymentVerifyService {
  private authHeader(): string {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new AppError("Razorpay credentials not configured", {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
    const token = Buffer.from(
      `${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`,
    ).toString("base64");
    return `Basic ${token}`;
  }

  private async fetchPayment(paymentId: string): Promise<RazorpayPayment> {
    const { data } = await axios.get<RazorpayPayment>(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
      { headers: { Authorization: this.authHeader() }, timeout: 60_000 },
    );
    return data;
  }

  private async fetchOrderPayments(
    razorpayOrderId: string,
  ): Promise<RazorpayPayment[]> {
    const { data } = await axios.get<{ items?: RazorpayPayment[] }>(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpayOrderId)}/payments`,
      { headers: { Authorization: this.authHeader() }, timeout: 60_000 },
    );
    return data?.items ?? [];
  }

  private mapRazorpayStatus(status: string | undefined): {
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
  } | null {
    if (status === "captured")
      return {
        paymentStatus: PaymentStatus.COMPLETED,
        orderStatus: OrderStatus.APPLIED,
      };
    if (status === "failed")
      return {
        paymentStatus: PaymentStatus.CANCELLED,
        orderStatus: OrderStatus.REJECTED,
      };
    if (status === "refunded")
      return {
        paymentStatus: PaymentStatus.REFUNDED,
        orderStatus: OrderStatus.REJECTED,
      };
    // created | authorized (and unknown) -> still pending, no definitive update
    return null;
  }

  /**
   * @param apply  When false (default) this is a *preview* — it fetches the
   *   live Razorpay status and reports what WOULD change, but never writes to
   *   the DB. When true, the resolved status is committed to the order.
   */
  async verifyAndUpdate(orderId: number, opts?: { apply?: boolean }) {
    const apply = opts?.apply === true;

    const order = await db.dataBase.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderNumber: true,
        paymentProvider: true,
        paymentId: true,
        paymentOrderId: true,
        paymentStatus: true,
        status: true,
      },
    });

    if (!order) {
      throw new AppError("Order not found", { statusCode: HttpStatus.NOT_FOUND });
    }
    if (order.paymentProvider !== "RAZORPAY") {
      throw new AppError("This order was not paid via Razorpay", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    // Prefer the exact payment id stored on the order; otherwise resolve one
    // from the Razorpay order id.
    let payment: RazorpayPayment | null = null;
    if (order.paymentId) {
      payment = await this.fetchPayment(order.paymentId);
    } else if (order.paymentOrderId) {
      const list = await this.fetchOrderPayments(order.paymentOrderId);
      payment =
        list.find((p) => p.status === "captured") ??
        list.find((p) => p.status === "authorized") ??
        list[0] ??
        null;
    } else {
      throw new AppError("No Razorpay payment reference on this order", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }

    const mapped = this.mapRazorpayStatus(payment?.status);
    // A definitive Razorpay status that actually differs from what's stored.
    const willChange = Boolean(mapped) && mapped!.paymentStatus !== order.paymentStatus;

    let applied = false;
    if (apply && mapped && willChange) {
      const data: Prisma.OrderUpdateInput = {
        paymentStatus: mapped.paymentStatus,
        status: mapped.orderStatus,
        paymentMetadata: {
          provider: "RAZORPAY",
          verifiedAt: new Date().toISOString(),
          razorpayPayment: payment as unknown as Prisma.InputJsonValue,
        } as Prisma.InputJsonValue,
      };
      // Backfill the payment id if we only had the razorpay order id.
      if (order.paymentId == null && payment?.id) {
        data.paymentId = payment.id;
      }
      await db.dataBase.order.update({ where: { id: order.id }, data });
      applied = true;
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayPaymentId: payment?.id ?? order.paymentId ?? null,
      razorpayStatus: payment?.status ?? null,
      /** Current DB payment status (before any apply). */
      currentPaymentStatus: order.paymentStatus,
      /** Status the order would/did move to (or current when no definitive status). */
      proposedPaymentStatus: mapped?.paymentStatus ?? order.paymentStatus,
      proposedOrderStatus: mapped?.orderStatus ?? order.status,
      /** Razorpay returned a final status (captured/failed/refunded). */
      hasDefinitiveStatus: Boolean(mapped),
      /** A definitive status that differs from the stored one (accept enabled). */
      willChange,
      /** Whether the DB was actually written in this call. */
      applied,
    };
  }
}
