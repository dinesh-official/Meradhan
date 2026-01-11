import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { LeadManagerService } from "./services/leads_manager.service";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";
import { db } from "@core/database/database";

export class LeadController {
  private manager: LeadManagerService;
  constructor() {
    this.manager = new LeadManagerService();
  }

  async createLead(req: Request, res: Response): Promise<void> {
    const data = appSchema.crm.leads.createNewLeadSchema.parse(req.body);
    const creatorId = req.session!.id;
    const response = await this.manager.createNewLead(creatorId, data);
    await createCrmActivityLog(req, {
      action: "LEAD_CREATE",
      details: {
        Reason: "LEAD_CREATE",
        Name: `${response.fullName}`,
        Email: response.emailAddress,
        PhoneNo: response.phoneNo,
        Status: response.status,
      },
      entityType: "Lead",
      entityId: response.id,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "lead created successfully",
      responseData: response,
    });
  }

  async deleteLead(req: Request, res: Response): Promise<void> {
    const leadId = req.params.leadId!;
    const lead = await this.manager.getLeadById(Number(leadId));
    const response = await this.manager.deleteLead(Number(leadId));
    await createCrmActivityLog(req, {
      action: "LEAD_DELETE",
      details: {
        Reason: "LEAD_DELETE",
        Name: `${lead.fullName}`,
        Email: lead.emailAddress,
        PhoneNo: lead.phoneNo,
        Status: lead.status,
      },
      entityType: "Lead",
      entityId: leadId.toString(),
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "lead delete successfully",
      responseData: response,
    });
  }

  async updateLead(req: Request, res: Response): Promise<void> {
    const data = appSchema.crm.leads.updateLeadSchema.parse(req.body);
    const leadId = req.params!.leadId;
    const response = await this.manager.updateLead(Number(leadId), data);
    await createCrmActivityLog(req, {
      action: "LEAD_UPDATE",
      details: {
        Reason: "LEAD_UPDATE",
        Name: `${response.fullName}`,
        Email: response.emailAddress,
        PhoneNo: response.phoneNo,
        Status: response.status,
      },
      entityType: "Lead",
      entityId: leadId?.toString(),
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "lead update successfully",
      responseData: response,
    });
  }

  async getLead(req: Request, res: Response): Promise<void> {
    const leadId = req.params!.leadId;
    const response = await this.manager.getLeadById(Number(leadId));
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "lead get successfully",
      responseData: response,
    });
  }

  async filterLead(req: Request, res: Response): Promise<void> {
    const payload = appSchema.crm.leads.findManyLeadsSchema.parse(req.query);
    // ADMIN sees all; USER (req.customer) is restricted to own or assigned leads
    const currentUserId = req.session?.id;
    const user = await db.dataBase.cRMUserDataModel.findUnique({
      where: {
        id: currentUserId,
      },
    });
    const isAdmin = user?.role === "ADMIN";

    const response = await this.manager.filterLead(
      payload,
      isAdmin ? undefined : user?.id
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "lead get successfully",
      responseData: response,
    });
  }

  async leadSourceSummary(req: Request, res: Response): Promise<void> {
    const rangeDays = Number(req.query.rangeDays) || 30;
    const summary = await this.manager.getLeadSourceSummary(rangeDays);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: summary,
    });
  }
}
