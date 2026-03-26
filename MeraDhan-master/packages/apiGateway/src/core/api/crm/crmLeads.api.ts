import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type {
  CreateNewLeadResponse,
  DeleteNewLeadByIDResponse,
  FindLeadsResponse,
  GetNewLeadByIdResponse,
  UpdateNewLeadByIDResponse,
  LeadSourceSummaryResponse,
} from "../../../types/response.types";
import type { appSchema } from "@root/schema";
import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export interface TCrmLeadInterface {
  createNewLead(
    data: z.infer<(typeof appSchema.crm.leads)["createNewLeadSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<CreateNewLeadResponse>>;

  getNewLeadById(
    leadId: number,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<GetNewLeadByIdResponse>>;

  updateNewLeadById(
    leadId: number,
    data: z.infer<(typeof appSchema.crm.leads)["updateLeadSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<UpdateNewLeadByIDResponse>>;

  deleteNewLeadById(
    followId: number,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<DeleteNewLeadByIDResponse>>;

  findLeads(
    query?: z.infer<(typeof appSchema.crm.leads)["findManyLeadsSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<FindLeadsResponse>>;

  getLeadSourceSummary(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<LeadSourceSummaryResponse>>;
}

export class CrmLeadApi implements TCrmLeadInterface {
  constructor(private apiClient: IApiCaller) {}

  async createNewLead(
    data: z.infer<(typeof appSchema.crm.leads)["createNewLeadSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmLeadInterface["createNewLead"]> {
    return this.apiClient.post<CreateNewLeadResponse>(
      `/crm/lead`,
      data,
      config
    );
  }

  async getNewLeadById(
    leadId: number,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmLeadInterface["getNewLeadById"]> {
    return this.apiClient.get<GetNewLeadByIdResponse>(
      `/crm/lead/${leadId}`,
      config
    );
  }

  async updateNewLeadById(
    leadId: number,
    data: z.infer<(typeof appSchema.crm.leads)["updateLeadSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmLeadInterface["updateNewLeadById"]> {
    return this.apiClient.put<UpdateNewLeadByIDResponse>(
      `/crm/lead/${leadId}`,
      data,
      config
    );
  }

  async deleteNewLeadById(
    followId: number,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmLeadInterface["deleteNewLeadById"]> {
    return this.apiClient.delete<DeleteNewLeadByIDResponse>(
      `crm/lead/${followId}`,
      config
    );
  }

  async findLeads(
    query?: z.infer<(typeof appSchema.crm.leads)["findManyLeadsSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmLeadInterface["findLeads"]> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params: { ...(config?.params ?? {}), ...(query ?? {}) },
    };
    return this.apiClient.get<FindLeadsResponse>(`crm/leads`, mergedConfig);
  }

  async getLeadSourceSummary(
    config?: AxiosRequestConfig
  ): ReturnType<TCrmLeadInterface["getLeadSourceSummary"]> {
    return this.apiClient.get<LeadSourceSummaryResponse>(
      `/crm/leads/summary`,
      config
    );
  }
}
