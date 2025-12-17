import { db, type DataBaseSchema } from "@core/database/database";
import type { Request } from "express";
import {
  getClientIP,
  parseBrowserInfo,
} from "@resource/customer/auditlogs/auditlogs.utility";

export class AuditLogRepository {
  async createCrmPageViewLog(
    logData: DataBaseSchema.PageViewLogsCRMCreateInput
  ): Promise<number> {
    // Implementation for creating a CRM page view log in the database
    const { id, sessionId } = await db.dataBase.pageViewLogsCRM.create({
      data: logData,
    });
    await this.incrementSessionPageCount(sessionId);
    return id; // Return the ID of the created log
  }

  async updateCrmPageViewLog(
    id: number,
    logData: Partial<DataBaseSchema.PageViewLogsCRMUpdateInput>
  ): Promise<void> {
    // Implementation for updating a CRM page view log in the database
    await db.dataBase.pageViewLogsCRM.update({
      where: { id },
      data: logData,
    });

    if (logData.sessionId && logData.duration) {
      await this.incrementSessionDuration(
        logData.sessionId.toString(),
        Number(logData.duration)
      );
    }
  }

  async startAuditLogSession(data: DataBaseSchema.SessionLogsCRMCreateInput) {
    // Implementation for starting an audit log session
    const { id, sessionToken } = await db.dataBase.sessionLogsCRM.create({
      data,
    });
    return { id, sessionToken };
  }

  async endAuditLogSession(
    sessionToken: string,
    data: Partial<DataBaseSchema.SessionLogsCRMUpdateInput>
  ): Promise<void> {
    if (!data.userId) {
      return;
    }
    // Implementation for ending an audit log session
    await db.dataBase.sessionLogsCRM.updateMany({
      where: { sessionToken },
      data,
    });
    await this.incrementSessionDuration(
      sessionToken,
      Number(data.duration) || 0
    );
  }

  async createCrmActivityLog(
    logData: DataBaseSchema.ActivityLogsCRMCreateInput
  ): Promise<void> {
    // Implementation for creating a CRM activity log in the database
    await db.dataBase.activityLogsCRM.create({
      data: logData,
    });
  }

  async incrementSessionPageCount(sessionId: string): Promise<void> {
    // Implementation for incrementing the total pages viewed in a session
    try {
      await db.dataBase.sessionLogsCRM.updateMany({
        where: { sessionToken: sessionId },
        data: {
          totalPages: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error("Error incrementing session page count:", error);
    }
  }

  async incrementSessionDuration(
    sessionId: string,
    duration: number
  ): Promise<void> {
    // Implementation for incrementing the total duration of a session
    try {
      await db.dataBase.sessionLogsCRM.updateMany({
        where: { sessionToken: sessionId },
        data: {
          duration: {
            increment: duration,
          },
        },
      });
    } catch (error) {
      console.error("Error incrementing session duration:", error);
    }
  }
}

export async function addCrmLoginBasedAuditLog(
  req: Request,
  data: {
    userId: number;
    sessionType: string;
    success: boolean;
    entityType?: string;
  }
) {
  const infoBrowser = parseBrowserInfo(req.headers["user-agent"] || "");
  const ipAddress = getClientIP(req);
  const user = await db.dataBase.cRMUserDataModel.findUnique({
    where: { id: Number(data.userId) },
  });
  if (!user) {
    console.log("No user found");

    return;
  }
  await db.dataBase.loginLogsCrm.create({
    data: {
      email: user?.email || "",
      ipAddress: ipAddress,
      browserName: infoBrowser.browserName,
      deviceType: infoBrowser.deviceType,
      sessionType: data.sessionType,
      operatingSystem: infoBrowser.operatingSystem,
      userAgent: req.headers["user-agent"] || "",
      userId: data.userId,
      name: user?.name,
      success: data.success,
    },
  });
  await createCrmActivityLog(req, {
    userId: data.userId,
    details: {
      Reason: data.sessionType,
    },
    action: data.sessionType.toUpperCase(),
    entityType: data.entityType || "Auth",
    entityId: data.userId,
  });
}

export async function endAuditLogSession(
  req: Request,
  data: {
    userId: number;
    endReason: string;
    success: boolean;
  }
) {
  const infoBrowser = parseBrowserInfo(req.headers["user-agent"] || "");
  const ipAddress = getClientIP(req);

  const auditLogsRepo = new AuditLogRepository();
  await auditLogsRepo.endAuditLogSession(req.cookies.token, {
    sessionToken: req.cookies.token,
    ipAddress: ipAddress,
    browserName: infoBrowser.browserName,
    deviceType: infoBrowser.deviceType,
    operatingSystem: infoBrowser.operatingSystem,
    userId: data.userId,
    userAgent: req.headers["user-agent"] || "",
    endTime: new Date(),
    endReason: data.endReason,
  });
}

export const createCrmActivityLog = async (
  req: Request,
  data: {
    userId: number;
    action: string;
    details: object;
    entityId?: string | number;
    entityType: string;
  }
) => {
  try {
    const infoBrowser = parseBrowserInfo(req.headers["user-agent"] || "");
    const ipAddress = getClientIP(req);

    const user = await db.dataBase.cRMUserDataModel.findUnique({
      where: { id: Number(data.userId) },
    });
    if (!user) {
      console.log("No user found for activity log");
      return;
    }

    const auditLogsRepo = new AuditLogRepository();
    await auditLogsRepo.createCrmActivityLog({
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
      email: user?.email || "",
      name: user?.name || "",
    });
  } catch (error) {
    console.log(error);
  }
};
