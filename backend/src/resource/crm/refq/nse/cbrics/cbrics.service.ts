import { db, type DataBaseSchema } from "@core/database/database";
import type { appSchema } from "@root/schema";
import type z from "zod";

export class CbricsParticipantService {
  async getParticipants({
    page = "1",
    pageSize = "15",
    search,
    workflowStatus,
    statusCode,
  }: z.infer<typeof appSchema.crm.rfq.nse.getParticipants.GetParticipantsZ>) {
    const skip = (Number(page) - 1) * Number(pageSize);

    const whereClause: DataBaseSchema.NseCbricsParticipantModelWhereInput = {};

    if (workflowStatus != undefined) {
      whereClause.workflowStatus = Number(workflowStatus);
    }

    if (statusCode != undefined) {
      whereClause.actualStatus = Number(statusCode);
    }

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { panNo: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      db.dataBase.nseCbricsParticipantModel.findMany({
        skip,
        take: Number(pageSize),
        where: whereClause,
        include: {
          bankAccountList: true,
          dpAccountList: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.dataBase.nseCbricsParticipantModel.count({ where: whereClause }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / Number(pageSize)),
      },
    };
  }

  async getSettledOrders() { }
}
