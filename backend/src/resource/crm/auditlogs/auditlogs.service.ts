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
    logData: { exitTime: Date; duration: number; scrollDepth: number; interactions: number }
  ): Promise<void> {
    await this.auditLogRepo.updateCrmPageViewLog(pageViewId, {
      exitTime: logData.exitTime,
      duration: logData.duration,
      scrollDepth: logData.scrollDepth,
      interactions: logData.interactions,
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
   * Uses name/email already stored on LoginLogsCrm at write time (no N+1 user lookups).
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

    const where: Record<string, unknown> = {};
    if (userId !== undefined) {
      where.userId = userId;
    }
    if (startDate != null && endDate != null) {
      where.createdAt = { gte: startDate, lte: endDate };
    }

    const [total, data] = await Promise.all([
      db.dataBase.loginLogsCrm.count({ where }),
      db.dataBase.loginLogsCrm.findMany({
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
   * Retrieves paginated CRM activity logs with optional filters.
   * Server-side filtering by date range, userId, entityType, and search (name, email, action, ipAddress).
   */
  async getCrmActivityLogs(
    userId?: number,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    pageSize: number = 20,
    entityType?: string,
    search?: string
  ) {
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
    const skip = (safePage - 1) * safePageSize;
    const take = safePageSize;

    const where: Record<string, unknown> = {};
    if (userId !== undefined) {
      where.userId = userId;
    }
    if (startDate != null && endDate != null) {
      where.createdAt = { gte: startDate, lte: endDate };
    }
    if (entityType != null && entityType.trim() !== "") {
      where.entityType = { equals: entityType.trim(), mode: "insensitive" };
    }
    if (search != null && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { action: { contains: term, mode: "insensitive" } },
        { ipAddress: { contains: term, mode: "insensitive" } },
      ];
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
   * Retrieves paginated session logs with optional date range. Uses batched user lookup and grouped page views (no N+1).
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

    const where: Record<string, unknown> = {};
    if (userId !== undefined) {
      where.userId = userId;
    }
    if (startDate != null && endDate != null) {
      where.startTime = { gte: startDate, lte: endDate };
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
    const userIds = [...new Set(sessions.map((s) => s.userId))];

    const [pageViews, users] = await Promise.all([
      db.dataBase.pageViewLogsCRM.findMany({
        where: { sessionId: { in: sessionIds } },
        orderBy: { entryTime: "asc" },
      }),
      userIds.length > 0
        ? db.dataBase.cRMUserDataModel.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, email: true },
        })
        : Promise.resolve([]),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));
    const pageViewsBySession = new Map<string, typeof pageViews>();
    for (const pv of pageViews) {
      const list = pageViewsBySession.get(pv.sessionId) ?? [];
      list.push(pv);
      pageViewsBySession.set(pv.sessionId, list);
    }

    const data = sessions.map((session) => ({
      ...session,
      user: userMap.get(session.userId) ?? null,
      pageViews: pageViewsBySession.get(String(session.sessionToken)) ?? [],
    }));

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
