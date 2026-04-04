import type { AxiosRequestConfig } from "axios";
import type { IApiCaller } from "../../../connection/apiCaller.interface";
import type {
  GetOrderHistoryResponse,
  GetPaymentGatewayModeResponse,
} from "./order.response";
import { appSchema } from "@root/schema";
import type z from "zod";

export class CustomerOrderApi {
  private schema = appSchema.order;

  constructor(private apiClient: IApiCaller) {}

  async getPaymentGatewayMode(
    config?: AxiosRequestConfig
  ): Promise<GetPaymentGatewayModeResponse> {
    const { data } = await this.apiClient.get<GetPaymentGatewayModeResponse>(
      "/customer/order/payment-gateway-mode",
      config
    );
    return data;
  }

  async getOrderHistory(
    query?: z.infer<typeof this.schema.OrderQuerySchema>,
    config?: AxiosRequestConfig
  ): Promise<GetOrderHistoryResponse> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params: { ...(config?.params ?? {}), ...(query ?? {}) },
    };
    const { data } = await this.apiClient.get<GetOrderHistoryResponse>(
      "/customer/order/history",
      mergedConfig
    );
    return data;
  }

  async addOrderLog(
    orderId: string,
    step: string,
    status: "SUCCESS" | "FAILED" | "PENDING",
    outputData?: Record<string, unknown>,
    details?: Record<string, unknown>,
    config?: AxiosRequestConfig
  ): Promise<{ responseData: { success: boolean } }> {
    const { data } = await this.apiClient.post<
      { responseData: { success: boolean } }
    >(
      "/customer/order/log",
      {
        orderId,
        step,
        status,
        outputData,
        details,
      },
      config
    );
    return data;
  }
}

