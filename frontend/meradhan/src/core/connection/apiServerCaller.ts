import { API_SERVER_URL_IP } from "@/global/constants/domains";
import { ApiError, IApiCaller } from "@root/apiGateway";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from "axios";
import { headers } from "next/headers";
import "server-only";

/**
 * Custom API Server Caller class extending AxiosInstance
 * - Automatically forwards incoming request headers (cookies, etc.)
 * - Allows full axios-like usage (get, post, put, patch, delete)
 * - Designed for Next.js Server Components / Route Handlers
 */
class ApiServerCaller implements IApiCaller {
  private instance: AxiosInstance;

  constructor(baseURL: string = API_SERVER_URL_IP) {
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
   * Prepare and merge headers from Next.js server context
   */
  private async prepareHeaders(
    configHeaders?: AxiosRequestHeaders | Record<string, string>
  ) {
    const incomingHeaders = await headers();
    const headersObj: Record<string, string> = {};

    // Convert ReadonlyHeaders to plain object
    incomingHeaders.forEach((value, key) => {
      headersObj[key] = value;
    });

    // Ensure cookies are preserved for session management
    const cookie = incomingHeaders.get("cookie") || "";
    headersObj["cookie"] = cookie;

    // Merge user-provided headers
    return {
      ...headersObj,
      ...(configHeaders || {}),
    };
  }

  /**
   * Base request handler — same as axios.request but injects server headers
   */
  async request<T = unknown>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    const mergedHeaders = await this.prepareHeaders(
      config.headers as Record<string, string>
    );

    const finalConfig: AxiosRequestConfig = {
      url,
      ...config,
      headers: mergedHeaders,
    };

    return this.instance.request<T>(finalConfig);
  }

  /**
   * GET request
   */
  async get<T = unknown>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: "POST", data });
  }

  /**
   * PUT request
   */
  async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: "PUT", data });
  }

  /**
   * PATCH request - edited duplicate
   */
  async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: "PATCH", data });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<AxiosResponse<T>> {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}

// Export a default singleton instance
const apiServerCaller = new ApiServerCaller();
export default apiServerCaller;
