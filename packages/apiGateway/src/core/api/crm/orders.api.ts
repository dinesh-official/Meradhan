import type { AxiosRequestConfig } from "axios";
import type { IApiCaller } from "../../../connection/apiCaller.interface";
import type { GetCrmOrdersResponse } from "./orders.response";
import { appSchema } from "@root/schema";
import type z from "zod";

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
