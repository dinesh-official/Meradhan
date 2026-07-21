import { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type {
  ListServiceRequestsResponse,
  ServiceRequestActionResponse,
} from "../../../types/service_requests.types";

export class CrmServiceRequestsApi {
  constructor(private apiClient: IApiCaller) {}

  async listRequests(
    query: z.infer<typeof appSchema.customer.findManyServiceRequestsSchema>,
    config?: AxiosRequestConfig,
  ) {
    const { data } = await this.apiClient.get<ListServiceRequestsResponse>(
      "/crm/service-requests",
      { ...config, params: query },
    );
    return data;
  }

  async closeAccount(requestId: number, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.patch<ServiceRequestActionResponse>(
      `/crm/service-requests/${requestId}/close-account`,
      undefined,
      config,
    );
    return data;
  }

  async rejectRequest(requestId: number, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.patch<ServiceRequestActionResponse>(
      `/crm/service-requests/${requestId}/reject`,
      undefined,
      config,
    );
    return data;
  }
}
