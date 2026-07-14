import type { Job } from "bull";
import { orderSettlementQueue } from "@jobs/queue/worker_queues";
import { db } from "@core/database/database";
import {
  OrderStageReconciliationService,
  type OrderStageReconciliationRun,
} from "./order_stage_reconciliation.service";
import { OrderSettlementService } from "./order_settlement.service";

type QueueJobSnapshot = {
  jobId: string;
  orderId: number;
  orderNumber: string | null;
  state: string;
  at: string | null;
  failedReason: string | null;
};

export type SettlementJobOverview = {
  queue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
  currentJob: QueueJobSnapshot | null;
  lastJob: QueueJobSnapshot | null;
  lastReconciliation: OrderStageReconciliationRun | null;
  lastUpdate: {
    type: "order_settlement" | "reconciliation";
    at: string;
    label: string;
    orderId?: number;
    orderNumber?: string | null;
  } | null;
};

function jobTimestamp(job: Job): number {
  return (
    job.finishedOn ??
    job.processedOn ??
    (typeof job.timestamp === "number" ? job.timestamp : 0)
  );
}

async function toJobSnapshot(
  job: Job,
  state: string,
): Promise<QueueJobSnapshot> {
  const orderId = Number(job.data?.id);
  let orderNumber: string | null = null;

  if (Number.isFinite(orderId)) {
    const order = await db.dataBase.order.findUnique({
      where: { id: orderId },
      select: { orderNumber: true },
    });
    orderNumber = order?.orderNumber ?? null;
  }

  const atMs = job.finishedOn ?? job.processedOn ?? job.timestamp;
  const failedReason =
    typeof job.failedReason === "string" ? job.failedReason : null;

  return {
    jobId: String(job.id),
    orderId: Number.isFinite(orderId) ? orderId : 0,
    orderNumber,
    state,
    at: atMs ? new Date(atMs).toISOString() : null,
    failedReason,
  };
}

async function resumeOrderSettlementJob(orderId: number): Promise<{
  orderId: number;
  orderNumber: string;
  queued: boolean;
  jobId: string;
  resumeFromStage: string | null;
}> {
  const order = await db.dataBase.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      paymentMetadata: true,
    },
  });
  if (!order) {
    throw new Error("Order not found");
  }

  const meta = (order.paymentMetadata ?? {}) as Record<string, unknown>;
  const nestedMethod = (
    meta as { payload?: { payment?: { entity?: { method?: string } } } }
  ).payload?.payment?.entity?.method;
  const method =
    typeof meta.method === "string"
      ? meta.method
      : typeof nestedMethod === "string"
        ? nestedMethod
        : null;
  const isNetBanking = method === "netbanking";

  const settlementService = new OrderSettlementService();
  await settlementService.seedOrderStages(order.id, { isNetBanking });

  const stages = await db.dataBase.orderStage.findMany({
    where: { orderId: order.id },
    orderBy: { seq: "asc" },
    select: { stage: true, seq: true, status: true },
  });
  const next = stages.find((s) => s.status !== 1) ?? null;
  const resumeFromStage = next?.stage ?? null;

  const settlementJobId = `order-settlement-${order.id}`;
  if (!next) {
    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      queued: false,
      jobId: settlementJobId,
      resumeFromStage: null,
    };
  }

  const existingJob = await orderSettlementQueue.getJob(settlementJobId);
  if (existingJob) {
    const state = await existingJob.getState();
    if (state === "active" || state === "waiting" || state === "delayed") {
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        queued: false,
        jobId: settlementJobId,
        resumeFromStage,
      };
    }
    await existingJob.remove().catch(() => undefined);
  }

  await orderSettlementQueue.add(
    {
      type: "orderSettlement",
      id: order.id,
      isNetBanking,
      forceResume: true,
    },
    { jobId: settlementJobId },
  );

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    queued: true,
    jobId: settlementJobId,
    resumeFromStage,
  };
}

export class SettlementJobOverviewService {
  private reconciliationService = new OrderStageReconciliationService();

