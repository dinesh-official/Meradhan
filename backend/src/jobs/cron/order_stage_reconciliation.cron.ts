import cron from "node-cron";
import logger from "@utils/logger/logger";
import { OrderStageReconciliationService } from "@services/order/order_stage_reconciliation.service";

/**
 * Backstop: resume stuck paid orders from the first incomplete/failed stage.
 * Primary path remains Redis orderSettlementQueue immediately after payment.
 */
cron.schedule(
  "*/30 * * * *",
  async () => {
    const service = new OrderStageReconciliationService();
    try {
      await service.run("cron");
    } catch (error) {
      logger.logError("Order stage reconciliation cron failed", error);
    }
  },
  { timezone: "Asia/Kolkata" },
);
