import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type { BaseResponseData } from "../../../types/base";

export class CommonApi {
  private schema = appSchema.contact;
  private partnershipSchema = appSchema.crm.partnership;
  constructor(private apiClient: IApiCaller) {}
  async conntactSubmit(
    payload: z.infer<typeof this.schema.contactSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<
      BaseResponseData<{
        message: string;
        status: boolean;
      }>
    >("/contact/submit", payload, config);
    return data;
  }
  async partnershipSubmit(
    payload: z.infer<typeof this.partnershipSchema.createPartnershipSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<
      BaseResponseData<{
        message: string;
        status: boolean;
      }>
    >("/partnership/submit", payload, config);
    return data;
  }
}
