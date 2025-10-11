import type { AxiosRequestConfig, AxiosResponse } from "axios";

import type z from "zod";

import type { appSchema } from "@root/schema";
import type { UserDataResponse } from "../../types/response";
import type { IApiCaller } from "../connection/apiCaller.interface";

export interface TAuthApiInterface {
    login(data: z.infer<typeof appSchema.auth['loginZodSchema']>, config?: AxiosRequestConfig): Promise<AxiosResponse<{ token: string }>>;

    register(data: z.infer<typeof appSchema.auth['registerZodSchema']>, config?: AxiosRequestConfig): Promise<AxiosResponse<{ token: string }>>;

    logout(config?: AxiosRequestConfig): Promise<AxiosResponse<{ message: string }>>;

    getSession(config?: AxiosRequestConfig): Promise<AxiosResponse<UserDataResponse>>;

}

export class AuthApi implements TAuthApiInterface {
    constructor(private apiClient: IApiCaller) {

    }

    async login(data: z.infer<typeof appSchema.auth['loginZodSchema']>, config?: AxiosRequestConfig): ReturnType<TAuthApiInterface['login']> {
        return await this.apiClient.get<{ token: string }>('/', config);
    }

    async register(data: z.infer<typeof appSchema.auth['registerZodSchema']>, config?: AxiosRequestConfig) {
        return await this.apiClient.post<{ token: string }>('/auth/register', data, config);
    }

    async logout(config?: AxiosRequestConfig) {
        return await this.apiClient.post<{ message: string }>('/auth/logout', undefined, config);
    }

    async getSession(config?: AxiosRequestConfig): ReturnType<TAuthApiInterface['getSession']> {
        return await this.apiClient.get(`/`, config);
    }
}