import { Router } from "express";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import {
  requireAnyPermission,
  requirePermission,
} from "@middlewares/require_permission_middleware";
import { NotificationController } from "./notification.controller";

const router = Router();
const controller = new NotificationController();

const crm = allowAccessMiddleware("CRM");

router.post(
  "/api/crm/notifications/query-customers",
  crm,
  requirePermission("notifications.customer_list.view"),
  (req, res) => controller.queryCustomers(req, res)
);

router.post(
  "/api/crm/notifications/saved-lists",
  crm,
  requirePermission("notifications.lists.create"),
  (req, res) => controller.createSavedList(req, res)
);

router.get(
  "/api/crm/notifications/saved-lists",
  crm,
  requirePermission("notifications.lists.view"),
  (req, res) => controller.listSavedLists(req, res)
);

router.get(
  "/api/crm/notifications/saved-lists/:id",
  crm,
  requirePermission("notifications.lists.view"),
  (req, res) => controller.getSavedList(req, res)
);

router.patch(
  "/api/crm/notifications/saved-lists/:id",
  crm,
  requirePermission("notifications.lists.create"),
  (req, res) => controller.patchSavedList(req, res)
);

router.delete(
  "/api/crm/notifications/saved-lists/:id",
  crm,
  requirePermission("notifications.lists.delete"),
  (req, res) => controller.deleteSavedList(req, res)
);

router.get(
  "/api/crm/notifications/saved-lists/:id/members",
  crm,
  requirePermission("notifications.lists.view"),
  (req, res) => controller.getSavedListMembers(req, res)
);

router.delete(
  "/api/crm/notifications/saved-lists/:id/members/:customerProfileId",
  crm,
  requirePermission("notifications.lists.members.remove"),
  (req, res) => controller.removeSavedListMember(req, res)
);

router.post(
  "/api/crm/notifications/send",
  crm,
  requirePermission("notifications.send"),
  (req, res) => controller.send(req, res)
);

router.get(
  "/api/crm/notifications/sms-templates",
  crm,
  requirePermission("notifications.send"),
  (req, res) => controller.smsTemplates(req, res)
);

router.get(
  "/api/crm/notifications/logs",
  crm,
  requirePermission("notifications.logs.view"),
  (req, res) => controller.listLogs(req, res)
);

router.get(
  "/api/crm/notifications/logs/:logId/recipients",
  crm,
  requirePermission("notifications.logs.view"),
  (req, res) => controller.getLogRecipients(req, res)
);

router.get(
  "/api/crm/customers/:customerProfileId/notification-logs",
  crm,
  requirePermission("notifications.logs.view"),
  (req, res) => controller.customerLogs(req, res)
);

router.get(
  "/api/crm/notifications/templates",
  crm,
  requireAnyPermission("notifications.templates.view", "notifications.send"),
  (req, res) => controller.listTemplates(req, res)
);

router.post(
  "/api/crm/notifications/templates",
  crm,
  requirePermission("notifications.templates.create"),
  (req, res) => controller.createTemplate(req, res)
);

router.patch(
  "/api/crm/notifications/templates/:id",
  crm,
  requirePermission("notifications.templates.edit"),
  (req, res) => controller.updateTemplate(req, res)
);

router.delete(
  "/api/crm/notifications/templates/:id",
  crm,
  requirePermission("notifications.templates.delete"),
  (req, res) => controller.deleteTemplate(req, res)
);

export default router;
