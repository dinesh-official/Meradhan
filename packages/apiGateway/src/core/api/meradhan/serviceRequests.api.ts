import { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type {
  CreateServiceRequestResponse,
  MyServiceRequestsResponse,
  ServiceRequestReasonsResponse,
} from "../../../types/service_requests.types";

export class CustomerServiceRequestsApi {
  constructor(private apiClient: IApiCaller) {}

  async getReasons(
    params: z.infer<typeof appSchema.customer.listServiceRequestReasonsQuerySchema>,
    config?: AxiosRequestConfig,
  ) {
    const { data } = await this.apiClient.get<ServiceRequestReasonsResponse>(
      "/customer/service-requests/reasons",
      { ...config, params },
    );
    return data;
  }

  async createRequest(
    payload: z.infer<typeof appSchema.customer.createServiceRequestSchema>,
    config?: AxiosRequestConfig,
  ) {
    const { data } = await this.apiClient.post<CreateServiceRequestResponse>(
      "/customer/service-requests",
      payload,
      config,
    );
    return data;
  }

  async getMyRequests(
    params?: z.infer<typeof appSchema.customer.listMyServiceRequestsQuerySchema>,
    config?: AxiosRequestConfig,
  ) {
    const { data } = await this.apiClient.get<MyServiceRequestsResponse>(
      "/customer/service-requests",
      { ...config, params },
    );
    return data;
  }
}
