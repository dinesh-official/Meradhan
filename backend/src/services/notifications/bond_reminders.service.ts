import { db } from "@core/database/database";
import {
  BondReminderType,
  BondReminderStatus,
  OrderStatus,
} from "@databases/generated/prisma/postgres";
import logger from "@utils/logger/logger";
import {
  couponReminderEmailQueue,
  maturityReminderEmailQueue,
} from "@jobs/queue/worker_queues";
import {
  addDaysUtcMidnight,
  couponAmountForHolding,
  formatIstDateLabel,
  formatRupees,
  fullCustomerName,
  isSettlementUnderShutPeriodForCoupon,
  istCalendarParts,
  istYmdToUtcMidnight,
  resolveSettlementDateForHolding,
  settleOrderLinkKeyFromOrder,
} from "./bond_reminders.helpers";

const SUPPORT_EMAIL = "support@meradhan.co";

/** Maturity offsets (days before maturityDateIst). 0 = maturity day. */
export type MaturityOffsetDays = 30 | 15 | 3 | 0;
/** Coupon offsets (days before dueDateIst). 0 = coupon day. */
export type CouponOffsetDays = 4 | 0;

export type BondRemindersScanSummary = {
  offsetDays: number;
  type: "MATURITY" | "COUPON";
  checked: number;
  queued: number;
  skippedNotVerified: number;
  skippedAlreadySent: number;
  skippedNoPeriodicCoupon: number;
  skippedUnderShutPeriod: number;
  errors: number;
};

type CouponAnchorMeta = {
  dueDate: Date;
  recordDateIst: Date | null;
  recordDays: number | null;
};

function maturityTypeFor(offsetDays: MaturityOffsetDays): BondReminderType {
  switch (offsetDays) {
    case 30:
      return BondReminderType.MATURITY_M_30;
    case 15:
      return BondReminderType.MATURITY_M_15;
    case 3:
      return BondReminderType.MATURITY_M_3;
    case 0:
      return BondReminderType.MATURITY_DAY;
  }
}

function couponTypeFor(offsetDays: CouponOffsetDays): BondReminderType {
  switch (offsetDays) {
    case 4:
      return BondReminderType.COUPON_D_MINUS_4;
    case 0:
      return BondReminderType.COUPON_DAY;
  }
}

export type MaturityEmailJobData = {
  logId: number;
  to: string;
  subject: string;
  customerName: string;
  isin: string;
  securityName: string;
  maturityDate: string;
  supportEmail: string;
};

export type CouponEmailJobData = {
  logId: number;
  to: string;
  subject: string;
  customerName: string;
  isin: string;
  securityName: string;
  couponDate: string;
  couponAmount: string;
  supportEmail: string;
};

