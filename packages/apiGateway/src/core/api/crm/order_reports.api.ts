import { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type {
  OrderReportsByCustomerResponse,
  OrderReportsByIsinResponse,
  OrderReportsFunnelResponse,
  OrderReportsHoldingsResponse,
  OrderReportsLifecycleResponse,
  OrderReportsLogFailuresResponse,
  OrderReportsRegisterResponse,
  OrderReportsRevenueResponse,
  OrderReportsRmPerformanceResponse,
  OrderReportsSettlementResponse,
  OrderReportsSummaryResponse,
} from "./order_reports.response";

type ReportsQuery = z.infer<typeof appSchema.crm.orderReports.OrderReportsQuerySchema>;
type ByIsinQuery = z.infer<typeof appSchema.crm.orderReports.OrderReportsByIsinQuerySchema>;
type RevenueQuery = z.infer<typeof appSchema.crm.orderReports.OrderReportsRevenueQuerySchema>;
type ByCustomerQuery = z.infer<typeof appSchema.crm.orderReports.OrderReportsByCustomerQuerySchema>;
type LogFailuresQuery = z.infer<typeof appSchema.crm.orderReports.OrderReportsLogFailuresQuerySchema>;
type SettlementQuery = z.infer<typeof appSchema.crm.orderReports.OrderReportsSettlementQuerySchema>;
type LifecycleQuery = z.infer<typeof appSchema.crm.orderReports.OrderReportsLifecycleQuerySchema>;

function mergeParams(
  config: AxiosRequestConfig | undefined,
  params: Record<string, unknown>,
): AxiosRequestConfig {
  return {
    ...config,
    params: { ...(config?.params ?? {}), ...params },
  };
}

export class CrmOrderReportsApi {
  constructor(private apiClient: IApiCaller) {}

  async getSummary(
    query: Pick<
      ReportsQuery,
      | "from"
      | "to"
      | "paymentStatus"
      | "status"
      | "isin"
      | "customerId"
      | "email"
      | "userType"
      | "kycStatus"
      | "groupBy"
    >,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsSummaryResponse> {
    const { data } = await this.apiClient.get<OrderReportsSummaryResponse>(
      "/crm/reports/orders/summary",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async getRegister(
    query: Pick<
      ReportsQuery,
      | "from"
      | "to"
      | "paymentStatus"
      | "status"
      | "isin"
      | "customerId"
      | "email"
      | "userType"
      | "kycStatus"
      | "page"
      | "limit"
    >,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsRegisterResponse> {
    const { data } = await this.apiClient.get<OrderReportsRegisterResponse>(
      "/crm/reports/orders/register",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async getByIsin(
    query: ByIsinQuery,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsByIsinResponse> {
    const { data } = await this.apiClient.get<OrderReportsByIsinResponse>(
      "/crm/reports/orders/by-isin",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async getRevenue(
    query: RevenueQuery,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsRevenueResponse> {
    const { data } = await this.apiClient.get<OrderReportsRevenueResponse>(
      "/crm/reports/orders/revenue",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async getFunnel(
    query: Pick<
      ReportsQuery,
      | "from"
      | "to"
      | "paymentStatus"
      | "status"
      | "isin"
      | "customerId"
      | "email"
      | "userType"
      | "kycStatus"
    >,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsFunnelResponse> {
    const { data } = await this.apiClient.get<OrderReportsFunnelResponse>(
      "/crm/reports/orders/funnel",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async getByCustomer(
    query: ByCustomerQuery,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsByCustomerResponse> {
    const { data } = await this.apiClient.get<OrderReportsByCustomerResponse>(
      "/crm/reports/orders/by-customer",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async getHoldings(
    query: Pick<
      ReportsQuery,
      | "from"
      | "to"
      | "paymentStatus"
      | "status"
      | "isin"
      | "customerId"
      | "email"
      | "userType"
      | "kycStatus"
    >,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsHoldingsResponse> {
    const { data } = await this.apiClient.get<OrderReportsHoldingsResponse>(
      "/crm/reports/orders/holdings",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async getLogFailures(
    query: LogFailuresQuery,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsLogFailuresResponse> {
    const { data } = await this.apiClient.get<OrderReportsLogFailuresResponse>(
      "/crm/reports/orders/log-failures",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async getSettlementAutomation(
    query: SettlementQuery,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsSettlementResponse> {
    const { data } = await this.apiClient.get<OrderReportsSettlementResponse>(
      "/crm/reports/orders/settlement-automation",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async getLifecycle(
    query: LifecycleQuery,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsLifecycleResponse> {
    const { data } = await this.apiClient.get<OrderReportsLifecycleResponse>(
      "/crm/reports/orders/lifecycle",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async getRmPerformance(
    query: Pick<
      ReportsQuery,
      | "from"
      | "to"
      | "paymentStatus"
      | "status"
      | "isin"
      | "customerId"
      | "email"
      | "userType"
      | "kycStatus"
    >,
    config?: AxiosRequestConfig,
  ): Promise<OrderReportsRmPerformanceResponse> {
    const { data } = await this.apiClient.get<OrderReportsRmPerformanceResponse>(
      "/crm/reports/orders/rm-performance",
      mergeParams(config, query as Record<string, unknown>),
    );
    return data;
  }

  async downloadRegisterExport(
    query: Pick<
      ReportsQuery,
      | "from"
      | "to"
      | "paymentStatus"
      | "status"
      | "isin"
      | "customerId"
      | "email"
      | "userType"
      | "kycStatus"
    >,
    config?: AxiosRequestConfig,
  ): Promise<Blob> {
    const { data } = await this.apiClient.get<Blob>(
      "/crm/reports/orders/register/export",
      {
        ...mergeParams(config, query as Record<string, unknown>),
        responseType: "blob",
      },
    );
    return data;
  }
}
