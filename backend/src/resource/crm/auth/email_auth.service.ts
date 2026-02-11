import { sendAdminLoginOtpEmail } from "@jobs/helper/send_emails";
import {
  OtpVerificationService,
  type IOtpVerificationService,
} from "@services/otp_verification.service";
import { AppError } from "@utils/error/AppError";
import { tokenUtils } from "@utils/token/JwtToken_utils";
import { AuthRepo } from "./auth.repo";

export class EmailAuthService {
  // OTP verification service
  private optManager: IOtpVerificationService;
  private authRepo: AuthRepo;
  constructor() {
    this.optManager = new OtpVerificationService("AUTH_OTP");
    this.authRepo = new AuthRepo();
  }

  async sendAuthEmailOtp(email: string) {
    const user = await this.authRepo.getAuthUserByEmail(email);
    const { token, otp } = await this.optManager.generateOtp(
      user.id.toString()
    );
    await sendAdminLoginOtpEmail({
      email: user.email,
      userName: user.name,
      otp,
    });
    return { token, id: user.id };
  }

  async verifyAuthEmailOtp(
    email: string,
    token: string,
    opt: string,
    callbackFunc?: (status: boolean, userid: number) => Promise<void> | void
  ) {
    const user = await this.authRepo.getAuthUserByEmail(email);
    try {
      const isVerified = await this.optManager.verifyOtp(token, opt);
      if (!isVerified) {
        if (callbackFunc) {
          await callbackFunc?.(false, user.id);
        }
        throw new AppError("The OTP provided is invalid.");
      }
      const authToken = tokenUtils.generateToken(
        {
          email: user.email,
          id: user.id,
          role: user.role,
        },
        "1d"
      );
      await this.authRepo.setLastLoginNow(user.id);
      if (callbackFunc) {
        callbackFunc?.(true, user.id);
      }
      return {
        token: authToken,
        id: user.id,
        role: user.role,
        avatar: user.avatar,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
      };
    } catch (error) {
      if (callbackFunc) {
        await callbackFunc?.(false, user.id);
      }
      throw error;
    }
  }

  async getSession(id: number) {
    const user = await this.authRepo.getAuthSession(id);
    return {
      id: user.id,
      role: user.role,
      avatar: user.avatar,
      name: user.name,
      email: user.email,
      phoneNo: user.phoneNo,
    };
  }
}
