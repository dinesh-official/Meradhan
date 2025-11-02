import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type { BondDetailResponse, ListedBondsResponse } from "./bonds.response";

export class BondsApi {
    constructor(private apiClient: IApiCaller) { }

    public async getListedBonds(payload: {
        filters?: z.infer<typeof appSchema.bonds.bondsFilterSchema>, params: {
            page?: number | string;
            limit?: number | string;
            category?: string
        }
    }, config?: AxiosRequestConfig) {
        const response = await this.apiClient.post<ListedBondsResponse>("/bonds/listed/filter", payload.filters, { ...config, params: payload.params });
        return response.data;
    }

    public async getBondDetailsByIsin(isin: string, config?: AxiosRequestConfig) {
        const response = await this.apiClient.get<BondDetailResponse>(`/bonds/${isin}`, config);
        return response.data;
    }

}