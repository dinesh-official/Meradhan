import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { CustomerProfileRepo } from "./customer.repo";
import { CustomerProfileService } from "./customer.service";
import { CorporateKycRepo } from "./corporatekyc.repo";
import { CorporateKycService } from "./corporatekyc.service";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";

export class CustomerProfileController {
  private profileService: CustomerProfileService;
  private corporateKycService: CorporateKycService;
  constructor() {
    const repo = new CustomerProfileRepo();
    this.profileService = new CustomerProfileService(repo);
    this.corporateKycService = new CorporateKycService(new CorporateKycRepo());
  }

  async createCustomer(req: Request, res: Response): Promise<void> {
    const id = req.session?.id;
    const payload = appSchema.customer.createNewCustomerSchema.parse(req.body);
    const response = await this.profileService.createCustomerProfile(
      payload,
      id
    );

    // Create Audit Log
    await createCrmActivityLog(req, {
      action: "create",
      details: {
        Reason: "CUSTOMER_CREATE",
        Name: `${response.firstName} ${response.middleName} ${response.lastName}`,
        UserName: response.userName,
      },
      entityType: "CUSTOMER",
      entityId: response.id,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async deleteCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const response = await this.profileService.removeCustomerProfile(
      Number(customerId)
    );

    // Create Audit Log
    await createCrmActivityLog(req, {
      action: "delete",
      details: {
        Reason: "CUSTOMER_DELETE",
        Name: `${response.firstName} ${response.middleName} ${response.lastName}`,
        UserName: response.userName,
      },
      entityType: "CUSTOMER_DELETE",
      entityId: response.id,
      userId: Number(req.session?.id),
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async softDeleteCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const response = await this.profileService.softDeleteCustomerProfile(
      Number(customerId)
    );

    // Create Audit Log
    await createCrmActivityLog(req, {
      action: "delete",
      details: {
        Reason: "CUSTOMER_SOFT_DELETE",
        Name: `${response.firstName} ${response.middleName} ${response.lastName}`,
        UserName: response.userName,
      },
      entityType: "CUSTOMER_SOFT_DELETE",
      entityId: response.id,
      userId: Number(req.session?.id),
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async updateCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const payload = appSchema.customer.updateCustomerProfileSchema.parse(
      req.body
    );
    const response = await this.profileService.updateCustomerProfile(
      Number(customerId),
      payload
    );
    // Create Audit Log
    await createCrmActivityLog(req, {
      action: "update",
      details: {
        Reason: "CUSTOMER_UPDATE",
        Name: `${response.firstName} ${response.middleName} ${response.lastName}`,
        UserName: response.userName,
      },
      entityType: "CUSTOMER",
      entityId: response.id,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async filterCustomer(req: Request, res: Response): Promise<void> {
    const payload = appSchema.customer.findManyCustomerSchema.parse(req.query);
    const response = await this.profileService.filterCustomers(payload);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async getCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const response = await this.profileService.getCustomerProfile(
      Number(customerId)
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async getFullProfileCustomer(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;

    const response = await this.profileService.getFullCustomerProfile(
      Number(customerId)
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async getCorporateKyc(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const response = await this.corporateKycService.getByCustomerId(
      Number(customerId)
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async saveCorporateKyc(req: Request, res: Response): Promise<void> {
    const customerId = req.params.customerId;
    const payload = appSchema.customer.createCorporateKycSchema.parse(req.body);
    const response = await this.corporateKycService.save(
      Number(customerId),
      payload
    );
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async getCustomerByParticipantCode(req: Request, res: Response): Promise<void> {
    const participantCode = req.params.participantCode;
    if (!participantCode) {
      res.sendResponse({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Participant code is required",
      });
      return;
    }
    const response = await this.profileService.getCustomerByParticipantCode(participantCode as string);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }
}
