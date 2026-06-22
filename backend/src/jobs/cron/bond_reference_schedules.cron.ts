import cron from "node-cron";
import logger from "@utils/logger/logger";
import { db } from "@core/database/database";
import { absoluteDataApiFromEnv } from "@modules/absolutedata/absolutedata.api";
import { BondReferenceDataService } from "@resource/crm/bonds/bond_reference_data.service";
import { EmailCommunication } from "@communication/email_communication";
import { env } from "@packages/config/src/env";

const TZ_IST = { timezone: "Asia/Kolkata" } as const;

const SUMMARY_EMAIL_TO =
  "sandeep.dhingra@meradhan.co,vikas.kukreja@meradhan.co,sourav@meradhan.co,mohammed.ali@meradhan.co,zahoor.ahmed@meradhan.co,dinesh.kumar@meradhan.co,sugandhan@meradhan.co";

function formatDateTime(date: Date): string {
  return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
}
async function runBondReferenceSchedulesSync() {
  if (!env.ABSOLUTE_DATA_API_KEY?.trim()) {
    logger.logInfo("bond_reference_schedules cron skipped: ABSOLUTE_DATA_API_KEY not set", {});
    return;
  }

  const startedAt = new Date();
  logger.logInfo("bond_reference_schedules cron started", {});

  const [couponIsins, redemptionIsins] = await Promise.all([
    db.dataBase.bondReferenceCouponPaymentDate.findMany({
      distinct: ["isin"],
      select: { isin: true },
    }),
    db.dataBase.bondReferenceRedemptionSchedule.findMany({
      distinct: ["isin"],
      select: { isin: true },
    }),
  ]);

  const isinSet = new Set<string>([
    ...couponIsins.map((r) => r.isin),
    ...redemptionIsins.map((r) => r.isin),
  ]);
  const isins = Array.from(isinSet);

  logger.logInfo(`bond_reference_schedules cron: processing ${isins.length} ISINs`, {});

  const api = absoluteDataApiFromEnv();
  const svc = new BondReferenceDataService();

  let succeeded = 0;
  let skipped = 0;
  let failed = 0;
  const failedIsins: string[] = [];

  for (const isin of isins) {
    try {
      const result = await api.getBondByIsin(isin);

      if (!result.ok || !result.data.items.length) {
        logger.logInfo(`bond_reference_schedules: no AD data for ${isin}, skipping`, {});
        skipped++;
        continue;
      }

      const adItem = result.data.items[0]!;

      // Guard: if AD returns the bond but both schedules are empty, skip rather
      // than wiping existing rows — empty schedule likely means data not available
      // from the source, not that the bond has no schedule.
      const hasScheduleData =
        (adItem.coupon.payment_schedule?.length ?? 0) > 0 ||
        (adItem.redemption_features.schedule?.length ?? 0) > 0;

      if (!hasScheduleData) {
        logger.logInfo(`bond_reference_schedules: AD returned empty schedules for ${isin}, skipping`, {});
        skipped++;
        continue;
      }

      await svc.upsertSchedulesFromAdItem(isin, adItem);
      succeeded++;
    } catch (err) {
      logger.logError(`bond_reference_schedules: failed for ISIN ${isin}`, err);
      failed++;
      failedIsins.push(isin);
    }

    // Avoid rate-limiting the AbsoluteData API
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const summary = {
    total: isins.length,
    succeeded,
    skipped,
    failed,
  };

  logger.logInfo("bond_reference_schedules cron completed", summary as unknown as Record<string, unknown>);

  // Send email summary
  const emailBody = `
Bond Reference Schedules Sync Summary
Ran at: ${formatDateTime(startedAt)} IST

Total ISINs processed : ${isins.length}
Updated successfully  : ${succeeded}
Skipped (no AD data)  : ${skipped}
Failed                : ${failed}
${failedIsins.length > 0
      ? `\nFailed ISINs:\n${failedIsins.join("\n")}`
      : ""
    }
  `.trim();

  try {
    const emailer = new EmailCommunication();
    await emailer.sendEmail({
      to: SUMMARY_EMAIL_TO,
      subject: `Bond Reference Schedules Sync ${formatDateTime(startedAt)}`,
      text: emailBody,
    });
  } catch (err) {
    logger.logError("bond_reference_schedules: failed to send summary email", err);
    console.log("Summary:\n", emailBody);
  }
}

// Run at 06:00 IST daily (before the 7 AM NSDL bond sync, no API overlap)
cron.schedule(
  "0 6 * * *",
  () => {
    runBondReferenceSchedulesSync().catch((err) =>
      logger.logError("bond_reference_schedules cron top-level error", err),
    );
  },
  TZ_IST,
);
