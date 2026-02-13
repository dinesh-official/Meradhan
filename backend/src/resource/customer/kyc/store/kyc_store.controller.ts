import { db } from "@core/database/database";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { sendRekycConfirmationOtpEmail } from "@jobs/helper/send_emails";
import { OtpVerificationService } from "@services/otp_verification.service";
import { tokenUtils } from "@utils/token/JwtToken_utils";
import { CustomerKycKycService } from "../kyc_process/customer_kyc.service";
import { CustomerKycManager } from "@services/customer/kyc/customer_kyc_manager.service";

// KYC store controller class to get and set kyc data in kyc_flow table to track kyc progress for customer to resume later
export class KycStoreController {
  private kycManager = new CustomerKycManager();
  async getKycData(req: Request, res: Response) {
    const id = req.customer!.id;

    const response = await db.dataBase.kYC_FLOW.findFirst({
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

    const response = await db.dataBase.kYC_FLOW.findFirst({
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

  private rekycOtpService = new OtpVerificationService("REKYC_VERIFY");

  /** Request OTP to admin email; must call confirmRekyc with the OTP to complete */
  async requestRekycOtp(req: Request, res: Response) {
    const customerId = Number(req.params.customerId);
    const adminId = req.session?.id;
    if (!adminId) {
      throw new AppError("Unauthorized", { statusCode: HttpStatus.UNAUTHORIZED });
    }
    const admin = await db.dataBase.cRMUserDataModel.findUnique({
      where: { id: adminId },
    });
    if (!admin?.email) {
      throw new AppError("Admin email not found.", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const identifier = `REKYC:${customerId}:${adminId}`;
    const { token, otp } = await this.rekycOtpService.generateOtp(
      identifier,
      6,
      300
    );
    await sendRekycConfirmationOtpEmail({
      email: admin.email,
      userName: admin.name ?? "Admin",
      otp,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { token },
    });
  }

  /** Verify OTP from email and apply reKYC for the customer */
  async confirmRekyc(req: Request, res: Response) {
    const { token, otp } = req.body as { token: string; otp: string };
    if (!token || typeof otp !== "string" || !otp.trim()) {
      throw new AppError("token and otp are required.", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const adminId = req.session?.id;
    if (!adminId) {
      throw new AppError("Unauthorized", { statusCode: HttpStatus.UNAUTHORIZED });
    }
    await this.rekycOtpService.verifyOtp(token, otp.trim());
    // Get customerId from token payload (identifier = "REKYC:customerId:adminId")
    const payload = tokenUtils.verifyToken<{ identifier: string }>(token);
    const match = /^REKYC:(\d+):\d+$/.exec(payload.identifier);
    if (!match) {
      throw new AppError("Invalid reKYC token.", {
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    const customerId = Number(match[1]);
    await db.dataBase.kYC_FLOW.updateMany({
      where: { userID: customerId },
      data: {
        markExpired: true,
        kycUserId: customerId,
        userID: null,
      },
    });
    await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: {
        kycStatus: "RE_KYC",
        kraStatus: "PENDING",
      },
    });
    res.send({
      status: true,
      message: "rekyc request applied successfully",
    });
  }

  async applyRekyc(req: Request, res: Response) {
    const id = Number(req.params.customerId);

    await db.dataBase.kYC_FLOW.updateMany({
      where: {
        userID: id,
      },
      data: {
        markExpired: true,
        kycUserId: id,
        userID: null,
      },
    });

    await db.dataBase.customerProfileDataModel.update({
      where: {
        id,
      },
      data: {
        kycStatus: "RE_KYC",
        kraStatus: "PENDING",
      },
    });

    res.send({
      status: true,
      message: "rekyc request send successfully",
    });
  }

  async setKycData(req: Request, res: Response) {
    const id = req.customer!.id;
    const step = req.params.step!;
    const data = req.body;
    const complete = req.query.complete === "true";
    const kycFlow = await db.dataBase.kYC_FLOW.findFirst({
      where: {
        userID: id,
      },
    });
    if (kycFlow) {
      await db.dataBase.kYC_FLOW.update({
        where: { id: kycFlow.id },
        data: { data: data, step: Number(step), complete },
      });
    } else {
      await db.dataBase.kYC_FLOW.create({
        data: { data: data, userID: id, step: Number(step), complete },
      });
    }


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
