import { cookieOptions } from "@config/cookie";
import { appSchema } from "@root/schema";
import {
  crateMeradhanActivityLog,
  revalidateMeradhanTrackingSession,
} from "@resource/customer/auditlogs/auditlog.repo";
import { trackRateLimitSuccess } from "@resource/customer/auth/customer.auth.ratelimit";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { CustomerManageAccountsService } from "./customer.manage_accounts.service";
import { CustomerProfileService } from "./customer.profile.service";

export class CustomerProfileController {
  private profileService = new CustomerProfileService();
  private manageAccountsService = new CustomerManageAccountsService();

  async requestMobileUpdate(req: Request, res: Response) {
    const { mobile, newWhatsAppNo } =
      appSchema.customer.customerMobileUpdateRequestSchema.parse(req.body);

    const otpToken = await this.profileService.updateMobileRequest({
      customerId: req.customer!.id,
      newMobile: mobile,
      newWhatsAppNo,
    });
    res.status(200).json({ success: true, otpToken });
  }

  async sendMobileOtpVerification(req: Request, res: Response) {
    const { mobile } =
      appSchema.customer.customerMobileSendOtpRequestSchema.parse(req.body);
    const otpToken = await this.profileService.sendMobileOtpVerification({
      newMobile: mobile,
    });
    res.status(200).json({ success: true, otpToken });
  }

  async verifyAndUpdateMobile(req: Request, res: Response) {
    const { otp, token, mobile } =
      appSchema.customer.customerMobileVerifyRequestSchema.parse(req.body);
    const isUpdated = await this.profileService.verifyAndUpdateMobile({
      customerId: req.customer!.id,
      newMobile: mobile,
      otpCode: otp,
      otpToken: token,
    });
    if (isUpdated) {
      res.status(200).json({
        success: true,
        message: "Mobile number updated successfully.",
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "OTP verification failed." });
    }
  }

  async toggleWhatsAppPreference(req: Request, res: Response) {
    const { enableWhatsApp } =
      appSchema.customer.customerWhatsAppPreferenceSchema.parse(req.body);
    await this.profileService.toggleWhatsAppNotifications(
      req.customer!.id,
      enableWhatsApp
    );
    res.status(200).json({
      success: true,
      message: "WhatsApp preference updated successfully.",
    });
  }

  async addBankAccount(req: Request, res: Response) {
    const bankDetails = appSchema.kyc.bankInfoSchema.parse(req.body);
    await this.manageAccountsService.addBankAccount(
      req.customer!.id,
      bankDetails
    );
    res
      .status(200)
      .json({ success: true, message: "Bank account added successfully." });
  }

  async removeBankAccount(req: Request, res: Response) {
    const bankAccountId = Number(req.params.bankAccountId);
    await this.manageAccountsService.removeBankAccount(
      req.customer!.id,
      bankAccountId
    );
    res
      .status(200)
      .json({ success: true, message: "Bank account removed successfully." });
  }

  async setPrimaryBankAccount(req: Request, res: Response) {
    const bankAccountId = Number(req.params.bankAccountId);
    await this.manageAccountsService.setPrimaryBankAccount(
      req.customer!.id,
      bankAccountId
    );
    res.status(200).json({
      success: true,
      message: "Primary bank account set successfully.",
    });
  }

  async addNewDematAccount(req: Request, res: Response) {
    const dematDetails = appSchema.customer.createDematAccountSchema.parse(
      req.body
    );
    await this.manageAccountsService.addNewDematAccount(
      req.customer!.id,
      dematDetails
    );
    res
      .status(200)
      .json({ success: true, message: "Demat account added successfully." });
  }

  async removeDematAccount(req: Request, res: Response) {
    const dematAccountId = Number(req.params.dematAccountId);
    await this.manageAccountsService.removeDematAccount(
      req.customer!.id,
      dematAccountId
    );
    res
      .status(200)
      .json({ success: true, message: "Demat account removed successfully." });
  }

  async setPrimaryDematAccount(req: Request, res: Response) {
    const dematAccountId = Number(req.params.dematAccountId);
    await this.manageAccountsService.setPrimaryDematAccount(
      req.customer!.id,
      dematAccountId
    );
    res.status(200).json({
      success: true,
      message: "Primary demat account set successfully.",
    });
  }

  async saveRiskProfileAnswers(req: Request, res: Response) {
    await this.manageAccountsService.saveRiskProfile(
      req.customer!.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Risk profile answers saved successfully.",
    });
  }

  async sendEmailVerifyOtp(req: Request, res: Response) {
    const { email } = appSchema.customer.customerEmailVerifySendOtpSchema.parse(
      req.body,
    );
    const { token } = await this.profileService.sendEmailVerifyOtp({
      customerId: req.customer!.id,
      email,
    });
    await trackRateLimitSuccess(req, "otp-send");
    res.status(200).json({ success: true, otpToken: token });
  }

  async verifyEmailVerifyOtp(req: Request, res: Response) {
    const { email, otp, token } =
      appSchema.customer.customerEmailVerifyConfirmSchema.parse(req.body);
    const isVerified = await this.profileService.verifyEmailVerifyOtp({
      customerId: req.customer!.id,
      email,
      token,
      otp,
    });
    await trackRateLimitSuccess(req, "otp-verify");
    if (isVerified) {
      res.status(200).json({
        success: true,
        message: "Email verified successfully.",
      });
    } else {
      res.status(400).json({ success: false, message: "OTP verification failed." });
    }
  }

  async sendEmailChangeOtp(req: Request, res: Response) {
    const { newEmail } = appSchema.customer.customerEmailChangeSendOtpSchema.parse(
      req.body,
    );
    const { token } = await this.profileService.sendEmailChangeOtp({
      customerId: req.customer!.id,
      newEmail,
    });
    await trackRateLimitSuccess(req, "otp-send");
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { otpToken: token },
    });
  }

  async verifyEmailChange(req: Request, res: Response) {
    const { newEmail, otp, token } =
      appSchema.customer.customerEmailChangeVerifySchema.parse(req.body);
    const data = await this.profileService.verifyEmailChange({
      customerId: req.customer!.id,
      newEmail,
      token,
      otp,
    });

    await crateMeradhanActivityLog(req, {
      userId: data.id,
      action: "PRIMARY_EMAIL_CHANGED",
      entityType: "Profile",
      entityId: data.id,
      details: {
        Reason:
          "Primary email has been changed; change verified by OTP.",
        previousEmail: data.previousEmail,
        newEmail: data.email,
        verifiedBy: "OTP",
      },
    });

    await revalidateMeradhanTrackingSession(req, {
      userId: data.id,
      sessionId: req.cookies["meradhan_tracking_session"],
    });
    await trackRateLimitSuccess(req, "otp-verify");

    res.cookie("token", data.token, cookieOptions);
    res.cookie("userId", data.id.toString(), cookieOptions);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: {
        id: data.id,
        email: data.email,
        avatar: data.avatar,
        token: data.token,
      },
    });
  }
}
