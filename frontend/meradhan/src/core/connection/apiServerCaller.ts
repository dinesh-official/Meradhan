import { API_SERVER_URL_IP } from "@/global/constants/domains";
import { ApiError, type IApiCaller } from "@root/apiGateway";
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
 *
 * Not declared as `implements IApiCaller`: meradhan and @root/apiGateway can
 * resolve different `axios` copies, so `AxiosRequestConfig` is structurally
 * incompatible at compile time. The singleton is asserted at export; runtime
 * matches IApiCaller.
 */
/**
 * Server-side outbound request timeout (ms). Keeps a slow / hung backend from
 * holding RSC streaming hostage — when the upstream eventually resets we want
 * to surface the failure ourselves and let `Promise.allSettled` callers render
 * partial pages, instead of the request dangling for minutes until the kernel
 * times out the socket.
 */
const SERVER_REQUEST_TIMEOUT_MS = 15_000;

class ApiServerCaller {
  private instance: AxiosInstance;

  constructor(baseURL: string = API_SERVER_URL_IP) {
    this.instance = axios.create({
      baseURL,
      withCredentials: true,
      timeout: SERVER_REQUEST_TIMEOUT_MS,
    });

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error)) {
          // ApiError / AxiosError typings come from @root/apiGateway's axios;
          // interceptor error is typed with meradhan's axios — duplicate install.
          return Promise.reject(
            new ApiError(
              error.message,
              error.code,
              error.config as never,
              error.request,
              error.response as never,
            ),
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

// Export a default singleton instance (see class note re: IApiCaller + axios)
const apiServerCaller = new ApiServerCaller() as unknown as IApiCaller;
export default apiServerCaller;
