import cron from "node-cron";
import logger from "@utils/logger/logger";
import { PaymentReconciliationService } from "@services/payment/payment_reconciliation.service";
import { env } from "@root/config/env";

// Hourly reconciliation of pending Razorpay payments.
// Scheduled slightly off the hour to avoid overlapping with other top-of-hour jobs.
cron.schedule(
    "5 * * * *",
    async () => {
        const svc = new PaymentReconciliationService();
        try {
            // if (env.KRA_ENV == "UAT") {
            const result = await svc.reconcilePendingRazorpayOrders({
                lookbackHours: 72,
                maxOrders: 75,
            });
            logger.logInfo("Payment reconciliation cron completed", result as any);
            // }
        } catch (error) {
            logger.logError("Payment reconciliation cron failed", error);
        }
    },
    { timezone: "Asia/Kolkata" },
);

// Abandoned-order reconciliation: flips PENDING orders the customer never paid for
// (closed the Razorpay modal / network dropped, so no paymentId was ever set) to
// CANCELLED -> dashboard shows "Not completed". Recovers webhook-missed paid orders too.
// Runs every 15 minutes so the UI updates quickly; the frontend dismiss handler is the
// instant fast-path and this is the reliable backstop.
cron.schedule(
    "*/15 * * * *",
    async () => {
        const svc = new PaymentReconciliationService();
        try {
            const result = await svc.reconcileAbandonedRazorpayOrders({
                lookbackHours: 72,
                maxOrders: 100,
                graceMinutes: 30,
            });
            logger.logInfo("Abandoned-order reconciliation cron completed", result as any);
        } catch (error) {
            logger.logError("Abandoned-order reconciliation cron failed", error);
        }
    },
    { timezone: "Asia/Kolkata" },
);

