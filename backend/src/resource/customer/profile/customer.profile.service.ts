import { db } from "@core/database/database";
import {
  sendCustomerEmailChangeOtpEmail,
  sendCustomerEmailVerifyOtpEmail,
} from "@jobs/helper/send_emails";
import { sendMobileOtp } from "@jobs/helper/send_sms";
import { CustomerProfileManager } from "@services/customer/customer_manager.service";
import { OtpVerificationService } from "@services/otp_verification.service";
import { ParticipantManager } from "@services/refq/nse/cbrics_manager.service";
import { AppError } from "@utils/error/AppError";
import { tokenUtils } from "@utils/token/JwtToken_utils";

const EMAIL_CHANGE_PREFIX = "CUSTOMER_EMAIL_CHANGE|";
const EMAIL_VERIFY_PREFIX = "CUSTOMER_EMAIL_VERIFY|";

function buildEmailVerifyIdentifier(customerId: number) {
  return `${EMAIL_VERIFY_PREFIX}${customerId}`;
}

function parseEmailVerifyIdentifier(identifier: string): number | null {
  if (!identifier.startsWith(EMAIL_VERIFY_PREFIX)) return null;
  const idStr = identifier.slice(EMAIL_VERIFY_PREFIX.length);
  const customerId = Number(idStr);
  return Number.isFinite(customerId) ? customerId : null;
}

function normalizeCustomerEmail(email: string) {
  return email.trim().toLowerCase();
}

function buildEmailChangeIdentifier(customerId: number, newEmail: string) {
  return `${EMAIL_CHANGE_PREFIX}${customerId}|${normalizeCustomerEmail(newEmail)}`;
}

function parseEmailChangeIdentifier(identifier: string): {
  customerId: number;
  newEmail: string;
} | null {
  if (!identifier.startsWith(EMAIL_CHANGE_PREFIX)) return null;
  const rest = identifier.slice(EMAIL_CHANGE_PREFIX.length);
  const pipe = rest.indexOf("|");
  if (pipe === -1) return null;
  const idStr = rest.slice(0, pipe);
  const email = rest.slice(pipe + 1);
  const customerId = Number(idStr);
  if (!Number.isFinite(customerId) || !email) return null;
  return { customerId, newEmail: normalizeCustomerEmail(email) };
}

export class CustomerProfileService {
  private optManager = new OtpVerificationService("MOBILE_VERIFY");
  private emailVerifyOtpManager = new OtpVerificationService("EMAIL_VERIFY");
  private emailChangeOtpManager = new OtpVerificationService("EMAIL_CHANGE");
  private participantManager = new ParticipantManager();
  private customerProfileManager = new CustomerProfileManager();

