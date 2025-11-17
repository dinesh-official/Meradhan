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

export default auditlogsRoutes;
