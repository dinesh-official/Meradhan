import { Router } from "express";
import { NseWebhookController } from "./webhook_notification.controller";

const router = Router();
const controller = new NseWebhookController();

// POST /api/webhook/nse/cbrics/notification
router.all("/api/webhook/nse/cbrics/notification", (req, res) =>
  controller.handleCbricsNotification(req, res)
);

// POST /api/webhook/nse/rfqs/notification
router.all("/api/webhook/nse/rfqs/notification", (req, res) =>
  controller.handleRfqsNotification(req, res)
);

export default router;