  async updateMobileRequest({
    customerId,
    newMobile,
    newWhatsAppNo,
  }: {
    newMobile: string;
    newWhatsAppNo?: string;
    customerId: number;
  }): Promise<boolean> {
    // Logic to handle mobile update request

    // check if newMobile is already in use can be added here

    const existingOtp = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        phoneNo: newMobile,
      },
    });
    if (existingOtp) {
      throw new AppError(
        "Mobile number is already associated with another account.",
      );
    }

    const user = await db.dataBase.customerProfileDataModel.update({
      where: {
        id: customerId,
      },
      data: {
        whatsAppNo: newWhatsAppNo,
        phoneNo: newMobile,
        utility: {
          update: {
            isPhoneVerified: false,
          },
        },
      },
    });

    if (user.kycStatus == "VERIFIED") {
      await this.participantManager.updateParticipant(customerId);
    }

    return true;
  }

  async sendMobileOtpVerification({
    newMobile,
  }: {
    newMobile: string;
  }): Promise<string> {
    const otp = await this.optManager.generateOtp(newMobile);
    // Send OTP to new mobile number (implementation not shown)
    if (process.env.NODE_ENV !== "production") {
      console.log(`OTP sent to ${newMobile}: ${otp}`);
    }

    await sendMobileOtp({
      mobile: newMobile,
      otp: otp.otp,
      template: "verify",
    });

    return otp.token;
  }

  async verifyAndUpdateMobile({
    customerId,
    newMobile,
    otpToken,
    otpCode,
  }: {
    customerId: number;
    newMobile: string;
    otpToken: string;
    otpCode: string;
  }): Promise<boolean> {
    const isValid = await this.optManager.verifyOtp(otpToken, otpCode);
    if (isValid) {
      // Update the customer's mobile number in the database (implementation not shown)
      console.log(
        `Mobile number for customer ${customerId} updated to ${newMobile}`,
      );

      await db.dataBase.customerProfileDataModel.update({
        data: {
          phoneNo: newMobile,
          utility: {
            update: {
              isPhoneVerified: true,
            },
          },
        },
        where: {
          id: customerId,
        },
      });

      return true;
    } else {
      console.log(`OTP verification failed for customer ${customerId}`);
      return false;
    }
  }

  async toggleWhatsAppNotifications(
    customerId: number,
    enable: boolean,
  ): Promise<boolean> {
    await db.dataBase.customerProfileDataModel.update({
      data: {
        utility: {
          update: {
            whatsAppNotificationAllow: enable,
          },
        },
      },
      where: {
        id: customerId,
      },
    });

    return true;
  }

  async sendEmailVerifyOtp({
    customerId,
    email: rawEmail,
  }: {
    customerId: number;
    email: string;
  }): Promise<{ token: string }> {
    const email = normalizeCustomerEmail(rawEmail);

    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        emailAddress: true,
        firstName: true,
        lastName: true,
        utility: { select: { isEmailVerified: true } },
      },
    });
    if (!user) {
      throw new AppError("Customer not found", { code: "CUSTOMER_NOT_FOUND" });
    }
    if (user.utility?.isEmailVerified) {
      throw new AppError("Email is already verified.", {
        code: "EMAIL_ALREADY_VERIFIED",
      });
    }
    if (normalizeCustomerEmail(user.emailAddress || "") !== email) {
      throw new AppError("Email does not match your registered address.", {
        code: "EMAIL_MISMATCH",
      });
    }

    const identifier = buildEmailVerifyIdentifier(customerId);
    const { token, otp } = await this.emailVerifyOtpManager.generateOtp(
      identifier,
      6,
      300,
    );

    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "User";
    await sendCustomerEmailVerifyOtpEmail({
      email,
      userName: displayName,
      otp,
    });

    return { token };
  }

  async verifyEmailVerifyOtp({
    customerId,
    email: rawEmail,
    token,
    otp,
  }: {
    customerId: number;
    email: string;
    token: string;
    otp: string;
  }): Promise<boolean> {
    const email = normalizeCustomerEmail(rawEmail);

    let tokenData: { identifier: string };
    try {
      tokenData = tokenUtils.verifyToken<{ identifier: string }>(token);
    } catch {
      throw new AppError("The provided OTP session is invalid or has expired.", {
        code: "INVALID_OTP_TOKEN",
      });
    }

    const parsedCustomerId = parseEmailVerifyIdentifier(tokenData.identifier);
    if (parsedCustomerId !== customerId) {
      throw new AppError("Invalid OTP session.", { code: "INVALID_OTP_SESSION" });
    }

    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      select: { emailAddress: true, utility: { select: { isEmailVerified: true } } },
    });
    if (!user) {
      throw new AppError("Customer not found", { code: "CUSTOMER_NOT_FOUND" });
    }
    if (user.utility?.isEmailVerified) {
      throw new AppError("Email is already verified.", {
        code: "EMAIL_ALREADY_VERIFIED",
      });
    }
    if (normalizeCustomerEmail(user.emailAddress || "") !== email) {
      throw new AppError("Email does not match your registered address.", {
        code: "EMAIL_MISMATCH",
      });
    }

    await this.emailVerifyOtpManager.verifyOtp(token, otp);

    await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: {
        utility: {
          update: {
            isEmailVerified: true,
          },
        },
      },
    });

    return true;
  }

  async sendEmailChangeOtp({
    customerId,
    newEmail: rawNewEmail,
  }: {
    customerId: number;
    newEmail: string;
  }): Promise<{ token: string }> {
    const newEmail = normalizeCustomerEmail(rawNewEmail);

    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        kycStatus: true,
        emailAddress: true,
        firstName: true,
        lastName: true,
      },
    });
    if (!user) {
      throw new AppError("Customer not found", { code: "CUSTOMER_NOT_FOUND" });
    }
    if (user.kycStatus !== "PENDING") {
      throw new AppError(
        "Email can only be changed while KYC is pending.",
        { code: "EMAIL_CHANGE_NOT_ALLOWED" },
      );
    }
    if (normalizeCustomerEmail(user.emailAddress || "") === newEmail) {
      throw new AppError("This is already your registered email address.", {
        code: "EMAIL_UNCHANGED",
      });
    }

    const duplicate = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        emailAddress: newEmail,
        NOT: { id: customerId },
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new AppError("This email is already registered to another account.", {
        code: "EMAIL_ALREADY_IN_USE",
      });
    }

    const identifier = buildEmailChangeIdentifier(customerId, newEmail);
    const { token, otp } = await this.emailChangeOtpManager.generateOtp(
      identifier,
      6,
      300,
    );

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "User";
    await sendCustomerEmailChangeOtpEmail({
      email: newEmail,
      userName: displayName,
      otp,
    });

    return { token };
  }

  async verifyEmailChange({
    customerId,
    newEmail: rawNewEmail,
    token,
    otp,
  }: {
    customerId: number;
    newEmail: string;
    token: string;
    otp: string;
  }): Promise<{
    id: number;
    email: string;
    avatar: string | null;
    token: string;
    previousEmail: string | null;
  }> {
    const newEmail = normalizeCustomerEmail(rawNewEmail);

    let tokenData: { identifier: string };
    try {
      tokenData = tokenUtils.verifyToken<{ identifier: string }>(token);
    } catch {
      throw new AppError("The provided OTP session is invalid or has expired.", {
        code: "INVALID_OTP_TOKEN",
      });
    }

    const parsed = parseEmailChangeIdentifier(tokenData.identifier);
    if (!parsed || parsed.customerId !== customerId) {
      throw new AppError("Invalid OTP session.", { code: "INVALID_OTP_SESSION" });
    }
    if (parsed.newEmail !== newEmail) {
      throw new AppError("Email does not match the OTP request.", {
        code: "EMAIL_MISMATCH",
      });
    }

    const userBefore = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        kycStatus: true,
        emailAddress: true,
        phoneNo: true,
        avatar: true,
      },
    });
    if (!userBefore) {
      throw new AppError("Customer not found", { code: "CUSTOMER_NOT_FOUND" });
    }
    if (userBefore.kycStatus !== "PENDING") {
      throw new AppError(
        "Email can only be changed while KYC is pending.",
        { code: "EMAIL_CHANGE_NOT_ALLOWED" },
      );
    }

    const taken = await db.dataBase.customerProfileDataModel.findFirst({
      where: {
        emailAddress: newEmail,
        NOT: { id: customerId },
      },
      select: { id: true },
    });
    if (taken) {
      throw new AppError("This email is already registered to another account.", {
        code: "EMAIL_ALREADY_IN_USE",
      });
    }

    await this.emailChangeOtpManager.verifyOtp(token, otp);

    const previousEmail = userBefore.emailAddress;

    const updated = await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: {
        emailAddress: newEmail,
        utility: {
          update: {
            isEmailVerified: true,
          },
        },
      },
      select: {
        id: true,
        emailAddress: true,
        phoneNo: true,
        avatar: true,
      },
    });

    await this.customerProfileManager.setLatestLoginTime(customerId);

    const authToken = tokenUtils.generateToken(
      {
        email: updated.emailAddress,
        mobile: updated.phoneNo,
        id: updated.id,
        role: "USER",
      },
      "1d",
    );

    return {
      id: updated.id,
      email: updated.emailAddress!,
      avatar: updated.avatar,
      token: authToken,
      previousEmail,
    };
  }
}
