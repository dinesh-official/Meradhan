import type { AxiosRequestConfig } from "axios";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type {
  CreateRazorpayRouteAccountPayload,
  CreateRazorpayRouteAccountResponse,
  CreateRazorpayRouteSettlementAccountPayload,
  CreateRazorpayRouteSettlementAccountResponse,
  DeleteRazorpayRouteSettlementAccountResponse,
  GetRazorpayRouteAccountsResponse,
  GetRazorpayRouteAccountByIdResponse,
  ListRazorpayRouteSettlementAccountsResponse,
  UpdateRazorpayRouteAccountPayload,
  UpdateRazorpayRouteAccountResponse,
  UpdateRazorpayRouteSettlementAccountPayload,
  UpdateRazorpayRouteSettlementAccountResponse,
} from "./razorpayRoutes.response";

export class CrmRazorpayRoutesApi {
  constructor(private apiClient: IApiCaller) {}

  async getRouteAccounts(
    config?: AxiosRequestConfig
  ): Promise<GetRazorpayRouteAccountsResponse> {
    const { data } = await this.apiClient.get<GetRazorpayRouteAccountsResponse>(
      "/rezorpay/route/accounts",
      config
    );
    return data;
  }

  async getRouteAccountById(
    razorpayAccountId: string,
    config?: AxiosRequestConfig
  ): Promise<GetRazorpayRouteAccountByIdResponse> {
    const { data } = await this.apiClient.get<GetRazorpayRouteAccountByIdResponse>(
      `/rezorpay/route/accounts/${encodeURIComponent(razorpayAccountId)}`,
      config
    );
    return data;
  }

  async createRouteAccount(
    payload: CreateRazorpayRouteAccountPayload,
    config?: AxiosRequestConfig
  ): Promise<CreateRazorpayRouteAccountResponse> {
    const { data } = await this.apiClient.post<CreateRazorpayRouteAccountResponse>(
      "/rezorpay/route/accounts",
      payload,
      config
    );
    return data;
  }

  async updateRouteAccount(
    razorpayAccountId: string,
    payload: UpdateRazorpayRouteAccountPayload,
    config?: AxiosRequestConfig
  ): Promise<UpdateRazorpayRouteAccountResponse> {
    const { data } = await this.apiClient.patch<UpdateRazorpayRouteAccountResponse>(
      `/rezorpay/route/accounts/${encodeURIComponent(razorpayAccountId)}`,
      payload,
      config
    );
    return data;
  }

  async listSettlementAccounts(
    razorpayAccountId: string,
    config?: AxiosRequestConfig
  ): Promise<ListRazorpayRouteSettlementAccountsResponse> {
    const { data } = await this.apiClient.get<ListRazorpayRouteSettlementAccountsResponse>(
      `/rezorpay/route/accounts/${encodeURIComponent(razorpayAccountId)}/settlement-accounts`,
      config
    );
    return data;
  }

  async createSettlementAccount(
    razorpayAccountId: string,
    payload: CreateRazorpayRouteSettlementAccountPayload,
    config?: AxiosRequestConfig
  ): Promise<CreateRazorpayRouteSettlementAccountResponse> {
    const { data } = await this.apiClient.post<CreateRazorpayRouteSettlementAccountResponse>(
      `/rezorpay/route/accounts/${encodeURIComponent(razorpayAccountId)}/settlement-accounts`,
      payload,
      config
    );
    return data;
  }

  async updateSettlementAccount(
    razorpayAccountId: string,
    settlementId: number,
    payload: UpdateRazorpayRouteSettlementAccountPayload,
    config?: AxiosRequestConfig
  ): Promise<UpdateRazorpayRouteSettlementAccountResponse> {
    const { data } = await this.apiClient.patch<UpdateRazorpayRouteSettlementAccountResponse>(
      `/rezorpay/route/accounts/${encodeURIComponent(razorpayAccountId)}/settlement-accounts/${encodeURIComponent(
        String(settlementId)
      )}`,
      payload,
      config
    );
    return data;
  }

  async deleteSettlementAccount(
    razorpayAccountId: string,
    settlementId: number,
    config?: AxiosRequestConfig
  ): Promise<DeleteRazorpayRouteSettlementAccountResponse> {
    const { data } = await this.apiClient.delete<DeleteRazorpayRouteSettlementAccountResponse>(
      `/rezorpay/route/accounts/${encodeURIComponent(razorpayAccountId)}/settlement-accounts/${encodeURIComponent(
        String(settlementId)
      )}`,
      config
    );
    return data;
  }
}

