import type { appSchema } from "@root/schema";
import type z from "zod";
import { AuditLogRepository } from "./auditlog.repo";
import { db } from "@core/database/database";

type PageView = z.infer<typeof appSchema.auditlogsSchema.PageViewSchema> & {};

export class AuditLogsService {
  private auditLogRepo = new AuditLogRepository();

  // Service methods for audit logs
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

  // ==================== Meradhan Audit Log Services ====================

  async revalidateMeradhanSession(
    sessionToken: string,
    userId: number
  ): Promise<void> {
    await this.auditLogRepo.revalidateMeradhanSession(sessionToken, userId);
  }

  async createPageViewLogMeradhan(logData: PageView): Promise<number> {
    return await this.auditLogRepo.createMeradhanPageViewLog({
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

  async endPageViewLogMeradhan(
    pageViewId: number,
    logData: PageView
  ): Promise<void> {
    await this.auditLogRepo.updateMeradhanPageViewLog(pageViewId, {
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

  async updatePageViewLogMeradhan(
    pageViewId: number,
    logData: Partial<PageView>
  ): Promise<void> {
    await this.auditLogRepo.updateMeradhanPageViewLog(pageViewId, logData);
  }

  async getMeradhanActivityLogs(
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

    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (userId !== undefined) {
      where.userId = userId;
    }

    const [total, data] = await Promise.all([
      db.dataBase.activityLogsMeradhan.count({ where }),
      db.dataBase.activityLogsMeradhan.findMany({
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
   * Retrieves paginated Meradhan login logs within an optional date range.
   * @param userId - Optional user ID to filter by
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @param page - Page number (1-based)
   * @param pageSize - Number of records per page
   */
  async getMeradhanLoginLogs(
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

    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (userId !== undefined) {
      where.userId = userId;
    }

    const [total, data] = await Promise.all([
      db.dataBase.loginLogsMeradhan.count({ where }),
      db.dataBase.loginLogsMeradhan.findMany({
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
   * Retrieves paginated Meradhan session logs within an optional date range, including associated page views.
   * @param userId - Optional user ID to filter by
   * @param sessionToken - Optional session token to filter by
   * @param trackingToken - Optional tracking token to filter by
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @param page - Page number (1-based)
   * @param pageSize - Number of records per page
   */
  async getMeradhanSessionLogs(
    userId?: number,
    sessionToken?: string,
    trackingToken?: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    pageSize: number = 20
  ) {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (safePage - 1) * safePageSize;
    const take = safePageSize;

    const where: Record<string, unknown> = {};

    if (startDate || endDate) {
      where.startTime = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (userId !== undefined) {
      where.userId = userId;
    }

    if (sessionToken) {
      where.sessionToken = sessionToken;
    }

    if (trackingToken) {
      where.trackingToken = trackingToken;
    }

    const [total, sessions] = await Promise.all([
      db.dataBase.sessionLogsMeradhan.count({ where }),
      db.dataBase.sessionLogsMeradhan.findMany({
        where,
        orderBy: { startTime: "desc" },
        skip,
        take,
      }),
    ]);

    const sessionIds = sessions.map((s) => String(s.sessionToken));

    const pageViews = await db.dataBase.pageViewLogsMeradhan.findMany({
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
      sessions.map(async (session) => {
        let user = null;
        if (session.userId) {
          user = await db.dataBase.customerProfileDataModel.findUnique({
            where: { id: session.userId },
            select: { firstName: true, middleName: true, lastName: true },
          });
        }
        return {
          ...session,
          user,
          pageViews: pageViews.filter(
            (pv) => pv.sessionId == session.sessionToken
          ),
        };
      })
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
