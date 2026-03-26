import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import type z from "zod";

export class PartnershipFollowUpManagerService {
  async getFollowUpNotesByPartnershipId(partnershipId: number) {
    const partnershipNotes =
      await db.dataBase.partnershipFollowUpNotesModel.findMany({
        where: { partnershipId },
        orderBy: { createdAt: "desc" },
      });
    if (!partnershipNotes) {
      throw new AppError(
        `Partnership notes with ID ${partnershipId} not found`,
        {
          statusCode: 404,
          code: "PARTNERSHIP_NOT_FOUND",
        }
      );
    }

    return partnershipNotes;
  }

  async deleteFollowUpNote(followUpNoteId: number) {
    const existing =
      await db.dataBase.partnershipFollowUpNotesModel.findUnique({
        where: { id: followUpNoteId },
      });
    if (!existing) {
      throw new AppError(`Follow-up note with ID ${followUpNoteId} not found`, {
        statusCode: 404,
        code: "FOLLOWUP_NOTE_NOT_FOUND",
      });
    }

    await db.dataBase.partnershipFollowUpNotesModel.delete({
      where: { id: followUpNoteId },
    });

    return true;
  }

  async createNewFollowUpNote(
    partnershipId: number,
    createdById: number,
    data: z.infer<
      typeof appSchema.crm.partnership.createPartnershipFollowUpNoteSchema
    >
  ) {
    const createrUser = await db.dataBase.cRMUserDataModel.findUnique({
      where: { id: createdById },
    });
    if (!createrUser) {
      throw new AppError(`CreatedUser does not found`, {
        code: "CREATER_USER_NOT_FOUND",
        statusCode: 404,
      });
    }

    const newFollowUpNote =
      await db.dataBase.partnershipFollowUpNotesModel.create({
        data: {
          text: data.text,
          nextDate: data.nextDate,
          createdByName: createrUser?.name,
          partnershipId: partnershipId,
          createdByID: createdById,
        },
      });

    if (!newFollowUpNote) {
      throw new AppError("Failed to create follow-up note", {
        statusCode: 400,
        code: "FOLLOWUP_NOTE_CREATE_FAILED",
      });
    }
    return newFollowUpNote;
  }

  async updateFollowUpNote(
    followUpNoteId: number,
    data: z.infer<
      typeof appSchema.crm.partnership.updatePartnershipFollowUpNoteSchema
    >
  ) {
    const existing =
      await db.dataBase.partnershipFollowUpNotesModel.findUnique({
        where: { id: followUpNoteId },
      });
    if (!existing) {
      throw new AppError(`Follow-up note with ID ${followUpNoteId} not found`, {
        statusCode: 404,
        code: "FOLLOWUP_NOTE_NOT_FOUND",
      });
    }

    const updatedNote =
      await db.dataBase.partnershipFollowUpNotesModel.update({
        where: { id: followUpNoteId },
        data: {
          text: data.text,
          nextDate: data.nextDate,
        },
      });

    if (!updatedNote) {
      throw new AppError("Failed to update follow-up note", {
        statusCode: 400,
        code: "FOLLOWUP_NOTE_UPDATE_FAILED",
      });
    }

    return updatedNote;
  }
}

