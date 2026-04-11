import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { NseNotificationsController } from "./nse_notifications.controller";

const router = Router();
const controller = new NseNotificationsController();

router.get(
  "/api/crm/rfq/nse/notifications/webhook",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.listWebhook(req, res),
);

router.get(
  "/api/crm/rfq/nse/notifications/cbrics",
  allowAccessMiddleware("CRM"),
  (req, res) => controller.listCbrics(req, res),
);

export default router;
