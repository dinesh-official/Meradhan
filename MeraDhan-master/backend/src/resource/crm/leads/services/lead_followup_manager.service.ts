import { db } from "@core/database/database";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import type z from "zod";

export class LeadsFollowUpManagerService {
  async getFollowUpNotesByLeadId(leadId: number) {
    const leadNotes = await db.dataBase.leadFollowUpNotesModel.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" }, // optional, adjust to your schema
    });
    if (!leadNotes) {
      throw new AppError(`Lead notes with ID ${leadId} not found`, {
        statusCode: 404,
        code: "LEAD_NOT_FOUND",
      });
    }

    return leadNotes;
  }

  async deleteFollowUpNote(followUpNoteId: number) {
    const existing = await db.dataBase.leadFollowUpNotesModel.findUnique({
      where: { id: followUpNoteId },
    });
    if (!existing) {
      throw new AppError(`FollowMessage with ID ${followUpNoteId} not found`, {
        statusCode: 404,
        code: "LEAD_FOLLOW_UP_NOT_NOT_FOUND",
      });
    }

    const data = await db.dataBase.leadFollowUpNotesModel.delete({
      where: { id: followUpNoteId },
    });

    return data;
  }

  async createNewFollowUpNote(
    leadId: number,
    createdById: number,
    data: z.infer<typeof appSchema.crm.leads.createNewLeadFollowUpNoteSchema>
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

    const newFollowUpNote = await db.dataBase.leadFollowUpNotesModel.create({
      data: {
        text: data.text,
        nextDate: data.nextDate,
        createdByName: createrUser?.name,
        leadId: leadId,
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
    data: z.infer<typeof appSchema.crm.leads.updateLeadFollowUpNoteSchema>
  ) {
    const existing = await db.dataBase.leadFollowUpNotesModel.findUnique({
      where: { id: followUpNoteId },
    });

    if (!existing) {
      throw new AppError(`Follow-up note with ID ${followUpNoteId} not found`, {
        statusCode: 404,
        code: "FOLLOWUP_NOTE_NOT_FOUND",
      });
    }

    const updatedFollowUp = await db.dataBase.leadFollowUpNotesModel.update({
      where: { id: followUpNoteId },
      data: {
        text: data.text?.trim(),
        nextDate: data.nextDate,
      },
    });

    if (!updatedFollowUp) {
      throw new AppError("Failed to update follow-up note", {
        statusCode: 400,
        code: "FOLLOWUP_NOTE_UPDATE_FAILED",
      });
    }

    return updatedFollowUp;
  }
}
