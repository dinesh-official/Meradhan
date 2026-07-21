import type { Request, Response } from "express";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import { ServiceRequestRepo } from "./service_requests.repo";
import { CustomerServiceRequestService } from "./service_requests.service";

export class CustomerServiceRequestController {
  private service: CustomerServiceRequestService;

  constructor() {
    this.service = new CustomerServiceRequestService(new ServiceRequestRepo());
  }

  async listReasons(req: Request, res: Response): Promise<void> {
    const query = appSchema.customer.listServiceRequestReasonsQuerySchema.parse(req.query);
    const response = await this.service.listReasons(query.type);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async createRequest(req: Request, res: Response): Promise<void> {
    const payload = appSchema.customer.createServiceRequestSchema.parse(req.body);
    const userId = req.customer?.id;
    const response = await this.service.createRequest(Number(userId), payload);
    res.sendResponse({
      statusCode: HttpStatus.CREATED,
      responseData: response,
    });
  }

  async listMyRequests(req: Request, res: Response): Promise<void> {
    const query = appSchema.customer.listMyServiceRequestsQuerySchema.parse(req.query);
    const userId = req.customer?.id;
    const response = await this.service.listMyRequests(Number(userId), query.type);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }
}
