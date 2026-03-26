import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type {
  CreateNewFollowUpResponse,
  DeleteFollowUpByIdResponse,
  GetAllFollowUpsByIdResponse,
  UpdateFollowUpByIdResponse,
} from "../../../types/response.types";
import type { appSchema } from "@root/schema";
import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export interface TCrmFollowUp {
  createFollowUp(
    leadId: number,
    data: z.infer<
      (typeof appSchema.crm.leads)["createNewLeadFollowUpNoteSchema"]
    >,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<CreateNewFollowUpResponse>>;

  getAllFollowUpById(
    leadId: number,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<GetAllFollowUpsByIdResponse>>;

  deleteFollowUpById(
    notesId: number,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<DeleteFollowUpByIdResponse>>;

  updateFollowUpById(
    followUpId: number,
    data: z.infer<(typeof appSchema.crm.leads)["updateLeadFollowUpNoteSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<UpdateFollowUpByIdResponse>>;
}

export class CrmFollowUpApi implements TCrmFollowUp {
  constructor(private apiClient: IApiCaller) {}

  async createFollowUp(
    leadId: number,
    data: z.infer<
      (typeof appSchema.crm.leads)["createNewLeadFollowUpNoteSchema"]
    >,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmFollowUp["createFollowUp"]> {
    return this.apiClient.post<CreateNewFollowUpResponse>(
      `/crm/lead/followup/${leadId}`,
      data,
      config
    );
  }

  async getAllFollowUpById(
    leadId: number,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmFollowUp["getAllFollowUpById"]> {
    return this.apiClient.get<GetAllFollowUpsByIdResponse>(
      `/crm/lead/followup/${leadId}`,
      config
    );
  }

  async deleteFollowUpById(
    notesId: number,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmFollowUp["deleteFollowUpById"]> {
    return this.apiClient.delete<DeleteFollowUpByIdResponse>(
      `/crm/lead/followup/${notesId}`,
      config
    );
  }

  async updateFollowUpById(
    followUpId: number,
    data: z.infer<(typeof appSchema.crm.leads)["updateLeadFollowUpNoteSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmFollowUp["updateFollowUpById"]> {
    return this.apiClient.put<UpdateFollowUpByIdResponse>(
      `/crm/lead/followup/${followUpId}`,
      data,
      config
    );
  }
}
