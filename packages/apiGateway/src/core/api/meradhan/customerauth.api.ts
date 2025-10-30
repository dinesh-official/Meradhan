import { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type { IAuthCompleteResponse, IResetPasswordResponse, ISessionResponse, ISignInRequestResponse, ISignInSendOtpResponse, ISignupOtpVerifyResponse } from "./customerauth.response";

export class CustomerAuthApi {
    private schema = appSchema.customer;

    constructor(private apiClient: IApiCaller) { }

    async sendSignupMobileVerify(payload: z.infer<typeof this.schema.sendMobileOtpSchema>, config?: AxiosRequestConfig) {
        const { data } = await this.apiClient.post<ISignupOtpVerifyResponse>("/auth/customer/send-signup-mobile-verify", payload, config);
        return data;
    }

    async sendSignupEmailVerify(payload: z.infer<typeof this.schema.sendEmailOtpSchema>, config?: AxiosRequestConfig) {
        const { data } = await this.apiClient.post<ISignupOtpVerifyResponse>("/auth/customer/send-signup-email-verify", payload, config);
        return data;
    }

    async singUpWithCredentials(params: z.infer<typeof this.schema.signUpWithCredentialsQuerySchema>, payload: z.infer<typeof this.schema.createNewCustomerSchema>, config?: AxiosRequestConfig) {
        const { data } = await this.apiClient.post<IAuthCompleteResponse>("/auth/customer/signup-with-credentials", payload, {
            ...config,
            params: params
        });
        return data;
    }

    // sign in with email or phone
    async signInRequest(payload: z.infer<typeof this.schema.signInWithEmailPhoneRequestSchema>, config?: AxiosRequestConfig) {
        const { data } = await this.apiClient.post<ISignInRequestResponse>("/auth/customer/signin/request", payload, config);
        return data;
    }

    async signInWithPassword(payload: z.infer<typeof this.schema.signInWithCredentialsSchema>, config?: AxiosRequestConfig) {
        const { data } = await this.apiClient.post<IAuthCompleteResponse>("/auth/customer/signin/with-password", payload, config);
        return data;
    }

    async signInSendOtp(payload: z.infer<typeof this.schema.sendSignInOtpSchema>, config?: AxiosRequestConfig) {
        const { data } = await this.apiClient.post<ISignInSendOtpResponse>("/auth/customer/signin/send-otp", payload, config);
        return data;
    }

    async signInVerifyOtp(payload: z.infer<typeof this.schema.signInWithOtpSchema>, config?: AxiosRequestConfig) {
        const { data } = await this.apiClient.post<IAuthCompleteResponse>("/auth/customer/signin/with-otp", payload, config);
        return data;
    }

    async sendForgetPasswordLink(payload: z.infer<typeof this.schema.sendForgetPasswordSchema>, config?: AxiosRequestConfig) {
        const { data } = await this.apiClient.post<IResetPasswordResponse>("/auth/customer/send-forget-password", payload, config);
        return data;
    }

    async resetPassword(payload: z.infer<typeof this.schema.resetPasswordSchema>, config?: AxiosRequestConfig) {
        const { data } = await this.apiClient.post<IResetPasswordResponse>("/auth/customer/reset-password", payload, config);
        return data;
    }

    async getSession(config?: AxiosRequestConfig) {
        const { data } = await this.apiClient.get<ISessionResponse>(`/customer/session`, config);
        return data;
    }
}