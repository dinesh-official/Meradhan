import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../../../connection/apiCaller.interface";
import type { NseISINResponseData } from "./isin.response";

export class RfqIsinApi {

    constructor(private apiClient: IApiCaller) { }

    async getAllIsin(payload: z.infer<typeof appSchema.crm.rfq.nse.isin.isinFilterSchema>, config?: AxiosRequestConfig) {
        const data  = await this.apiClient.get<NseISINResponseData>("/crm/rfq/nse/isin", {
            ...config,
            params: payload,
        });
        return data;
    }
}