import {
  addCrmLoginBasedAuditLog,
  AuditLogRepository,
  endAuditLogSession,
} from "@resource/crm/auditlogs/auditlog.repo";
import {
  getClientIP,
  parseBrowserInfo,
} from "@resource/customer/auditlogs/auditlogs.utility";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { EmailAuthService } from "./email_auth.service";

export class AuthController {
  private auditLogsRepo = new AuditLogRepository();
  private emailAuthService: EmailAuthService;
  constructor() {
    this.emailAuthService = new EmailAuthService();
  }

  async loginWithOtp(req: Request, res: Response): Promise<void> {
    const data = appSchema.auth.loginWithOtpSchema.parse(req.body);
    console.log(data);
    const payload = await this.emailAuthService.sendAuthEmailOtp(data.email);

    // Audit log for login attempt with otp
    await addCrmLoginBasedAuditLog(req, {
      sessionType: "otp_request",
      userId: payload.id,
      success: true,
    });

    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "otp send successfully",
      success: true,
      responseData: payload,
    });
  }

  async verifyLoginOtp(req: Request, res: Response): Promise<void> {
    const data = appSchema.auth.verifyOtpSchema.parse(req.body);
    console.log(data);
    const payload = await this.emailAuthService.verifyAuthEmailOtp(
      data.email,
      data.token,
      data.otp,
      // Audit log for login attempt
      async (status, id) => {
        await addCrmLoginBasedAuditLog(req, {
          sessionType: "login",
          userId: Number(id), // Replace with actual userId if available
          success: status,
        });
      },
    );

    // Start audit log session
    const infoBrowser = parseBrowserInfo(req.headers["user-agent"] || "");
    await this.auditLogsRepo.startAuditLogSession({
      sessionToken: payload.token,
      userId: Number(payload.id),
      ipAddress: getClientIP(req),
      browserName: infoBrowser.browserName,
      deviceType: infoBrowser.deviceType,
      operatingSystem: infoBrowser.operatingSystem,
      startTime: new Date(),
      totalPages: 0,
      userAgent: req.headers["user-agent"] || "",
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "successfully verified",
      responseData: payload,
    });
  }

  async session(req: Request, res: Response): Promise<void> {
    const id = req.session!.id;
    const session = await this.emailAuthService.getSession(Number(id));
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "session",
      responseData: session,
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    // Clear all cookies
    res.clearCookie("userId");
    res.clearCookie("token");

    await addCrmLoginBasedAuditLog(req, {
      sessionType: "logout",
      userId: Number(req.cookies.userId),
      success: true,
    });
    await endAuditLogSession(req, {
      userId: Number(req.cookies.userId),
      endReason: "User logged out",
      success: true,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "logout successfully",
    });
  }
}
