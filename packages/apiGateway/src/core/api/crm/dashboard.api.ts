import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type {
  DashboardSummaryResponse,
  SalesPerformanceResponse,
} from "../../../types/response.types";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export interface TDashboardApi {
  getSummary(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<DashboardSummaryResponse>>;
  getSalesPerformance(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<SalesPerformanceResponse>>;
}

export class CrmDashboardApi implements TDashboardApi {
  constructor(private apiClient: IApiCaller) {}

  async getSummary(
    config?: AxiosRequestConfig
  ): ReturnType<TDashboardApi["getSummary"]> {
    return this.apiClient.get<DashboardSummaryResponse>(
      "/crm/dashboard/summary",
      config
    );
  }

  async getSalesPerformance(
    config?: AxiosRequestConfig
  ): ReturnType<TDashboardApi["getSalesPerformance"]> {
    return this.apiClient.get<SalesPerformanceResponse>(
      "/crm/dashboard/sales-performance",
      config
    );
  }
}

