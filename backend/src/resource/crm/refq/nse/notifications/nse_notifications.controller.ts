import type { Request, Response } from "express";
import { HttpStatus } from "@utils/error/AppError";
import { NseNotificationsService } from "./nse_notifications.service";

export class NseNotificationsController {
  private service = new NseNotificationsService();

  async listWebhook(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 25;
    const data = await this.service.listWebhookNotifications({ page, limit });
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async listCbrics(req: Request, res: Response) {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 25;
    const data = await this.service.listCbricsTableNotifications({ page, limit });
    return res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }
}
