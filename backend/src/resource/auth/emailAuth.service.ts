import { OtpVerificationService, type IOtpVerificationService } from "@lib/manager/OtpVerificationService.service";
import { AppError } from "@utils/error/AppError";
import { tokenUtils } from "@utils/token/JwtToken.utils";
import { sendLoginOtpEmail } from "../../queues/services/sender/sendEmailOtp";
import { AuthRepo } from "./auth.repo";

export class EmailAuthService {

    private optManager: IOtpVerificationService;
    private authRepo: AuthRepo;
    constructor() {
        this.optManager = new OtpVerificationService("AUTH_OTP");
        this.authRepo = new AuthRepo();
    }

    async sendAuthEmailOtp(email: string) {
        const user = await this.authRepo.getAuthUserByEmail(email);
        const { token, otp } = await this.optManager.generateOtpAndSend(user.id.toString());
        await sendLoginOtpEmail({
            email: user.email,
            userName: user.name,
            otp
        })
        return { token };
    }

    async verifyAuthEmailOtp(email: string, token: string, opt: string) {
        const user = await this.authRepo.getAuthUserByEmail(email);
        const isVerified = await this.optManager.verifyOtp(token, opt);
        if (!isVerified) {
            throw new AppError("The OTP provided is invalid.")
        }
        const authToken = tokenUtils.generateToken({
            email: user.email,
            id: user.id,
        }, '1d');
        await this.authRepo.setLastLoginNow(user.id);
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

    async getSession(id: number) {
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