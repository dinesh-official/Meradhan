import { Router } from "express";
import { AuditLogsController } from "./audit_logs.controller";

const webAuditLogsRouter = Router();
const auditLogsController = new AuditLogsController();

webAuditLogsRouter.all("/api/web/tracking", async (req, res) => {
    await auditLogsController.createTracking(req, res);
});

webAuditLogsRouter.all("/api/web/tracking/revalidate", async (req, res) => {
    await auditLogsController.revalidateTracking(req, res);
});



webAuditLogsRouter.get("/api/web/tracking/list", async (req, res) => {
    await auditLogsController.getAuditLogsList(req, res);
});


webAuditLogsRouter.get("/api/web/tracking/group", async (req, res) => {
    await auditLogsController.getGroupedAuditLogs(req, res);
});


webAuditLogsRouter.get("/api/web/tracking/group/auth", async (req, res) => {
    await auditLogsController.getAuthAuditLogs(req, res);
});


webAuditLogsRouter.get("/api/web/tracking/group/unknown", async (req, res) => {
    await auditLogsController.getUnknownGroupedAuditLogs(req, res);
});

export default webAuditLogsRouter

