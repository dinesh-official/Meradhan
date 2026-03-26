import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { BaseResponseData } from "../../../../../types/base";
import type { IApiCaller } from "../../../../connection/apiCaller.interface";
import { type ParticipantData } from "./participants.response";

export class RfqParticipantsApi {
  constructor(private apiClient: IApiCaller) {}

  async getAllParticipants(
    payload: z.infer<
      typeof appSchema.crm.rfq.nse.getParticipants.GetParticipantsZ
    >,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.get<BaseResponseData<ParticipantData[]>>(
      "/crm/rfq/nse/cbrics/participants",
      {
        ...config,
        params: payload,
      }
    );
    return data;
  }

  async getAllRfqParticipants(config?: AxiosRequestConfig) {
    const data = await this.apiClient.get<
      BaseResponseData<{ code: string; name: string }[]>
    >("/crm/rfq/nse/rfq/participants", {
      ...config,
    });
    return data;
  }
}
