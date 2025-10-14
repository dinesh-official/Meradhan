import { appSchema } from "@root/schema";
import type { CookieOptions, Request, Response } from "express";
import type { TEmailAuthServiceInterface } from "./services/EmailAuth.service";
import { HttpStatus } from "@utils/error/AppError";
import { config } from "@config/config";

export interface TAuthController {
    loginWithOtp(req: Request, res: Response): Promise<void>
    verifyLoginOtp(req: Request, res: Response): Promise<void>
}

export class AuthController implements TAuthController {

    constructor(private emailAuthService: TEmailAuthServiceInterface) { }

    async loginWithOtp(req: Request, res: Response): Promise<void> {
        const data = appSchema.auth.loginWithOtpSchema.parse(req.body);
        const payload = await this.emailAuthService.sendAuthEmailOtp(data.email)
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "opt send successfully",
            success: true,
            responseData: payload
        })
    }

    async verifyLoginOtp(req: Request, res: Response): Promise<void> {
        const data = appSchema.auth.verifyOtpSchema.parse(req.body);
        const payload = await this.emailAuthService.verifyAuthEmailOtp(data.email, data.token, data.otp);

        const cookieOptions: CookieOptions = {
            httpOnly: true,   
            secure: config.mode === "PRODUCTION",
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "strict",
        }

        res.cookie("token", payload.token, cookieOptions);
        res.cookie("id", payload.id, cookieOptions);
        res.cookie("role", payload.role, cookieOptions);

        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "successfully verified"
        });
    }
}