export class BondRemindersService {
  /**
   * Scan settled holdings whose bond maturity falls exactly `offsetDays` days
   * after today (IST), upsert a dedupe row per (customer, ISIN, type, anchor),
   * and enqueue the email job for any newly inserted rows.
   */
  async enqueueMaturityForOffset(
    offsetDays: MaturityOffsetDays,
  ): Promise<BondRemindersScanSummary> {
    const summary: BondRemindersScanSummary = {
      offsetDays,
      type: "MATURITY",
      checked: 0,
      queued: 0,
      skippedNotVerified: 0,
      skippedAlreadySent: 0,
      skippedNoPeriodicCoupon: 0,
      skippedUnderShutPeriod: 0,
      errors: 0,
    };

    const { y, m, d } = istCalendarParts();
    const todayIstUtcMidnight = istYmdToUtcMidnight(y, m, d);
    const targetIst = addDaysUtcMidnight(todayIstUtcMidnight, offsetDays);
    const reminderType = maturityTypeFor(offsetDays);

    const bonds = await db.dataBase.bonds.findMany({
      where: { maturityDateIst: targetIst },
      select: { isin: true, bondName: true, maturityDateIst: true },
    });

    if (bonds.length === 0) {
      logger.logInfo("bond_reminders maturity scan: no bonds match target IST date", {
        offsetDays,
        targetIst: targetIst.toISOString(),
      });
      return summary;
    }

    const isinToBond = new Map(bonds.map((b) => [b.isin, b]));
    const isins = bonds.map((b) => b.isin);

    const holdings = await db.dataBase.customerBonds.findMany({
      where: {
        isin: { in: isins },
        order: { status: OrderStatus.SETTLED },
      },
      select: {
        id: true,
        isin: true,
        bondName: true,
        customerProfileId: true,
        customerProfile: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            emailAddress: true,
            utility: {
              select: { isEmailVerified: true, accountStatus: true },
            },
          },
        },
      },
    });

    summary.checked = holdings.length;

    for (const holding of holdings) {
      try {
        const bond = isinToBond.get(holding.isin);
        if (!bond?.maturityDateIst) continue;

        const profile = holding.customerProfile;
        if (!profile) continue;

        const isEligible =
          profile.utility?.isEmailVerified === true &&
          profile.utility?.accountStatus === "ACTIVE";

        if (!isEligible) {
          await this.recordSkipped({
            customerProfileId: profile.id,
            isin: holding.isin,
            reminderType,
            anchorDateIst: bond.maturityDateIst,
            scheduledForIst: todayIstUtcMidnight,
            reason: "email not verified or account inactive",
          });
          summary.skippedNotVerified += 1;
          continue;
        }

        const created = await this.tryCreateQueuedLog({
          customerProfileId: profile.id,
          isin: holding.isin,
          reminderType,
          anchorDateIst: bond.maturityDateIst,
          scheduledForIst: todayIstUtcMidnight,
        });

        if (!created) {
          summary.skippedAlreadySent += 1;
          continue;
        }

        const customerName = fullCustomerName(profile);
        const securityName = holding.bondName || bond.bondName || holding.isin;
        const payload: MaturityEmailJobData = {
          logId: created.id,
          to: profile.emailAddress,
          subject: `Bond Maturity Reminder – ISIN ${holding.isin}`,
          customerName,
          isin: holding.isin,
          securityName,
          maturityDate: formatIstDateLabel(bond.maturityDateIst),
          supportEmail: SUPPORT_EMAIL,
        };

        await maturityReminderEmailQueue.add(payload, {
          attempts: 3,
          backoff: { type: "exponential", delay: 60_000 },
          removeOnComplete: true,
          removeOnFail: 100,
        });

        summary.queued += 1;
      } catch (err) {
        summary.errors += 1;
        logger.logError("bond_reminders maturity enqueue failed", err);
      }
    }

    logger.logInfo("bond_reminders maturity scan complete", summary);
    return summary;
  }

  /**
   * Scan upcoming coupon events whose dueDateIst is exactly `offsetDays` after
   * today (IST), join with settled holdings on ISIN, and enqueue per-holding emails.
   */
  async enqueueCouponForOffset(
    offsetDays: CouponOffsetDays,
  ): Promise<BondRemindersScanSummary> {
    const summary: BondRemindersScanSummary = {
      offsetDays,
      type: "COUPON",
      checked: 0,
      queued: 0,
      skippedNotVerified: 0,
      skippedAlreadySent: 0,
      skippedNoPeriodicCoupon: 0,
      skippedUnderShutPeriod: 0,
      errors: 0,
    };

    const { y, m, d } = istCalendarParts();
    const todayIstUtcMidnight = istYmdToUtcMidnight(y, m, d);
    const targetIst = addDaysUtcMidnight(todayIstUtcMidnight, offsetDays);
    const reminderType = couponTypeFor(offsetDays);

    const couponRows = await db.dataBase.bondReferenceCouponPaymentDate.findMany({
      where: { dueDateIst: targetIst },
      select: {
        isin: true,
        dueDateIst: true,
        recordDateIst: true,
        recordDays: true,
      },
    });

    if (couponRows.length === 0) {
      logger.logInfo("bond_reminders coupon scan: no coupon rows match target IST date", {
        offsetDays,
        targetIst: targetIst.toISOString(),
      });
      return summary;
    }

    // Collapse duplicate (isin, dueDate) entries; keep shut-period fields for skip logic.
    const isinToCouponAnchor = new Map<string, CouponAnchorMeta>();
    for (const row of couponRows) {
      if (!row.dueDateIst) continue;
      if (!isinToCouponAnchor.has(row.isin)) {
        isinToCouponAnchor.set(row.isin, {
          dueDate: row.dueDateIst,
          recordDateIst: row.recordDateIst ?? null,
          recordDays:
            typeof row.recordDays === "number" && Number.isFinite(row.recordDays)
              ? row.recordDays
              : null,
        });
      }
    }

    const isins = [...isinToCouponAnchor.keys()];
    if (isins.length === 0) {
      return summary;
    }

    const bonds = await db.dataBase.bonds.findMany({
      where: { isin: { in: isins } },
      select: {
        isin: true,
        bondName: true,
        faceValue: true,
        couponRate: true,
        interestPaymentFrequency: true,
        interestPaymentMode: true,
      },
    });
    const isinToBond = new Map(bonds.map((b) => [b.isin, b]));

    const holdings = await db.dataBase.customerBonds.findMany({
      where: {
        isin: { in: isins },
        order: { status: OrderStatus.SETTLED },
      },
      select: {
        id: true,
        isin: true,
        bondName: true,
        quantity: true,
        purchaseDate: true,
        customerProfileId: true,
        order: {
          select: { bondDetails: true, reqOrderNumber: true, metadata: true },
        },
        customerProfile: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            emailAddress: true,
            utility: {
              select: { isEmailVerified: true, accountStatus: true },
            },
          },
        },
      },
    });

    const settleLinkKeys = [
      ...new Set(
        holdings
          .map((h) => (h.order ? settleOrderLinkKeyFromOrder(h.order) : undefined))
          .filter((k): k is string => k != null && k.length > 0),
      ),
    ];
    const modSettleDateByLinkKey = new Map<string, string>();
    if (settleLinkKeys.length > 0) {
      const settleRows = await db.dataBase.settleOrderModel.findMany({
        where: { orderNumber: { in: settleLinkKeys } },
        select: { orderNumber: true, modSettleDate: true },
      });
      for (const row of settleRows) {
        if (
          row.modSettleDate &&
          String(row.modSettleDate).trim() !== "" &&
          !modSettleDateByLinkKey.has(row.orderNumber)
        ) {
          modSettleDateByLinkKey.set(row.orderNumber, String(row.modSettleDate).trim());
        }
      }
    }

    summary.checked = holdings.length;

    for (const holding of holdings) {
      try {
        const couponAnchor = isinToCouponAnchor.get(holding.isin);
        if (!couponAnchor) continue;
        const dueDate = couponAnchor.dueDate;

        const bond = isinToBond.get(holding.isin);
        const couponAmount = bond
          ? couponAmountForHolding(bond, holding.quantity)
          : null;

        const profile = holding.customerProfile;
        if (!profile) continue;

        const linkKey = holding.order ? settleOrderLinkKeyFromOrder(holding.order) : undefined;
        const modSettleDate =
          linkKey != null ? modSettleDateByLinkKey.get(linkKey) : undefined;

        const settlementDate = resolveSettlementDateForHolding({
          modSettleDate,
          bondDetails: holding.order?.bondDetails,
          purchaseDate: holding.purchaseDate,
        });

        if (
          isSettlementUnderShutPeriodForCoupon({
            settlement: settlementDate,
            dueDate,
            recordDateIst: couponAnchor.recordDateIst,
            recordDays: couponAnchor.recordDays,
          })
        ) {
          await this.recordSkipped({
            customerProfileId: profile.id,
            isin: holding.isin,
            reminderType,
            anchorDateIst: dueDate,
            scheduledForIst: todayIstUtcMidnight,
            reason:
              "purchase settled during shut period for this coupon (no coupon due to buyer)",
          });
          summary.skippedUnderShutPeriod += 1;
          continue;
        }

        if (couponAmount === null) {
          await this.recordSkipped({
            customerProfileId: profile.id,
            isin: holding.isin,
            reminderType,
            anchorDateIst: dueDate,
            scheduledForIst: todayIstUtcMidnight,
            reason: "no periodic coupon (ON_MATURITY/UNKNOWN or missing inputs)",
          });
          summary.skippedNoPeriodicCoupon += 1;
          continue;
        }

        const isEligible =
          profile.utility?.isEmailVerified === true &&
          profile.utility?.accountStatus === "ACTIVE";

        if (!isEligible) {
          await this.recordSkipped({
            customerProfileId: profile.id,
            isin: holding.isin,
            reminderType,
            anchorDateIst: dueDate,
            scheduledForIst: todayIstUtcMidnight,
            reason: "email not verified or account inactive",
          });
          summary.skippedNotVerified += 1;
          continue;
        }

        const created = await this.tryCreateQueuedLog({
          customerProfileId: profile.id,
          isin: holding.isin,
          reminderType,
          anchorDateIst: dueDate,
          scheduledForIst: todayIstUtcMidnight,
        });

        if (!created) {
          summary.skippedAlreadySent += 1;
          continue;
        }

        const customerName = fullCustomerName(profile);
        const securityName = holding.bondName || bond?.bondName || holding.isin;
        const payload: CouponEmailJobData = {
          logId: created.id,
          to: profile.emailAddress,
          subject: `Upcoming Coupon Payment – ISIN ${holding.isin}`,
          customerName,
          isin: holding.isin,
          securityName,
          couponDate: formatIstDateLabel(dueDate),
          couponAmount: formatRupees(couponAmount),
          supportEmail: SUPPORT_EMAIL,
        };

        await couponReminderEmailQueue.add(payload, {
          attempts: 3,
          backoff: { type: "exponential", delay: 60_000 },
          removeOnComplete: true,
          removeOnFail: 100,
        });

        summary.queued += 1;
      } catch (err) {
        summary.errors += 1;
        logger.logError("bond_reminders coupon enqueue failed", err);
      }
    }

    logger.logInfo("bond_reminders coupon scan complete", summary);
    return summary;
  }

  /**
   * Attempt to insert a fresh QUEUED row for (customer, ISIN, type, anchorDate).
   * Returns the created row, or `null` if a row already exists for this event
   * (signals "do not re-send"). Relies on the model's unique constraint.
   */
  private async tryCreateQueuedLog(input: {
    customerProfileId: number;
    isin: string;
    reminderType: BondReminderType;
    anchorDateIst: Date;
    scheduledForIst: Date;
  }) {
    try {
      const row = await db.dataBase.bondReminderLog.create({
        data: {
          customerProfileId: input.customerProfileId,
          isin: input.isin,
          reminderType: input.reminderType,
          anchorDateIst: input.anchorDateIst,
          scheduledForIst: input.scheduledForIst,
          status: BondReminderStatus.QUEUED,
        },
        select: { id: true },
      });
      return row;
    } catch (err) {
      // P2002 unique constraint: already processed before — that's the dedupe path.
      const code = (err as { code?: string } | null)?.code;
      if (code === "P2002") {
        return null;
      }
      throw err;
    }
  }

  private async recordSkipped(input: {
    customerProfileId: number;
    isin: string;
    reminderType: BondReminderType;
    anchorDateIst: Date;
    scheduledForIst: Date;
    reason: string;
  }) {
    try {
      await db.dataBase.bondReminderLog.upsert({
        where: {
          uniq_customer_isin_event: {
            customerProfileId: input.customerProfileId,
            isin: input.isin,
            reminderType: input.reminderType,
            anchorDateIst: input.anchorDateIst,
          },
        },
        create: {
          customerProfileId: input.customerProfileId,
          isin: input.isin,
          reminderType: input.reminderType,
          anchorDateIst: input.anchorDateIst,
          scheduledForIst: input.scheduledForIst,
          status: BondReminderStatus.SKIPPED,
          errorMessage: input.reason,
        },
        update: {},
      });
    } catch (err) {
      logger.logError("bond_reminders failed to record SKIPPED", err);
    }
  }
}

