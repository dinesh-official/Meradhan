/* eslint-disable @typescript-eslint/no-explicit-any */
import { type DataBaseSchema } from "@core/database/database";
import { CrmTrackingRepo } from "./tracking.repo";

export interface TrackingPayload {
  type?: string;
  props?: any;
  time?: string;
  ts?: number;
  trackId?: string;
}

export interface RevalidatePayload {
  trackId: string;
  token: string;
  userId: number;
}

export interface AuditLogsListQuery {
  page?: string;
  limit?: string;
  search?: string;
  userId?: string;
  type?: string;
  fromDate?: string;
  toDate?: string;
}

export interface GroupQuery {
  page?: number;
  limit?: number;
  userId?: string;
  search?: string;
}

/**
 * Service for CRM tracking audit logs
 */
export class CrmTrackingService {
  private auditLogsRepo: CrmTrackingRepo;
  private auth_list = [
    "login",
    "logout",
    "auto_logout",
    "otp_request",
    "otp_verify",
    "session",
  ];

  constructor() {
    this.auditLogsRepo = new CrmTrackingRepo();
  }

  async createTracking(payload: TrackingPayload) {
    if (!payload?.type) {
      return null;
    }

    const token = payload?.props?.token;
    const propsWithoutToken = { ...payload.props };
    delete propsWithoutToken.token;

    const auditLogData: DataBaseSchema.CrmAuditLogsCreateInput = {
      type: payload.type,
      data: propsWithoutToken,
      url:
        payload.type === "page_duration"
          ? payload.props?.from || payload.props?.url
          : payload.props?.url,
      createdAt: payload.time ? new Date(payload.ts!) : undefined,
      userId: payload.props?.userId,
      token: token,
      trackId: payload.trackId,
    };

    return await this.auditLogsRepo.createAuditLog(auditLogData);
  }

  async revalidateTracking(payload: RevalidatePayload) {
    if (!payload?.trackId || !payload?.userId) {
      return null;
    }

    return await this.auditLogsRepo.updateAuditLogsByTrackId(payload.trackId, {
      userId: payload.userId,
      token: payload.token,
    });
  }

