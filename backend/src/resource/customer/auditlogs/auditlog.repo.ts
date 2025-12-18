import { db, type DataBaseSchema } from "@core/database/database";
import type { Request } from "express";
import { getClientIP, parseBrowserInfo } from "./auditlogs.utility";

export class AuditLogRepository {
  // ==================== Meradhan Audit Log Methods ====================

  async startMeradhanSession(
    data: DataBaseSchema.SessionLogsMeradhanCreateInput
  ) {
    const { id, sessionToken } = await db.dataBase.sessionLogsMeradhan.create({
      data,
    });
    return { id, sessionToken };
  }

  async revalidateMeradhanSession(
    sessionToken: string,
    userId: number
  ): Promise<void> {
    await db.dataBase.sessionLogsMeradhan.updateMany({
      where: { sessionToken },
      data: {
        userId: userId,
      },
    });
    await db.dataBase.pageViewLogsMeradhan.updateMany({
      where: { sessionId: sessionToken },
      data: {
        userId: userId,
      },
    });
  }

  async createMeradhanPageViewLog(
    logData: DataBaseSchema.PageViewLogsMeradhanCreateInput
  ): Promise<number> {
    const { id, sessionId } = await db.dataBase.pageViewLogsMeradhan.create({
      data: logData,
    });
    await this.incrementMeradhanSessionPageCount(sessionId);
    return id;
  }

  async updateMeradhanPageViewLog(
    id: number,
    logData: Partial<DataBaseSchema.PageViewLogsMeradhanUpdateInput>
  ): Promise<void> {
    await db.dataBase.pageViewLogsMeradhan.update({
      where: { id },
      data: logData,
    });

    if (logData.sessionId && logData.duration) {
      await this.incrementMeradhanSessionDuration(
        logData.sessionId.toString(),
        Number(logData.duration)
      );
    }
  }

  async endMeradhanSession(
    sessionToken: string,
    data: Partial<DataBaseSchema.SessionLogsMeradhanUpdateInput>
  ): Promise<void> {
    await db.dataBase.sessionLogsMeradhan.updateMany({
      where: { sessionToken },
      data,
    });
    if (data.duration) {
      await this.incrementMeradhanSessionDuration(
        sessionToken,
        Number(data.duration)
      );
    }
  }

  async incrementMeradhanSessionPageCount(sessionId: string): Promise<void> {
    try {
      await db.dataBase.sessionLogsMeradhan.updateMany({
        where: { sessionToken: sessionId },
        data: {
          totalPages: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error("Error incrementing Meradhan session page count:", error);
    }
  }

  async incrementMeradhanSessionDuration(
    sessionId: string,
    duration: number
  ): Promise<void> {
    try {
      await db.dataBase.sessionLogsMeradhan.updateMany({
        where: { sessionToken: sessionId },
        data: {
          duration: {
            increment: duration,
          },
        },
      });
    } catch (error) {
      console.error("Error incrementing Meradhan session duration:", error);
    }
  }

  async createMeradhanLoginLog(
    logData: DataBaseSchema.LoginLogsMeradhanCreateInput
  ): Promise<void> {
    await db.dataBase.loginLogsMeradhan.create({
      data: logData,
    });
  }

  async createMeradhanActivityLog(
    logData: DataBaseSchema.ActivityLogsMeradhanCreateInput
  ): Promise<void> {
    await db.dataBase.activityLogsMeradhan.create({
      data: logData,
    });
  }
}

// ==================== Meradhan Helper Functions ====================

export async function addMeradhanLoginBasedAuditLog(
  req: Request,
  data: {
    userId?: number;
    email: string;
    sessionType: string;
    success: boolean;
    entityType?: string;
  }
) {
  const infoBrowser = parseBrowserInfo(req.headers["user-agent"] || "");
  const ipAddress = getClientIP(req);

  let userName: string | undefined;
  if (data.userId) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: Number(data.userId) },
    });
    if (user) {
      userName = `${user.firstName}${user.middleName ? " " + user.middleName : ""}${user.lastName ? " " + user.lastName : ""}`;
    }
  }

  if (!data.userId) {
    return;
  }
  const auditLogsRepo = new AuditLogRepository();
  await auditLogsRepo.createMeradhanLoginLog({
    email: data.email,
    ipAddress: ipAddress,
    browserName: infoBrowser.browserName,
    deviceType: infoBrowser.deviceType,
    sessionType: data.sessionType,
    operatingSystem: infoBrowser.operatingSystem,
    userAgent: req.headers["user-agent"] || "",
    userId: data.userId,
    name: userName,
    success: data.success,
  });
  await crateMeradhanActivityLog(req, {
    userId: data.userId,
    details: {
      Reason: data.sessionType,
    },
    action: data.sessionType.toUpperCase(),
    entityType: data.entityType || "Auth",
    entityId: data.userId,
  });
}

