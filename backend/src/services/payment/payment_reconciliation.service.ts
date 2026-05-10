import { db } from "@core/database/database";
import type { Prisma } from "@databases/generated/prisma/postgres";
import { PaymentStatus } from "@databases/generated/prisma/postgres";
import { orderSettlementQueue } from "@jobs/queue/worker_queues";
import { SettlementStatus, SettlementStep } from "@packages/config/constants";
import { env } from "@packages/config/src/env";
import { OrderService } from "@resource/customer/order/order.service";
import logger from "@utils/logger/logger";
import axios from "axios";
import { S3DailyLogger } from "../../../log/s3logger";

type RazorpayPayment = {
  id: string;
  entity?: "payment";
  amount: number; // paisa
  currency?: string;
  order_id?: string;
  status?: string; // created | authorized | captured | failed | refunded
  method?: string;
  captured?: boolean;
  description?: string | null;
  error_code?: string | null;
  error_description?: string | null;
  error_source?: string | null;
  error_step?: string | null;
  error_reason?: string | null;
  acquirer_data?: unknown;
  created_at?: number;
};

type RazorpayTransfersResponse = {
  entity?: "collection";
  count?: number;
  items?: Array<{
    id: string;
    entity?: "transfer";
    source?: string;
    recipient?: string;
    amount?: number;
    currency?: string;
    status?: string; // pending | processed | failed | reversed | cancelled
    created_at?: number;
    processed_at?: number;
    notes?: Record<string, unknown>;
  }>;
};

const IST_TZ = "Asia/Kolkata";
const reconS3Logger = new S3DailyLogger({ s3Prefix: "log-files/payment-reconciliation" });

function s3Meta(base: Record<string, unknown>, extra?: Record<string, unknown>) {
  return { service: "payment-reconciliation", ...base, ...(extra ?? {}) };
}