  async getAuditLogsList(query: AuditLogsListQuery) {
    const pageNum = parseInt(query.page || "1", 10);
    const limitNum = parseInt(query.limit || "10", 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter dynamically
    const where: DataBaseSchema.CrmAuditLogsWhereInput = {};

    if (query.userId) where.userId = Number(query.userId);
    if (query.type) where.type = String(query.type);

    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    if (query.search) {
      const searchNum = Number(query.search);
      where.OR = [
        { type: { contains: String(query.search), mode: "insensitive" } },
        { token: { contains: String(query.search), mode: "insensitive" } },
        { url: { contains: String(query.search), mode: "insensitive" } },
        // Search by userId if the search term is a number
        ...(Number.isInteger(searchNum) && searchNum > 0
          ? [{ userId: searchNum }]
          : []),
      ];
    }

    // Fetch records and count in parallel
    const [records, total] = await Promise.all([
      this.auditLogsRepo.findManyAuditLogs({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        omit: {
          token: true,
        },
      }),
      this.auditLogsRepo.countAuditLogs({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
      data: records,
    };
  }

  async getGroupedAuditLogs(query: GroupQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const baseWhere: DataBaseSchema.CrmAuditLogsWhereInput = {
      trackId: { not: null },
      type: {
        notIn: this.auth_list,
      },
    };

    // Add userId filter if provided
    if (query.userId) {
      baseWhere.userId = Number(query.userId);
    }

    // Count Unique Sessions
    const totalGroups = await this.auditLogsRepo.groupByTrackId({
      by: ["trackId"],
      where: baseWhere,
    });

    // Paginated groups
    const groups = await this.auditLogsRepo.groupByTrackId({
      by: ["trackId"],
      _count: { trackId: true },
      where: baseWhere,
      orderBy: {
        _count: { trackId: "desc" },
      },
      skip,
      take: limit,
    });

    const sessions = await Promise.all(
      groups.map(async (g) => {
        // Get latest record of this session to identify who initiated it
        const latest = await this.auditLogsRepo.findFirstAuditLog({
          where: {
            trackId: g.trackId,
            type: { notIn: this.auth_list },
            ...(query.userId && { userId: Number(query.userId) }),
          },
          orderBy: { createdAt: "desc" },
        });

        const user = latest?.userId
          ? await this.auditLogsRepo.findCRMUser(latest.userId)
          : null;

        const records = await this.auditLogsRepo.findManyAuditLogs({
          where: {
            trackId: g.trackId,
            type: { notIn: this.auth_list },
            ...(query.userId && { userId: Number(query.userId) }),
          },
          orderBy: { createdAt: "desc" },
        });

        return {
          trackId: g.trackId,
          count: g._count,
          user,
          records,
        };
      })
    );

    // Filter sessions based on search query
    let filteredSessions = sessions.filter((s) => s.user !== null);

    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredSessions = filteredSessions.filter((session) => {
        if (!session.user) return false;

        return (
          session.user.name?.toLowerCase().includes(searchTerm) ||
          session.user.email?.toLowerCase().includes(searchTerm) ||
          session.user.role?.toLowerCase().includes(searchTerm) ||
          session.user.id.toString().includes(searchTerm) ||
          session.trackId?.toLowerCase().includes(searchTerm)
        );
      });
    }

    return {
      meta: {
        currentPage: page,
        limit,
        total: query.search ? filteredSessions.length : totalGroups.length,
        totalPages: Math.ceil(
          (query.search ? filteredSessions.length : totalGroups.length) / limit
        ),
      },
      sessions: filteredSessions,
    };
  }

  async getAuthGroupedAuditLogs(query: GroupQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const baseWhere: DataBaseSchema.CrmAuditLogsWhereInput = {
      trackId: { not: null },
      type: {
        in: this.auth_list,
      },
    };

    // Add userId filter if provided
    if (query.userId) {
      baseWhere.userId = Number(query.userId);
    }

    // Count Unique Sessions
    const totalGroups = await this.auditLogsRepo.groupByTrackId({
      by: ["trackId"],
      where: baseWhere,
    });

    // Paginated groups
    const groups = await this.auditLogsRepo.groupByTrackId({
      by: ["trackId"],
      _count: { trackId: true },
      where: baseWhere,
      orderBy: {
        _count: { trackId: "desc" },
      },
      skip,
      take: limit,
    });

    const sessions = await Promise.all(
      groups.map(async (g) => {
        // Get latest record of this session to identify who initiated it
        const latest = await this.auditLogsRepo.findFirstAuditLog({
          where: {
            trackId: g.trackId,
            type: { in: this.auth_list },
            userId: { not: null },
            ...(query.userId && { userId: Number(query.userId) }),
          },
          orderBy: { createdAt: "desc" },
        });

        const user = latest?.userId
          ? await this.auditLogsRepo.findCRMUser(latest.userId)
          : null;

        const records = await this.auditLogsRepo.findManyAuditLogs({
          where: {
            trackId: g.trackId,
            type: { in: this.auth_list },
            ...(query.userId && { userId: Number(query.userId) }),
          },
          orderBy: { createdAt: "desc" },
        });

        return {
          trackId: g.trackId,
          count: g._count,
          user,
          records,
        };
      })
    );

    // Filter sessions based on search query
    let filteredSessions = sessions.filter((s) => s.user !== null);

    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filteredSessions = filteredSessions.filter((session) => {
        if (!session.user) return false;

        return (
          session.user.name?.toLowerCase().includes(searchTerm) ||
          session.user.email?.toLowerCase().includes(searchTerm) ||
          session.user.role?.toLowerCase().includes(searchTerm) ||
          session.user.id.toString().includes(searchTerm) ||
          session.trackId?.toLowerCase().includes(searchTerm)
        );
      });
    }

    return {
      meta: {
        currentPage: page,
        limit,
        total: query.search ? filteredSessions.length : totalGroups.length,
        totalPages: Math.ceil(
          (query.search ? filteredSessions.length : totalGroups.length) / limit
        ),
      },
      sessions: filteredSessions,
    };
  }

  async getUnknownGroupedAuditLogs() {
    const groups = await this.auditLogsRepo.groupByTrackId({
      by: ["trackId"],
      _count: { trackId: true },
      where: {
        trackId: { not: null },
      },
      orderBy: {
        _count: { trackId: "desc" },
      },
      take: 50,
    });

    const sessions = await Promise.all(
      groups.map(async (g) => {
        const records = await this.auditLogsRepo.findManyAuditLogs({
          where: { trackId: g.trackId, userId: null },
          orderBy: { createdAt: "desc" },
        });

        return {
          trackId: g.trackId,
          count: g._count,
          records,
        };
      })
    );

    return sessions.filter((s) => s.records.length > 0);
  }

  async getAllUsers() {
    return await this.auditLogsRepo.getAllCRMUsers();
  }
}
