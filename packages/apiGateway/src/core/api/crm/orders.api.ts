import { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type {
  GetCrmOrdersResponse,
  GetCrmOrderDetailsResponse,
} from "./orders.response";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export class CrmOrdersApi {
  private schema = appSchema.crm.orders;

  constructor(private apiClient: IApiCaller) {}

  async getAllOrders(
    query?: z.infer<typeof this.schema.CrmOrdersQuerySchema>,
    config?: AxiosRequestConfig
  ): Promise<GetCrmOrdersResponse> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params: { ...(config?.params ?? {}), ...(query ?? {}) },
    };
    const { data } = await this.apiClient.get<GetCrmOrdersResponse>(
      "/crm/orders/all",
      mergedConfig
    );
    return data;
  }

  async getOrderById(
    orderId: number,
    config?: AxiosRequestConfig
  ): Promise<GetCrmOrderDetailsResponse> {
    const { data } = await this.apiClient.get<GetCrmOrderDetailsResponse>(
      `/crm/orders/${orderId}`,
      config
    );
    return data;
  }

  async updateOrderStatus(
    orderId: number,
    status: "PENDING" | "SETTLED" | "APPLIED" | "REJECTED",
    config?: AxiosRequestConfig
  ): Promise<GetCrmOrderDetailsResponse> {
    const { data } = await this.apiClient.patch<GetCrmOrderDetailsResponse>(
      `/crm/orders/${orderId}/status`,
      { status },
      config
    );
    return data;
  }
}
