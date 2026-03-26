/* eslint-disable @typescript-eslint/no-explicit-any */
import { db, type DataBaseSchema } from "@core/database/database";

/**
 * Repository for Web tracking audit logs (webAuditLogs table)
 */
export class WebTrackingRepo {
  async createAuditLog(payload: DataBaseSchema.WebAuditLogsCreateInput) {
    const response = await db.dataBase.webAuditLogs.create({
      data: payload,
    });
    return response;
  }

  async updateAuditLogsByTrackId(
    trackId: string,
    data: DataBaseSchema.WebAuditLogsUpdateInput
  ) {
    const response = await db.dataBase.webAuditLogs.updateMany({
      where: { trackId },
      data,
    });
    return response;
  }

  async findManyAuditLogs(payload: DataBaseSchema.WebAuditLogsFindManyArgs) {
    const response = await db.dataBase.webAuditLogs.findMany(payload);
    return response;
  }

  async countAuditLogs(payload: DataBaseSchema.WebAuditLogsCountArgs) {
    const response = await db.dataBase.webAuditLogs.count(payload);
    return response;
  }

  async groupByTrackId(payload: DataBaseSchema.WebAuditLogsGroupByArgs) {
    const response = await db.dataBase.webAuditLogs.groupBy(payload as any);
    return response;
  }

  async findFirstAuditLog(payload: DataBaseSchema.WebAuditLogsFindFirstArgs) {
    const response = await db.dataBase.webAuditLogs.findFirst(payload);
    return response;
  }

  async findCustomerUser(userId: number) {
    const response = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        emailAddress: true,
        middleName: true,
      },
    });
    return {
      id: response?.id || 0,
      name: response
        ? `${response.firstName || ""} ${response.middleName || ""} ${response.lastName || ""}`.trim()
        : null,
      email: response?.emailAddress,
    };
  }
}
