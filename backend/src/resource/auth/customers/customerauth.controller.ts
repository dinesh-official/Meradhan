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


        const user = await this.customerAuthService.checkEmailOrPhoneExists(email);
        console.log(user);


        const response = await this.optManager.generateOtpAndSend(
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

        await this.customerAuthService.checkEmailOrPhoneExists(mobile);

        const response = await this.optManager.generateOtpAndSend("CUSTOMER_SIGNUP:" + mobile, 4);
        await sendMobileOtp({ mobile, otp: response.otp, template: "signup" });

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
}
