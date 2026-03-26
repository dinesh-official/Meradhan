import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { CrmUserService } from "./crmusers.service";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";

export class CrmUserController {
  private crmUserService: CrmUserService;
  constructor() {
    this.crmUserService = new CrmUserService();
  }

  async createNewUser(req: Request, res: Response): Promise<void> {
    const createBy = req.session!.id;
    const data = appSchema.crm.user.createCRMUserSchema.parse(req.body);
    if (data.role === "SUPER_ADMIN" && req.session?.role !== "SUPER_ADMIN") {
      return res.sendResponse({
        statusCode: 403,
        message: "Only a Super Admin can create a new Super Admin.",
      }) as unknown as void;
    }
    const response = await this.crmUserService.createNewUser(data, createBy);
    await createCrmActivityLog(req, {
      action: "CREATE_USER",
      details: {
        Reason: "Create New User",
        ...data,
      },
      entityType: "USERS",
      entityId: response.id,
      userId: Number(req.session?.id),
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "new user created successfully",
      responseData: response,
    });
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    if (req.session?.role !== "SUPER_ADMIN") {
      return res.sendResponse({
        statusCode: 403,
        message: "Only a Super Admin can edit users.",
      }) as unknown as void;
    }
    const id = req.params!.id;
    const data = appSchema.crm.user.updateUserSchema.parse(req.body);
    if (
      data.role === "SUPER_ADMIN" &&
      req.session?.role !== "SUPER_ADMIN"
    ) {
      return res.sendResponse({
        statusCode: 403,
        message: "Only a Super Admin can assign the Super Admin role.",
      }) as unknown as void;
    }
    const response = await this.crmUserService.updateUser(Number(id), data);

    await createCrmActivityLog(req, {
      action: "UPDATE_USER",
      details: {
        Reason: "UPDATE_USER",
        ...data,
      },
      entityType: "USERS",
      entityId: response.id,
      userId: Number(req.session?.id),
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "new user update successfully",
      responseData: response,
    });
  }

  async findUser(req: Request, res: Response): Promise<void> {
    const id = req.params!.id;
    const response = await this.crmUserService.findUser(Number(id));
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    if (req.session?.role !== "SUPER_ADMIN") {
      return res.sendResponse({
        statusCode: 403,
        message: "Only a Super Admin can delete users.",
      }) as unknown as void;
    }
    const id = req.params!.id;
    const data = await this.crmUserService.deleteUser(Number(id));

    await createCrmActivityLog(req, {
      action: "DELETE_USER",
      details: {
        Reason: "DELETE_USER",
        Name: `${data.name}`,
        Email: `${data.email}`,
        PhoneNo: `${data.phoneNo}`,
        Role: `${data.role}`,
      },
      entityType: "USERS",
      entityId: data.id,
      userId: Number(req.session?.id),
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Account Delete successfully",
      responseData: data,
    });
  }

  async findManyUser(req: Request, res: Response): Promise<void> {
    const filters = appSchema.crm.user.findManyUserSchema.parse(req.query);
    const response = await this.crmUserService.findManyUser(filters);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async getSummary(_req: Request, res: Response): Promise<void> {
    const response = await this.crmUserService.getSummary();
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }
}
