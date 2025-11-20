import { Router } from "express";
import { AuditLogsController } from "./auditlogs.controller";

const auditlogsRoutes = Router();

const auditLogsController = new AuditLogsController();

auditlogsRoutes.post("/api/auditlogs/crm/page-tracking/start", (req, res) =>
  auditLogsController.startPageTracking(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/crm/page-tracking/end/:pageId",
  (req, res) => auditLogsController.endPageTracking(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/crm/page-tracking/update/:pageId",
  (req, res) => auditLogsController.updatePageTracking(req, res)
);

// Paginated logs
auditlogsRoutes.get("/api/auditlogs/crm/login-logs", (req, res) =>
  auditLogsController.getLoginLogsCrm(req, res)
);

auditlogsRoutes.get("/api/auditlogs/crm/activity-logs", (req, res) =>
  auditLogsController.getActivityLogsCrm(req, res)
);

auditlogsRoutes.get("/api/auditlogs/crm/session-logs", (req, res) =>
  auditLogsController.getSessionLogsCrm(req, res)
);

// ==================== Meradhan Routes ====================

auditlogsRoutes.post("/api/auditlogs/meradhan/tracing/init", (req, res) =>
  auditLogsController.startMeradhanTracking(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/meradhan/page-tracking/start",
  (req, res) => auditLogsController.startPageTrackingMeradhan(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/meradhan/page-tracking/end/:pageId",
  (req, res) => auditLogsController.endPageTrackingMeradhan(req, res)
);

auditlogsRoutes.post(
  "/api/auditlogs/meradhan/page-tracking/update/:pageId",
  (req, res) => auditLogsController.updatePageTrackingMeradhan(req, res)
);

// Paginated logs for Meradhan

auditlogsRoutes.get("/api/auditlogs/meradhan/activity-logs", (req, res) =>
  auditLogsController.getActivityLogsMeradhan(req, res)
);

auditlogsRoutes.get("/api/auditlogs/meradhan/login-logs", (req, res) =>
  auditLogsController.getLoginLogsMeradhan(req, res)
);

auditlogsRoutes.get("/api/auditlogs/meradhan/session-logs", (req, res) =>
  auditLogsController.getSessionLogsMeradhan(req, res)
);

export default auditlogsRoutes;
