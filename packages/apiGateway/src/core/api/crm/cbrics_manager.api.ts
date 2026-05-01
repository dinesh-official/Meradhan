import type { AxiosRequestConfig } from "axios";
import type { BaseResponseData } from "../../../types/base";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export type CbricsWorkflowStatus =
  | 0
  | 1
  | 5
  | 6
  | 10
  | 15
  | 16
  | 100;

export type NseCbricsParticipantDbListResponse = {
  data: Array<{
    key: number;
    id: number;
    loginId: string;
    userId: number;
    actualStatus: number;
    workflowStatus: number;
    firstName: string;
    panNo: string;
    contactPerson: string;
    telephone: string;
    emailList: string[];
    createdAt: string;
    updatedAt: string;
  }>;
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

export type CbricsLinkedCustomersGroupedResponse = {
  groups: Array<{
    workflowStatus: number;
    label: string;
    rows: Array<{
      customerId: number;
      displayName: string;
      emailAddress: string;
      phoneNo: string | null;
      userType: string;
      kycStatus: string;
      cbricsParticipantId: number;
      loginId: string;
      workflowStatus: number;
      actualStatus: number;
      participantNameOnCbrics: string;
      panNo: string;
    }>;
  }>;
  totalReturned: number;
  truncated: boolean;
};

export type CbricsLinkedCustomerListResponse = {
  data: Array<{
    customerId: number;
    displayName: string;
    emailAddress: string;
    phoneNo: string | null;
    userType: string;
    kycStatus: string;
    cbricsParticipantId: number;
    loginId: string;
    workflowStatus: number;
    actualStatus: number;
    participantNameOnCbrics: string;
    panNo: string;
  }>;
  meta: { page: number; pageSize: number; total: number; totalPages: number };
};

export class CbricsManagerApi {
  constructor(private apiClient: IApiCaller) {}

  listDbNseCbricsParticipants(
    params?: { page?: string; pageSize?: string; search?: string },
    config?: AxiosRequestConfig,
  ) {
    return this.apiClient.get<BaseResponseData<NseCbricsParticipantDbListResponse>>(
      "/crm/tools/cbrics-manager/db/participants",
      { ...config, params },
    );
  }

  getCustomersWithCbricsGroupedByWorkflow(
    params?: {
      search?: string;
      accountStatus?: string;
      kycStatus?: string;
      maxRows?: string;
    },
    config?: AxiosRequestConfig,
  ) {
    return this.apiClient.get<BaseResponseData<CbricsLinkedCustomersGroupedResponse>>(
      "/crm/tools/cbrics-manager/customers/grouped-by-workflow",
      { ...config, params },
    );
  }

  getCustomersWithCbricsParticipant(
    params: {
      page?: string;
      pageSize?: string;
      search?: string;
      accountStatus?: string;
      kycStatus?: string;
    },
    config?: AxiosRequestConfig,
  ) {
    return this.apiClient.get<BaseResponseData<CbricsLinkedCustomerListResponse>>(
      "/crm/tools/cbrics-manager/customers",
      { ...config, params },
    );
  }

  getParticipantById(id: number, config?: AxiosRequestConfig) {
    return this.apiClient.get<BaseResponseData<Record<string, unknown>>>(
      `/crm/tools/cbrics-manager/participants/${id}`,
      config,
    );
  }

  getCustomerProfileMatchKeysForParticipant(id: number, config?: AxiosRequestConfig) {
    return this.apiClient.get<
      BaseResponseData<{ customerId: number | null; bankKeys: string[]; dematKeys: string[] }>
    >(`/crm/tools/cbrics-manager/participants/${id}/customer-profile-match-keys`, config);
  }

  postBankAccountsList(
    body: { participantCode?: string; workflowStatus: CbricsWorkflowStatus },
    config?: AxiosRequestConfig,
  ) {
    return this.apiClient.post<BaseResponseData<unknown[]>>(
      "/crm/tools/cbrics-manager/bank-accounts/list",
      body,
      config,
    );
  }

  postDpAccountsList(
    body: { participantCode?: string; workflowStatus: CbricsWorkflowStatus },
    config?: AxiosRequestConfig,
  ) {
    return this.apiClient.post<BaseResponseData<unknown[]>>(
      "/crm/tools/cbrics-manager/dp-accounts/list",
      body,
      config,
    );
  }

  postBankMarkDefault(
    body: { participantCode: string; bankIFSC: string; bankAccountNo?: string },
    config?: AxiosRequestConfig,
  ) {
    return this.apiClient.post<BaseResponseData<unknown>>(
      "/crm/tools/cbrics-manager/bank-accounts/mark-default",
      body,
      config,
    );
  }

  postDpMarkDefault(
    body: {
      participantCode: string;
      dpType: "NSDL" | "CDSL";
      dpId?: string | null;
      benId: string;
    },
    config?: AxiosRequestConfig,
  ) {
    return this.apiClient.post<BaseResponseData<unknown>>(
      "/crm/tools/cbrics-manager/dp-accounts/mark-default",
      body,
      config,
    );
  }

  postParticipantUpdate(
    id: number,
    body: Record<string, unknown>,
    config?: AxiosRequestConfig,
  ) {
    return this.apiClient.post<BaseResponseData<Record<string, unknown>>>(
      `/crm/tools/cbrics-manager/participants/${id}/update`,
      body,
      config,
    );
  }

  postParticipantCreateMissingProfileFinancials(id: number, config?: AxiosRequestConfig) {
    return this.apiClient.post<
      BaseResponseData<{
        profileId: number;
        createdBanks: number;
        createdDemats: number;
        skippedExistingBankLines: number;
        skippedExistingDematLines: number;
        skippedBankMissingAccountNumber: number;
        skippedDematInvalid: number;
      }>
    >(`/crm/tools/cbrics-manager/participants/${id}/create-missing-profile-financials`, {}, config);
  }
}