function hoursAgoUtc(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function roundPaisaFromRupees(totalAmount: unknown): number | null {
  const n = typeof totalAmount === "number" ? totalAmount : Number(totalAmount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

function basicAuthHeader() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return null;
  const token = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString(
    "base64",
  );
  return `Basic ${token}`;
}

export class PaymentReconciliationService {
  private orderService = new OrderService();
  private authHeader = basicAuthHeader();

  /**
   * Hourly reconciliation of *pending* Razorpay orders.
   *
   * Goals:
   * - Verify Razorpay payment status (captured/failed/authorized/etc.)
   * - Verify Route transfers status (if any)
   * - Append audit logs into OrderLogs
   * - If payment is captured but webhook/settlement missed: queue settlement safely
   */
  async reconcilePendingRazorpayOrders(opts?: { lookbackHours?: number; maxOrders?: number }) {
    const lookbackHours = opts?.lookbackHours ?? 72;
    const maxOrders = opts?.maxOrders ?? 50;
    const minOrderAgeMinutes = 60;

    if (!this.authHeader) {
      logger.logError("Payment reconciliation skipped: Razorpay credentials missing");
      reconS3Logger.error(
        "Payment reconciliation skipped: Razorpay credentials missing",
        s3Meta({ lookbackHours, maxOrders }),
      );
      return { checked: 0, updated: 0, queuedSettlement: 0, skipped: 0 };
    }

    const since = hoursAgoUtc(lookbackHours);
    const now = new Date();
    const olderThan = new Date(now.getTime() - minOrderAgeMinutes * 60 * 1000);
    const recentReconcileCutoff = new Date(now.getTime() - 55 * 60 * 1000);

    reconS3Logger.info(
      "Payment reconciliation run started",
      s3Meta({
        lookbackHours,
        maxOrders,
        minOrderAgeMinutes,
        since: since.toISOString(),
        olderThan: olderThan.toISOString(),
        recentReconcileCutoff: recentReconcileCutoff.toISOString(),
      }),
    );

    const candidates = await db.dataBase.order.findMany({
      where: {
        paymentProvider: "RAZORPAY",
        paymentStatus: PaymentStatus.PENDING,
        createdAt: { gte: since, lt: olderThan },
        paymentId: { not: null },
      },
      orderBy: { createdAt: "asc" },
      take: maxOrders,
      select: {
        id: true,
        orderNumber: true,
        customerProfileId: true,
        paymentOrderId: true,
        paymentId: true,
        transferId: true,
        paymentStatus: true,
        status: true,
        totalAmount: true,
        metadata: true,
        createdAt: true,
      },
    });

    let updated = 0;
    let queuedSettlement = 0;
    let skipped = 0;

    reconS3Logger.info(
      "Payment reconciliation candidates fetched",
      s3Meta({ candidates: candidates.length }),
    );

    for (const order of candidates) {
      const paymentId = order.paymentId ?? "";
      if (!paymentId) {
        skipped++;
        reconS3Logger.warn(
          "Skipping candidate without paymentId",
          s3Meta({ orderId: order.id, orderNumber: order.orderNumber }),
        );
        continue;
      }

      const recentRecon = await db.dataBase.orderLogs.findFirst({
        where: {
          orderId: order.id,
          step: "PAYMENT_RECONCILIATION",
          createdAt: { gte: recentReconcileCutoff },
        },
        orderBy: { createdAt: "desc" },
      });
      if (recentRecon) {
        skipped++;
        reconS3Logger.info(
          "Skipping: reconciliation already ran recently",
          s3Meta({ orderId: order.id, orderNumber: order.orderNumber, paymentId }),
        );
        continue;
      }

      try {
        reconS3Logger.info(
          "Reconciling order payment (start)",
          s3Meta({
            orderId: order.id,
            orderNumber: order.orderNumber,
            paymentId,
            paymentOrderId: order.paymentOrderId,
            existingTransferId: order.transferId ?? null,
            orderPaymentStatus: order.paymentStatus,
            orderStatus: order.status,
            createdAt: order.createdAt.toISOString(),
          }),
        );

        await this.orderService.addOrderLog(order.id, "PAYMENT_RECONCILIATION", "PENDING", {
          at: new Date().toISOString(),
          timezone: IST_TZ,
        });

        const paymentBefore = await this.fetchPayment(paymentId);
        reconS3Logger.info(
          "Razorpay payment fetched",
          s3Meta({ orderId: order.id, orderNumber: order.orderNumber, paymentId }, { payment: paymentBefore }),
        );

        let payment = paymentBefore;
        if (payment?.status === "authorized") {
          const paisa = roundPaisaFromRupees(order.totalAmount);
          if (paisa) {
            await this.orderService.addOrderLog(
              order.id,
              "PAYMENT_RECONCILIATION_CAPTURE_ATTEMPT",
              "PENDING",
              { paymentId, amount: paisa },
            );
            reconS3Logger.info(
              "Razorpay capture attempt",
              s3Meta(
                { orderId: order.id, orderNumber: order.orderNumber, paymentId },
                { amountPaisa: paisa },
              ),
            );
            await this.capturePayment(paymentId, paisa).catch((e) => {
              logger.logError(`Razorpay capture failed for ${paymentId}`, e);
              reconS3Logger.error(
                "Razorpay capture failed",
                s3Meta(
                  { orderId: order.id, orderNumber: order.orderNumber, paymentId },
                  { error: e instanceof Error ? e.message : String(e) },
                ),
              );
            });
            payment = await this.fetchPayment(paymentId);
            reconS3Logger.info(
              "Razorpay payment re-fetched after capture attempt",
              s3Meta({ orderId: order.id, orderNumber: order.orderNumber, paymentId }, { payment }),
            );
          }
        }

        const transfers = await this.fetchTransfers(paymentId).catch(() => null);
        const transferId = transfers?.items?.[0]?.id;
        reconS3Logger.info(
          "Razorpay transfers fetched",
          s3Meta(
            { orderId: order.id, orderNumber: order.orderNumber, paymentId },
            { transfers },
          ),
        );

        const paymentStatusUpdate = this.mapRazorpayToPaymentStatus(payment);

        const updates: Prisma.OrderUpdateInput = {};
        if (transferId && !order.transferId) {
          updates.transferId = transferId;
        }

        if (paymentStatusUpdate) {
          updates.paymentStatus = paymentStatusUpdate.paymentStatus as any;
          updates.status = paymentStatusUpdate.orderStatus as any;
          updates.paymentMetadata = {
            provider: "RAZORPAY",
            reconciledAt: new Date().toISOString(),
            razorpayPayment: payment,
            razorpayTransfers: transfers,
          } as Prisma.InputJsonValue;
        } else {
          updates.paymentMetadata = {
            provider: "RAZORPAY",
            reconciledAt: new Date().toISOString(),
            razorpayPayment: payment,
            razorpayTransfers: transfers,
          } as Prisma.InputJsonValue;
        }

        if (Object.keys(updates).length) {
          await db.dataBase.order.update({ where: { id: order.id }, data: updates });
          updated++;
          reconS3Logger.info(
            "Order updated after reconciliation",
            s3Meta(
              { orderId: order.id, orderNumber: order.orderNumber, paymentId },
              { updates },
            ),
          );
        }

        await this.orderService.addOrderLog(
          order.id,
          "PAYMENT_RECONCILIATION",
          "SUCCESS",
          {
            paymentId,
            paymentStatus: payment?.status ?? null,
            transferId: transferId ?? order.transferId ?? null,
            transferCount: transfers?.count ?? null,
          },
          {
            razorpayPayment: payment,
            razorpayTransfers: transfers,
          },
        );

        // If payment is captured but settlement workflow hasn't started (webhook missed),
        // queue settlement safely.
        if (payment?.status === "captured") {
          const alreadyQueuedRecently = await db.dataBase.orderSettlementAutomationLog.findFirst({
            where: {
              paymentId,
              createdAt: { gte: hoursAgoUtc(2) },
            },
            orderBy: { createdAt: "desc" },
          });

          if (!alreadyQueuedRecently) {
            const missing = await this.findMissingSettlementSteps(order.id);
            const needsSettlement = missing.length > 0;
            if (needsSettlement) {
              reconS3Logger.warn(
                "Captured payment but settlement steps missing; queuing settlement",
                s3Meta(
                  { orderId: order.id, orderNumber: order.orderNumber, paymentId },
                  { missingSteps: missing },
                ),
              );
              await this.orderService.addOrderLog(
                order.id,
                "PAYMENT_RECONCILIATION_SETTLEMENT_QUEUE",
                "PENDING",
                { paymentId, missingSteps: missing },
              );

              const isNetBanking =
                typeof payment?.method === "string" ? payment.method === "netbanking" : false;

              await orderSettlementQueue.add({
                type: "orderSettlement",
                id: order.id,
                paymentOrderId: order.paymentOrderId,
                paymentId,
                paymentEntity: payment,
                isNetBanking,
              });

              queuedSettlement++;
              await this.orderService.addOrderLog(
                order.id,
                "PAYMENT_RECONCILIATION_SETTLEMENT_QUEUE",
                "SUCCESS",
                { paymentId, queued: true, missingSteps: missing },
              );
            } else {
              reconS3Logger.info(
                "Captured payment; settlement steps already present",
                s3Meta({ orderId: order.id, orderNumber: order.orderNumber, paymentId }),
              );
            }
          } else {
            reconS3Logger.info(
              "Captured payment; settlement already queued recently",
              s3Meta(
                { orderId: order.id, orderNumber: order.orderNumber, paymentId },
                { lastAutomationLogId: alreadyQueuedRecently.id },
              ),
            );
          }
        }
      } catch (error) {
        skipped++;
        await this.orderService.addOrderLog(
          order.id,
          "PAYMENT_RECONCILIATION",
          "FAILED",
          { paymentId },
          {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          },
        );
        reconS3Logger.error(
          "Payment reconciliation failed for order",
          s3Meta(
            { orderId: order.id, orderNumber: order.orderNumber, paymentId },
            {
              error: error instanceof Error ? error.message : "Unknown error",
              stack: error instanceof Error ? error.stack : undefined,
            },
          ),
        );
      }
    }

    reconS3Logger.info(
      "Payment reconciliation run completed",
      s3Meta({ checked: candidates.length, updated, queuedSettlement, skipped }),
    );
    return { checked: candidates.length, updated, queuedSettlement, skipped };
  }

  private async fetchPayment(paymentId: string): Promise<RazorpayPayment> {
    const { data } = await axios.get<RazorpayPayment>(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: { Authorization: this.authHeader! },
        timeout: 60_000,
      },
    );
    return data;
  }

  private async capturePayment(paymentId: string, amountPaisa: number) {
    const { data } = await axios.post(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/capture`,
      { amount: amountPaisa, currency: "INR" },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: this.authHeader!,
        },
        timeout: 60_000,
      },
    );
    return data;
  }

  private async fetchTransfers(paymentId: string): Promise<RazorpayTransfersResponse> {
    const { data } = await axios.get<RazorpayTransfersResponse>(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/transfers`,
      {
        headers: { Authorization: this.authHeader! },
        timeout: 60_000,
      },
    );
    return data;
  }

  private mapRazorpayToPaymentStatus(payment: RazorpayPayment | null | undefined): null | {
    paymentStatus: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
    orderStatus: "PENDING" | "APPLIED" | "REJECTED";
  } {
    const s = payment?.status;
    if (!s) return null;

    if (s === "captured") return { paymentStatus: "COMPLETED", orderStatus: "APPLIED" };
    if (s === "failed") return { paymentStatus: "CANCELLED", orderStatus: "REJECTED" };
    if (s === "refunded") return { paymentStatus: "REFUNDED", orderStatus: "REJECTED" };

    // created | authorized and others -> still pending
    return null;
  }

  private async findMissingSettlementSteps(orderId: number) {
    const required = [
      SettlementStep.ADD_ISIN,
      SettlementStep.ACCEPT_NEGOTIATION,
      SettlementStep.PROPOSE_DEAL,
      SettlementStep.ACCEPT_OR_REJECT_DEAL,
      SettlementStep.UPDATE_ORDER_STATUS,
    ];

    const logs = await db.dataBase.orderLogs.findMany({
      where: {
        orderId,
        step: { in: required },
        status: SettlementStatus.SUCCESS,
      },
      select: { step: true },
    });

    const done = new Set(logs.map((l) => l.step));
    return required.filter((s) => !done.has(s));
  }
}

