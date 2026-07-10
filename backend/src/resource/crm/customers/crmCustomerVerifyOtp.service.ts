import { db } from "@core/database/database";
import {
  sendCustomerEmailVerifyOtpEmail,
} from "@jobs/helper/send_emails";
import { sendMobileOtp } from "@jobs/helper/send_sms";
import { OtpVerificationService } from "@services/otp_verification.service";
import { AppError, HttpStatus } from "@utils/error/AppError";
import { tokenUtils } from "@utils/token/JwtToken_utils";

/**
 * Redis identifier prefix that the customer self-serve email verify flow
 * uses (see `customer.profile.service.ts`). We deliberately reuse it here
 * so a CRM-initiated and a customer-initiated email-verify OTP share the
 * same key — the latest one issued wins, and either party can complete
 * the verification.
 */
const EMAIL_VERIFY_PREFIX = "CUSTOMER_EMAIL_VERIFY|";

function buildEmailVerifyIdentifier(customerId: number) {
  return `${EMAIL_VERIFY_PREFIX}${customerId}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Mask the bulk of an email address — keep the first 2 chars and the
 * domain, replace the rest with `*`. Used only for safe rendering in the
 * CRM "OTP sent to …" dialog header; the OTP itself goes to the real
 * mailbox.
 */
function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return trimmed;
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  if (local.length <= 2) return `${local}***${domain}`;
  return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 2, 3))}${domain}`;
}

/**
 * Mask the middle of a phone number — keep the country code (if any) and
 * the last 4 digits. Same purpose as `maskEmail`.
 */
function maskMobile(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return phone;
  const tail = digits.slice(-4);
  const head = digits.length > 10 ? `+${digits.slice(0, digits.length - 10)}` : "";
  return `${head} XXXXXX${tail}`.trim();
}

/**
 * CRM-side service for sending and verifying OTPs against an existing
 * customer's registered phone / email so a CRM admin can mark them as
 * verified without giving the customer the password to do it themselves.
 *
 * Implementation notes
 * --------------------
 *  - Phone OTPs are 6 digits, expire after 300 s. MSG91 is enqueued via
 *    `sendMobileOtp(template: "verify")` exactly like the self-serve
 *    flow, so the SMS body the customer receives is identical.
 *  - Email OTPs are 6 digits, expire after 300 s. The SMTP template
 *    used is `meraDhanOtpEmailText` via `sendCustomerEmailVerifyOtpEmail`.
 *  - We deliberately share the Redis namespace (`MOBILE_VERIFY` and
 *    `EMAIL_VERIFY`) with the customer-side flow — last issuer wins, and
 *    either party can complete the verification.
 *  - Successful verifies flip `customers_auth_data.is{Phone,Email}Verified`
 *    on the linked `CustomersAuthDataModel` (exposed in API as
 *    `utility.is{Phone,Email}Verified`).
 */
export class CrmCustomerVerifyOtpService {
  private mobileOtp = new OtpVerificationService("MOBILE_VERIFY");
  private emailOtp = new OtpVerificationService("EMAIL_VERIFY");

