import { QueueStore } from "@store/queue_store";
import { AppError } from "@utils/error/AppError";
import { hashingUtils } from "@utils/hash/hashing_utils";
import { tokenUtils } from "@utils/token/JwtToken_utils";

export interface OtpRecord {
  otp: string;
  expiresAt: number;
}

export interface IOtpVerificationService {
  generateOtp(
    identifier: string,
    length?: number,
    expirySeconds?: number
  ): Promise<{ token: string; otp: string }>;
  verifyOtp(token: string, otp: string): Promise<boolean>;
}

export class OtpVerificationService implements IOtpVerificationService {
  private storeKey;
  private store: QueueStore;
  constructor(
    private useOf:
      | "AUTH_OTP"
      | "EMAIL_VERIFY"
      | "MOBILE_VERIFY"
      | "REKYC_VERIFY" = "AUTH_OTP"
  ) {
    this.store = QueueStore.getStore();
    this.storeKey = useOf;
  }

  async generateOtp(
    identifier: string,
    length: number = 6,
    expirySeconds: number = 300
  ): ReturnType<IOtpVerificationService["generateOtp"]> {
    const otp = Array.from({ length }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    if (process.env.NODE_ENV !== "production") {
      console.log("====================");
      console.log("OTP SEND - ", otp);
      console.log("====================");
    }
    const value = await hashingUtils.hashPassword(otp);
    await this.store.setKey(
      `${this.storeKey}:${identifier}`,
      { otp: value },
      expirySeconds
    );
    const token = tokenUtils.generateToken<{ identifier: string }>(
      { identifier },
      expirySeconds
    );
    return { token, otp };
  }

  async verifyOtp(
    token: string,
    otp: string
  ): ReturnType<IOtpVerificationService["verifyOtp"]> {
    const tokenData = tokenUtils.verifyToken<{ identifier: string }>(token);
    const record = await this.store.getKey<{ otp: string }>(
      `${this.storeKey}:${tokenData.identifier}`
    );
    if (!record) throw new AppError("The provided OTP is no longer valid.");

    const isValid = await hashingUtils.comparePassword(otp, record.otp);
    if (!isValid) throw new AppError("Invalid OTP. Please try again.");
    await this.store.deleteKey(`${this.storeKey}:${tokenData.identifier}`);
    return isValid;
  }
}
