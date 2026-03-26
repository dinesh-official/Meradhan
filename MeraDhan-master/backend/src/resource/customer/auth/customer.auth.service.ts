import { db, type DataBaseSchema } from "@core/database/database";
import {
  sendCustomerSigninOtpEmail,
  sendEmailVerificationLink,
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
            isEmailVerified: verifyBy === "email",
            isPhoneVerified: verifyBy === "mobile",
          },
        },
      },
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
    };
  }

  async signinRequest(data: { identifier: I_IDENTIFIED; value: string }) {
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

    this.checkUserSigninWith(user, data.identifier);
    if (data.identifier == "phoneNo") {
      return await this.sendSigninWithOtp({ identifier: data.identifier, value: data.value });
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.emailAddress,
    };
  }

  async signInWithCredentials(data: {
    identifier: I_IDENTIFIED;
    value: string;
    password: string;
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

    // verify password
    const isPasswordValid = await hashingUtils.comparePassword(
      data.password,
      user.utility.password || ""
    );
    if (!isPasswordValid) {
      throw new AppError("Invalid password please try again", {
        code: "INVALID_PASSWORD",
      });
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
      if (!user.utility.isPhoneVerified && !user.utility.isEmailVerified) {
        throw new AppError(
          "This account hasn’t been verified yet. <a class='underline text-primary cursor-pointer' role='button' id='resend-email-verification'  >Click here</a> to send a verification link to your email to activate your account.",
          { code: "EMAIL_NOT_VERIFIED" }
        );
      }
      throw new AppError(
        `Your email is not verified. Please login using your verified phone number. Or, <a class='underline text-primary cursor-pointer' role='button' id='resend-email-verification'   >Click here</a> to send the email verification link. Once verified, you can login using your email ID as well.`,
        { code: "EMAIL_NOT_VERIFIED" }
      );
    }
    if (identifier == "phoneNo" && !user.utility.isPhoneVerified) {
      throw new AppError(
        "This mobile number is not verified. Please login using your email ID and verify your phone number from the My Profile section.",
        { code: "PHONE_NOT_VERIFIED" }
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
