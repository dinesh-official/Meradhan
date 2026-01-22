import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type {
  BondDetailResponse,
  LatestBondsResponse,
  ListedBondsResponse,
} from "./bonds.response";

export class BondsApi {
  constructor(private apiClient: IApiCaller) { }

  public async getListedBonds(
    payload: {
      filters?: z.infer<typeof appSchema.bonds.bondsFilterSchema>;
      params: {
        page?: number | string;
        limit?: number | string;
        category?: string;
        all?: string;
      };
    },
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.post<ListedBondsResponse>(
      "/bonds/listed/filter",
      payload.filters,
      { ...config, params: payload.params }
    );
    return response.data;
  }

  public async getBondDetailsByIsin(isin: string, config?: AxiosRequestConfig) {
    const response = await this.apiClient.get<BondDetailResponse>(
      `/bonds/${isin}`,
      config
    );
    return response.data;
  }

  public async getLatestBonds(count: number = 3, config?: AxiosRequestConfig) {
    const response = await this.apiClient.get<LatestBondsResponse>(
      `/bonds/latest`,
      { ...config, params: { count } }
    );
    return response.data;
  }

  public async getUpcomingBonds(
    limit: number = 6,
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.get<LatestBondsResponse>(
      `/bonds/upcoming`,
      { ...config, params: { limit } }
    );
    return response.data;
  }

  public async createBond(
    payload: z.infer<typeof appSchema.bonds.bondCreateUpdateSchema>,
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.post<BondDetailResponse>(
      `/bonds`,
      payload,
      config
    );
    return response.data;
  }

  public async updateBond(
    isin: string,
    payload: z.infer<typeof appSchema.bonds.bondCreateUpdateSchema>,
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.put<BondDetailResponse>(
      `/bonds/${isin}`,
      payload,
      config
    );
    return response.data;
  }

  public async getOngoingDeals(config?: AxiosRequestConfig) {
    const response = await this.apiClient.get<LatestBondsResponse>(
      `/bonds/ongoing-deals`,
      config
    );
    return response.data;
  }
}
