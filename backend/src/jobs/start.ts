// cron Jobs
import "./cron/nseIsin_cron";

// Queue Worker - queues are initialized at startup in main.ts
import "./sms_worker";
import "./email_worker";

// Order Settlement Worker
import "./order_settlement_worker";

// KRA Worker
import "./kra_worker";

console.log("✅ All workers initialized successfully");
