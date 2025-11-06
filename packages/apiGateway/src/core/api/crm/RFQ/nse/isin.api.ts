import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../../../connection/apiCaller.interface";
import type { CreateRfqResponseItem, NseISINResponseData } from "./isin.response";
import type { BaseResponseData } from "../../../../../types/base";

export class RfqIsinApi {

    constructor(private apiClient: IApiCaller) { }

    async getAllIsin(payload: z.infer<typeof appSchema.crm.rfq.nse.isin.isinFilterSchema>, config?: AxiosRequestConfig) {
        const data = await this.apiClient.get<NseISINResponseData>("/crm/rfq/nse/isin", {
            ...config,
            params: payload,
        });
        return data;
    }

    async addIsinToRfq(payload: z.infer<typeof appSchema.rfq.addIsinSchema>, config?: AxiosRequestConfig) {
        const data = await this.apiClient.post<BaseResponseData<CreateRfqResponseItem>>("/crm/rfq/nse/add-isin", payload, config);
        return data;
    }

    async getRfqFind(payload?: z.infer<typeof appSchema.rfq.rfqFilterSchema>, config?: AxiosRequestConfig) {
        const data = await this.apiClient.get<BaseResponseData<CreateRfqResponseItem[]>>("/crm/rfq/nse/find", {
            ...config,
            params: payload,
        });
        return data.data;
    }
}