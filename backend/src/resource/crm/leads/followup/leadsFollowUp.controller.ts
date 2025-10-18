import type { Request, Response } from "express";
import { LeadsFollowUpManager } from "../manager/leadFollowup.manager";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";

export interface ILeadsFollowUpControllerInterface {
    createFollowUpNote(req: Request, res: Response): Promise<void>;
    updateFollowUpNote(req: Request, res: Response): Promise<void>;
    deleteFollowUpNote(req: Request, res: Response): Promise<void>;
    getFollowUpNotesByLeadId(req: Request, res: Response): Promise<void>;
}


export class LeadsFollowUpController implements ILeadsFollowUpControllerInterface {
    private followUpManager: LeadsFollowUpManager;

    constructor() {
        this.followUpManager = new LeadsFollowUpManager();
    }

    // ----------------------------------------
    // Create a Follow-Up Note
    // ----------------------------------------
    async createFollowUpNote(req: Request, res: Response): Promise<void> {

        const leadId = Number(req.params.leadId);
        const createdById = Number(req.session?.id); // from auth middleware
        const data = appSchema.crm.leads.createNewLeadFollowUpNoteSchema.parse(req.body);

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
        const data = appSchema.crm.leads.updateLeadFollowUpNoteSchema.parse(req.body);

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

    // ----------------------------------------
    // Delete a Follow-Up Note
    // ----------------------------------------
    async deleteFollowUpNote(req: Request, res: Response): Promise<void> {

        const followUpNoteId = Number(req.params.id);
        await this.followUpManager.deleteFollowUpNote(followUpNoteId);

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
