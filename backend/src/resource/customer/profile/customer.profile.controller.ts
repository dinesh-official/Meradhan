import type { Request, Response } from "express";
import { CustomerProfileService } from "./customer.profile.service";
import { appSchema } from "@root/schema";
import { CustomerManageAccountsService } from "./customer.manage_accounts.service";

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
}
