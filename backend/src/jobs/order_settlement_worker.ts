import type { Job } from "bull";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import { orderSettlementQueue } from "./queue/worker_queues";
import { OrderSettlementService } from "@services/order/order_settlement.service";
import logger from "@utils/logger/logger";
startQueueWorker(orderSettlementQueue, async (job: Job) => {
  const settlementService = new OrderSettlementService();
  await settlementService.initiateOrderSettlement(job.data.id);
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