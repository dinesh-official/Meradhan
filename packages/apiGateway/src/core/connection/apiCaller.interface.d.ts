import type { AxiosRequestConfig, AxiosResponse } from "axios";

export interface IApiCaller {
    /**
     * Makes a generic request with merged server headers
     */
    request<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;

    /**
     * GET request
     */
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;

    /**
     * POST request
     */
    post<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;

    /**
     * PUT request
     */
    put<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;

    /**
     * PATCH request
     */
    patch<T = unknown, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;

    /**
     * DELETE request
     */
    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}