import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { PartnershipManagerService } from "./services/partnership_manager.service";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";
import { db } from "@core/database/database";

export class PartnershipController {
  private manager: PartnershipManagerService;
  constructor() {
    this.manager = new PartnershipManagerService();
  }

  async createPartnership(req: Request, res: Response): Promise<void> {
    const data = appSchema.crm.partnership.createPartnershipSchema.parse(
      req.body
    );
    const creatorId = req.session!.id;
    const response = await this.manager.createNewPartnership(creatorId, data);
    await createCrmActivityLog(req, {
      action: "PARTNERSHIP_CREATE",
      details: {
        Reason: "PARTNERSHIP_CREATE",
        OrganizationName: `${response.organizationName}`,
        ContactName: response.fullName,
        Email: response.emailAddress,
        PhoneNo: response.mobileNumber,
        Status: response.status,
      },
      entityType: "Partnership",
      entityId: response.id,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Partnership submission created successfully",
      responseData: response,
    });
  }

  async deletePartnership(req: Request, res: Response): Promise<void> {
    const partnershipId = req.params.partnershipId!;
    const partnership = await this.manager.getPartnershipById(
      Number(partnershipId)
    );
    const response = await this.manager.deletePartnership(
      Number(partnershipId)
    );
    await createCrmActivityLog(req, {
      action: "PARTNERSHIP_DELETE",
      details: {
        Reason: "PARTNERSHIP_DELETE",
        OrganizationName: `${partnership.organizationName}`,
        ContactName: partnership.fullName,
        Email: partnership.emailAddress,
        PhoneNo: partnership.mobileNumber,
        Status: partnership.status,
      },
      entityType: "Partnership",
      entityId: partnershipId.toString(),
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Partnership deleted successfully",
      responseData: response,
    });
  }

  async updatePartnership(req: Request, res: Response): Promise<void> {
    const data = appSchema.crm.partnership.updatePartnershipSchema.parse(
      req.body
    );
    const partnershipId = req.params!.partnershipId;
    const response = await this.manager.updatePartnership(
      Number(partnershipId),
      data
    );
    await createCrmActivityLog(req, {
      action: "PARTNERSHIP_UPDATE",
      details: {
        Reason: "PARTNERSHIP_UPDATE",
        OrganizationName: `${response.organizationName}`,
        ContactName: response.fullName,
        Email: response.emailAddress,
        PhoneNo: response.mobileNumber,
        Status: response.status,
      },
      entityType: "Partnership",
      entityId: partnershipId?.toString(),
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Partnership updated successfully",
      responseData: response,
    });
  }

  async getPartnership(req: Request, res: Response): Promise<void> {
    const partnershipId = req.params!.partnershipId;
    const response = await this.manager.getPartnershipById(
      Number(partnershipId)
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Partnership retrieved successfully",
      responseData: response,
    });
  }

  async filterPartnership(req: Request, res: Response): Promise<void> {
    const payload =
      appSchema.crm.partnership.findManyPartnershipsSchema.parse(req.query);
    const currentUserId = req.session?.id;
    const user = await db.dataBase.cRMUserDataModel.findUnique({
      where: {
        id: currentUserId,
      },
    });
    const isAdmin = user?.role === "ADMIN";

    const response = await this.manager.filterPartnership(
      payload,
      isAdmin ? undefined : user?.id
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Partnerships retrieved successfully",
      responseData: response,
    });
  }
}

