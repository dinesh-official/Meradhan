import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { NotificationService } from "./notification.service";
import {
  NotificationBatchDeliveryStatus,
  NotificationMedium,
} from "@databases/generated/prisma/postgres";

export class NotificationController {
  private service = new NotificationService();

  queryCustomers = async (req: Request, res: Response) => {
    const body = appSchema.crm.notifications.queryCustomersPromptSchema.parse(
      req.body
    );
    const data = await this.service.queryCustomersFromPrompt(body.prompt);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  };

  createSavedList = async (req: Request, res: Response) => {
    const body = appSchema.crm.notifications.createSavedListSchema.parse(req.body);
    const userId = req.session!.id;
    const data = await this.service.createSavedList(userId, body);
    res.sendResponse({
      statusCode: HttpStatus.CREATED,
      responseData: data,
    });
  };

  listSavedLists = async (req: Request, res: Response) => {
    const userId = req.session!.id;
    const role = req.session!.role;
    const data = await this.service.listSavedLists(userId, role);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  };

  getSavedList = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.session!.id;
    const data = await this.service.getSavedList(userId, id);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  };

  patchSavedList = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.session!.id;
    const body = appSchema.crm.notifications.patchSavedListSchema.parse(req.body);
    const data = await this.service.patchSavedList(userId, id, body);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  };

  deleteSavedList = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const userId = req.session!.id;
    const role = req.session!.role;
    const data = await this.service.softDeleteSavedList(userId, role, id);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  };

  send = async (req: Request, res: Response) => {
    const body = appSchema.crm.notifications.sendNotificationSchema.parse(req.body);
    const userId = req.session!.id;
    const data = await this.service.sendNotification(userId, {
      savedListId: body.savedListId,
      medium: body.medium as NotificationMedium,
      dltTemplateId: body.dltTemplateId,
      templateVariables: body.templateVariables,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Notification batch processed.",
      responseData: data,
    });
  };

  smsTemplates = async (_req: Request, res: Response) => {
    const templates = this.service.getSmsTemplatesFromConfig();
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { templates },
    });
  };

  listLogs = async (req: Request, res: Response) => {
    const q = appSchema.crm.notifications.listNotificationLogsQuerySchema.parse(
      req.query
    );
    const data = await this.service.listNotificationLogs({
      page: q.page,
      pageSize: q.pageSize,
      medium: q.medium as NotificationMedium | undefined,
      deliveryStatus: q.deliveryStatus as
        | NotificationBatchDeliveryStatus
        | undefined,
      from: q.from,
      to: q.to,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  };

  getSavedListMembers = async (req: Request, res: Response) => {
    const listId = Number(req.params.id);
    const userId = req.session!.id;
    const role = req.session!.role;
    const data = await this.service.getSavedListMembers(userId, role, listId);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  };

  removeSavedListMember = async (req: Request, res: Response) => {
    const listId = Number(req.params.id);
    const customerProfileId = Number(req.params.customerProfileId);
    const userId = req.session!.id;
    const role = req.session!.role;
    const data = await this.service.removeSavedListMember(userId, role, listId, customerProfileId);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Member removed.",
      responseData: data,
    });
  };

  customerLogs = async (req: Request, res: Response) => {
    const customerProfileId = Number(req.params.customerProfileId);
    const data = await this.service.listCustomerNotificationLogs(customerProfileId);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  };

  /* ─── DLT Template CRUD ─────────────────────────────────── */

  listTemplates = async (_req: Request, res: Response) => {
    const data = await this.service.listTemplates();
    res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  createTemplate = async (req: Request, res: Response) => {
    const body = appSchema.crm.notifications.createTemplateSchema.parse(req.body);
    const userId = req.session!.id;
    const data = await this.service.createTemplate(userId, body);
    res.sendResponse({ statusCode: HttpStatus.CREATED, responseData: data });
  };

  updateTemplate = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const body = appSchema.crm.notifications.updateTemplateSchema.parse(req.body);
    const data = await this.service.updateTemplate(id, body);
    res.sendResponse({ statusCode: HttpStatus.OK, responseData: data });
  };

  deleteTemplate = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.service.deleteTemplate(id);
    res.sendResponse({ statusCode: HttpStatus.OK, message: "Template deleted." });
  };
}
