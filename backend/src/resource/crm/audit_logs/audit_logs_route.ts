import { Router } from "express";
import { AuditLogsController } from "./audit_logs.controller";

const auditLogsRouter = Router();
const auditLogsController = new AuditLogsController();

auditLogsRouter.all("/api/crm/tracking", async (req, res) => {
    await auditLogsController.createTracking(req, res);
});

auditLogsRouter.all("/api/crm/tracking/revalidate", async (req, res) => {
    await auditLogsController.revalidateTracking(req, res);
});



auditLogsRouter.get("/api/crm/tracking/list", async (req, res) => {
    await auditLogsController.getAuditLogsList(req, res);
});


auditLogsRouter.get("/api/crm/tracking/group", async (req, res) => {
    await auditLogsController.getGroupedAuditLogs(req, res);
});


auditLogsRouter.get("/api/crm/tracking/group/auth", async (req, res) => {
    await auditLogsController.getAuthAuditLogs(req, res);
});


auditLogsRouter.get("/api/crm/tracking/group/unknown", async (req, res) => {
    await auditLogsController.getUnknownGroupedAuditLogs(req, res);
});

auditLogsRouter.get("/api/crm/tracking/users", async (req, res) => {
    await auditLogsController.getAllUsers(req, res);
});

export default auditLogsRouter

