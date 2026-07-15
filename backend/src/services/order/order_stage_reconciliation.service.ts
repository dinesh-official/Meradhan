import { db } from "@core/database/database";
import {
  OrderPipelineStage,
  OrderStageStatus,
} from "@packages/config/constants";
import { OrderStatus, PaymentStatus } from "@databases/generated/prisma/postgres";
import { cacheStorage } from "@store/redis_store";
import logger from "@utils/logger/logger";
import { OrderSettlementService } from "./order_settlement.service";

export const ORDER_STAGE_RECONCILIATION_LAST_RUN_KEY =
  "crm:order-stage-reconciliation:last-run";

export type ReconciliationTrigger = "cron" | "manual";

export type OrderStageReconciliationRun = {
  at: string;
  trigger: ReconciliationTrigger;
  checked: number;
  processed: number;
  skipped: number;
  failed: number;
};

export type OrderStageReconciliationResult = OrderStageReconciliationRun;

function resolvePaymentMethod(
  paymentMetadata: unknown,
): { method: string | null; isNetBanking: boolean } {
  const meta = (paymentMetadata ?? {}) as Record<string, unknown>;
  const nestedMethod = (
    meta as { payload?: { payment?: { entity?: { method?: string } } } }
  ).payload?.payment?.entity?.method;
  const method =
    typeof meta.method === "string"
      ? meta.method
      : typeof nestedMethod === "string"
        ? nestedMethod
        : null;
  return { method, isNetBanking: method === "netbanking" };
}

export class OrderStageReconciliationService {
  async getLastRun(): Promise<OrderStageReconciliationRun | null> {
    return cacheStorage.get<OrderStageReconciliationRun>(
      ORDER_STAGE_RECONCILIATION_LAST_RUN_KEY,
    );
  }

  async run(
    trigger: ReconciliationTrigger = "cron",
  ): Promise<OrderStageReconciliationResult> {
    const settlementService = new OrderSettlementService();
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const waitingGrace = new Date(Date.now() - 15 * 60 * 1000);

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
      const { isNetBanking } = resolvePaymentMethod(order.paymentMetadata);

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
          `Order stage reconciliation failed for order ${order.orderNumber}`,
          error,
        );
      }
    }

    const summary: OrderStageReconciliationResult = {
      at: new Date().toISOString(),
      trigger,
      checked: candidates.length,
      processed,
      skipped,
      failed,
    };

    await cacheStorage.set(ORDER_STAGE_RECONCILIATION_LAST_RUN_KEY, summary);

    logger.logInfo("Order stage reconciliation completed", summary as any);

    return summary;
  }
}
