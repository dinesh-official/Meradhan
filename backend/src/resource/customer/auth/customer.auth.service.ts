import { db, type DataBaseSchema } from "@core/database/database";
import {
  sendCustomerSigninOtpEmail,
  sendCustomerSignupOtpEmail,
  sendEmailVerificationLink,
  sendKycReminderNotStartedEmail,
} from "@jobs/helper/send_emails";
import { sendMobileOtp } from "@jobs/helper/send_sms";
import { env } from "@packages/config/src/env";
import type { appSchema } from "@root/schema";
import { CustomerProfileManager } from "@services/customer/customer_manager.service";
import { OtpVerificationService } from "@services/otp_verification.service";
import { AppError } from "@utils/error/AppError";
import { removeCountryCode } from "@utils/filters/convert";
import { generateUsername } from "@utils/generate/generate_username";
import { hashingUtils } from "@utils/hash/hashing_utils";
import { tokenUtils } from "@utils/token/JwtToken_utils";

import type z from "zod";
type I_IDENTIFIED = "email" | "phoneNo";

export class CustomerAuthService {
  private customerProfileService = new CustomerProfileManager();
  private optManager = new OtpVerificationService("AUTH_OTP");

  async signUpWithCredentials(
    data: z.infer<typeof appSchema.customer.createNewCustomerSchema>
  ) {
    const user = await this.customerProfileService.createCustomerProfile(data);

    return {
      id: user.id,
      email: user.emailAddress,
      avatar: user.avatar,
    };
  }

  async verifyOtpForSignup(userId: number, verifyBy: "email" | "mobile") {
    const user = await db.dataBase.customerProfileDataModel.update({
      where: {
        id: userId,
      },
      data: {
        utility: {
          update: {
            ...(verifyBy === "email" ? { isEmailVerified: true } : {}),
            ...(verifyBy === "mobile" ? { isPhoneVerified: true } : {}),
          },
        },
      },
      include: { utility: true },
    });
    const authToken = tokenUtils.generateToken(
      {
        email: user.emailAddress,
        mobile: user.phoneNo,
        id: userId,
        role: "USER",
      },
      "1d"
    );
    await this.customerProfileService.setLatestLoginTime(user.id);
    return {
      id: user.id,
      email: user.emailAddress,
      avatar: user.avatar,
      token: authToken,
      isEmailVerified: user.utility.isEmailVerified,
      isPhoneVerified: user.utility.isPhoneVerified,
    };
  }

