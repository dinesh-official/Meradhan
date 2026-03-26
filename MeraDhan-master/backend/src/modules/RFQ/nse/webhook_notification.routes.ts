import { Router } from "express";
import { withRateLimit } from "@middlewares/ratelimit_midddleare";
import { NseWebhookController } from "./webhook_notification.controller";

const router = Router();
const controller = new NseWebhookController();

// SECURITY: Rate limiting applied as temporary mitigation until signature verification is implemented
// TODO: Implement signature verification using NSE-provided secret
// TODO: Consider IP whitelisting for NSE webhook sources
const webhookRateLimiter = withRateLimit({
  max: 100, // Allow up to 100 requests per minute per IP
  min: 1,
  message:
    "Too many webhook requests. Please contact support if this is legitimate.",
});

// POST /api/webhook/nse/cbrics/notification
// SECURITY: ⚠️ Missing signature verification - see controller for details
router.all(
  "/api/webhook/nse/cbrics/notification",
  webhookRateLimiter,
  (req, res) => controller.handleCbricsNotification(req, res)
);

// POST /api/webhook/nse/rfqs/notification
// SECURITY: ⚠️ Missing signature verification - see controller for details
router.all(
  "/api/webhook/nse/rfqs/notification",
  webhookRateLimiter,
  (req, res) => controller.handleRfqsNotification(req, res)
);

export default router;
