import type { AxiosRequestConfig } from "axios";
import type { IApiCaller } from "../../../connection/apiCaller.interface";
import type {
  GetInvestmentAllocationResponse,
  GetInvestmentByMaturityResponse,
  GetInvestmentByRatingResponse,
  GetInvestmentByIssuerTypeResponse,
  GetPortfolioDetailsResponse,
  GetPortfolioSummaryResponse,
  GetCashflowTimelineResponse,
  GetCashflowToMaturityResponse,
} from "./portfolio.response";

export class CustomerPortfolioApi {
  constructor(private apiClient: IApiCaller) { }

  async getPortfolioSummary(
    config?: AxiosRequestConfig
  ): Promise<GetPortfolioSummaryResponse> {
    const { data } =
      await this.apiClient.get<GetPortfolioSummaryResponse>(
        "/customer/portfolio/summary",
        config
      );
    return data;
  }

  async getInvestmentByIssuerType(
    config?: AxiosRequestConfig
  ): Promise<GetInvestmentByIssuerTypeResponse> {
    const { data } =
      await this.apiClient.get<GetInvestmentByIssuerTypeResponse>(
        "/customer/portfolio/investment-by-issuer-type",
        config
      );
    return data;
  }

  async getInvestmentByRating(
    config?: AxiosRequestConfig
  ): Promise<GetInvestmentByRatingResponse> {
    const { data } =
      await this.apiClient.get<GetInvestmentByRatingResponse>(
        "/customer/portfolio/investment-by-rating",
        config
      );
    return data;
  }

  async getInvestmentAllocation(
    config?: AxiosRequestConfig
  ): Promise<GetInvestmentAllocationResponse> {
    const { data } =
      await this.apiClient.get<GetInvestmentAllocationResponse>(
        "/customer/portfolio/investment-allocation",
        config
      );
    return data;
  }

  async getInvestmentByMaturity(
    config?: AxiosRequestConfig
  ): Promise<GetInvestmentByMaturityResponse> {
    const { data } =
      await this.apiClient.get<GetInvestmentByMaturityResponse>(
        "/customer/portfolio/investment-by-maturity",
        config
      );
    return data;
  }

  async getPortfolioDetails(
    body?: {
      page?: number;
      limit?: number;
      bondTypes?: string[];
      bondRatings?: string[];
      couponRanges?: string[];
      paymentFrequencies?: string[];
    },
    config?: AxiosRequestConfig
  ): Promise<GetPortfolioDetailsResponse> {
    const payload = {
      page: body?.page,
      limit: body?.limit,
      bondTypes: body?.bondTypes,
      bondRatings: body?.bondRatings,
      couponRanges: body?.couponRanges,
      paymentFrequencies: body?.paymentFrequencies,
    };

    const { data } =
      await this.apiClient.post<GetPortfolioDetailsResponse>(
        "/customer/portfolio/details",
        payload,
        config
      );
    return data;
  }

  async getCashflowTimeline(
    startDate?: string,
    endDate?: string,
    types?: string[],
    config?: AxiosRequestConfig
  ): Promise<GetCashflowTimelineResponse> {
    const { data } = await this.apiClient.get<GetCashflowTimelineResponse>(
      "/customer/portfolio/cashflow-timeline",
      {
        ...config,
        params: {
          ...config?.params,
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          ...(types && types.length > 0 && { bondType: types.join(",") }),
        },
      }
    );
    return data;
  }

  async getCashflowToMaturity(
    config?: AxiosRequestConfig
  ): Promise<GetCashflowToMaturityResponse> {
    const { data } =
      await this.apiClient.get<GetCashflowToMaturityResponse>(
        "/customer/portfolio/cashflow-maturity",
        config
      );
    return data;
  }
}
