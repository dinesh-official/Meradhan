import { Router } from "express";
import { AuditLogsController } from "./auditlogs.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import { crmAuditLogLimiter } from "./auditlogs.ratelimit";
import { auditLogPayloadLimit } from "./auditlogs.middleware";

const auditlogsRoutes = Router();

const auditLogsController = new AuditLogsController();

// Payload size limits: 10KB for tracking endpoints
const trackingPayloadLimit = auditLogPayloadLimit(10 * 1024); // 10KB

// ==================== CRM Page Tracking Routes ====================
// CRM audit log routes - require ADMIN authentication
auditlogsRoutes.post(
  "/api/auditlogs/crm/page-tracking/start",
  crmAuditLogLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("CRM"),
  (req, res) => auditLogsController.startPageTracking(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/crm/page-tracking/end/:pageId",
  crmAuditLogLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("CRM"),
  (req, res) => auditLogsController.endPageTracking(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/crm/page-tracking/update/:pageId",
  crmAuditLogLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("CRM"),
  (req, res) => auditLogsController.updatePageTracking(req, res)
);

// Paginated logs - require ADMIN authentication
auditlogsRoutes.get(
  "/api/auditlogs/crm/login-logs",
  crmAuditLogLimiter,
  allowAccessMiddleware("CRM"),
  (req, res) => auditLogsController.getLoginLogsCrm(req, res)
);

auditlogsRoutes.get(
  "/api/auditlogs/crm/activity-logs",
  crmAuditLogLimiter,
  allowAccessMiddleware("CRM"),
  (req, res) => auditLogsController.getActivityLogsCrm(req, res)
);

auditlogsRoutes.get(
  "/api/auditlogs/crm/session-logs",
  crmAuditLogLimiter,
  allowAccessMiddleware("CRM"),
  (req, res) => auditLogsController.getSessionLogsCrm(req, res)
);

// ==================== CRM Tracking Routes ====================
// CRM tracking routes (crmAuditLogs table) - require ADMIN authentication
auditlogsRoutes.all(
  "/api/crm/tracking",
  crmAuditLogLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.createCrmTracking(req, res)
);

auditlogsRoutes.all(
  "/api/auditlogs/crm/close-session/:userId",
  async (req, res) => auditLogsController.clearCrmTrackingSession(req, res)
);

auditlogsRoutes.all(
  "/api/crm/tracking/revalidate",
  crmAuditLogLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.revalidateCrmTracking(req, res)
);

auditlogsRoutes.get(
  "/api/crm/tracking/list",
  crmAuditLogLimiter,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.getCrmTrackingList(req, res)
);

auditlogsRoutes.get(
  "/api/crm/tracking/group",
  crmAuditLogLimiter,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.getCrmGroupedTracking(req, res)
);

auditlogsRoutes.get(
  "/api/crm/tracking/group/auth",
  crmAuditLogLimiter,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.getCrmAuthTracking(req, res)
);

auditlogsRoutes.get(
  "/api/crm/tracking/group/unknown",
  crmAuditLogLimiter,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.getCrmUnknownTracking(req, res)
);

auditlogsRoutes.get(
  "/api/crm/tracking/users",
  crmAuditLogLimiter,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.getCrmTrackingUsers(req, res)
);

export default auditlogsRoutes;
