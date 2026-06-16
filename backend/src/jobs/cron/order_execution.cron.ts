import cron from "node-cron";
import logger from "@utils/logger/logger";
import { isMarketOpen } from "@services/order/order-pricing-helper";
import { OrderExecutionSchedulerService } from "@services/order/order_execution_scheduler.service";

// 24/7 trading: submit after-hours orders to NSE once the market opens.
//
// Runs every 10 minutes, Monday–Friday (IST). The market-open guard is the real
// gate — it skips holidays and the minutes before 09:15 / after 16:45 — so the
// scheduler only enqueues when NSE is actually accepting trades.
cron.schedule(
  "*/10 * * * 1-5",
  async () => {
    const now = new Date();
    if (!isMarketOpen(now)) return;

    try {
      const result =
        await new OrderExecutionSchedulerService().enqueueDueScheduledOrders(
          now,
        );
      if (result.found > 0) {
        logger.logInfo(
          "Order execution scheduler run completed",
          result as unknown as Record<string, unknown>,
        );
      }
    } catch (error) {
      logger.logError("Order execution scheduler cron failed", error);
    }
  },
  { timezone: "Asia/Kolkata" },
);
