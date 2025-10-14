import { AppError } from "@utils/error/AppError";
import { tokenUtils } from "@utils/token/JwtToken.utils";
import { AuthOtpService, type IAuthOtpService } from "./AuthOtp.service";
import type { IAuthRepoInterface } from "../auth.repo";

export interface TEmailAuthServiceInterface {
    sendAuthEmailOtp(email: string): Promise<{ token: string }>,
    verifyAuthEmailOtp(email: string, token: string, opt: string): Promise<{ token: string, role: string, id: number }>
}

export class EmailAuthService implements TEmailAuthServiceInterface {

    private optManager: IAuthOtpService;
    constructor(private authRepo: IAuthRepoInterface) {
        this.optManager = new AuthOtpService();
    }

    async sendAuthEmailOtp(email: string): ReturnType<TEmailAuthServiceInterface['sendAuthEmailOtp']> {
        const user = await this.authRepo.getAuthUserByEmail(email);
        const token = await this.optManager.generateOtpAndSend(user.id.toString());
        return { token };
    }

    async verifyAuthEmailOtp(email: string, token: string, opt: string): ReturnType<TEmailAuthServiceInterface['verifyAuthEmailOtp']> {
        const user = await this.authRepo.getAuthUserByEmail(email);
        const isVerified = await this.optManager.verifyOtp(token, opt);
        if (!isVerified) {
            throw new AppError("invalid otp.")
        }
        const authToken = tokenUtils.generateToken(user, '1d');
        return {
            token: authToken,
            id: user.id,
            role: user.role
        }
    }
}