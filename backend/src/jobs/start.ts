// cron Jobs
import "./cron/nseIsin_cron";
import "./cron/kyc_reports.cron";
import "./cron/payment_reconciliation.cron";
import "./cron/bond_reminders.cron";
import "./cron/order_execution.cron";

// Queue Worker - queues are initialized at startup in main.ts
import "./sms_worker";
import "./email_worker";
import "./bond_reminders_worker";

// Order Settlement Worker - not used
import "./order_settlement_worker";

// KRA Worker - not used
import "./kra_worker";

console.log("✅ All workers initialized successfully");
