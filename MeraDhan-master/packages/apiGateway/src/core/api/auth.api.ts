import type { AxiosRequestConfig, AxiosResponse } from "axios";

import type z from "zod";
import type { appSchema } from "@root/schema";
import type { IApiCaller } from "../connection/apiCaller.interface";
import type {
  BaseResponseData,
  OtpVerifyDataResponse,
  UserSessionDataResponse,
} from "../../types/response.types";

export interface TAuthApiInterface {
  loginWithOtp(
    data: z.infer<(typeof appSchema.auth)["loginWithOtpSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<BaseResponseData<{ token: string }>>>;
  verifyOtp(
    data: z.infer<(typeof appSchema.auth)["verifyOtpSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<OtpVerifyDataResponse>>;
  logout(config?: AxiosRequestConfig): Promise<AxiosResponse<BaseResponseData>>;
  getSession(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<UserSessionDataResponse>>;
}

export class AuthApi implements TAuthApiInterface {
  constructor(private apiClient: IApiCaller) {}

  async loginWithOtp(
    data: z.infer<(typeof appSchema.auth)["loginWithOtpSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TAuthApiInterface["loginWithOtp"]> {
    return await this.apiClient.post("/auth/login-with-otp", data, config);
  }

  async verifyOtp(
    data: z.infer<(typeof appSchema.auth)["verifyOtpSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TAuthApiInterface["verifyOtp"]> {
    return await this.apiClient.post("/auth/verify-otp", data, config);
  }

  async logout(
    config?: AxiosRequestConfig
  ): ReturnType<TAuthApiInterface["logout"]> {
    return await this.apiClient.post("/auth/logout", config);
  }

  async getSession(
    config?: AxiosRequestConfig
  ): ReturnType<TAuthApiInterface["getSession"]> {
    return await this.apiClient.get(`/session`, config);
  }
}
