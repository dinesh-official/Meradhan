import { db } from "@core/database/database";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { CustomerKycKycService } from "../kyc_process/customer_kyc.service";

// KYC store controller class to get and set kyc data in kyc_flow table to track kyc progress for customer to resume later
export class KycStoreController {
  async getKycData(req: Request, res: Response) {
    const id = req.customer!.id;

    const response = await db.dataBase.kYC_FLOW.findUnique({
      where: {
        userID: id,
      },
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async getKycDataById(req: Request, res: Response) {
    const id = Number(req.params.customerId);

    const response = await db.dataBase.kYC_FLOW.findUnique({
      where: {
        userID: id,
      },
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async getKycKraDataById(req: Request, res: Response) {
    const id = Number(req.params.customerId);

    const response = await db.dataBase.kraDataLogs.findMany({
      where: {
        userId: id,
      },
      orderBy: { createdAt: "asc" },
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  async setKycData(req: Request, res: Response) {
    const id = req.customer!.id;
    const step = req.params.step!;
    const data = req.body;
    const complete = req.query.complete === "true";

    await db.dataBase.kYC_FLOW.upsert({
      where: {
        userID: id,
      },
      create: {
        data: data,
        userID: id,
        step: Number(step),
        complete,
      },
      update: {
        data: data,
        step: Number(step),
        complete,
      },
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        success: true,
      },
    });
  }

  async getKycLevel(req: Request, res: Response) {
    const customerId = Number(req.params.customerId);
    const kyc = new CustomerKycKycService();

    const level = await kyc.getKycLevel(customerId);

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: level,
    });
  }

  async addAuditLog(req: Request, res: Response) {
    const customerId = Number(req.params.customerId);
    const userId = req.customer?.id;
    const isAdmin = req.session?.id; // Admin users have session

    // Security: Enforce ownership check - users can only add audit logs for their own KYC
    // Admins can add audit logs for any customer
    if (!isAdmin && userId !== customerId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only add audit logs for your own KYC.",
      });
    }

    await db.dataBase.kYC_FLOW.updateMany({
      where: {
        userID: customerId,
      },
      data: {
        auditLog: {
          push: req.body,
        },
      },
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        success: true,
      },
    });
  }

  async setCurrentStep(req: Request, res: Response) {
    const customerId = Number(req.params.customerId);
    const currentStepName = req.body.currentStepName;
    await db.dataBase.kYC_FLOW.updateMany({
      where: {
        userID: customerId,
      },
      data: {
        currentStepName: currentStepName,
      },
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        success: true,
      },
    });
  }
}
