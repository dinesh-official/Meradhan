import { appSchema } from "@root/schema";
import type { IApiCaller } from "../../../connection/apiCaller.interface";
import type { AxiosRequestConfig } from "axios";

import type z from "zod";
import type {
  I_IFSCResponse,
  IBankKycVerifyResponse,
  IDmatKycVerifyResponse,
  IEsignKycRequest,
  IPANKycRequestResponse,
  IPANKycVerifyResponse,
  ISelfireKycRequestResponse,
  ISelfireKycVerifyResponse,
  ISignKycRequestResponse,
  ISignKycVerifyResponse,
  IStoreKycGETResponse,
  IStoreKycSETResponse,
  KRAResponse,
} from "./Kyc.response";
import type { BaseResponseData } from "../../../../types/base";

export class CustomerKycApi {
  private schema = appSchema.kyc;

  constructor(private apiClient: IApiCaller) {}

  async requestPanVerification(
    payload: z.infer<typeof this.schema.kycPanInfoDataSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<IPANKycRequestResponse>(
      "/customer/kyc/pan/request",
      payload,
      config
    );
    return data;
  }

  async verifyPanVerification(
    payload: { kid: string },
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.get<IPANKycVerifyResponse>(
      "/customer/kyc/pan/response/" + payload.kid,
      config
    );
    return data;
  }

  async storeKycProgress(
    payload: { step: number; data: unknown; complete?: boolean },
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<IStoreKycSETResponse>(
      "/customer/kyc/store/" + payload.step,
      payload.data,
      {
        ...config,
        params: {
          complete: payload.complete,
        },
      }
    );
    return data;
  }

  async getKycProgress(config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.get<IStoreKycGETResponse>(
      "/customer/kyc/store/get",
      config
    );
    return data;
  }

  // selfie
  async requestSelfieVerification(
    payload: z.infer<typeof this.schema.selfieSignRequestSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<ISelfireKycRequestResponse>(
      "/customer/kyc/selfie/request",
      payload,
      config
    );
    return data;
  }

  async verifySelfieVerification(
    payload: { kid: string },
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.get<ISelfireKycVerifyResponse>(
      "/customer/kyc/selfie/response/" + payload.kid,
      config
    );

    return data;
  }

  // sign
  async requestSignVerification(
    payload: z.infer<typeof this.schema.selfieSignRequestSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<ISignKycRequestResponse>(
      "/customer/kyc/sign/request",
      payload,
      config
    );
    return data;
  }

  async verifySignVerification(
    payload: { kid: string },
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.get<ISignKycVerifyResponse>(
      "/customer/kyc/sign/response/" + payload.kid,
      config
    );
    return data;
  }

  // ifsc code
  async verifyIfscCode(payload: { ifsc: string }, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.get<I_IFSCResponse>(
      `/bank/${payload.ifsc}`,
      config
    );
    return data;
  }

  async verifyBankAccount(
    payload: z.infer<typeof this.schema.bankInfoSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<IBankKycVerifyResponse>(
      `/customer/kyc/bank/verify`,
      payload,
      config
    );
    return data;
  }

  async verifyDematAccount(
    payload: z.infer<typeof this.schema.dpAccountInfoSchema>,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<IDmatKycVerifyResponse>(
      `/customer/kyc/demat/submit`,
      payload,
      config
    );
    return data;
  }

  async esignRequest(config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.post<IEsignKycRequest>(
      `/customer/kyc/esign/request`,
      undefined,
      config
    );
    return data;
  }

  async esignVerifyResponse(docId: string, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.get<IEsignKycRequest>(
      `/customer/kyc/esign/verify/${docId}`,
      config
    );
    return data;
  }

  async getKycLevel(customerId: number, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.get<BaseResponseData<string>>(
      `/customer/kyc/level/${customerId}`,
      config
    );
    return data;
  }

  async addKycAuditLog(
    customerId: number,
    action: {
      type: string;
      description: string;
      timestamp?: string;
      step?: number;
    },
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<
      BaseResponseData<{ success: true }>
    >(`/customer/kyc/audit-log/${customerId}`, action, config);
    return data;
  }

  async setCurrentKycStep(
    customerId: number,
    currentStepName: string,
    config?: AxiosRequestConfig
  ) {
    const { data } = await this.apiClient.post<
      BaseResponseData<{ success: true }>
    >(`/customer/kyc/current-step/${customerId}`, { currentStepName }, config);
    return data;
  }

  async getKycProgressStoreCrm(id: number, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.get<IStoreKycGETResponse>(
      "/crm/kyc/store/get/" + id,
      config
    );
    return data;
  }

  async getKycKraDataById(customerId: number, config?: AxiosRequestConfig) {
    const { data } = await this.apiClient.get<KRAResponse>(
      `/crm/kyc/kra/get/${customerId}`,
      config
    );
    return data;
  }
}