  async updateSignupEmail(customerId: number, newEmail: string) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId, isDeleted: false },
      include: { utility: true },
    });
    if (!user) {
      throw new AppError("Customer not found.", { code: "CUSTOMER_NOT_FOUND" });
    }
    if (user.utility.isEmailVerified) {
      throw new AppError("Email is already verified and cannot be changed during signup.", {
        code: "EMAIL_ALREADY_VERIFIED",
      });
    }
    await this.assertEmailNotUsedByOtherCustomer(newEmail, customerId);
    const updated = await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: { emailAddress: newEmail },
      select: { id: true, emailAddress: true },
    });
    return { id: updated.id, email: updated.emailAddress };
  }

  async updateSignupPhone(customerId: number, newPhone: string) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId, isDeleted: false },
      include: { utility: true },
    });
    if (!user) {
      throw new AppError("Customer not found.", { code: "CUSTOMER_NOT_FOUND" });
    }
    if (user.utility.isPhoneVerified) {
      throw new AppError(
        "Phone number is already verified and cannot be changed during signup.",
        { code: "PHONE_ALREADY_VERIFIED" },
      );
    }
    const normalizedPhone = "+91" + removeCountryCode(newPhone);
    await this.assertPhoneNotUsedByOtherCustomer(normalizedPhone, customerId);
    const updated = await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: {
        phoneNo: normalizedPhone,
        whatsAppNo: normalizedPhone,
      },
      select: { id: true, phoneNo: true },
    });
    return {
      id: updated.id,
      phone: removeCountryCode(updated.phoneNo ?? newPhone),
    };
  }

  async verifyOtpForSignupBoth(
    data: z.infer<typeof appSchema.customer.signUpVerifyBothSchema>,
  ) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: data.id, isDeleted: false },
      include: { utility: true },
    });
    if (!user) {
      throw new AppError("Customer not found.", { code: "CUSTOMER_NOT_FOUND" });
    }

    await this.optManager.verifyOtpsAtomically([
      { token: data.emailToken, otp: data.emailOtp },
      { token: data.mobileToken, otp: data.mobileOtp },
    ]);

    const updated = await db.dataBase.customerProfileDataModel.update({
      where: { id: data.id },
      data: {
        utility: {
          update: {
            isEmailVerified: true,
            isPhoneVerified: true,
          },
        },
      },
      include: { utility: true },
    });

    return {
      id: updated.id,
      email: updated.emailAddress,
      avatar: updated.avatar,
      isEmailVerified: updated.utility.isEmailVerified,
      isPhoneVerified: updated.utility.isPhoneVerified,
    };
  }

  async signinRequest(data: {
    identifier: I_IDENTIFIED;
    value: string;
    sendActivationOtp?: boolean;
  }) {
    const query: DataBaseSchema.CustomerProfileDataModelWhereUniqueInput =
      data.identifier == "email"
        ? {
          emailAddress: data.value,
        }
        : {
          phoneNo: "+91" + removeCountryCode(data.value),
        };

    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: {
        ...query,
        isDeleted: false,
      },
      include: {
        utility: true,
      },
    });
    if (!user) {
      throw new AppError("Invalid email or mobile number", {
        code: "USER_NOT_FOUND",
      });
    }

    if (user.utility.accountStatus == "SUSPENDED") {
      throw new AppError("Your account is suspended", {
        code: "ACCOUNT_SUSPENDED",
      });
    }

    if (this.shouldUseActivationAtLogin(user, data.identifier)) {
      if (data.sendActivationOtp === true) {
        return this.sendAccountActivationOtpAtLogin(user, data.identifier);
      }
      return this.getAccountActivationPromptAtLogin(user, data.identifier);
    }

    this.checkUserSigninWith(user, data.identifier);
    return await this.sendSigninWithOtp({
      identifier: data.identifier,
      value: data.value,
    });
  }

  async verifyAccountActivationAtLogin(
    data: z.infer<typeof appSchema.customer.accountActivationVerifySchema>,
  ) {
    const user = await this.findCustomerBySigninIdentifier(data.identity, data.value);
    if (!user) {
      throw new AppError("Invalid email or mobile number", { code: "USER_NOT_FOUND" });
    }

    if (!this.canActivateAtLogin(user)) {
      throw new AppError("Account activation is not available for this sign-in method.", {
        code: "ACTIVATION_NOT_ALLOWED",
      });
    }

    const channel = data.identity === "phoneNo" ? "phone" : "email";
    if (channel === "phone" && user.utility.isPhoneVerified) {
      throw new AppError("Phone number is already verified.", { code: "PHONE_ALREADY_VERIFIED" });
    }
    if (channel === "email" && user.utility.isEmailVerified) {
      throw new AppError("Email is already verified.", { code: "EMAIL_ALREADY_VERIFIED" });
    }

    await this.optManager.verifyOtp(data.token, data.otp);

    const updated = await db.dataBase.customerProfileDataModel.update({
      where: { id: user.id },
      data: {
        utility: {
          update:
            channel === "phone"
              ? { isPhoneVerified: true }
              : { isEmailVerified: true },
        },
      },
    });

    const authToken = tokenUtils.generateToken(
      {
        email: updated.emailAddress,
        mobile: updated.phoneNo,
        id: updated.id,
        role: "USER",
      },
      "1d",
    );
    await this.customerProfileService.setLatestLoginTime(updated.id);
    return {
      id: updated.id,
      email: updated.emailAddress,
      avatar: updated.avatar,
      token: authToken,
    };
  }

  async sendSigninWithOtp(data: { identifier: I_IDENTIFIED; value: string }) {
    const query: DataBaseSchema.CustomerProfileDataModelWhereUniqueInput =
      data.identifier == "email"
        ? {
          emailAddress: data.value,
        }
        : {
          phoneNo: "+91" + removeCountryCode(data.value),
        };

    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: query,
      include: {
        utility: true,
      },
    });
    if (!user) {
      throw new AppError("Invalid email or mobile number", {
        code: "USER_NOT_FOUND",
      });
    }

    this.checkUserSigninWith(user, data.identifier);
    const { token, otp } = await this.optManager.generateOtp(
      "CUSTOMER_SIGNIN:" + user.id + ":" + data.identifier,
      4
    );

    // send otp to user worker
    if (data.identifier == "email") {
      sendCustomerSigninOtpEmail({
        email: user.emailAddress,
        otp,
        userName: user.firstName + " " + user.lastName,
      });
    } else {
      if (user.phoneNo) {
        await sendMobileOtp({
          mobile: user.phoneNo,
          otp,
          template: "login",
        });
      }
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      token,
    };
  }

  async verifySigninWithOtp(data: {
    identifier: I_IDENTIFIED;
    value: string;
    token: string;
    otp: string;
  }) {
    const query: DataBaseSchema.CustomerProfileDataModelWhereUniqueInput =
      data.identifier == "email"
        ? {
          emailAddress: data.value,
        }
        : {
          phoneNo: "+91" + removeCountryCode(data.value),
        };

    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: query,
      include: {
        utility: true,
      },
    });
    if (!user) {
      throw new AppError("Invalid email or mobile number", {
        code: "USER_NOT_FOUND",
      });
    }

    this.checkUserSigninWith(user, data.identifier);
    const isValid = await this.optManager.verifyOtp(data.token, data.otp);

    // send otp to user worker
    if (!isValid) {
      throw new AppError("Invalid OTP. Please try again.");
    }

    if (user.utility.twoFactorEnabled) {
      if (!user.utility.twoFactorPasscodeHash) {
        throw new AppError(
          "Two-factor authentication is misconfigured. Please update your 2FA settings.",
          { code: "TWO_FACTOR_PASSCODE_NOT_SET" },
        );
      }
      const challengeToken = this.createTwoFactorPasscodeChallengeToken(user.id);
      return {
        id: user.id,
        email: user.emailAddress,
        avatar: user.avatar,
        requiresTwoFactor: true as const,
        challengeToken,
      };
    }

    const authToken = tokenUtils.generateToken(
      {
        email: user.emailAddress,
        mobile: user.phoneNo,
        id: user.id,
        role: "USER",
      },
      "1d"
    );
    await this.customerProfileService.setLatestLoginTime(user.id);
    return {
      id: user.id,
      email: user.emailAddress,
      avatar: user.avatar,
      token: authToken,
    };
  }

  async getTwoFactorSettings(customerId: number) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId, isDeleted: false },
      include: { utility: true },
    });
    if (!user) {
      throw new AppError("Customer not found.", { code: "CUSTOMER_NOT_FOUND" });
    }

    return {
      enabled: user.utility.twoFactorEnabled,
      hasPasscodeSet: Boolean(user.utility.twoFactorPasscodeHash),
      signinWith: user.utility.signinWith,
    };
  }

  async updateTwoFactorSettings(
    customerId: number,
    data: z.infer<typeof appSchema.customer.customerTwoFactorSettingsUpdateSchema>,
  ) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId, isDeleted: false },
      include: { utility: true },
    });
    if (!user) {
      throw new AppError("Customer not found.", { code: "CUSTOMER_NOT_FOUND" });
    }

    this.assertCanManageTwoFactor(user);

    if (data.enabled) {
      let passcodeHash = user.utility.twoFactorPasscodeHash;
      if (data.passcode) {
        passcodeHash = await hashingUtils.hashPassword(data.passcode);
      } else if (!passcodeHash) {
        throw new AppError("Set a 6-digit passcode to enable 2FA.", {
          code: "TWO_FACTOR_PASSCODE_REQUIRED",
        });
      }

      await db.dataBase.customersAuthDataModel.update({
        where: { id: user.customersAuthDataModelId },
        data: {
          twoFactorEnabled: true,
          twoFactorPasscodeHash: passcodeHash,
        },
      });
    } else {
      await db.dataBase.customersAuthDataModel.update({
        where: { id: user.customersAuthDataModelId },
        data: {
          twoFactorEnabled: false,
          twoFactorPasscodeHash: null,
        },
      });
    }

    return this.getTwoFactorSettings(customerId);
  }

  async verifyTwoFactorSignin(
    data: z.infer<typeof appSchema.customer.signInVerifyTwoFactorSchema>,
  ) {
    const { userId } = this.parseTwoFactorChallengeToken(data.challengeToken);
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: userId, isDeleted: false },
      include: { utility: true },
    });
    if (!user) {
      throw new AppError("User not found.", { code: "USER_NOT_FOUND" });
    }
    this.checkUserSigninWith(
      user,
      user.utility.isEmailVerified ? "email" : "phoneNo",
    );
    if (!user.utility.twoFactorEnabled) {
      throw new AppError("Two-factor authentication is not enabled for this account.", {
        code: "TWO_FACTOR_NOT_ENABLED",
      });
    }
    if (!user.utility.twoFactorPasscodeHash) {
      throw new AppError("Two-factor authentication is misconfigured.", {
        code: "TWO_FACTOR_PASSCODE_NOT_SET",
      });
    }

    const isPasscodeValid = await hashingUtils.comparePassword(
      data.passcode,
      user.utility.twoFactorPasscodeHash,
    );
    if (!isPasscodeValid) {
      throw new AppError("Invalid passcode. Please try again.", {
        code: "INVALID_TWO_FACTOR_PASSCODE",
      });
    }

    const authToken = tokenUtils.generateToken(
      {
        email: user.emailAddress,
        mobile: user.phoneNo,
        id: user.id,
        role: "USER",
      },
      "1d",
    );
    await this.customerProfileService.setLatestLoginTime(user.id);
    return {
      id: user.id,
      email: user.emailAddress,
      avatar: user.avatar,
      token: authToken,
    };
  }

  async socialLogin(data: {
    email: string;
    image: string;
    name: string;
    id: string;
    provider: "GOOGLE" | "MICROSOFT" | "FACEBOOK";
  }) {
    const isExist = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        utility: {
          socialLoginId: data.id,
          signinWith: data.provider,
        },
      },
    });

    if (isExist) {
      const authToken = tokenUtils.generateToken(
        {
          email: isExist.emailAddress,
          mobile: isExist.phoneNo,
          id: isExist.id,
          role: "USER",
        },
        "1d"
      );
      await this.customerProfileService.setLatestLoginTime(isExist.id);
      return {
        id: isExist.id,
        email: isExist.emailAddress,
        avatar: isExist.avatar,
        token: authToken,
      };
    }

    // create new if not exist
    const isEmailExist = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        emailAddress: data.email,
      },
    });

    if (isEmailExist) {
      throw new AppError(
        "The provided social email is already registered. Please login.",
        { code: "EMAIL_ALREADY_REGISTERED" }
      );
    }

    const response = await db.dataBase.customerProfileDataModel.create({
      data: {
        firstName: data.name.split(" ")?.[0] || "",
        lastName: data.name.split(" ")?.[1] || "",
        emailAddress: data.email,
        avatar: data.image,
        middleName: "",
        userName: generateUsername(),
        utility: {
          create: {
            signinWith: data.provider,
            isEmailVerified: true,
            socialLoginId: data.id,
            lastLogin: new Date(),
            termsAccepted: true,
          },
        },
      },
    });

    // KYC reminder (not started) — 24 hours after social signup.
    // Will be skipped at send-time if KYC has already started/completed.
    try {
      const fullName = `${response.firstName ?? ""} ${response.lastName ?? ""}`.trim() || "Customer";
      await sendKycReminderNotStartedEmail({
        customerId: response.id,
        email: response.emailAddress,
        customerFullName: fullName,
        title: undefined,
        startKycLink: "https://www.meradhan.co/dashboard/kyc",
        delayMs: 24 * 60 * 60 * 1000,
      });
    } catch (e) {
      console.log(e);
    }

    const authToken = tokenUtils.generateToken(
      {
        email: response.emailAddress,
        mobile: response.phoneNo,
        id: response.id,
        role: "USER",
      },
      "1d"
    );
    return {
      id: response.id,
      email: response.emailAddress,
      avatar: response.avatar,
      token: authToken,
    };
  }

  private async findCustomerBySigninIdentifier(identifier: I_IDENTIFIED, value: string) {
    const query: DataBaseSchema.CustomerProfileDataModelWhereUniqueInput =
      identifier == "email"
        ? { emailAddress: value }
        : { phoneNo: "+91" + removeCountryCode(value) };

    return db.dataBase.customerProfileDataModel.findUnique({
      where: { ...query, isDeleted: false },
      include: { utility: true },
    });
  }

  private canActivateAtLogin(
    user: DataBaseSchema.CustomerProfileDataModelGetPayload<{
      include: { utility: true };
    }>,
  ) {
    return user.utility.signinWith === "CREDENTIALS";
  }

  private assertCanManageTwoFactor(
    user: DataBaseSchema.CustomerProfileDataModelGetPayload<{
      include: { utility: true };
    }>,
  ) {
    if (user.utility.signinWith !== "CREDENTIALS") {
      throw new AppError(
        "Two-factor passcode is available only for email or phone OTP accounts.",
        { code: "TWO_FACTOR_CREDENTIALS_ONLY" },
      );
    }
  }

  private createTwoFactorPasscodeChallengeToken(userId: number): string {
    return tokenUtils.generateToken(
      { identifier: `CUSTOMER_2FA_PASSCODE:${userId}` },
      "10m",
    );
  }

  private parseTwoFactorChallengeToken(token: string): { userId: number } {
    const payload = tokenUtils.verifyToken<{ identifier: string }>(token);
    const identifier = payload.identifier;
    if (!identifier?.startsWith("CUSTOMER_2FA_PASSCODE:")) {
      throw new AppError("Invalid 2FA challenge. Please login again.", {
        code: "INVALID_TWO_FACTOR_CHALLENGE",
      });
    }
    const userId = Number(identifier.split(":")[1]);
    if (Number.isNaN(userId)) {
      throw new AppError("Invalid 2FA challenge. Please login again.", {
        code: "INVALID_TWO_FACTOR_CHALLENGE",
      });
    }
    return { userId };
  }

  private needsPhoneActivation(
    user: DataBaseSchema.CustomerProfileDataModelGetPayload<{
      include: { utility: true };
    }>,
    identifier: I_IDENTIFIED,
  ) {
    return identifier === "phoneNo" && !user.utility.isPhoneVerified;
  }

  private needsEmailActivation(
    user: DataBaseSchema.CustomerProfileDataModelGetPayload<{
      include: { utility: true };
    }>,
    identifier: I_IDENTIFIED,
  ) {
    return identifier === "email" && !user.utility.isEmailVerified;
  }

  /** Login activation OTP only when both email and phone are unverified. */
  private shouldUseActivationAtLogin(
    user: DataBaseSchema.CustomerProfileDataModelGetPayload<{
      include: { utility: true };
    }>,
    identifier: I_IDENTIFIED,
  ) {
    if (!this.canActivateAtLogin(user)) {
      return false;
    }
    if (user.utility.isEmailVerified || user.utility.isPhoneVerified) {
      return false;
    }
    return (
      this.needsPhoneActivation(user, identifier) ||
      this.needsEmailActivation(user, identifier)
    );
  }

  private maskPhoneForDisplay(phoneNo: string | null): string {
    const digits = removeCountryCode(phoneNo ?? "");
    if (digits.length < 4) return phoneNo ?? "";
    return `+91 XXXXXX${digits.slice(-4)}`;
  }

  private maskEmailForDisplay(email: string): string {
    const at = email.indexOf("@");
    if (at <= 0) return email;
    const local = email.slice(0, at);
    const domain = email.slice(at + 1);
    if (local.length <= 2) return `***@${domain}`;
    return `${local.slice(0, 2)}***@${domain}`;
  }

  private getAccountActivationPromptAtLogin(
    user: DataBaseSchema.CustomerProfileDataModelGetPayload<{
      include: { utility: true };
    }>,
    identifier: I_IDENTIFIED,
  ) {
    if (!this.canActivateAtLogin(user)) {
      throw new AppError("Account activation is not available for this sign-in method.", {
        code: "ACTIVATION_NOT_ALLOWED",
      });
    }

    const channel = identifier === "phoneNo" ? "phone" : "email";

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddress,
      requiresAccountActivation: true as const,
      channel,
      activationOtpSent: false as const,
      maskedTarget:
        channel === "phone"
          ? this.maskPhoneForDisplay(user.phoneNo)
          : this.maskEmailForDisplay(user.emailAddress),
    };
  }

  private async sendAccountActivationOtpAtLogin(
    user: DataBaseSchema.CustomerProfileDataModelGetPayload<{
      include: { utility: true };
    }>,
    identifier: I_IDENTIFIED,
  ) {
    if (!this.canActivateAtLogin(user)) {
      throw new AppError("Account activation is not available for this sign-in method.", {
        code: "ACTIVATION_NOT_ALLOWED",
      });
    }

    const channel = identifier === "phoneNo" ? "phone" : "email";
    const otpKey = `CUSTOMER_LOGIN_ACTIVATE:${channel}:${user.id}`;
    const otpLength = channel === "phone" ? 4 : 6;
    const { token, otp } = await this.optManager.generateOtp(otpKey, otpLength);

    if (channel === "phone") {
      if (!user.phoneNo) {
        throw new AppError("No mobile number on file.", { code: "PHONE_NOT_FOUND" });
      }
      await sendMobileOtp({
        mobile: removeCountryCode(user.phoneNo),
        otp,
        template: "login",
      });
    } else {
      await sendCustomerSignupOtpEmail({
        email: user.emailAddress,
        userName: `${user.firstName} ${user.lastName}`.trim(),
        otp,
      });
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddress,
      requiresAccountActivation: true as const,
      channel,
      activationOtpSent: true as const,
      token,
      maskedTarget:
        channel === "phone"
          ? this.maskPhoneForDisplay(user.phoneNo)
          : this.maskEmailForDisplay(user.emailAddress),
    };
  }

  private checkUserSigninWith(
    user: DataBaseSchema.CustomerProfileDataModelGetPayload<{
      include: {
        utility: true;
      };
    }>,
    identifier: I_IDENTIFIED
  ) {
    if (user?.utility.signinWith == "GOOGLE") {
      throw new AppError(
        "This email was registered using Google. Please continue with Google below to log in.",
        { code: "GOOGLE_SIGNIN" }
      );
    }
    if (user?.utility.signinWith == "MICROSOFT") {
      throw new AppError(
        "This email was registered using Microsoft. Please continue with Microsoft below to log in.",
        { code: "MICROSOFT_SIGNIN" }
      );
    }
    if (user?.utility.signinWith == "FACEBOOK") {
      throw new AppError(
        "This email was registered using Facebook. Please continue with Facebook below to log in.",
        { code: "FACEBOOK_SIGNIN" }
      );
    }
    if (user.utility.accountStatus == "SUSPENDED") {
      throw new AppError(
        "Your account has been suspended. Please contact support for further assistance.",
        { code: "ACCOUNT_SUSPENDED" }
      );
    }
    if (identifier == "email" && !user.utility.isEmailVerified) {
      throw new AppError(
        `Your email is not verified. Please login using your verified phone number. Or, <a class='underline text-primary cursor-pointer' role='button' id='resend-email-verification'>Click here</a> to send the email verification link. Once verified, you can login using your email ID as well.`,
        { code: "EMAIL_NOT_VERIFIED" },
      );
    }
    if (identifier == "phoneNo" && !user.utility.isPhoneVerified) {
      if (user.utility.isEmailVerified) {
        const maskedEmail = this.maskEmailForDisplay(user.emailAddress);
        throw new AppError(
          `Your mobile number is not verified yet. Your email address <span class="font-medium">${maskedEmail}</span> is verified. Please sign in using your verified email address.`,
          { code: "PHONE_NOT_VERIFIED" },
        );
      }
      throw new AppError(
        "Your mobile number is not verified yet. Please verify your account to continue.",
        { code: "PHONE_NOT_VERIFIED" },
      );
    }
  }

  async sendEmailVerification(customerId: number): Promise<boolean> {
    // Logic to send email verification (implementation not shown)

    const customer = await db.dataBase.customerProfileDataModel.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer) {
      throw new AppError("Customer not found.");
    }

    const token = tokenUtils.generateToken({ customerId, role: "USER" }, "30m");

    await sendEmailVerificationLink({
      email: customer.emailAddress,
      userName: customer.firstName + " " + customer.lastName,
      link: `${env.NEXT_PUBLIC_HOST_URL}/verify-email?token=${token}`,
    });
    return true;
  }

  async verifyEmailToken(token: string): Promise<boolean> {
    try {
      const decoded = tokenUtils.verifyToken<{ customerId: number }>(token);
      const customerId = decoded.customerId;

      await db.dataBase.customerProfileDataModel.update({
        data: {
          utility: {
            update: {
              isEmailVerified: true,
            },
          },
        },
        where: {
          id: customerId,
        },
      });

      return true;
    } catch (error) {
      console.error("Email verification failed:", error);
      throw new AppError("Invalid or expired token.");
    }
  }

  private async assertEmailNotUsedByOtherCustomer(
    email: string,
    excludeCustomerId: number,
  ) {
    const existing = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        emailAddress: email,
        id: { not: excludeCustomerId },
        isDeleted: false,
      },
      select: { id: true },
    });
    if (existing) {
      throw new AppError("This email is already registered to another account.", {
        code: "EMAIL_ALREADY_IN_USE",
      });
    }
  }

  private async assertPhoneNotUsedByOtherCustomer(
    phoneNo: string,
    excludeCustomerId: number,
  ) {
    const existing = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        phoneNo,
        id: { not: excludeCustomerId },
        isDeleted: false,
      },
      select: { id: true },
    });
    if (existing) {
      throw new AppError(
        "This phone number is already registered to another account.",
        { code: "PHONE_ALREADY_IN_USE" },
      );
    }
  }

  async throwEmailOrPhoneExists(emailOrMob: string) {
    const user =
      await this.customerProfileService.getCustomerProfileByEmail(emailOrMob);
    if (user?.emailAddress && user.emailAddress === emailOrMob) {
      throw new Error("Email already exists");
    }

    const userByPhone =
      await this.customerProfileService.getCustomerProfileByPhone(
        "+91" + removeCountryCode(emailOrMob)
      );

    if (
      userByPhone?.phoneNo &&
      (userByPhone.phoneNo == emailOrMob ||
        userByPhone.phoneNo == "+91" + removeCountryCode(emailOrMob))
    ) {
      throw new Error("Phone number already exists");
    }

    return user;
  }

  async resendEmailVerificationForUnverifiedUser(data: {
    identifier: I_IDENTIFIED;
    value: string;
  }): Promise<boolean> {
    const query: DataBaseSchema.CustomerProfileDataModelWhereUniqueInput =
      data.identifier == "email"
        ? {
          emailAddress: data.value,
        }
        : {
          phoneNo: "+91" + removeCountryCode(data.value),
        };

    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: {
        ...query,
        isDeleted: false,
      },
      include: {
        utility: true,
      },
    });

    if (!user) {
      throw new AppError("Invalid email or mobile number", {
        code: "USER_NOT_FOUND",
      });
    }

    // Only allow resend if both email and phone are not verified
    if (user.utility.isEmailVerified || user.utility.isPhoneVerified) {
      throw new AppError(
        "Your account is already verified. Please login with your credentials.",
        { code: "ALREADY_VERIFIED" }
      );
    }

    // Check if account is suspended
    if (user.utility.accountStatus == "SUSPENDED") {
      throw new AppError("Your account is suspended", {
        code: "ACCOUNT_SUSPENDED",
      });
    }

    // Send email verification
    const token = tokenUtils.generateToken(
      { customerId: user.id, role: "USER" },
      "30m"
    );

    await sendEmailVerificationLink({
      email: user.emailAddress,
      userName: user.firstName + " " + user.lastName,
      link: `${env.NEXT_PUBLIC_HOST_URL}/verify-email?token=${token}`,
    });

    return true;
  }
}
