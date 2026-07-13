import cron from "node-cron";
import logger from "@utils/logger/logger";
import { db } from "@core/database/database";
import {
  OrderPipelineStage,
  OrderStageStatus,
} from "@packages/config/constants";
import { OrderSettlementService } from "@services/order/order_settlement.service";
import { OrderStatus, PaymentStatus } from "@databases/generated/prisma/postgres";

/**
 * Backstop: resume stuck paid orders from the first incomplete/failed stage.
 * Primary path remains Redis orderSettlementQueue immediately after payment.
 */
cron.schedule(
  "*/30 * * * *",
  async () => {
    const settlementService = new OrderSettlementService();
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const waitingGrace = new Date(Date.now() - 15 * 60 * 1000);

    try {
      const candidates = await db.dataBase.order.findMany({
        where: {
          paymentStatus: PaymentStatus.COMPLETED,
          settlementStage: {
            in: [
              OrderPipelineStage.PAYMENT_DONE,
              OrderPipelineStage.ADD_ISIN,
              OrderPipelineStage.QUOTE_ACCEPT,
              OrderPipelineStage.DEAL_PROPOSE,
              OrderPipelineStage.DEAL_ACCEPT,
            ],
          },
          updatedAt: { lte: cutoff },
          status: {
            notIn: [
              OrderStatus.CANCELLED,
              OrderStatus.REJECTED,
              OrderStatus.EXPIRED,
              OrderStatus.SETTLED,
            ],
          },
          NOT: {
            orderStages: {
              some: {
                status: OrderStageStatus.WAITING,
                updatedAt: { gte: waitingGrace },
              },
            },
          },
        },
        select: {
          id: true,
          orderNumber: true,
          paymentMetadata: true,
        },
        take: 50,
        orderBy: { updatedAt: "asc" },
      });

      let processed = 0;
      let skipped = 0;
      let failed = 0;

      for (const order of candidates) {
        const meta = (order.paymentMetadata ?? {}) as Record<string, unknown>;
        const method =
          typeof meta.method === "string"
            ? meta.method
            : typeof (meta as { payload?: { payment?: { entity?: { method?: string } } } })
                  .payload?.payment?.entity?.method === "string"
              ? (meta as { payload: { payment: { entity: { method: string } } } })
                  .payload.payment.entity.method
              : null;
        const isNetBanking = method === "netbanking";

        try {
          const result = await settlementService.reconcileOrderSettlementByStages(
            order.id,
            isNetBanking,
          );
          if (result.status === "skipped_locked") skipped++;
          else if (result.status === "failed" || result.status === "max_attempts")
            failed++;
          else processed++;
        } catch (error) {
          failed++;
          logger.logError(
            `Order stage reconciliation cron failed for order ${order.orderNumber}`,
            error,
          );
        }
      }

      logger.logInfo("Order stage reconciliation cron completed", {
        checked: candidates.length,
        processed,
        skipped,
        failed,
      } as any);
    } catch (error) {
      logger.logError("Order stage reconciliation cron failed", error);
    }
  },
  { timezone: "Asia/Kolkata" },
);
