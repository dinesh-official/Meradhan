import { db } from "@core/database/database";
import { orderSettlementQueue } from "@jobs/queue/worker_queues";
import {
  isMarketOpen,
  nextMarketOpen,
} from "@services/order/order-pricing-helper";
import { sendOrderReceivedEmail } from "@services/notifications/order_received_email";
import logger from "@utils/logger/logger";

type SettlementDispatchData = {
  orderId: number;
  paymentOrderId?: string | null;
  paymentId?: string | null;
  paymentEntity?: unknown;
  isNetBanking: boolean;
};

/**
 * Single decision point for submitting a paid order to NSE (24/7 trading).
 *
 * - Market open   -> enqueue the settlement job immediately (existing behaviour).
 * - Market closed -> schedule the trade for the next market open by setting
 *   Order.scheduledExecutionAt; the order_execution cron enqueues it then, and
 *   the customer gets the "order received" email.
 *
 * Every settlement entry point (payment webhook AND the payment reconciliation
 * cron, which recovers webhook-missed payments) must route through this so the
 * market-hours gate cannot be bypassed and the paths cannot drift apart.
 *
 * The scheduled branch is idempotent: it only sets scheduledExecutionAt and
 * sends the email the first time, so repeated reconciliation runs for the same
 * order neither re-schedule nor re-email the customer.
 */
export async function dispatchOrScheduleSettlement(
  data: SettlementDispatchData,
  now: Date = new Date(),
): Promise<{ scheduled: boolean }> {
  if (isMarketOpen(now)) {
    const job = await orderSettlementQueue.add({
      type: "orderSettlement",
      id: data.orderId,
      paymentOrderId: data.paymentOrderId,
      paymentId: data.paymentId,
      paymentEntity: data.paymentEntity,
      isNetBanking: data.isNetBanking,
    });
    logger.logInfo("Settlement queued immediately (market open)", {
      orderId: data.orderId,
      jobId: job.id,
    });
    return { scheduled: false };
  }

  const scheduledExecutionAt = nextMarketOpen(now);

  // Idempotent claim: only schedule + notify the first time. A repeated
  // reconciliation run finds scheduledExecutionAt already set -> no-op.
  const claim = await db.dataBase.order.updateMany({
    where: {
      id: data.orderId,
      scheduledExecutionAt: null,
      status: { in: ["APPLIED", "PENDING"] },
    },
    data: { scheduledExecutionAt },
  });

  if (claim.count === 1) {
    await sendOrderReceivedEmail({
      orderId: data.orderId,
      scheduledExecutionAt,
    });
    logger.logInfo("Order scheduled for next market open (market closed)", {
      orderId: data.orderId,
      scheduledExecutionAt: scheduledExecutionAt.toISOString(),
    });
  } else {
    logger.logInfo("Order already scheduled; skipping re-schedule/email", {
      orderId: data.orderId,
    });
  }

  return { scheduled: true };
}
