// ApiClient.ts
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import type { IApiCaller } from "./apiCaller.interface";
import { ApiError } from "./error";

class ApiCallerClient implements IApiCaller {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      withCredentials: true,
    });
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          return Promise.reject(
            new ApiError(
              error.message,
              error.code,
              error.config,
              error.request,
              error.response
            )
          );
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Base request handler — same as axios.request but injects server headers
   */
  async request<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const finalConfig: AxiosRequestConfig = {
      url,
      ...config,
    };
    return this.instance.request<T>(finalConfig);
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: "POST", data });
  }

  /**
   * PUT request
   */
  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: "PUT", data });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: "PATCH", data });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}

// Optionally export the class if you want multiple instances
export { ApiCallerClient };
