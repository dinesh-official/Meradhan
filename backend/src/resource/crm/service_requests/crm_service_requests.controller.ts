import type { Request, Response } from "express";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import { createCrmActivityLog } from "@resource/crm/auditlogs/auditlog.repo";
import { CrmServiceRequestService } from "./crm_service_requests.service";

export class CrmServiceRequestController {
  private service = new CrmServiceRequestService();

  async listRequests(req: Request, res: Response): Promise<void> {
    const parsed = appSchema.customer.findManyServiceRequestsSchema.parse(req.query);
    const response = await this.service.filterRequests(parsed);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async closeAccount(req: Request, res: Response): Promise<void> {
    const requestId = Number(req.params.id);
    const adminId = Number(req.session?.id);
    const response = await this.service.closeAccount(requestId, adminId);

    await createCrmActivityLog(req, {
      action: "update",
      details: {
        Reason: "SERVICE_REQUEST_CLOSE_ACCOUNT",
        RequestId: requestId,
      },
      entityType: "SERVICE_REQUEST",
      entityId: requestId,
      userId: adminId,
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async rejectRequest(req: Request, res: Response): Promise<void> {
    const requestId = Number(req.params.id);
    const adminId = Number(req.session?.id);
    const response = await this.service.rejectRequest(requestId, adminId);

    await createCrmActivityLog(req, {
      action: "update",
      details: {
        Reason: "SERVICE_REQUEST_REJECT",
        RequestId: requestId,
      },
      entityType: "SERVICE_REQUEST",
      entityId: requestId,
      userId: adminId,
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }
}
