import { config } from "@config/config";
import { cookieOptions } from "@config/cookie";
import { appSchema } from "@root/schema";
import { HttpStatus } from "@utils/error/AppError";
import type { Request, Response } from "express";
import { EmailAuthService } from "./emailAuth.service";


export class AuthController {

    private emailAuthService: EmailAuthService;
    constructor() {
        this.emailAuthService = new EmailAuthService();
    }

    async loginWithOtp(req: Request, res: Response): Promise<void> {
        console.log(req.body);

        const data = appSchema.auth.loginWithOtpSchema.parse(req.body);
        const payload = await this.emailAuthService.sendAuthEmailOtp(data.email)
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "otp send successfully",
            success: true,
            responseData: payload
        })
    }

    async verifyLoginOtp(req: Request, res: Response): Promise<void> {
        const data = appSchema.auth.verifyOtpSchema.parse(req.body);
        const payload = await this.emailAuthService.verifyAuthEmailOtp(data.email, data.token, data.otp);

        res.cookie("token", payload.token, cookieOptions);
        res.cookie("userId", payload.id, cookieOptions);
        res.cookie("role", payload.role, cookieOptions);

        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "successfully verified",
            responseData: payload
        });
    }

    async session(req: Request, res: Response): Promise<void> {
        const id = req.session!.id;
        const session = await this.emailAuthService.getSession(Number(id));
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "session",
            responseData: session
        })
    }

    async logout(req: Request, res: Response): Promise<void> {
        // Clear all cookies
        for (const cookieName in req.cookies) {
            res.clearCookie(cookieName, {
                path: '/',
                httpOnly: true,
                secure: config.mode == 'PRODUCTION',
                sameSite: 'lax',
            });
        }
        res.sendResponse({
            statusCode: HttpStatus.OK,
            message: "logout successfully",
        })
    }
}
