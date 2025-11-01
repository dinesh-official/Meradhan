import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { LeadManagerService } from "./services/leads_manager.service";

export class LeadController {

    private manager: LeadManagerService;
    constructor() {
        this.manager = new LeadManagerService();
    }

    async createLead(req: Request, res: Response): Promise<void> {
        const data = appSchema.crm.leads.createNewLeadSchema.parse(req.body);
        const creatorId = req.session!.id
        const response = await this.manager.createNewLead((creatorId), data)
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "lead created successfully",
            responseData: response
        })
    }

    async deleteLead(req: Request, res: Response): Promise<void> {
        const leadId = req.params.leadId!
        const response = await this.manager.deleteLead(Number(leadId))
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "lead delete successfully",
            responseData: response
        })
    }

    async updateLead(req: Request, res: Response): Promise<void> {
        const data = appSchema.crm.leads.updateLeadSchema.parse(req.body);
        const leadId = req.params!.leadId
        const response = await this.manager.updateLead(Number(leadId), data)
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "lead update successfully",
            responseData: response
        })
    }

    async getLead(req: Request, res: Response): Promise<void> {
        const leadId = req.params!.leadId
        const response = await this.manager.getLeadById(Number(leadId))
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "lead get successfully",
            responseData: response
        })
    }

    async filterLead(req: Request, res: Response): Promise<void> {
        const payload = appSchema.crm.leads.findManyLeadsSchema.parse(req.query);

        const response = await this.manager.filterLead(payload)
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "lead get successfully",
            responseData: response
        })
    }
}