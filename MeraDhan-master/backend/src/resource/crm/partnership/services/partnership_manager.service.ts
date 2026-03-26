import { db, type DataBaseSchema } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import type z from "zod";

export class PartnershipManagerService {
  async getPartnershipById(partnershipId: number) {
    const partnership = await db.dataBase.partnershipSubmissionModel.findUnique(
      {
        where: { id: partnershipId },
        include: {
          assignTo: true,
          followUpNotes: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }
    );

    if (!partnership) {
      throw new AppError(`Partnership with ID ${partnershipId} not found`, {
        statusCode: 404,
        code: "PARTNERSHIP_NOT_FOUND",
      });
    }

    return partnership;
  }

  async createNewPartnership(
    createdBy: number,
    data: z.infer<typeof appSchema.crm.partnership.createPartnershipSchema>
  ) {
    const createdPartnership =
      await db.dataBase.partnershipSubmissionModel.create({
        data: {
          organizationName: data.organizationName.trim(),
          organizationType: data.organizationType.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          website: data.website?.trim() || null,
          fullName: data.fullName.trim(),
          designation: data.designation.trim(),
          emailAddress: data.emailAddress.trim().toLowerCase(),
          mobileNumber: data.mobileNumber.trim(),
          partnershipModel: data.partnershipModel,
          clientBase: data.clientBase?.trim() || null,
          message: data.message?.trim() || null,
          status: data.status || "NEW",
          createdBy: createdBy,
          assignTo: data.assignTo
            ? {
                connect: {
                  id: data.assignTo,
                },
              }
            : undefined,
        },
      });
    return createdPartnership;
  }

  async updatePartnership(
    partnershipId: number,
    data: z.infer<typeof appSchema.crm.partnership.updatePartnershipSchema>
  ) {
    const existing = await db.dataBase.partnershipSubmissionModel.findUnique({
      where: { id: partnershipId },
    });
    if (!existing) {
      throw new AppError(`Partnership with ID ${partnershipId} not found`, {
        statusCode: 404,
        code: "PARTNERSHIP_NOT_FOUND",
      });
    }

    const updatedPartnership =
      await db.dataBase.partnershipSubmissionModel.update({
        where: { id: partnershipId },
        data: {
          organizationName: data.organizationName?.trim(),
          organizationType: data.organizationType?.trim(),
          city: data.city?.trim(),
          state: data.state?.trim(),
          website: data.website?.trim() || null,
          fullName: data.fullName?.trim(),
          designation: data.designation?.trim(),
          emailAddress: data.emailAddress?.trim().toLowerCase(),
          mobileNumber: data.mobileNumber?.trim(),
          partnershipModel: data.partnershipModel,
          clientBase: data.clientBase?.trim() || null,
          message: data.message?.trim() || null,
          status: data.status,
          assignTo: data.assignTo
            ? {
                connect: {
                  id: data.assignTo,
                },
              }
            : undefined,
        },
      });

    if (!updatedPartnership) {
      throw new AppError("Failed to update partnership", {
        statusCode: 400,
        code: "PARTNERSHIP_UPDATE_FAILED",
      });
    }

    return updatedPartnership;
  }

  async deletePartnership(partnershipId: number) {
    const existing = await db.dataBase.partnershipSubmissionModel.findUnique({
      where: { id: partnershipId },
    });
    if (!existing) {
      throw new AppError(`Partnership with ID ${partnershipId} not found`, {
        statusCode: 404,
        code: "PARTNERSHIP_NOT_FOUND",
      });
    }

    await db.dataBase.partnershipSubmissionModel.delete({
      where: { id: partnershipId },
    });

    return true;
  }

  async filterPartnership(
    payload: z.infer<
      typeof appSchema.crm.partnership.findManyPartnershipsSchema
    >,
    restrictedUserId?: number
  ) {
    const page = Number(payload.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    const filters: DataBaseSchema.PartnershipSubmissionModelWhereInput = {};

    if (payload.status) {
      filters.status = payload.status;
    }

    if (payload.partnershipModel) {
      filters.partnershipModel = payload.partnershipModel;
    }

    if (payload.organizationType) {
      filters.organizationType = {
        contains: payload.organizationType,
        mode: "insensitive",
      };
    }

    if (payload.search) {
      filters.OR = [
        { fullName: { contains: payload.search, mode: "insensitive" } },
        {
          emailAddress: { contains: payload.search, mode: "insensitive" },
        },
        {
          organizationName: {
            contains: payload.search,
            mode: "insensitive",
          },
        },
        {
          mobileNumber: { contains: payload.search, mode: "insensitive" },
        },
        { city: { contains: payload.search, mode: "insensitive" } },
        { state: { contains: payload.search, mode: "insensitive" } },
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

    const total = await db.dataBase.partnershipSubmissionModel.count({
      where: filters,
    });
    const data = await db.dataBase.partnershipSubmissionModel.findMany({
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