  private async loadCustomerWithUtility(customerId: number) {
    const user = await db.dataBase.customerProfileDataModel.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phoneNo: true,
        emailAddress: true,
        utility: {
          select: { isEmailVerified: true, isPhoneVerified: true },
        },
      },
    });
    if (!user) {
      throw new AppError("Customer not found.", {
        code: "CUSTOMER_NOT_FOUND",
        statusCode: HttpStatus.NOT_FOUND,
      });
    }
    return user;
  }

  // ---------------- Mobile ----------------

  async sendMobileVerifyOtp(
    customerId: number,
  ): Promise<{ otpToken: string; sentTo: string }> {
    const user = await this.loadCustomerWithUtility(customerId);

    const phoneNo = (user.phoneNo ?? "").trim();
    if (!phoneNo) {
      throw new AppError("Customer does not have a registered mobile number.", {
        code: "CUSTOMER_NO_MOBILE",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (user.utility?.isPhoneVerified) {
      throw new AppError("Mobile number is already verified.", {
        code: "MOBILE_ALREADY_VERIFIED",
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const { token, otp } = await this.mobileOtp.generateOtp(phoneNo, 6, 300);
    await sendMobileOtp({
      mobile: phoneNo,
      otp,
      template: "verify",
    });

    return { otpToken: token, sentTo: maskMobile(phoneNo) };
  }

  async verifyMobileOtp({
    customerId,
    otp,
    token,
  }: {
    customerId: number;
    otp: string;
    token: string;
  }): Promise<{ verified: true; phoneNo: string }> {
    const user = await this.loadCustomerWithUtility(customerId);

    const phoneNo = (user.phoneNo ?? "").trim();
    if (!phoneNo) {
      throw new AppError("Customer does not have a registered mobile number.", {
        code: "CUSTOMER_NO_MOBILE",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (user.utility?.isPhoneVerified) {
      throw new AppError("Mobile number is already verified.", {
        code: "MOBILE_ALREADY_VERIFIED",
        statusCode: HttpStatus.CONFLICT,
      });
    }

    let tokenData: { identifier: string };
    try {
      tokenData = tokenUtils.verifyToken<{ identifier: string }>(token);
    } catch {
      throw new AppError("OTP session is invalid or has expired.", {
        code: "INVALID_OTP_TOKEN",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (tokenData.identifier !== phoneNo) {
      throw new AppError(
        "OTP session does not match this customer's mobile number.",
        { code: "OTP_SESSION_MISMATCH", statusCode: HttpStatus.BAD_REQUEST },
      );
    }

    await this.mobileOtp.verifyOtp(token, otp);

    await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: { utility: { update: { isPhoneVerified: true } } },
    });

    return { verified: true, phoneNo: maskMobile(phoneNo) };
  }

  // ---------------- Email ----------------

  async sendEmailVerifyOtp(
    customerId: number,
  ): Promise<{ otpToken: string; sentTo: string }> {
    const user = await this.loadCustomerWithUtility(customerId);

    const email = normalizeEmail(user.emailAddress ?? "");
    if (!email) {
      throw new AppError("Customer does not have a registered email address.", {
        code: "CUSTOMER_NO_EMAIL",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (user.utility?.isEmailVerified) {
      throw new AppError("Email is already verified.", {
        code: "EMAIL_ALREADY_VERIFIED",
        statusCode: HttpStatus.CONFLICT,
      });
    }

    const identifier = buildEmailVerifyIdentifier(customerId);
    const { token, otp } = await this.emailOtp.generateOtp(identifier, 6, 300);

    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "User";
    await sendCustomerEmailVerifyOtpEmail({
      email,
      userName: displayName,
      otp,
    });

    return { otpToken: token, sentTo: maskEmail(email) };
  }

  async verifyEmailOtp({
    customerId,
    otp,
    token,
  }: {
    customerId: number;
    otp: string;
    token: string;
  }): Promise<{ verified: true; email: string }> {
    const user = await this.loadCustomerWithUtility(customerId);

    const email = normalizeEmail(user.emailAddress ?? "");
    if (!email) {
      throw new AppError("Customer does not have a registered email address.", {
        code: "CUSTOMER_NO_EMAIL",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (user.utility?.isEmailVerified) {
      throw new AppError("Email is already verified.", {
        code: "EMAIL_ALREADY_VERIFIED",
        statusCode: HttpStatus.CONFLICT,
      });
    }

    let tokenData: { identifier: string };
    try {
      tokenData = tokenUtils.verifyToken<{ identifier: string }>(token);
    } catch {
      throw new AppError("OTP session is invalid or has expired.", {
        code: "INVALID_OTP_TOKEN",
        statusCode: HttpStatus.BAD_REQUEST,
      });
    }
    if (tokenData.identifier !== buildEmailVerifyIdentifier(customerId)) {
      throw new AppError(
        "OTP session does not match this customer's email.",
        { code: "OTP_SESSION_MISMATCH", statusCode: HttpStatus.BAD_REQUEST },
      );
    }

    await this.emailOtp.verifyOtp(token, otp);

    await db.dataBase.customerProfileDataModel.update({
      where: { id: customerId },
      data: { utility: { update: { isEmailVerified: true } } },
    });

    return { verified: true, email: maskEmail(email) };
  }
}
