import { cookieOptions } from "@config/cookie";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";

import { CustomerAuthService } from "./customer.auth.service";

import { db } from "@core/database/database";
import {
  sendCustomerSignupOtpEmail,
  sendCustomerWelcomeEmail,
} from "@jobs/helper/send_emails";
import { sendMobileOtp } from "@jobs/helper/send_sms";
import {
  addMeradhanLoginBasedAuditLog,
  endMeradhanSessionLog,
  revalidateMeradhanTrackingSession,
} from "@resource/customer/auditlogs/auditlog.repo";
import { OtpVerificationService } from "@services/otp_verification.service";
import { trackRateLimitSuccess } from "./customer.auth.ratelimit";

export class CustomerAuthController {
  private customerAuthService = new CustomerAuthService();
  private optManager = new OtpVerificationService("AUTH_OTP");

  // ✅ Send Auth Email OTP
  async sendAuthEmailOtp(req: Request, res: Response) {
    const { email, name } = appSchema.customer.sendEmailOtpSchema.parse(
      req.body,
    );
    const response = await this.optManager.generateOtp(
      "CUSTOMER_SIGNUP:" + email,
      4,
    );
    await sendCustomerSignupOtpEmail({
      email,
      userName: name,
      otp: response.otp,
    });
    // Track successful OTP send for rate limiting
    await trackRateLimitSuccess(req, "otp-send");
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { token: response.token },
    });
  }

  // ✅ Send Auth Mobile OTP
  async sendAuthMobileOtp(req: Request, res: Response) {
    const { mobile } = appSchema.customer.sendMobileOtpSchema.parse(req.body);
    const response = await this.optManager.generateOtp(
      "CUSTOMER_SIGNUP:" + mobile,
      4,
    );
    await sendMobileOtp({ mobile, otp: response.otp, template: "signup" });
    // Track successful OTP send for rate limiting
    await trackRateLimitSuccess(req, "otp-send");
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: { token: response.token },
    });
  }

  // ✅ Signup with Credentials
  async signUpWithCredentials(req: Request, res: Response) {
    const data = appSchema.customer.createNewCustomerSchema.parse(req.body);
    await this.customerAuthService.throwEmailOrPhoneExists(data.emailId);
    await this.customerAuthService.throwEmailOrPhoneExists(data.phoneNo);
    const user = await this.customerAuthService.signUpWithCredentials({
      ...data,
    });
    await addMeradhanLoginBasedAuditLog(req, {
      userId: user.id,
      sessionType: "SIGNUP_CREDENTIALS",
      success: true,
      entityType: "Auth",
      email: user.email,
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: user,
    });
  }

  // ✅ Signup with Credentials
  async verifyOtpForSignup(req: Request, res: Response) {
    const { otp, token, verifyBy, id } =
      appSchema.customer.signUpWithCredentialsQuerySchema.parse(req.query);
    const isVerified = await this.optManager.verifyOtp(
      token || "",
      otp.toString(),
    );
    if (!isVerified) {
      throw new AppError("The OTP provided is invalid.");
    }
    const user = await this.customerAuthService.verifyOtpForSignup(
      Number(id!),
      verifyBy as "email" | "mobile",
    );
    // send welcome email
    const userData = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: user.id },
      select: { firstName: true, lastName: true },
    });
    await sendCustomerWelcomeEmail({
      email: user.email,
      userName: userData?.firstName + " " + userData?.lastName,
    });
    await addMeradhanLoginBasedAuditLog(req, {
      userId: user.id,
      sessionType: "SIGNUP_VERIFIED",
      success: true,
      entityType: "Auth",
      email: user.email,
    });
    // Server Sent Events (SSE)
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: user,
    });
  }

  // signin request with email or phone
  async signInRequest(req: Request, res: Response) {
    const payload = appSchema.customer.signInWithEmailPhoneRequestSchema.parse(
      req.body,
    );
    const response = await this.customerAuthService.signinRequest({
      identifier: payload.identity,
      value: payload.value,
    });

    console.log("signin request response", response);

    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: response,
    });
  }

  // signin with otp
  async signInWithPassword(req: Request, res: Response) {
    const { identity, password, value } =
      appSchema.customer.signInWithCredentialsSchema.parse(req.body);
    const data = await this.customerAuthService.signInWithCredentials({
      identifier: identity,
      password,
      value,
    });
    await addMeradhanLoginBasedAuditLog(req, {
      userId: data.id,
      sessionType: "SIGNIN_CREDENTIALS_PASSWORD",
      success: true,
      entityType: "Auth",
      email: data.email,
    });
    await revalidateMeradhanTrackingSession(req, {
      userId: data.id,
      sessionId: req.cookies["meradhan_tracking_session"],
    });
    res.cookie("token", data.token, cookieOptions);
    res.cookie("userId", data.id.toString(), cookieOptions);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async signInWithOtpSend(req: Request, res: Response) {
    const { identity, value } = appSchema.customer.sendSignInOtpSchema.parse(
      req.body,
    );
    const data = await this.customerAuthService.sendSigninWithOtp({
      identifier: identity,
      value,
    });
    // Track successful OTP send for rate limiting
    await trackRateLimitSuccess(req, "otp-send");
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async signInWithOtpVerify(req: Request, res: Response) {
    const { identity, value, otp, token } =
      appSchema.customer.signInWithOtpSchema.parse(req.body);
    const data = await this.customerAuthService.verifySigninWithOtp({
      identifier: identity,
      value,
      otp,
      token,
    });
    // Track successful OTP verification for rate limiting
    await trackRateLimitSuccess(req, "otp-verify");
    res.cookie("token", data.token, cookieOptions);
    res.cookie("userId", data.id.toString(), cookieOptions);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async signInSocialMedia(req: Request, res: Response) {
    const socialLogin = appSchema.customer.SocialLoginUserSchema.parse(
      req.body,
    );
    const data = await this.customerAuthService.socialLogin(socialLogin);
    res.sendResponse({
      statusCode: HttpStatus.OK,
      responseData: data,
    });
  }

  async logout(req: Request, res: Response): Promise<void> {
    // Clear all cookies
    res.cookie("token", "", {
      ...cookieOptions,
      expires: new Date(0),
    });
    await endMeradhanSessionLog(req, {
      userId: req.customer!.id,
      endReason: "User initiated logout",
      sessionToken: req.cookies["meradhan_tracking_session"],
    });
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "logout successfully",
    });
  }

  async session(req: Request, res: Response): Promise<void> {
    const id = req.customer?.id;

    if (!id) {
      throw new AppError("Session not found");
    }

    const session = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id, isDeleted: false, utility: { accountStatus: "ACTIVE" } },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        avatar: true,
        emailAddress: true,
        userName: true,
        kycStatus: true,
        kraStatus: true,
        gender: true,
      },
    });

    const hasRekycExpiredFlow = session
      ? await db.dataBase.kYC_FLOW.findFirst({
        where: { kycUserId: id, markExpired: true },
        select: { id: true },
      }).then((row) => !!row)
      : false;

    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "session",
      responseData: session
        ? { ...session, hasRekycExpiredFlow }
        : undefined,
    });
  }

  async sendVerifyEmail(req: Request, res: Response): Promise<void> {
    // send email verification to the user c
    await this.customerAuthService.sendEmailVerification(req.customer!.id);
    // Track successful email verification d
    await trackRateLimitSuccess(req, "email-verify");
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Verification email sent successfully.",
    });
  }
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.query;
    await this.customerAuthService.verifyEmailToken(token as string);
    // Track successful email verification for rate limiting
    await trackRateLimitSuccess(req, "email-verify");
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Email verified successfully.",
    });
  }

  async resendEmailVerificationForUnverifiedUser(
    req: Request,
    res: Response,
  ): Promise<void> {
    const payload = appSchema.customer.signInWithEmailPhoneRequestSchema.parse(
      req.body,
    );
    await this.customerAuthService.resendEmailVerificationForUnverifiedUser({
      identifier: payload.identity,
      value: payload.value,
    });
    // Track successful email verification send for rate limiting
    await trackRateLimitSuccess(req, "email-verify");
    res.sendResponse({
      statusCode: HttpStatus.OK,
      message: "Verification email sent successfully.",
    });
  }
}
