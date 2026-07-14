import type { Job } from "bull";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import { orderSettlementQueue } from "./queue/worker_queues";
import { OrderSettlementService } from "@services/order/order_settlement.service";
import logger from "@utils/logger/logger";

startQueueWorker(orderSettlementQueue, async (job: Job) => {
  const settlementService = new OrderSettlementService();
  // Resume-safe stage runner. Keep initiateOrderSettlement available for one-line rollback.
  const result = await settlementService.reconcileOrderSettlementByStages(
    job.data.id,
    job.data.isNetBanking,
    { forceResume: job.data.forceResume === true },
  );
  if (
    result.status === "failed" ||
    result.status === "max_attempts"
  ) {
    throw new Error(
      `Order settlement ${result.status} for order ${job.data.id}`,
    );
  }
  if (result.status === "skipped_locked") {
    logger.logInfo(
      `Order settlement job ${job.id} skipped — lock held for order ${job.data.id}`,
    );
  }
}, 1, {
  onCompleted(job) {
    logger.logInfo(`Order settlement job ${job.id} completed`);
  },
  onFailed(job, err) {
    logger.logError(`Order settlement job ${job.id} failed: ${err.message}`);
  },
  onError(err) {
    logger.logError(`Order settlement worker error: ${err.message}`);
  },
});
