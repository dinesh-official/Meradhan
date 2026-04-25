import type { AxiosRequestConfig } from "axios";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type {
  CreateRazorpayRouteStakeholderResponse,
  CreateRazorpayStakeholderPayload,
  ListRazorpayRouteStakeholdersResponse,
  UpdateRazorpayRouteStakeholderResponse,
  UpdateRazorpayStakeholderPayload,
} from "./razorpayStakeholders.response";

export class CrmRazorpayStakeholdersApi {
  constructor(private apiClient: IApiCaller) {}

  async listByAccount(
    razorpayAccountId: string,
    config?: AxiosRequestConfig
  ): Promise<ListRazorpayRouteStakeholdersResponse> {
    const { data } = await this.apiClient.get<ListRazorpayRouteStakeholdersResponse>(
      `/rezorpay/route/accounts/${encodeURIComponent(razorpayAccountId)}/stakeholders`,
      config
    );
    return data;
  }

  async create(
    razorpayAccountId: string,
    payload: CreateRazorpayStakeholderPayload,
    config?: AxiosRequestConfig
  ): Promise<CreateRazorpayRouteStakeholderResponse> {
    const { data } = await this.apiClient.post<CreateRazorpayRouteStakeholderResponse>(
      `/rezorpay/route/accounts/${encodeURIComponent(razorpayAccountId)}/stakeholders`,
      payload,
      config
    );
    return data;
  }

  async update(
    razorpayAccountId: string,
    razorpayStakeholderId: string,
    payload: UpdateRazorpayStakeholderPayload,
    config?: AxiosRequestConfig
  ): Promise<UpdateRazorpayRouteStakeholderResponse> {
    const { data } = await this.apiClient.patch<UpdateRazorpayRouteStakeholderResponse>(
      `/rezorpay/route/accounts/${encodeURIComponent(razorpayAccountId)}/stakeholders/${encodeURIComponent(razorpayStakeholderId)}`,
      payload,
      config
    );
    return data;
  }
}

