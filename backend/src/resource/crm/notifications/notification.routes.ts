import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { requireNotificationAccess } from "@middlewares/notification_access_middleware";
import { requireTemplateAdmin } from "@middlewares/notification_template_middleware";
import { NotificationController } from "./notification.controller";

const router = Router();
const controller = new NotificationController();

const gate = [allowAccessMiddleware("CRM"), requireNotificationAccess];

router.post("/api/crm/notifications/query-customers", ...gate, (req, res) =>
  controller.queryCustomers(req, res)
);

router.post("/api/crm/notifications/saved-lists", ...gate, (req, res) =>
  controller.createSavedList(req, res)
);

router.get("/api/crm/notifications/saved-lists", ...gate, (req, res) =>
  controller.listSavedLists(req, res)
);

router.get("/api/crm/notifications/saved-lists/:id", ...gate, (req, res) =>
  controller.getSavedList(req, res)
);

router.patch("/api/crm/notifications/saved-lists/:id", ...gate, (req, res) =>
  controller.patchSavedList(req, res)
);

router.delete("/api/crm/notifications/saved-lists/:id", ...gate, (req, res) =>
  controller.deleteSavedList(req, res)
);

router.get("/api/crm/notifications/saved-lists/:id/members", ...gate, (req, res) =>
  controller.getSavedListMembers(req, res)
);

router.delete(
  "/api/crm/notifications/saved-lists/:id/members/:customerProfileId",
  ...gate,
  (req, res) => controller.removeSavedListMember(req, res)
);

router.post("/api/crm/notifications/send", ...gate, (req, res) =>
  controller.send(req, res)
);

router.get("/api/crm/notifications/sms-templates", ...gate, (req, res) =>
  controller.smsTemplates(req, res)
);

router.get("/api/crm/notifications/logs", ...gate, (req, res) =>
  controller.listLogs(req, res)
);

router.get("/api/crm/notifications/logs/:logId/recipients", ...gate, (req, res) =>
  controller.getLogRecipients(req, res)
);

router.get(
  "/api/crm/customers/:customerProfileId/notification-logs",
  ...gate,
  (req, res) => controller.customerLogs(req, res)
);

/* ─── DLT Template routes ─────────────────────────────────── */
// All roles can read; only ADMIN/SUPER_ADMIN can write
router.get("/api/crm/notifications/templates", ...gate, (req, res) =>
  controller.listTemplates(req, res)
);
router.post("/api/crm/notifications/templates", ...gate, requireTemplateAdmin, (req, res) =>
  controller.createTemplate(req, res)
);
router.patch("/api/crm/notifications/templates/:id", ...gate, requireTemplateAdmin, (req, res) =>
  controller.updateTemplate(req, res)
);
router.delete("/api/crm/notifications/templates/:id", ...gate, requireTemplateAdmin, (req, res) =>
  controller.deleteTemplate(req, res)
);

export default router;
