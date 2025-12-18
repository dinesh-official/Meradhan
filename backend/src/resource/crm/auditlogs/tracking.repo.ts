/* eslint-disable @typescript-eslint/no-explicit-any */
import { db, type DataBaseSchema } from "@core/database/database";

/**
 * Repository for CRM tracking audit logs (crmAuditLogs table)
 */
export class CrmTrackingRepo {
  async createAuditLog(payload: DataBaseSchema.CrmAuditLogsCreateInput) {
    const response = await db.dataBase.crmAuditLogs.create({
      data: payload,
    });
    return response;
  }

  async updateAuditLogsByTrackId(
    trackId: string,
    data: DataBaseSchema.CrmAuditLogsUpdateInput
  ) {
    const response = await db.dataBase.crmAuditLogs.updateMany({
      where: { trackId },
      data,
    });
    return response;
  }

  async findManyAuditLogs(payload: DataBaseSchema.CrmAuditLogsFindManyArgs) {
    const response = await db.dataBase.crmAuditLogs.findMany(payload);
    return response;
  }

  async countAuditLogs(payload: DataBaseSchema.CrmAuditLogsCountArgs) {
    const response = await db.dataBase.crmAuditLogs.count(payload);
    return response;
  }

  async groupByTrackId(payload: DataBaseSchema.CrmAuditLogsGroupByArgs) {
    const response = await db.dataBase.crmAuditLogs.groupBy(payload as any);
    return response;
  }

  async findFirstAuditLog(payload: DataBaseSchema.CrmAuditLogsFindFirstArgs) {
    const response = await db.dataBase.crmAuditLogs.findFirst(payload);
    return response;
  }

  async findCRMUser(userId: number) {
    const response = await db.dataBase.cRMUserDataModel.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    return response;
  }

  async getAllCRMUsers() {
    const response = await db.dataBase.cRMUserDataModel.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });
    return response;
  }
}
