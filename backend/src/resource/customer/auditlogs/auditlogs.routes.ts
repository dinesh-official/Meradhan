import { Router } from "express";
import { AuditLogsController } from "./auditlogs.controller";
import { allowAccessMiddleware } from "@middlewares/auth_middleware";
import {
  meradhanTrackingLimiter,
  auditLogCreationLimiter,
  auditLogReadLimiter,
} from "./auditlogs.ratelimit";
import {
  auditLogPayloadLimit,
  enforceUserDataAccess,
} from "./auditlogs.middleware";

const auditlogsRoutes = Router();

const auditLogsController = new AuditLogsController();

// Payload size limits: 10KB for tracking endpoints, 5KB for activity creation
const trackingPayloadLimit = auditLogPayloadLimit(10 * 1024); // 10KB
const activityPayloadLimit = auditLogPayloadLimit(5 * 1024); // 5KB

// ==================== Meradhan Routes ====================
// Meradhan tracking endpoints - require USER authentication to prevent log injection/spam
// These track user activity, so authentication is required for security
auditlogsRoutes.post(
  "/api/auditlogs/meradhan/tracing/init",
  auditLogCreationLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("USER", "CRM"),
  (req, res) => auditLogsController.startMeradhanTracking(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/meradhan/page-tracking/start",
  auditLogCreationLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("USER", "CRM"),
  (req, res) => auditLogsController.startPageTrackingMeradhan(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/meradhan/page-tracking/end/:pageId",
  auditLogCreationLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("USER", "CRM"),
  (req, res) => auditLogsController.endPageTrackingMeradhan(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/meradhan/page-tracking/update/:pageId",
  auditLogCreationLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("USER", "CRM"),
  (req, res) => auditLogsController.updatePageTrackingMeradhan(req, res)
);

// Paginated logs for Meradhan - require USER authentication (users can see their own logs)
// Protected against IDOR: USER role can only query their own data
auditlogsRoutes.get(
  "/api/auditlogs/meradhan/activity-logs",
  auditLogReadLimiter,
  allowAccessMiddleware("USER", "CRM"),
  enforceUserDataAccess,
  (req, res) => auditLogsController.getActivityLogsMeradhan(req, res)
);

auditlogsRoutes.get(
  "/api/auditlogs/meradhan/login-logs",
  auditLogReadLimiter,
  allowAccessMiddleware("USER", "CRM"),
  enforceUserDataAccess,
  (req, res) => auditLogsController.getLoginLogsMeradhan(req, res)
);

auditlogsRoutes.get(
  "/api/auditlogs/meradhan/session-logs",
  auditLogReadLimiter,
  allowAccessMiddleware("USER", "CRM"),
  enforceUserDataAccess,
  (req, res) => auditLogsController.getSessionLogsMeradhan(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/meradhan/create/activity",
  auditLogCreationLimiter,
  activityPayloadLimit,
  allowAccessMiddleware("USER"),
  (req, res) => auditLogsController.createActivityLogMeradhan(req, res)
);

// ==================== Web Tracking Routes ====================
// Web tracking routes (webAuditLogs table) - for customer website tracking
// These routes are internal-only to prevent log injection/spam and protect customer data
// SECURITY: Require authentication (ADMIN or USER) - no unauthenticated writes allowed
// Note: If service token or IP-based access is needed, implement requireInternalAccess middleware
auditlogsRoutes.all(
  "/api/web/tracking",
  meradhanTrackingLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("CRM", "USER"), // Require authentication - no PUBLIC access
  async (req, res) => auditLogsController.createWebTracking(req, res)
);

auditlogsRoutes.all(
  "/api/web/tracking/revalidate",
  meradhanTrackingLimiter,
  trackingPayloadLimit,
  allowAccessMiddleware("CRM", "USER"), // Require authentication - no PUBLIC access
  async (req, res) => auditLogsController.revalidateWebTracking(req, res)
);

auditlogsRoutes.get(
  "/api/web/tracking/list",
  auditLogReadLimiter,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.getWebTrackingList(req, res)
);

auditlogsRoutes.get(
  "/api/web/tracking/group",
  auditLogReadLimiter,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.getWebGroupedTracking(req, res)
);

auditlogsRoutes.get(
  "/api/web/tracking/group/auth",
  auditLogReadLimiter,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.getWebAuthTracking(req, res)
);

auditlogsRoutes.get(
  "/api/web/tracking/group/unknown",
  auditLogReadLimiter,
  allowAccessMiddleware("CRM"),
  async (req, res) => auditLogsController.getWebUnknownTracking(req, res)
);

export default auditlogsRoutes;
