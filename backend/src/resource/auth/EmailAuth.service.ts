import { OtpVerificationService, type IOtpVerificationService } from "@lib/manager/OtpVerificationService.service";
import { AppError } from "@utils/error/AppError";
import { tokenUtils } from "@utils/token/JwtToken.utils";
import { sendLoginOtpEmail } from "../../queues/services/emails/sendEmailOtp";
import type { IAuthRepoInterface } from "./auth.repo";


type ReqDataResponse = { token: string, role: string, id: number, avatar?: string | null, name: string, email: string, phoneNo: string }

export interface TEmailAuthServiceInterface {
    sendAuthEmailOtp(email: string): Promise<{ token: string }>,
    verifyAuthEmailOtp(email: string, token: string, opt: string): Promise<ReqDataResponse>
    getSession(id: number): Promise<Omit<ReqDataResponse, 'token'>>
}

export class EmailAuthService implements TEmailAuthServiceInterface {

    private optManager: IOtpVerificationService;
    constructor(private authRepo: IAuthRepoInterface) {
        this.optManager = new OtpVerificationService("AUTH_OTP");
    }

    async sendAuthEmailOtp(email: string): ReturnType<TEmailAuthServiceInterface['sendAuthEmailOtp']> {
        const user = await this.authRepo.getAuthUserByEmail(email);
        const { token, otp } = await this.optManager.generateOtpAndSend(user.id.toString());
        await sendLoginOtpEmail({
            email: user.email,
            userName: user.name,
            otp
        })
        return { token };
    }

    async verifyAuthEmailOtp(email: string, token: string, opt: string): ReturnType<TEmailAuthServiceInterface['verifyAuthEmailOtp']> {
        const user = await this.authRepo.getAuthUserByEmail(email);
        const isVerified = await this.optManager.verifyOtp(token, opt);
        if (!isVerified) {
            throw new AppError("The OTP provided is invalid.")
        }
        const authToken = tokenUtils.generateToken({
            email: user.email,
            id: user.id,
        }, '1d');
        return {
            token: authToken,
            id: user.id,
            role: user.role,
            avatar: user.avatar,
            name: user.name,
            email: user.email,
            phoneNo: user.phoneNo
        }
    }

    async getSession(id: number): ReturnType<TEmailAuthServiceInterface['getSession']> {
        const user = await this.authRepo.getAuthSession(id);
        return {
            id: user.id,
            role: user.role,
            avatar: user.avatar,
            name: user.name,
            email: user.email,
            phoneNo: user.phoneNo
        }
    }
}