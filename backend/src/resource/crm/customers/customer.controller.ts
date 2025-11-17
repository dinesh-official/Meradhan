import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { CustomerProfileRepo } from "./customer.repo";
import { CustomerProfileService } from "./customer.service";
import { createCrmActivityLog } from "@services/auditlogs/auditlog.repo";

export class CustomerProfileController {
  private profileService: CustomerProfileService;
  constructor() {
    const repo = new CustomerProfileRepo();
    this.profileService = new CustomerProfileService(repo);
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
}
