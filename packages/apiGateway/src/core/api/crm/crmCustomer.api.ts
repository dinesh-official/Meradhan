import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type z from "zod";
import type {
  CreateCustomerResponse,
  CustomerProfile,
  DeleteCustomerResponse,
  GetCorporateKycResponse,
  GetCustomerResponse,
  GetCustomerResponseById,
  SaveCorporateKycResponse,
  UpdateCustomerResponse,
} from "../../../types/response.types";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import { ApiError } from "../../connection/error";
import type { BaseResponseData } from "../../../types/base";

export interface TCrmCustomerInterface {
  createCustomer(
    data: z.infer<(typeof appSchema.customer)["createNewCustomerSchema"]>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<CreateCustomerResponse>>;

  customerInfoById(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<GetCustomerResponseById>>;

  deleteCustomerById(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<DeleteCustomerResponse>>;

  getCustomer(
    query?: z.infer<(typeof appSchema.customer)["findManyCustomerSchema"]>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<GetCustomerResponse>>;

  updateCustomer(
    data: z.infer<(typeof appSchema.customer)["updateCustomerProfileSchema"]>,
    customerId: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<UpdateCustomerResponse>>;

  getCorporateKyc(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<GetCorporateKycResponse>>;

  /** Binary PDF — use `responseType: "blob"` internally. */
  getCorporateKycPdf(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<Blob>;

  saveCorporateKyc(
    customerId: number,
    data: z.infer<(typeof appSchema.customer)["createCorporateKycSchema"]>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<SaveCorporateKycResponse>>;

  corporateKraStatus(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{ isRunning: boolean; kycDataStoreId: number | null }>>>;

  triggerCorporateKra(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{ isTriggered: boolean }>>>;

  listCorporateKycAttachments(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<Array<{
    id: number;
    corporateKycModelId: number;
    label: string;
    fileUrl: string;
    createdByCrmUserId?: number | null;
    createdAt: string;
    updatedAt: string;
  }>>>>;

  createCorporateKycAttachment(
    customerId: number,
    data: { label: string; fileUrl: string },
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{
    id: number;
    corporateKycModelId: number;
    label: string;
    fileUrl: string;
    createdByCrmUserId?: number | null;
    createdAt: string;
    updatedAt: string;
  }>>>;

  deleteCorporateKycAttachment(
    customerId: number,
    attachmentId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{ isDeleted: boolean }>>>;
}

export class CrmCustomerApi implements TCrmCustomerInterface {
  constructor(private apiClient: IApiCaller) { }

  async createCustomer(
    data: z.infer<(typeof appSchema.customer)["createNewCustomerSchema"]>,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["createCustomer"]> {
    return this.apiClient.post<CreateCustomerResponse>(
      "/crm/customer",
      data,
      config,
    );
  }

  async customerInfoById(
    customerId: number | string,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["customerInfoById"]> {
    return this.apiClient.get<GetCustomerResponseById>(
      `/crm/customer/${customerId}`,
      config,
    );
  }

  async deleteCustomerById(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["deleteCustomerById"]> {
    return this.apiClient.delete<DeleteCustomerResponse>(
      `/crm/customer/${customerId}`,
      config,
    );
  }

  async getCustomer(
    query?: z.infer<(typeof appSchema.customer)["findManyCustomerSchema"]>,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["getCustomer"]> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params: { ...(config?.params ?? {}), ...(query ?? {}) },
    };
    return this.apiClient.get<GetCustomerResponse>(
      `/crm/customers`,
      mergedConfig,
    );
  }

  async getCustomerByParticipantCode(
    participantCode: string,
    config?: AxiosRequestConfig,
  ) {
    return this.apiClient.get<BaseResponseData<CustomerProfile>>(
      `/crm/customer/participant/${participantCode}`,
      config,
    );
  }

  async updateCustomer(
    data: z.infer<(typeof appSchema.customer)["updateCustomerProfileSchema"]>,
    customerId: string,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["updateCustomer"]> {
    return this.apiClient.patch<UpdateCustomerResponse>(
      `/crm/customer/${customerId}`,
      data,
      config,
    );
  }

  async getCorporateKyc(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["getCorporateKyc"]> {
    return this.apiClient.get<GetCorporateKycResponse>(
      `/crm/customer/${customerId}/corporate-kyc`,
      config,
    );
  }

  async getCorporateKycPdf(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<Blob> {
    try {
      const response = await this.apiClient.get<Blob>(
        `/crm/customer/${customerId}/corporate-kyc/pdf`,
        { ...config, responseType: "blob" },
      );
      return response.data;
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.response?.data instanceof Blob &&
        err.response.data.type?.includes("json")
      ) {
        try {
          const text = await err.response.data.text();
          const j = JSON.parse(text) as { message?: string };
          throw new Error(j.message ?? "Failed to download corporate KYC PDF");
        } catch (e) {
          if (e instanceof SyntaxError) {
            /* ignore — fall through to rethrow Axios error */
          } else {
            throw e;
          }
        }
      }
      throw err instanceof Error ? err : new Error("Failed to download corporate KYC PDF");
    }
  }

  async saveCorporateKyc(
    customerId: number,
    data: z.infer<(typeof appSchema.customer)["createCorporateKycSchema"]>,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["saveCorporateKyc"]> {
    return this.apiClient.put<SaveCorporateKycResponse>(
      `/crm/customer/${customerId}/corporate-kyc`,
      data,
      config,
    );
  }

  async corporateKraStatus(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["corporateKraStatus"]> {
    return this.apiClient.get<BaseResponseData<{ isRunning: boolean; kycDataStoreId: number | null }>>(
      `/crm/customer/${customerId}/corporate-kyc/kra/status`,
      config,
    );
  }

  async triggerCorporateKra(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["triggerCorporateKra"]> {
    return this.apiClient.post<BaseResponseData<{ isTriggered: boolean }>>(
      `/crm/customer/${customerId}/corporate-kyc/kra/trigger`,
      {},
      config,
    );
  }

  async listCorporateKycAttachments(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["listCorporateKycAttachments"]> {
    return this.apiClient.get<
      BaseResponseData<
        Array<{
          id: number;
          corporateKycModelId: number;
          label: string;
          fileUrl: string;
          createdByCrmUserId?: number | null;
          createdAt: string;
          updatedAt: string;
        }>
      >
    >(`/crm/customer/${customerId}/corporate-kyc/attachments`, config);
  }

  async createCorporateKycAttachment(
    customerId: number,
    data: { label: string; fileUrl: string },
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["createCorporateKycAttachment"]> {
    return this.apiClient.post<
      BaseResponseData<{
        id: number;
        corporateKycModelId: number;
        label: string;
        fileUrl: string;
        createdByCrmUserId?: number | null;
        createdAt: string;
        updatedAt: string;
      }>
    >(`/crm/customer/${customerId}/corporate-kyc/attachments`, data, config);
  }

  async deleteCorporateKycAttachment(
    customerId: number,
    attachmentId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["deleteCorporateKycAttachment"]> {
    return this.apiClient.delete<BaseResponseData<{ isDeleted: boolean }>>(
      `/crm/customer/${customerId}/corporate-kyc/attachments/${attachmentId}`,
      config,
    );
  }
}
