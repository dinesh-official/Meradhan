import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../../../connection/apiCaller.interface";
import { type ParticipantResponseData } from "./participants.response";

export class RfqParticipantsApi {

    constructor(private apiClient: IApiCaller) { }

    async getAllParticipants(payload: z.infer<typeof appSchema.crm.rfq.nse.getParticipants.GetParticipantsZ>, config?: AxiosRequestConfig) {
        const data  = await this.apiClient.get<ParticipantResponseData>("/crm/rfq/nse/participants", {
            ...config,
            params: payload,
        });
        return data;
    }

}