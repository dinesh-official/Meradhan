import { db, type DataBaseSchema } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import type z from "zod";

export class LeadManagerService {
  async getLeadById(leadId: number) {
    const lead = await db.dataBase.leadsModel.findUnique({
      where: { id: leadId },
      include: {
        assignTo: true,
      },
    });

    if (!lead) {
      throw new AppError(`Lead with ID ${leadId} not found`, {
        statusCode: 404,
        code: "LEAD_NOT_FOUND",
      });
    }

    return lead;
  }

  async createNewLead(
    createdBy: number,
    data: z.infer<typeof appSchema.crm.leads.createNewLeadSchema>
  ) {
    const createdNewLead = db.dataBase.leadsModel.create({
      data: {
        companyName: data.companyName,
        bondType: data.bondType,
        fullName: data.fullName,
        phoneNo: data.phoneNo,
        leadSource: data.leadSource,
        emailAddress: data.emailAddress,
        status: data.status,
        createdBy: createdBy,
        exInvestmentAmount: data.exInvestmentAmount,
        note: data.note,
        assignTo: data.assignTo
          ? {
              connect: {
                id: data.assignTo,
              },
            }
          : undefined,
      },
    });
    return createdNewLead;
  }

  async updateLead(
    leadId: number,
    data: z.infer<typeof appSchema.crm.leads.updateLeadSchema>
  ) {
    const existing = await db.dataBase.leadsModel.findUnique({
      where: { id: leadId },
    });
    if (!existing) {
      throw new AppError(`Lead with ID ${leadId} not found`, {
        statusCode: 404,
        code: "LEAD_NOT_FOUND",
      });
    }

    const updatedLead = await db.dataBase.leadsModel.update({
      where: { id: leadId },
      data: {
        companyName: data.companyName?.trim(),
        bondType: data.bondType,
        fullName: data.fullName?.trim(),
        phoneNo: data.phoneNo?.trim(),
        leadSource: data.leadSource,
        emailAddress: data.emailAddress?.trim().toLowerCase(),
        status: data.status,
        exInvestmentAmount: data.exInvestmentAmount,
        note: data.note,
        assignTo: data.assignTo
          ? {
              connect: {
                id: data.assignTo,
              },
            }
          : undefined,
      },
    });

    if (!updatedLead) {
      throw new AppError("Failed to update lead", {
        statusCode: 400,
        code: "LEAD_UPDATE_FAILED",
      });
    }

    return updatedLead;
  }

  async deleteLead(leadId: number) {
    const existing = await db.dataBase.leadsModel.findUnique({
      where: { id: leadId },
    });
    if (!existing) {
      throw new AppError(`Lead with ID ${leadId} not found`, {
        statusCode: 404,
        code: "LEAD_NOT_FOUND",
      });
    }

    await db.dataBase.leadsModel.delete({
      where: { id: leadId },
    });

    return true;
  }

  async getLeadSourceSummary(rangeDays = 30) {
    const from = new Date();
    from.setDate(from.getDate() - rangeDays);

    const grouped = await db.dataBase.leadsModel.groupBy({
      by: ["leadSource"],
      _count: { _all: true },
      where: { createdAt: { gte: from } },
    });

    return grouped.map((item) => ({
      source: item.leadSource,
      count: item._count._all,
    }));
  }

  async filterLead(
    payload: z.infer<typeof appSchema.crm.leads.findManyLeadsSchema>,
    restrictedUserId?: number
  ) {
    const page = Number(payload.page) || 1;
    const pageSize = 10; // You can make this configurable if needed
    const skip = (page - 1) * pageSize;
    const filters: DataBaseSchema.LeadsModelWhereInput = {};

    if (payload.status) {
      filters.status = payload.status;
    }

    if (payload.source) {
      filters.leadSource = payload.source;
    }

    if (payload.search) {
      filters.OR = [
        { fullName: { contains: payload.search, mode: "insensitive" } },
        { emailAddress: { contains: payload.search, mode: "insensitive" } },
        { companyName: { contains: payload.search, mode: "insensitive" } },
        { emailAddress: { contains: payload.search, mode: "insensitive" } },
        { phoneNo: { contains: payload.search, mode: "insensitive" } },
      ];
    }

    if (restrictedUserId) {
      const existingAnd = Array.isArray(filters.AND)
        ? filters.AND
        : filters.AND
          ? [filters.AND]
          : [];
      filters.AND = [
        ...existingAnd,
        {
          OR: [
            { assignTo: { id: restrictedUserId } },
            { createdBy: restrictedUserId },
          ],
        },
      ];
    }

    const total = await db.dataBase.leadsModel.count({ where: filters });
    const data = await db.dataBase.leadsModel.findMany({
      where: filters,
      skip,
      take: pageSize,
      include: {
        assignTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
