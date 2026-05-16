import { QueueStore } from "@store/queue_store";
import { AppError } from "@utils/error/AppError";
import { hashingUtils } from "@utils/hash/hashing_utils";
import { tokenUtils } from "@utils/token/JwtToken_utils";

export interface OtpRecord {
  otp: string;
  expiresAt: number;
}

export type OtpValidationResult = {
  identifier: string;
  valid: boolean;
  expired: boolean;
};

export interface IOtpVerificationService {
  generateOtp(
    identifier: string,
    length?: number,
    expirySeconds?: number
  ): Promise<{ token: string; otp: string }>;
  verifyOtp(token: string, otp: string): Promise<boolean>;
  /** Validates OTP without consuming it (for multi-OTP atomic flows). */
  validateOtp(token: string, otp: string): Promise<OtpValidationResult>;
  /** Validates all OTPs first; deletes keys only when every OTP is correct and present. */
  verifyOtpsAtomically(
    checks: Array<{ token: string; otp: string }>,
  ): Promise<void>;
}

export class OtpVerificationService implements IOtpVerificationService {
  private storeKey;
  private store: QueueStore;
  constructor(
    private useOf:
      | "AUTH_OTP"
      | "EMAIL_VERIFY"
      | "EMAIL_CHANGE"
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

  async validateOtp(
    token: string,
    otp: string,
  ): Promise<OtpValidationResult> {
    let identifier: string;
    try {
      const tokenData = tokenUtils.verifyToken<{ identifier: string }>(token);
      identifier = tokenData.identifier;
    } catch {
      return { identifier: "", valid: false, expired: true };
    }

    const record = await this.store.getKey<{ otp: string }>(
      `${this.storeKey}:${identifier}`,
    );
    if (!record) {
      return { identifier, valid: false, expired: true };
    }

    const valid = await hashingUtils.comparePassword(otp, record.otp);
    return { identifier, valid, expired: false };
  }

  async verifyOtpsAtomically(
    checks: Array<{ token: string; otp: string }>,
  ): Promise<void> {
    const results = await Promise.all(
      checks.map((check) => this.validateOtp(check.token, check.otp)),
    );

    if (results.some((r) => r.expired)) {
      throw new AppError(
        "Your OTPs have expired. Please request new OTPs for both email and mobile.",
        { code: "OTP_EXPIRED" },
      );
    }

    const invalidIndexes = results
      .map((r, i) => (r.valid ? -1 : i))
      .filter((i) => i >= 0);

    if (invalidIndexes.length > 0) {
      if (invalidIndexes.length === checks.length) {
        throw new AppError(
          "Invalid email and mobile OTP. Please check both codes and try again.",
          { code: "INVALID_BOTH_OTP" },
        );
      }
      if (invalidIndexes.includes(0)) {
        throw new AppError(
          "Invalid email OTP. Please check the code and try again.",
          { code: "INVALID_EMAIL_OTP" },
        );
      }
      throw new AppError(
        "Invalid mobile OTP. Please check the code and try again.",
        { code: "INVALID_MOBILE_OTP" },
      );
    }

    await Promise.all(
      results.map((r) =>
        this.store.deleteKey(`${this.storeKey}:${r.identifier}`),
      ),
    );
  }

  async verifyOtp(
    token: string,
    otp: string
  ): ReturnType<IOtpVerificationService["verifyOtp"]> {
    const result = await this.validateOtp(token, otp);
    if (result.expired) {
      throw new AppError("The provided OTP is no longer valid.");
    }
    if (!result.valid) {
      throw new AppError("Invalid OTP. Please try again.");
    }
    await this.store.deleteKey(`${this.storeKey}:${result.identifier}`);
    return true;
  }
}
