import cron from "node-cron";
import logger from "@utils/logger/logger";
import {
  BondRemindersService,
  type CouponOffsetDays,
  type MaturityOffsetDays,
} from "@services/notifications/bond_reminders.service";

const TZ_IST = { timezone: "Asia/Kolkata" } as const;

async function runMaturity(offsetDays: MaturityOffsetDays) {
  try {
    const svc = new BondRemindersService();
    const result = await svc.enqueueMaturityForOffset(offsetDays);
    logger.logInfo(
      `bond_reminders cron MATURITY M-${offsetDays} completed`,
      result as unknown as Record<string, unknown>,
    );
  } catch (err) {
    logger.logError(
      `bond_reminders cron MATURITY M-${offsetDays} failed`,
      err,
    );
  }
}

async function runCoupon(offsetDays: CouponOffsetDays) {
  try {
    const svc = new BondRemindersService();
    const result = await svc.enqueueCouponForOffset(offsetDays);
    logger.logInfo(
      `bond_reminders cron COUPON D-${offsetDays} completed`,
      result as unknown as Record<string, unknown>,
    );
  } catch (err) {
    logger.logError(
      `bond_reminders cron COUPON D-${offsetDays} failed`,
      err,
    );
  }
}

// Maturity reminders (anchor = Bonds.maturityDateIst). Staggered every 15 minutes
// so each tier has a clean log entry and we never collide with the KYC reports
// cron that also runs at 09:00 IST.
cron.schedule("0 9 * * *",  () => runMaturity(30), TZ_IST);
cron.schedule("15 9 * * *", () => runMaturity(15), TZ_IST);
cron.schedule("30 9 * * *", () => runMaturity(3),  TZ_IST);
cron.schedule("45 9 * * *", () => runMaturity(0),  TZ_IST);

// Coupon reminders (anchor = BondReferenceCouponPaymentDate.dueDateIst).
cron.schedule("0 8 * * *",  () => runCoupon(4), TZ_IST);
cron.schedule("30 8 * * *", () => runCoupon(0), TZ_IST);