  async getOverview(): Promise<SettlementJobOverview> {
    const [counts, activeJobs, waitingJobs, completedJobs, failedJobs, lastReconciliation] =
      await Promise.all([
        orderSettlementQueue.getJobCounts(),
        orderSettlementQueue.getJobs(["active"], 0, 1),
        orderSettlementQueue.getJobs(["waiting"], 0, 1),
        orderSettlementQueue.getJobs(["completed"], 0, 5),
        orderSettlementQueue.getJobs(["failed"], 0, 5),
        this.reconciliationService.getLastRun(),
      ]);

    const currentRaw = activeJobs[0] ?? waitingJobs[0] ?? null;
    const currentState = activeJobs[0]
      ? "active"
      : waitingJobs[0]
        ? "waiting"
        : null;

    const recentCandidates: Array<{ job: Job; state: string }> = [
      ...completedJobs.map((job) => ({ job, state: "completed" })),
      ...failedJobs.map((job) => ({ job, state: "failed" })),
      ...(activeJobs[0] ? [{ job: activeJobs[0], state: "active" }] : []),
      ...(waitingJobs[0] ? [{ job: waitingJobs[0], state: "waiting" }] : []),
    ];

    recentCandidates.sort((a, b) => jobTimestamp(b.job) - jobTimestamp(a.job));
    const lastRaw = recentCandidates[0] ?? null;

    const [currentJob, lastJob] = await Promise.all([
      currentRaw && currentState
        ? toJobSnapshot(currentRaw, currentState)
        : Promise.resolve(null),
      lastRaw ? toJobSnapshot(lastRaw.job, lastRaw.state) : Promise.resolve(null),
    ]);

    let lastUpdate: SettlementJobOverview["lastUpdate"] = null;

    const jobAt = lastJob?.at ? Date.parse(lastJob.at) : 0;
    const reconAt = lastReconciliation?.at
      ? Date.parse(lastReconciliation.at)
      : 0;

    if (jobAt >= reconAt && lastJob?.at) {
      lastUpdate = {
        type: "order_settlement",
        at: lastJob.at,
        label:
          lastJob.orderNumber != null
            ? `Order ${lastJob.orderNumber}`
            : `Order #${lastJob.orderId}`,
        orderId: lastJob.orderId,
        orderNumber: lastJob.orderNumber,
      };
    } else if (lastReconciliation?.at) {
      lastUpdate = {
        type: "reconciliation",
        at: lastReconciliation.at,
        label: "Stage reconciliation batch",
      };
    }

    return {
      queue: {
        waiting: counts.waiting ?? 0,
        active: counts.active ?? 0,
        completed: counts.completed ?? 0,
        failed: counts.failed ?? 0,
        delayed: counts.delayed ?? 0,
      },
      currentJob,
      lastJob,
      lastReconciliation,
      lastUpdate,
    };
  }

  async rerunLastJob(): Promise<{
    action: "order_settlement" | "reconciliation";
    queued: boolean;
    orderId?: number;
    orderNumber?: string;
    jobId?: string;
    resumeFromStage?: string | null;
    reconciliation?: OrderStageReconciliationRun;
    message: string;
  }> {
    const overview = await this.getOverview();

    if (overview.queue.active > 0 && overview.currentJob) {
      return {
        action: "order_settlement",
        queued: false,
        orderId: overview.currentJob.orderId,
        orderNumber: overview.currentJob.orderNumber ?? undefined,
        jobId: overview.currentJob.jobId,
        message: "A settlement job is already running.",
      };
    }

    if (overview.lastUpdate?.type === "order_settlement" && overview.lastJob) {
      const orderId = overview.lastJob.orderId;
      if (!orderId) {
        throw new Error("Last settlement job has no order id");
      }

      const result = await resumeOrderSettlementJob(orderId);
      return {
        action: "order_settlement",
        queued: result.queued,
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        jobId: result.jobId,
        resumeFromStage: result.resumeFromStage,
        message: result.queued
          ? `Settlement re-queued for order ${result.orderNumber}.`
          : result.resumeFromStage
            ? `Settlement already queued or in progress for order ${result.orderNumber}.`
            : `Order ${result.orderNumber} settlement is already complete.`,
      };
    }

    const reconciliation = await this.reconciliationService.run("manual");
    return {
      action: "reconciliation",
      queued: true,
      reconciliation,
      message: "Stage reconciliation batch started.",
    };
  }

  async runReconciliation(): Promise<OrderStageReconciliationRun> {
    return this.reconciliationService.run("manual");
  }
}
