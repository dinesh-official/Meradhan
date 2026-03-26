import type { Request, Response } from "express";

import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import { PartnershipFollowUpManagerService } from "../services/partnership_followup_manager.service";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";

export class PartnershipFollowUpController {
  private followUpManager: PartnershipFollowUpManagerService;

  constructor() {
    this.followUpManager = new PartnershipFollowUpManagerService();
  }

  async createFollowUpNote(req: Request, res: Response): Promise<void> {
    const partnershipId = Number(req.params.partnershipId);
    const createdById = Number(req.session?.id);
    const data =
      appSchema.crm.partnership.createPartnershipFollowUpNoteSchema.parse(
        req.body
      );

    await createCrmActivityLog(req, {
      action: "CREATE_PARTNERSHIP_FOLLOWUP",
      details: {
        Reason: "CREATE_PARTNERSHIP_FOLLOWUP",
        Note: `${data.text}`,
        Date: data.nextDate,
      },
      entityType: "PARTNERSHIP_FOLLOWUP",
      entityId: partnershipId,
      userId: Number(req.session?.id),
    });

    const newNote = await this.followUpManager.createNewFollowUpNote(
      partnershipId,
      createdById,
      data
    );

    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Follow-up note created successfully",
      responseData: newNote,
    });
  }

  async getFollowUpNotesByPartnershipId(
    req: Request,
    res: Response
  ): Promise<void> {
    const partnershipId = Number(req.params.partnershipId);
    const notes =
      await this.followUpManager.getFollowUpNotesByPartnershipId(partnershipId);

    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Follow-up notes retrieved successfully",
      responseData: notes,
    });
  }

  async updateFollowUpNote(req: Request, res: Response): Promise<void> {
    const followUpNoteId = Number(req.params.id);
    const data =
      appSchema.crm.partnership.updatePartnershipFollowUpNoteSchema.parse(
        req.body
      );

    await createCrmActivityLog(req, {
      action: "UPDATE_PARTNERSHIP_FOLLOWUP",
      details: {
        Reason: "UPDATE_PARTNERSHIP_FOLLOWUP",
        Note: `${data.text}`,
      },
      entityType: "PARTNERSHIP_FOLLOWUP",
      entityId: followUpNoteId,
      userId: Number(req.session?.id),
    });

    const updatedNote = await this.followUpManager.updateFollowUpNote(
      followUpNoteId,
      data
    );

    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Follow-up note updated successfully",
      responseData: updatedNote,
    });
  }

  async deleteFollowUpNote(req: Request, res: Response): Promise<void> {
    const followUpNoteId = Number(req.params.id);

    await createCrmActivityLog(req, {
      action: "DELETE_PARTNERSHIP_FOLLOWUP",
      details: {
        Reason: "DELETE_PARTNERSHIP_FOLLOWUP",
      },
      entityType: "PARTNERSHIP_FOLLOWUP",
      entityId: followUpNoteId,
      userId: Number(req.session?.id),
    });

    await this.followUpManager.deleteFollowUpNote(followUpNoteId);

    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Follow-up note deleted successfully",
      responseData: true,
    });
  }
}

