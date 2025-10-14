import { AppError } from "@utils/error/AppError";
import { tokenUtils } from "@utils/token/JwtToken.utils";
import { QueueStore, type IQueueService } from "../../../queues/redis/QueueStore";
import { hashingUtils } from "@utils/hash/hashing.utils";
import { config } from "@config/config";

export interface OtpRecord {
    otp: string;
    expiresAt: number;
}

export interface IAuthOtpService {
    generateOtpAndSend(identifier: string, length?: number, expirySeconds?: number): Promise<string>;
    verifyOtp(token: string, otp: string): Promise<boolean>;
}

export class AuthOtpService implements IAuthOtpService {

    private storeKey = "AUTH_OTP";
    private store: IQueueService;
    constructor() {
        this.store = QueueStore.getStore();
    }

    async generateOtpAndSend(identifier: string, length: number = 6, expirySeconds: number = 300): ReturnType<IAuthOtpService['generateOtpAndSend']> {
        const otp = Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
        if (config.mode == "DEVELOPMENT") {
            console.log("====================");
            console.log("OTP SEND - ", otp);
            console.log("====================");
        }
        const value = await hashingUtils.hashPassword(otp)
        await this.store.setKey(`${this.storeKey}:${identifier}`, value, expirySeconds);
        const token = tokenUtils.generateToken<{ identifier: string }>({ identifier }, expirySeconds)
        return token;
    }

    async verifyOtp(token: string, otp: string): ReturnType<IAuthOtpService['verifyOtp']> {
        const tokenData = tokenUtils.verifyToken<{ identifier: string }>(token)
        const record = await this.store.getKey<string>(`${this.storeKey}:${tokenData.identifier}`)
        if (!record) throw new AppError("The provided OTP is no longer valid.");

        const isValid = await hashingUtils.comparePassword(otp, record);
        if (!isValid) throw new AppError("Invalid OTP. Please try again.");
        await this.store.deleteKey(`${this.storeKey}:${tokenData.identifier}`)
        return isValid;
    }

}
