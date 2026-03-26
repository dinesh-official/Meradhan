import { appSchema } from "@root/schema";
import { AuditLogsService } from "./auditlogs.service";
import {
  WebTrackingService,
  type TrackingPayload,
  type RevalidatePayload,
  type AuditLogsListQuery,
  type GroupQuery,
} from "./web-tracking.service";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import {
  crateMeradhanActivityLog,
  startMeradhanTrackingSession,
} from "./auditlog.repo";

export class AuditLogsController {
  private auditLogsService = new AuditLogsService();
  private webTrackingService = new WebTrackingService();

  // ==================== Meradhan Controllers ====================

  async startMeradhanTracking(req: Request, res: Response): Promise<void> {
    const logData = appSchema.auditlogsSchema.PageViewSchema.parse(req.body);

    // Session is required for Meradhan
    if (!logData.sessionId) {
      res.sendResponse({
        statusCode: 400,
        message: "Session ID is required",
        success: false,
      });
      return;
    }

    const pageViewId = startMeradhanTrackingSession(req, {
      userId: logData.userId,
      sessionId: logData.sessionId,
    });

    res.sendResponse({
      statusCode: 200,
      message: "Meradhan Page View Log Created",
      success: true,
      responseData: { pageViewId },
    });
  }

  async startPageTrackingMeradhan(req: Request, res: Response): Promise<void> {
    const logData = appSchema.auditlogsSchema.PageViewSchema.parse(req.body);

    // Session is required for Meradhan
    if (!logData.sessionId) {
      res.sendResponse({
        statusCode: 400,
        message: "Session ID is required",
        success: false,
      });
      return;
    }

    const pageViewId =
      await this.auditLogsService.createPageViewLogMeradhan(logData);
    res.sendResponse({
      statusCode: 200,
      message: "Meradhan Page View Log Created",
      success: true,
      responseData: { pageViewId },
    });
  }

  async endPageTrackingMeradhan(req: Request, res: Response): Promise<void> {
    if (!req.body) {
      res.end();
      return;
    }

    if (typeof req.body == "string") {
      req.body = JSON.parse(req.body);
    }

    const pageId = req.params.pageId;
    const logData = appSchema.auditlogsSchema.PageViewSchema.parse(req.body);

    // Session is required for Meradhan
    if (!logData.sessionId) {
      res.sendResponse({
        statusCode: 400,
        message: "Session ID is required",
        success: false,
      });
      return;
    }

    await this.auditLogsService.endPageViewLogMeradhan(Number(pageId), logData);
    res.sendResponse({
      statusCode: 200,
      message: "Meradhan Page View Log Ended",
      success: true,
    });
  }

  async updatePageTrackingMeradhan(req: Request, res: Response): Promise<void> {
    const pageId = req.params.pageId;
    const logData = appSchema.auditlogsSchema.PageViewSchema.parse(req.body);
    await this.auditLogsService.updatePageViewLogMeradhan(
      Number(pageId),
      logData
    );
    res.sendResponse({
      statusCode: 200,
      message: "Meradhan Page View Log Updated",
      success: true,
    });
  }

  async getActivityLogsMeradhan(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : undefined;
    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

    const logs = await this.auditLogsService.getMeradhanActivityLogs(
      userId,
      startDate,
      endDate,
      page,
      pageSize
    );

    res.sendResponse({
      statusCode: 200,
      message: "Meradhan Activity Logs Retrieved",
      success: true,
      responseData: logs,
    });
  }

  async getLoginLogsMeradhan(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : undefined;
    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

    const logs = await this.auditLogsService.getMeradhanLoginLogs(
      userId,
      startDate,
      endDate,
      page,
      pageSize
    );

    res.sendResponse({
      statusCode: 200,
      message: "Meradhan Login Logs Retrieved",
      success: true,
      responseData: logs,
    });
  }

  async getSessionLogsMeradhan(req: Request, res: Response): Promise<void> {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const sessionToken = req.query.sessionToken
      ? String(req.query.sessionToken)
      : undefined;
    const trackingToken = req.query.trackingToken
      ? String(req.query.trackingToken)
      : undefined;
    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : undefined;
    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

    const logs = await this.auditLogsService.getMeradhanSessionLogs(
      userId,
      sessionToken,
      trackingToken,
      startDate,
      endDate,
      page,
      pageSize
    );

    res.sendResponse({
      statusCode: 200,
      message: "Meradhan Session Logs Retrieved",
      success: true,
      responseData: logs,
    });
  }

  async createActivityLogMeradhan(req: Request, res: Response): Promise<void> {
    const activityLogId = await crateMeradhanActivityLog(req, {
      userId: req.customer!.id,
      action: req.body.action,
      details: req.body.details,
      entityType: req.body.entityType,
      entityId: req.body.entityId,
    });

    res.sendResponse({
      statusCode: 200,
      message: "Meradhan Activity Log Created",
      success: true,
      responseData: { activityLogId },
    });
  }

  // ==================== Web Tracking Controllers ====================

  async createWebTracking(req: Request, res: Response): Promise<void> {
    const payload = req.body?.[0] as TrackingPayload;
    await this.webTrackingService.createTracking(payload);
    res.send("OK");
  }

  async revalidateWebTracking(req: Request, res: Response): Promise<void> {
    const payload = req.body as RevalidatePayload;
    await this.webTrackingService.revalidateTracking(payload);
    res.send("OK");
  }

  async getWebTrackingList(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query as AuditLogsListQuery;
      const result = await this.webTrackingService.getAuditLogsList(query);

      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error) {
      console.error("Web Tracking List Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getWebGroupedTracking(req: Request, res: Response): Promise<void> {
    try {
      const query: GroupQuery = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        userId: req.query.userId as string,
        search: req.query.search as string,
      };

      const result = await this.webTrackingService.getGroupedAuditLogs(query);

      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error) {
      console.error("Web Tracking Group Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getWebAuthTracking(req: Request, res: Response): Promise<void> {
    try {
      const query: GroupQuery = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        userId: req.query.userId as string,
        search: req.query.search as string,
      };

      const result =
        await this.webTrackingService.getAuthGroupedAuditLogs(query);

      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error) {
      console.error("Web Tracking Group Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getWebUnknownTracking(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.webTrackingService.getUnknownGroupedAuditLogs();

      res.sendResponse({
        statusCode: HttpStatus.OK,
        responseData: result,
      });
    } catch (error) {
      console.error("Web Tracking Unknown Group Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
