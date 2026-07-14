import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type {
  DashboardSummaryResponse,
  RerunLastSettlementJobResponse,
  RunSettlementReconciliationResponse,
  SalesPerformanceResponse,
  SettlementJobStatusResponse,
} from "../../../types/response.types";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export interface TDashboardApi {
  getSummary(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<DashboardSummaryResponse>>;
  getSalesPerformance(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<SalesPerformanceResponse>>;
  getSettlementJobStatus(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<SettlementJobStatusResponse>>;
  runSettlementReconciliation(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<RunSettlementReconciliationResponse>>;
  rerunLastSettlementJob(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<RerunLastSettlementJobResponse>>;
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

  async getSettlementJobStatus(
    config?: AxiosRequestConfig
  ): ReturnType<TDashboardApi["getSettlementJobStatus"]> {
    return this.apiClient.get<SettlementJobStatusResponse>(
      "/crm/dashboard/settlement-job-status",
      config
    );
  }

  async runSettlementReconciliation(
    config?: AxiosRequestConfig
  ): ReturnType<TDashboardApi["runSettlementReconciliation"]> {
    return this.apiClient.post<RunSettlementReconciliationResponse>(
      "/crm/dashboard/run-settlement-reconciliation",
      undefined,
      config
    );
  }

  async rerunLastSettlementJob(
    config?: AxiosRequestConfig
  ): ReturnType<TDashboardApi["rerunLastSettlementJob"]> {
    return this.apiClient.post<RerunLastSettlementJobResponse>(
      "/crm/dashboard/rerun-last-settlement-job",
      undefined,
      config
    );
  }
}

