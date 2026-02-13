import { appSchema } from "@root/schema";
import { AuditLogsService } from "./auditlogs.service";
import {
  CrmTrackingService,
  type TrackingPayload,
  type RevalidatePayload,
  type AuditLogsListQuery,
  type GroupQuery,
} from "./tracking.service";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { endAuditLogSession } from "./auditlog.repo";

export class AuditLogsController {
  private auditLogsService = new AuditLogsService();
  private crmTrackingService = new CrmTrackingService();

  // Controller methods for CRM audit logs
  async startPageTracking(req: Request, res: Response): Promise<void> {
    const logData = appSchema.auditlogsSchema.PageViewSchema.parse(req.body);
    const pageViewId =
      await this.auditLogsService.createPageViewLogCrm(logData);
    res.sendResponse({
      statusCode: 200,
      message: "CRM Page View Log Created",
      success: true,
      responseData: { pageViewId },
    });
  }

  async endPageTracking(req: Request, res: Response): Promise<void> {
    if (!req.body) {
      res.end();
      return;
    }

    if (typeof req.body == "string") {
      req.body = JSON.parse(req.body);
    }

    const pageId = req.params.pageId;
    const logData = appSchema.auditlogsSchema.EndPageViewSchema.parse(req.body);
    await this.auditLogsService.endPageViewLogCrm(Number(pageId), logData);
    res.sendResponse({
      statusCode: 200,
      message: "CRM Page View Log Ended",
      success: true,
    });
  }

  async updatePageTracking(req: Request, res: Response): Promise<void> {
    const pageId = req.params.pageId;
    const logData = appSchema.auditlogsSchema.PageViewSchema.parse(req.body);
    await this.auditLogsService.updatePageViewLogCrm(Number(pageId), logData);
    res.sendResponse({
      statusCode: 200,
      message: "CRM Page View Log Updated",
      success: true,
    });
  }

  async getLoginLogsCrm(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : undefined;
    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

    const logs = await this.auditLogsService.getCrmLoginLogs(
      userId,
      startDate,
      endDate,
      page,
      pageSize
    );

    res.sendResponse({
      statusCode: 200,
      message: "CRM Login Logs Retrieved",
      success: true,
      responseData: logs,
    });
  }

  async getActivityLogsCrm(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : undefined;
    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
    const entityType =
      typeof req.query.entityType === "string"
        ? req.query.entityType
        : undefined;
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const logs = await this.auditLogsService.getCrmActivityLogs(
      userId,
      startDate,
      endDate,
      page,
      pageSize,
      entityType,
      search
    );

    res.sendResponse({
      statusCode: 200,
      message: "CRM Activity Logs Retrieved",
      success: true,
      responseData: logs,
    });
  }

  async getSessionLogsCrm(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : undefined;
    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

    const logs = await this.auditLogsService.getSessionLogs(
      userId,
      startDate,
      endDate,
      page,
      pageSize
    );

    res.sendResponse({
      statusCode: 200,
      message: "CRM Session Logs Retrieved",
      success: true,
      responseData: logs,
    });
  }

  // ==================== CRM Tracking Controllers ====================

  async createCrmTracking(req: Request, res: Response): Promise<void> {
    const payload = req.body?.[0] as TrackingPayload;
    await this.crmTrackingService.createTracking(payload);
    res.send("OK");
  }

  async revalidateCrmTracking(req: Request, res: Response): Promise<void> {
    const payload = req.body as RevalidatePayload;
    await this.crmTrackingService.revalidateTracking(payload);
    res.send("OK");
  }

  async clearCrmTrackingSession(req: Request, res: Response): Promise<void> {
    const body = req.body as { sessionId?: string; reason?: string } | undefined;
    const endReason =
      body?.reason === "inactivity"
        ? "Auto closed - inactivity"
        : "User closed session";
    await endAuditLogSession(req, {
      userId: Number(req.params.userId),
      endReason,
      success: true,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "CRM Tracking Session Cleared",
      success: true,
    });
  }

  async getCrmTrackingList(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as AuditLogsListQuery;
      const result = await this.crmTrackingService.getAuditLogsList(query);

      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error) {
      console.error("CRM Tracking List Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCrmGroupedTracking(req: Request, res: Response): Promise<void> {
    try {
      const query: GroupQuery = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        userId: req.query.userId as string,
        search: req.query.search as string,
      };

      const result = await this.crmTrackingService.getGroupedAuditLogs(query);

      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error) {
      console.error("CRM Tracking Group Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCrmAuthTracking(req: Request, res: Response): Promise<void> {
    try {
      const query: GroupQuery = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        userId: req.query.userId as string,
        search: req.query.search as string,
      };

      const result =
        await this.crmTrackingService.getAuthGroupedAuditLogs(query);

      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error) {
      console.error("CRM Tracking Group Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCrmUnknownTracking(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.crmTrackingService.getUnknownGroupedAuditLogs();

      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error) {
      console.error("CRM Tracking Unknown Group Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCrmTrackingUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.crmTrackingService.getAllUsers();

      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error) {
      console.error("CRM Users List Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
