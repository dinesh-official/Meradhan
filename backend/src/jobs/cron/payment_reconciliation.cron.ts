import cron from "node-cron";
import logger from "@utils/logger/logger";
import { PaymentReconciliationService } from "@services/payment/payment_reconciliation.service";
import { env } from "@packages/config/src/env";

// Hourly reconciliation of pending Razorpay payments.
// Scheduled slightly off the hour to avoid overlapping with other top-of-hour jobs.
cron.schedule(
    "5 * * * *",
    async () => {
        const svc = new PaymentReconciliationService();
        try {
            if (env.KRA_ENV == "UAT") {
                const result = await svc.reconcilePendingRazorpayOrders({
                    lookbackHours: 72,
                    maxOrders: 75,
                });
                logger.logInfo("Payment reconciliation cron completed", result as any);
            }
        } catch (error) {
            logger.logError("Payment reconciliation cron failed", error);
        }
    },
    { timezone: "Asia/Kolkata" },
);

