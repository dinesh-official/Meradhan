import type { Job } from "bull";
import { EmailCommunication } from "@communication/email_communication";
import { db } from "@core/database/database";
import { BondReminderStatus } from "@databases/generated/prisma/postgres";
import { meraDhanBondMaturityReminderEmailText } from "@emails/text/meraDhanBondMaturityReminderEmailText";
import { meraDhanBondCouponReminderEmailText } from "@emails/text/meraDhanBondCouponReminderEmailText";
import logger from "@utils/logger/logger";
import {
  couponReminderEmailQueue,
  maturityReminderEmailQueue,
} from "./queue/worker_queues";
import { startQueueWorker } from "./helper/start_queue_worker_helper";
import type {
  CouponEmailJobData,
  MaturityEmailJobData,
} from "@services/notifications/bond_reminders.service";

async function markSent(logId: number, messageId: string | undefined) {
  try {
    await db.dataBase.bondReminderLog.update({
      where: { id: logId },
      data: {
        status: BondReminderStatus.SENT,
        sentAt: new Date(),
        emailMessageId: messageId ?? null,
        errorMessage: null,
      },
    });
  } catch (err) {
    logger.logError("bond_reminders: failed to mark log SENT", err);
  }
}

async function markFailed(logId: number, err: unknown) {
  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : "unknown error";
  try {
    await db.dataBase.bondReminderLog.update({
      where: { id: logId },
      data: {
        status: BondReminderStatus.FAILED,
        errorMessage: message.slice(0, 1000),
      },
    });
  } catch (innerErr) {
    logger.logError("bond_reminders: failed to mark log FAILED", innerErr);
  }
}

startQueueWorker(maturityReminderEmailQueue, async (job: Job) => {
  const data = job.data as MaturityEmailJobData;

  // Re-check log row before sending so we never re-send a row that's already SENT
  // (covers the case where the cron re-enqueues due to misconfiguration).
  const log = await db.dataBase.bondReminderLog.findUnique({
    where: { id: data.logId },
    select: { id: true, status: true },
  });
  if (!log) {
    logger.logError("bond_reminders maturity: log row not found", { logId: data.logId });
    return;
  }
  if (log.status === BondReminderStatus.SENT) {
    logger.logInfo("bond_reminders maturity: already SENT, skipping", { logId: data.logId });
    return;
  }

  const emailer = new EmailCommunication();
  try {
    const messageId = await emailer.sendEmail({
      to: data.to,
      subject: data.subject,
      html: meraDhanBondMaturityReminderEmailText({
        customerName: data.customerName,
        isin: data.isin,
        securityName: data.securityName,
        maturityDate: data.maturityDate,
        supportEmail: data.supportEmail,
      }),
    });
    await markSent(data.logId, messageId);
  } catch (err) {
    await markFailed(data.logId, err);
    throw err;
  }
});

startQueueWorker(couponReminderEmailQueue, async (job: Job) => {
  const data = job.data as CouponEmailJobData;

  const log = await db.dataBase.bondReminderLog.findUnique({
    where: { id: data.logId },
    select: { id: true, status: true },
  });
  if (!log) {
    logger.logError("bond_reminders coupon: log row not found", { logId: data.logId });
    return;
  }
  if (log.status === BondReminderStatus.SENT) {
    logger.logInfo("bond_reminders coupon: already SENT, skipping", { logId: data.logId });
    return;
  }

  const emailer = new EmailCommunication();
  try {
    const messageId = await emailer.sendEmail({
      to: data.to,
      subject: data.subject,
      html: meraDhanBondCouponReminderEmailText({
        customerName: data.customerName,
        isin: data.isin,
        securityName: data.securityName,
        couponDate: data.couponDate,
        couponAmount: data.couponAmount,
        supportEmail: data.supportEmail,
      }),
    });
    await markSent(data.logId, messageId);
  } catch (err) {
    await markFailed(data.logId, err);
    throw err;
  }
});
