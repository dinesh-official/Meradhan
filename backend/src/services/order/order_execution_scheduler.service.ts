import { db } from "@core/database/database";
import { orderSettlementQueue } from "@jobs/queue/worker_queues";
import logger from "@utils/logger/logger";

/**
 * 24/7 trading scheduler.
 *
 * Orders paid for outside market hours are reserved immediately but carry a
 * `scheduledExecutionAt` instant (the next market open). This service finds the
 * orders whose time has come and enqueues the existing settlement job for each,
 * so the unchanged settlement worker fires the NSE RFQ flow exactly as it does
 * for in-window orders.
 *
 * Idempotency: each order is claimed atomically by flipping
 * `scheduledExecutionAt` to null in a conditional updateMany. Only the run whose
 * update affects the row enqueues it, so overlapping cron runs never double-fire.
 */
export class OrderExecutionSchedulerService {
  async enqueueDueScheduledOrders(
    now: Date = new Date(),
  ): Promise<{ found: number; enqueued: number }> {
    const due = await db.dataBase.order.findMany({
      where: {
        scheduledExecutionAt: { not: null, lte: now },
        status: "APPLIED",
      },
      select: {
        id: true,
        paymentOrderId: true,
        paymentId: true,
        metadata: true,
      },
    });

    let enqueued = 0;

    for (const order of due) {
      // Atomic claim — only the run that clears scheduledExecutionAt enqueues.
      const claim = await db.dataBase.order.updateMany({
        where: { id: order.id, scheduledExecutionAt: { not: null } },
        data: { scheduledExecutionAt: null },
      });
      if (claim.count !== 1) continue;

      // The settlement worker only needs id + isNetBanking. isNetBanking is
      // derived from the Razorpay payment entity persisted into order.metadata
      // at capture time (updateOrderMetadata).
      const isNetBanking =
        (order.metadata as { method?: string } | null)?.method === "netbanking";

      try {
        const job = await orderSettlementQueue.add({
          type: "orderSettlement",
          id: order.id,
          paymentOrderId: order.paymentOrderId,
          paymentId: order.paymentId,
          isNetBanking,
        });
        enqueued++;
        logger.logInfo("Scheduled order enqueued for settlement", {
          orderId: order.id,
          jobId: job.id,
        });
      } catch (error) {
        // Re-arm so a later run retries this order instead of dropping it.
        await db.dataBase.order.update({
          where: { id: order.id },
          data: { scheduledExecutionAt: now },
        });
        logger.logError("Failed to enqueue scheduled order; re-armed", {
          orderId: order.id,
          error,
        });
      }
    }

    return { found: due.length, enqueued };
  }
}
