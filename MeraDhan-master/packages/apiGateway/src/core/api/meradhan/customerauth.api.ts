import { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type {
  IAuthCompleteResponse,
  IResetPasswordResponse,
  ISessionResponse,
  ISignInRequestResponse,
  ISignInSendOtpResponse,
  ISignupOtpVerifyResponse,
} from "./customerauth.response";

export class CustomerAuthApi {
  private schema = appSchema.customer;

  constructor(private apiClient: IApiCaller) {}

  async sendSignupMobileVerify(
    payload: z.infer<typeof this.schema.sendMobileOtpSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<ISignupOtpVerifyResponse>(
      "/auth/customer/send-signup-mobile-verify",
      payload,
      config
    );
    return data;
  }

  async sendSignupEmailVerify(
    payload: z.infer<typeof this.schema.sendEmailOtpSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<ISignupOtpVerifyResponse>(
      "/auth/customer/send-signup-email-verify",
      payload,
      config
    );
    return data;
  }

  async verifySignupOtp(
    params: z.infer<typeof this.schema.signUpWithCredentialsQuerySchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<IAuthCompleteResponse>(
      "/auth/customer/verify-signup-otp",
      undefined,
      {
        ...config,
        params: params,
      }
    );
    return data;
  }

  async singUpWithCredentials(
    payload: z.infer<typeof this.schema.createNewCustomerSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<IAuthCompleteResponse>(
      "/auth/customer/signup-with-credentials",
      payload,
      {
        ...config,
      }
    );
    return data;
  }

  // sign in with email or phone
  async signInRequest(
    payload: z.infer<typeof this.schema.signInWithEmailPhoneRequestSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<ISignInRequestResponse>(
      "/auth/customer/signin/request",
      payload,
      config
    );
    return data;
  }

  async signInWithPassword(
    payload: z.infer<typeof this.schema.signInWithCredentialsSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<IAuthCompleteResponse>(
      "/auth/customer/signin/with-password",
      payload,
      config
    );
    return data;
  }

  async signInSendOtp(
    payload: z.infer<typeof this.schema.sendSignInOtpSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<ISignInSendOtpResponse>(
      "/auth/customer/signin/send-otp",
      payload,
      config
    );
    return data;
  }

  async signInVerifyOtp(
    payload: z.infer<typeof this.schema.signInWithOtpSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<IAuthCompleteResponse>(
      "/auth/customer/signin/with-otp",
      payload,
      config
    );
    return data;
  }

  async sendForgetPasswordLink(
    payload: z.infer<typeof this.schema.sendForgetPasswordSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<IResetPasswordResponse>(
      "/auth/customer/send-forget-password",
      payload,
      config
    );
    return data;
  }

  async resetPassword(
    payload: z.infer<typeof this.schema.resetPasswordSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<IResetPasswordResponse>(
      "/auth/customer/reset-password",
      payload,
      config
    );
    return data;
  }

  async getSession(config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.get<ISessionResponse>(
      `/customer/session`,
      config
    );
    return data;
  }

  async sendEmailVerifyLink(config?: AxiosRequestConfig) {
    return await this.apiClient.get<{ message: string }>(
      `/auth/customer/send-verify-email`,
      config
    );
  }

  async verifyEmail(token: string, config?: AxiosRequestConfig) {
    return await this.apiClient.get<{ message: string }>(
      `/auth/customer/verify-email?token=${token}`,
      config
    );
  }

  async resendEmailVerificationForUnverifiedUser(
    payload: z.infer<typeof this.schema.signInWithEmailPhoneRequestSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<{ message: string }>(
      "/auth/customer/resend-email-verification",
      payload,
      config
    );
    return data;
  }

  async updateMobileNumber(
    payload: z.infer<typeof this.schema.customerMobileUpdateRequestSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<{ message: string }>(
      `/auth/customer/profile/mobile`,
      payload,
      config
    );
    return data;
  }

  async sendMobileVerifyOtp(
    payload: z.infer<typeof this.schema.sendMobileOtpSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<{ otpToken: string }>(
      "/auth/customer/profile/mobile/send-otp",
      payload,
      config
    );
    return data;
  }

  async verifyMobileOtp(
    payload: z.infer<typeof this.schema.customerMobileVerifyRequestSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<{
      success: boolean;
      message: string;
    }>("/auth/customer/profile/mobile/verify", payload, config);
    return data;
  }

  async toggleWhatsAppNotification(
    status?: boolean,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<{
      success: boolean;
      message: string;
    }>(
      "/auth/customer/profile/whatsapp",
      {
        enableWhatsApp: status,
      },
      config
    );
    return data;
  }

  async addBankAccount(
    payload: z.infer<typeof appSchema.kyc.bankInfoSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<{ message: string }>(
      "/auth/customer/profile/bank-account",
      payload,
      config
    );
    return data;
  }

  async removeBankAccount(bankId: number, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.delete<{ message: string }>(
      `/auth/customer/profile/bank-account/${bankId}`,
      config
    );
    return data;
  }

  async setPrimaryBankAccount(bankId: number, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.post<{ message: string }>(
      `/auth/customer/profile/bank-account/primary/${bankId}`,
      {},
      config
    );
    return data;
  }

  async addDematAccount(
    payload: z.infer<typeof appSchema.customer.createDematAccountSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<{ message: string }>(
      "/auth/customer/profile/demat-account",
      payload,
      config
    );
    return data;
  }

  async removeDematAccount(dematId: number, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.delete<{ message: string }>(
      `/auth/customer/profile/demat-account/${dematId}`,
      config
    );
    return data;
  }

  async setPrimaryDematAccount(dematId: number, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.post<{ message: string }>(
      `/auth/customer/profile/demat-account/primary/${dematId}`,
      {},
      config
    );
    return data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async setRiskProfile(payload: any[], config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.post<{ message: string }>(
      "/auth/customer/profile/risk-profile",
      payload,
      config
    );
    return data;
  }
}