export async function endMeradhanSessionLog(
  req: Request,
  data: {
    sessionToken: string;
    userId?: number;
    endReason: string;
    duration?: number;
  }
) {
  if (!data.sessionToken) {
    return;
  }
  const infoBrowser = parseBrowserInfo(req.headers["user-agent"] || "");
  const ipAddress = getClientIP(req);

  const auditLogsRepo = new AuditLogRepository();
  await auditLogsRepo.endMeradhanSession(data.sessionToken, {
    sessionToken: data.sessionToken,
    ipAddress: ipAddress,
    browserName: infoBrowser.browserName,
    deviceType: infoBrowser.deviceType,
    operatingSystem: infoBrowser.operatingSystem,
    userId: data.userId,
    userAgent: req.headers["user-agent"] || "",
    endTime: new Date(),
    endReason: data.endReason,
    duration: data.duration,
  });
}

export async function startMeradhanTrackingSession(
  req: Request,
  data: {
    userId?: number;
    sessionId: string;
  }
) {
  const infoBrowser = parseBrowserInfo(req.headers["user-agent"] || "");
  const ipAddress = getClientIP(req);
  const auditLogsRepo = new AuditLogRepository();

  // Implementation for starting a Meradhan tracking session
  return await auditLogsRepo.startMeradhanSession({
    sessionToken: data.sessionId,
    browserName: infoBrowser.browserName,
    deviceType: infoBrowser.deviceType,
    operatingSystem: infoBrowser.operatingSystem,
    ipAddress: ipAddress,
    userAgent: req.headers["user-agent"] || "",
    userId: data.userId,
    duration: 0,
    totalPages: 0,
    startTime: new Date(),
  });
}

export async function crateMeradhanActivityLog(
  req: Request,
  data: {
    userId: number;
    action: string;
    details: object;
    entityId?: string | number;
    entityType: string;
  }
) {
  try {
    const infoBrowser = parseBrowserInfo(req.headers["user-agent"] || "");
    const ipAddress = getClientIP(req);

    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: data.userId },
    });

    const auditLogsRepo = new AuditLogRepository();
    await auditLogsRepo.createMeradhanActivityLog({
      userId: data.userId,
      action: data.action,
      details: data.details,
      ipAddress: ipAddress,
      entityType: data.entityType,
      browserName: infoBrowser.browserName,
      deviceType: infoBrowser.deviceType,
      operatingSystem: infoBrowser.operatingSystem,
      entityId: data.entityId?.toString(),
      url: req.originalUrl,
      userAgent: req.headers["user-agent"] || "",
      email: user?.emailAddress, // Email is optional here
      name: user
        ? `${user.firstName}${user.middleName ? " " + user.middleName : ""}${user.lastName ? " " + user.lastName : ""}`
        : "", // Name is optional here
    });
  } catch (error) {
    console.log(error);
  }
}

export async function revalidateMeradhanTrackingSession(
  req: Request,
  data: {
    userId: number;
    sessionId: string;
  }
) {
  if (!data.sessionId || !data.userId) {
    return;
  }
  const auditLogsRepo = new AuditLogRepository();
  await auditLogsRepo.revalidateMeradhanSession(data.sessionId, data.userId);
}
