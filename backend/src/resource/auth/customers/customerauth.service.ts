import { db, type DataBaseSchema } from "@core/database/database";
import { CustomerProfileManager } from "@lib/manager/customer/customer.manager";
import { OtpVerificationService } from "@lib/manager/OtpVerificationService.service";
import type { appSchema } from "@root/schema";
import { AppError } from "@utils/error/AppError";
import { removeCountryCode } from "@utils/filters/convert";
import { hashingUtils } from "@utils/hash/hashing.utils";
import { tokenUtils } from "@utils/token/JwtToken.utils";
import type z from "zod";
import { sendCustomerSigninOtpEmail } from "../../../queues/services/sender/sendEmailOtp";
import { sendMobileOtp } from "../../../queues/services/sender/sendMobileOtp";
type I_IDENTIFIED = "email" | "phoneNo"
export class CustomerAuthService {
    private customerProfileService = new CustomerProfileManager();
    private optManager = new OtpVerificationService("AUTH_OTP");

    async signUpWithCredentials(data: z.infer<typeof appSchema.customer.createNewCustomerSchema>) {
        const user = await this.customerProfileService.createCustomerProfile(data);
        const authToken = tokenUtils.generateToken({
            email: user.emailAddress,
            id: user.id,
        }, '1d');
        await this.customerProfileService.setLatestLoginTime(user.id);
        return {
            id: user.id,
            email: user.emailAddress,
            avatar: user.avatar,
            token: authToken,
        };
    }

    async signinRequest(data: { identifier: I_IDENTIFIED, value: string }) {

        const query: DataBaseSchema.CustomerProfileDataModelWhereUniqueInput = data.identifier == "email" ? {
            emailAddress: data.value
        } : {
            phoneNo: "+91" + removeCountryCode(data.value)
        }

        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: query,
            include: {
                utility: true
            }
        });
        if (!user) {
            throw new AppError("Invalid email or mobile number", { code: "USER_NOT_FOUND" });
        }

        this.checkUserSigninWith(user, data.identifier);

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName
        };
    }

    async signInWithCredentials(data: { identifier: I_IDENTIFIED, value: string, password: string }) {
        
        const query: DataBaseSchema.CustomerProfileDataModelWhereUniqueInput = data.identifier == "email" ? {
            emailAddress: data.value
        } : {
            phoneNo: "+91" + removeCountryCode(data.value)
        }

        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: query,
            include: {
                utility: true
            }
        });
        if (!user) {
            throw new AppError("Invalid email or mobile number", { code: "USER_NOT_FOUND" });
        }

        this.checkUserSigninWith(user, data.identifier);

        // verify password
        const isPasswordValid = await hashingUtils.comparePassword(data.password, (user.utility.password || ""));
        if (!isPasswordValid) {
            throw new AppError("Invalid password please try again", { code: "INVALID_PASSWORD" });
        }

        const authToken = tokenUtils.generateToken({
            email: user.emailAddress,
            mobile: user.phoneNo,
            id: user.id,
        }, '1d');
        await this.customerProfileService.setLatestLoginTime(user.id);
        return {
            id: user.id,
            email: user.emailAddress,
            avatar: user.avatar,
            token: authToken,
        };
    }

    async sendSigninWithOtp(data: { identifier: I_IDENTIFIED, value: string }) {
        const query: DataBaseSchema.CustomerProfileDataModelWhereUniqueInput = data.identifier == "email" ? {
            emailAddress: data.value
        } : {
            phoneNo: "+91" + removeCountryCode(data.value)
        }

        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: query,
            include: {
                utility: true
            }
        });
        if (!user) {
            throw new AppError("Invalid email or mobile number", { code: "USER_NOT_FOUND" });
        }

        this.checkUserSigninWith(user, data.identifier);
        const { token, otp } = await this.optManager.generateOtp("CUSTOMER_SIGNIN:" + user.id + ":" + data.identifier, 4);

        // send otp to user worker
        if (data.identifier == "email") {
            sendCustomerSigninOtpEmail({
                email: user.emailAddress,
                otp,
                userName: user.firstName + " " + user.lastName
            });
        } else {
            await sendMobileOtp({
                mobile: user.phoneNo,
                otp,
                template: "login"
            });
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            token
        };

    }

    async verifySigninWithOtp(data: { identifier: I_IDENTIFIED, value: string, token: string, otp: string }) {
        const query: DataBaseSchema.CustomerProfileDataModelWhereUniqueInput = data.identifier == "email" ? {
            emailAddress: data.value
        } : {
            phoneNo: "+91" + removeCountryCode(data.value)
        }

        const user = await db.dataBase.customerProfileDataModel.findUnique({
            where: query,
            include: {
                utility: true
            }
        });
        if (!user) {
            throw new AppError("Invalid email or mobile number", { code: "USER_NOT_FOUND" });
        }

        this.checkUserSigninWith(user, data.identifier);
        const isValid = await this.optManager.verifyOtp("CUSTOMER_SIGNIN:" + user.id + ":" + data.identifier, data.otp);

        // send otp to user worker
        if (!isValid) {
            throw new AppError("Invalid OTP. Please try again.");
        }

        const authToken = tokenUtils.generateToken({
            email: user.emailAddress,
            mobile: user.phoneNo,
            id: user.id,
        }, '1d');
        await this.customerProfileService.setLatestLoginTime(user.id);
        return {
            id: user.id,
            email: user.emailAddress,
            avatar: user.avatar,
            token: authToken,
        };
    }

    private checkUserSigninWith(user: DataBaseSchema.CustomerProfileDataModelGetPayload<{
        include: {
            utility: true
        }
    }>, identifier: I_IDENTIFIED) {
        if (user?.utility.signinWith == "GOOGLE") {
            throw new AppError("This email was registered using Google. Please continue with Google below to log in.", { code: "GOOGLE_SIGNIN" });
        }
        if (user?.utility.signinWith == "MICROSOFT") {
            throw new AppError("This email was registered using Microsoft. Please continue with Microsoft below to log in.", { code: "MICROSOFT_SIGNIN" });
        }
        if (user?.utility.signinWith == "FACEBOOK") {
            throw new AppError("This email was registered using Facebook. Please continue with Facebook below to log in.", { code: "FACEBOOK_SIGNIN" });
        }
        if (user.utility.accountStatus == "SUSPENDED") {
            throw new AppError("Your account has been suspended. Please contact support for further assistance.", { code: "ACCOUNT_SUSPENDED" });
        }
        if (identifier == "email" && !user.utility.isEmailVerified) {
            throw new AppError("This email is not verified. Please login using your email ID and verify your email from the My Profile section.", { code: "EMAIL_NOT_VERIFIED" });
        }
        if (identifier == "phoneNo" && !user.utility.isPhoneVerified) {
            throw new AppError("This mobile number is not verified. Please login using your email ID and verify your phone number from the My Profile section.", { code: "PHONE_NOT_VERIFIED" });
        }
    }

    async throwEmailOrPhoneExists(emailOrMob: string) {
        const user = await this.customerProfileService.getCustomerProfileByEmail(emailOrMob);
        if (user) {
            throw new Error("Email already exists");
        }
        const userByPhone = await this.customerProfileService.getCustomerProfileByPhone("+91" + removeCountryCode(emailOrMob));
        if (userByPhone) {
            throw new Error("Phone number already exists");
        }
        return user;
    }
}