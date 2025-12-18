import type { appSchema } from "@root/schema";
import type z from "zod";
import { AuditLogRepository } from "./auditlog.repo";
import { db } from "@core/database/database";

type PageView = z.infer<typeof appSchema.auditlogsSchema.PageViewSchema> & {};

export class AuditLogsService {
  private auditLogRepo = new AuditLogRepository();

  // Service methods for CRM audit logs
  async createPageViewLogCrm(logData: PageView): Promise<number> {
    // Implementation for creating a CRM page view log
    return await this.auditLogRepo.createCrmPageViewLog({
      pagePath: logData.pagePath,
      sessionId: logData.sessionId,
      pageTitle: logData.pageTitle,
      entryTime: logData.entryTime,
      scrollDepth: logData.scrollDepth,
      interactions: logData.interactions,
      duration: logData.duration,
      exitTime: logData.exitTime,
      referrer: logData.referrer,
      userId: logData.userId,
    });
  }

  async endPageViewLogCrm(
    pageViewId: number,
    logData: PageView
  ): Promise<void> {
    // Implementation for ending a CRM page view log
    await this.auditLogRepo.updateCrmPageViewLog(pageViewId, {
      pagePath: logData.pagePath,
      sessionId: logData.sessionId,
      pageTitle: logData.pageTitle,
      entryTime: logData.entryTime,
      scrollDepth: logData.scrollDepth,
      interactions: logData.interactions,
      duration: logData.duration,
      exitTime: logData.exitTime,
      referrer: logData.referrer,
      userId: logData.userId,
    });
  }

  async updatePageViewLogCrm(
    pageViewId: number,
    logData: Partial<PageView>
  ): Promise<void> {
    // Implementation for updating a CRM page view log
    await this.auditLogRepo.updateCrmPageViewLog(pageViewId, logData);
  }

  /**
   * Retrieves paginated CRM login logs for a user within an optional date range.
   * @param userId - Optional user ID to filter by
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @param page - Page number (1-based)
   * @param pageSize - Number of records per page
   */
  async getCrmLoginLogs(
    userId?: number,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    pageSize: number = 20
  ) {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (safePage - 1) * safePageSize;
    const take = safePageSize;

    const where: Record<string, unknown> = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId !== undefined) {
      where.userId = userId;
    }

    const [total, logs] = await Promise.all([
      db.dataBase.loginLogsCrm.count({ where }),
      db.dataBase.loginLogsCrm.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);

    const data = await Promise.all(
      logs.map(async (log) => ({
        ...log,
        name: log.userId
          ? (
              await db.dataBase.cRMUserDataModel.findUnique({
                where: { id: log.userId },
                select: { name: true },
              })
            )?.name || "N/A"
          : "N/A",
        email: log.userId
          ? (
              await db.dataBase.cRMUserDataModel.findUnique({
                where: { id: log.userId },
                select: { email: true },
              })
            )?.email || "N/A"
          : "N/A",
      }))
    );

    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    return {
      data,
      meta: {
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  /**
   * Retrieves paginated CRM activity logs for a user within an optional date range.
   * @param userId - Optional user ID to filter by
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @param page - Page number (1-based)
   * @param pageSize - Number of records per page
   */
  async getCrmActivityLogs(
    userId?: number,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    pageSize: number = 20
  ) {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (safePage - 1) * safePageSize;
    const take = safePageSize;

    const where: Record<string, unknown> = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId !== undefined) {
      where.userId = userId;
    }

    const [total, data] = await Promise.all([
      db.dataBase.activityLogsCRM.count({ where }),
      db.dataBase.activityLogsCRM.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    return {
      data,
      meta: {
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  /**
   * Retrieves paginated session logs for a user within an optional date range, including associated page views.
   * @param userId - Optional user ID to filter by
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @param page - Page number (1-based)
   * @param pageSize - Number of records per page
   */
  async getSessionLogs(
    userId?: number,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    pageSize: number = 20
  ) {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (safePage - 1) * safePageSize;
    const take = safePageSize;

    const where: Record<string, unknown> = {
      startTime: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (userId !== undefined) {
      where.userId = userId;
    }

    const [total, sessions] = await Promise.all([
      db.dataBase.sessionLogsCRM.count({ where }),
      db.dataBase.sessionLogsCRM.findMany({
        where,
        orderBy: { startTime: "desc" },
        skip,
        take,
      }),
    ]);

    const sessionIds = sessions.map((s) => String(s.sessionToken));

    const pageViews = await db.dataBase.pageViewLogsCRM.findMany({
      where: {
        sessionId: {
          in: sessionIds,
        },
      },
      orderBy: {
        entryTime: "asc",
      },
    });

    const data = await Promise.all(
      sessions.map(async (session) => ({
        ...session,
        user: await db.dataBase.cRMUserDataModel.findUnique({
          where: { id: session.userId },
          select: { name: true, email: true },
        }),
        pageViews: pageViews.filter(
          (pv) => pv.sessionId == session.sessionToken
        ),
      }))
    );

    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    return {
      data,
      meta: {
        total,
        page: safePage,
        pageSize: safePageSize,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }
}
