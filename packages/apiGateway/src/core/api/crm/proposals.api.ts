import type { AxiosRequestConfig } from "axios";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type {
  CreateCrmSavedProposalResponse,
  AutoCreateRfqFromProposalResponse,
  DeleteCrmSavedProposalResponse,
  GetCrmSavedProposalResponse,
  ListCrmSavedProposalsResponse,
  MarkWaitingForApprovalResponse,
  QueueProposalProcessingResponse,
} from "./proposals.response";

export class CrmSavedProposalsApi {
  constructor(private apiClient: IApiCaller) {}

  async listMine(config?: AxiosRequestConfig): Promise<ListCrmSavedProposalsResponse> {
    const { data } = await this.apiClient.get<ListCrmSavedProposalsResponse>(
      "/crm/proposals",
      config
    );
    return data;
  }

  async listAll(config?: AxiosRequestConfig): Promise<ListCrmSavedProposalsResponse> {
    const { data } = await this.apiClient.get<ListCrmSavedProposalsResponse>(
      "/crm/proposals/all",
      config
    );
    return data;
  }

  async create(
    payload: {
      customerProfileId?: number | null;
      linkedRfqParticipantCode?: string | null;
      isin: string;
      bondName: string;
      side: "BUY" | "SELL";
      quantity: number;
      notes?: string | null;
      data: unknown;
    },
    config?: AxiosRequestConfig
  ): Promise<CreateCrmSavedProposalResponse> {
    const { data } = await this.apiClient.post<CreateCrmSavedProposalResponse>(
      "/crm/proposals",
      payload,
      config
    );
    return data;
  }

  async getById(id: number, config?: AxiosRequestConfig): Promise<GetCrmSavedProposalResponse> {
    const { data } = await this.apiClient.get<GetCrmSavedProposalResponse>(
      `/crm/proposals/${encodeURIComponent(String(id))}`,
      config
    );
    return data;
  }

  async deleteById(
    id: number,
    config?: AxiosRequestConfig
  ): Promise<DeleteCrmSavedProposalResponse> {
    const { data } = await this.apiClient.delete<DeleteCrmSavedProposalResponse>(
      `/crm/proposals/${encodeURIComponent(String(id))}`,
      config
    );
    return data;
  }

  async autoCreateRfq(
    id: number,
    config?: AxiosRequestConfig
  ): Promise<AutoCreateRfqFromProposalResponse> {
    const { data } = await this.apiClient.post<AutoCreateRfqFromProposalResponse>(
      `/crm/proposals/${encodeURIComponent(String(id))}/auto-create-rfq`,
      {},
      config
    );
    return data;
  }

  async queueProcessing(
    id: number,
    config?: AxiosRequestConfig
  ): Promise<QueueProposalProcessingResponse> {
    const { data } = await this.apiClient.post<QueueProposalProcessingResponse>(
      `/crm/proposals/${encodeURIComponent(String(id))}/process`,
      {},
      config
    );
    return data;
  }

  async markWaitingForApproval(
    id: number,
    config?: AxiosRequestConfig
  ): Promise<MarkWaitingForApprovalResponse> {
    const { data } = await this.apiClient.post<MarkWaitingForApprovalResponse>(
      `/crm/proposals/${encodeURIComponent(String(id))}/waiting-for-approval`,
      {},
      config
    );
    return data;
  }
}

