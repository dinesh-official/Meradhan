import { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { GetCrmOrdersResponse } from "./orders.response";
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
}
