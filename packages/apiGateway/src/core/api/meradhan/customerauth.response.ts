import type { BaseResponseData } from "../../../types/base";

export type ISignupOtpVerifyResponse = BaseResponseData<{
  token: string;
}>;

export type IAuthCompleteResponse = BaseResponseData<{
  id: number;
  email: string;
  avatar: string | null;
  token?: string;
  requiresTwoFactor?: boolean;
  challengeToken?: string;
}>;

export type ISignInRequestResponse = BaseResponseData<{
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  token?: string;
  allowOtpLogin?: boolean;
  requiresAccountActivation?: boolean;
  channel?: "phone" | "email";
  activationOtpSent?: boolean;
  maskedTarget?: string;
}>;

export type ISignInSendOtpResponse = BaseResponseData<{
  id: number;
  firstName: string;
  lastName: string;
  token: string;
}>;

export type IResetPasswordResponse = BaseResponseData<{
  message: string;
}>;

export type ICustomerTwoFactorSettingsResponse = BaseResponseData<{
  enabled: boolean;
  hasPasscodeSet: boolean;
  hasPasswordSet: boolean;
  signinWith: "CREDENTIALS" | "GOOGLE" | "MICROSOFT" | "FACEBOOK";
}>;

export type ISessionResponse = BaseResponseData<{
  id: number;
  avatar: string | null;
  userName: string;
  emailAddress: string;
  firstName: string;
  middleName: string;
  lastName: string;
  kycStatus: string;
  /** KRA verification status when KRA exists for the user (e.g. VERIFIED, PENDING, DOWNLOAD_KRA). */
  kraStatus?: string | null;
  isRekycUnderReview?: boolean;
  /** True when user has any KYC flow with markExpired (rekyc flow). */
  hasRekycExpiredFlow?: boolean;
  kycProgress?: {
    hasStarted: boolean;
    step: number;
    complete: boolean;
  };
}>;
