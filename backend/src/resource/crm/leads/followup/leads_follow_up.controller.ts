import type { Request, Response } from "express";

import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import { LeadsFollowUpManagerService } from "../services/lead_followup_manager.service";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";

export class LeadsFollowUpController {
  private followUpManager: LeadsFollowUpManagerService;

  constructor() {
    this.followUpManager = new LeadsFollowUpManagerService();
  }

  // ----------------------------------------
  // Create a Follow-Up Note
  // ----------------------------------------
  async createFollowUpNote(req: Request, res: Response): Promise<void> {
    const leadId = Number(req.params.leadId);
    const createdById = Number(req.session?.id); // from auth middleware
    const data = appSchema.crm.leads.createNewLeadFollowUpNoteSchema.parse(
      req.body
    );

    await createCrmActivityLog(req, {
      action: "CREATE_FOLLOWUP",
      details: {
        Reason: "CREATE_FOLLOWUP",
        Note: `${data.text}`,
        Date: data.nextDate,
      },
      entityType: "FOLLOWUP",
      entityId: leadId,
      userId: Number(req.session?.id),
    });

    const newNote = await this.followUpManager.createNewFollowUpNote(
      leadId,
      createdById,
      data
    );

    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Follow-up note created successfully",
      responseData: newNote,
    });
  }

  // ----------------------------------------
  // Update a Follow-Up Note
  // ----------------------------------------
  async updateFollowUpNote(req: Request, res: Response): Promise<void> {
    const followUpNoteId = Number(req.params.id);
    const data = appSchema.crm.leads.updateLeadFollowUpNoteSchema.parse(
      req.body
    );

    const updatedNote = await this.followUpManager.updateFollowUpNote(
      followUpNoteId,
      data
    );

    await createCrmActivityLog(req, {
      action: "UPDATE_FOLLOWUP",
      details: {
        Reason: "UPDATE_FOLLOWUP",
        Note: `${data.text}`,
        Date: data.nextDate,
      },
      entityType: "FOLLOWUP",
      entityId: followUpNoteId,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Follow-up note updated successfully",
      responseData: updatedNote,
    });
  }

  // ----------------------------------------
  // Delete a Follow-Up Note
  // ----------------------------------------
  async deleteFollowUpNote(req: Request, res: Response): Promise<void> {
    const followUpNoteId = Number(req.params.id);
    const data = await this.followUpManager.deleteFollowUpNote(followUpNoteId);
    await createCrmActivityLog(req, {
      action: "DELETE_FOLLOWUP",
      details: {
        Reason: "DELETE_FOLLOWUP",
        Note: `${data.text}`,
        Date: data.nextDate,
      },
      entityType: "FOLLOWUP",
      entityId: followUpNoteId,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Follow-up note deleted successfully",
    });
  }

  // ----------------------------------------
  // Get All Follow-Up Notes for a Lead
  // ----------------------------------------
  async getFollowUpNotesByLeadId(req: Request, res: Response): Promise<void> {
    const leadId = Number(req.params.leadId);
    const notes = await this.followUpManager.getFollowUpNotesByLeadId(leadId);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Follow-up notes fetched successfully",
      responseData: notes,
    });
  }
}
