import { appSchema } from "@root/schema";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { ISignupCompleteResponse, ISignupOtpVerifyResponse } from "./customerauth.response";

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
        const { data } = await this.apiClient.post<ISignupCompleteResponse>("/auth/customer/signup-with-credentials", payload, {
            ...config,
            params: params
        });
        return data;
    }
}