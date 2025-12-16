import type { Job } from "bull";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import { orderSettlementQueue } from "./queue/worker_queues";
import { OrderSettlementService } from "@services/order/order_settlement.service";

startQueueWorker(orderSettlementQueue, async (job: Job) => {
  const settlementService = new OrderSettlementService();
  const { orderId } = job.data;

  console.log(`Processing settlement for order: ${orderId}`);

  await settlementService.initiateOrderSettlement(orderId);
});
