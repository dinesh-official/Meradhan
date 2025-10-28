import { cookieOptions } from "@config/cookie";
import { OtpVerificationService } from "@lib/manager/OtpVerificationService.service";
import { appSchema } from "@root/schema";
import { AppError, HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { sendCustomerSignupOtpEmail } from "../../../queues/services/sender/sendEmailOtp";
import { sendMobileOtp } from "../../../queues/services/sender/sendMobileOtp";
import { CustomerAuthService } from "./customerauth.service";



export class CustomerAuthController {
    private customerAuthService = new CustomerAuthService();
    private optManager = new OtpVerificationService("AUTH_OTP");

    // ✅ Send Auth Email OTP
    async sendAuthEmailOtp(req: Request, res: Response) {
        const { email, name } = appSchema.customer.sendEmailOtpSchema.parse(req.body);
        await this.customerAuthService.throwEmailOrPhoneExists(email);
        const response = await this.optManager.generateOtp(
            "CUSTOMER_SIGNUP:" + email,
            4
        );
        await sendCustomerSignupOtpEmail({ email, userName: name, otp: response.otp });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: { token: response.token },
        });
    }

    // ✅ Send Auth Mobile OTP
    async sendAuthMobileOtp(req: Request, res: Response) {
        const { mobile } = appSchema.customer.sendMobileOtpSchema.parse(req.body);
        await this.customerAuthService.throwEmailOrPhoneExists(mobile);
        const response = await this.optManager.generateOtp("CUSTOMER_SIGNUP:" + mobile, 4);
        await sendMobileOtp({ mobile, otp: response.otp, template: "signup" })
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: { token: response.token },
        });
    }

    // ✅ Signup with Credentials
    async signUpWithCredentials(req: Request, res: Response) {
        const { otp, token } = appSchema.customer.signUpWithCredentialsQuerySchema.parse(req.query);
        const isVerified = await this.optManager.verifyOtp(
            token || "",
            otp.toString()
        );
        if (!isVerified) {
            throw new AppError("The OTP provided is invalid.");
        }
        const data = appSchema.customer.createNewCustomerSchema.parse(req.body);
        const user = await this.customerAuthService.signUpWithCredentials(data);
        res.cookie("token", user.token, cookieOptions);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: user,
        });
    }

    // signin request with email or phone
    async signInRequest(req: Request, res: Response) {
        const payload = appSchema.customer.signInWithEmailPhoneRequestSchema.parse(req.body);
        const response = await this.customerAuthService.signinRequest({
            identifier: payload.identity,
            value: payload.value,
        });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: response,
        });
    }

    // signin with otp
    async signInWithPassword(req: Request, res: Response) {
        const { identity, password, value } = appSchema.customer.signInWithCredentialsSchema.parse(req.body);
        const data = await this.customerAuthService.signInWithCredentials({ identifier: identity, password, value });
        res.cookie("token", data.token, cookieOptions);
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: data,
        });
    }

    async signInWithOtpSend(req: Request, res: Response) {
        const { identity, value } = appSchema.customer.sendSignInOtpSchema.parse(req.body);
        const data = await this.customerAuthService.sendSigninWithOtp({ identifier: identity, value });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: data,
        });
    }

    async signInWithOtpVerify(req: Request, res: Response) {
        const { identity, value, otp, token } = appSchema.customer.signInWithOtpSchema.parse(req.body);
        const data = await this.customerAuthService.verifySigninWithOtp({ identifier: identity, value, otp, token });
        res.sendResponse({
            statusCode: HttpStatus.OK,
            responseData: data,
        });
    }


    async logout(req: Request, res: Response): Promise<void> {
        // Clear all cookies
        for (const cookieName in req.cookies) {
            res.clearCookie(cookieName);
        }
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "logout successfully",
        })
    }
}
