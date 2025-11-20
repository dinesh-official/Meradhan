import { appSchema } from "@root/schema";
import { AuditLogsService } from "./auditlogs.service";
import type { Request, Response } from "express";
import { startMeradhanTrackingSession } from "./auditlog.repo";

export class AuditLogsController {
  private auditLogsService = new AuditLogsService();

  // Controller methods for audit logs
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

  // Controller methods for audit logs
  async endPageTracking(req: Request, res: Response): Promise<void> {
    if (!req.body) {
      res.end();
      return;
    }

    if (typeof req.body == "string") {
      req.body = JSON.parse(req.body);
    }

    const pageId = req.params.pageId;
    const logData = appSchema.auditlogsSchema.PageViewSchema.parse(req.body);
    await this.auditLogsService.endPageViewLogCrm(Number(pageId), logData);
    res.sendResponse({
      statusCode: 200,
      message: "CRM Page View Log Ended",
      success: true,
    });
  }

  // Controller methods for audit logs
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

    const logs = await this.auditLogsService.getCrmActivityLogs(
      userId,
      startDate,
      endDate,
      page,
      pageSize
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
}
