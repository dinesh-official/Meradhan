import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type { appSchema } from "@root/schema";
import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type { BaseResponseData, PaginationMeta } from "../../../types/base";

export interface PartnershipPayload {
  id: number;
  organizationName: string;
  organizationType: string;
  city: string;
  state: string;
  website: string | null;
  fullName: string;
  designation: string;
  emailAddress: string;
  mobileNumber: string;
  partnershipModel: string;
  clientBase: string | null;
  message: string | null;
  status: string;
  createdBy: number;
  cRMUserDataModelId: number | null;
  createdAt: string;
  updatedAt: string;
  assignTo?: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
  } | null;
}

export type CreatePartnershipResponse = BaseResponseData<PartnershipPayload>;
export type GetPartnershipByIdResponse = BaseResponseData<PartnershipPayload>;
export type UpdatePartnershipResponse = BaseResponseData<PartnershipPayload>;
export type DeletePartnershipResponse = BaseResponseData<boolean>;
export type FindPartnershipsResponse = BaseResponseData<{
  data: PartnershipPayload[];
  meta: PaginationMeta;
}>;

export interface TCrmPartnershipInterface {
  createPartnership(
    data: z.infer<(typeof appSchema.crm.partnership)["createPartnershipSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<CreatePartnershipResponse>>;

  getPartnershipById(
    partnershipId: number,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<GetPartnershipByIdResponse>>;

  updatePartnership(
    partnershipId: number,
    data: z.infer<(typeof appSchema.crm.partnership)["updatePartnershipSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<UpdatePartnershipResponse>>;

  deletePartnership(
    partnershipId: number,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<DeletePartnershipResponse>>;

  findPartnerships(
    query?: z.infer<(typeof appSchema.crm.partnership)["findManyPartnershipsSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<FindPartnershipsResponse>>;
}

export class CrmPartnershipApi implements TCrmPartnershipInterface {
  constructor(private apiClient: IApiCaller) {}

  async createPartnership(
    data: z.infer<(typeof appSchema.crm.partnership)["createPartnershipSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmPartnershipInterface["createPartnership"]> {
    return this.apiClient.post<CreatePartnershipResponse>(
      `/crm/partnership`,
      data,
      config
    );
  }

  async getPartnershipById(
    partnershipId: number,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmPartnershipInterface["getPartnershipById"]> {
    return this.apiClient.get<GetPartnershipByIdResponse>(
      `/crm/partnership/${partnershipId}`,
      config
    );
  }

  async updatePartnership(
    partnershipId: number,
    data: z.infer<(typeof appSchema.crm.partnership)["updatePartnershipSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmPartnershipInterface["updatePartnership"]> {
    return this.apiClient.put<UpdatePartnershipResponse>(
      `/crm/partnership/${partnershipId}`,
      data,
      config
    );
  }

  async deletePartnership(
    partnershipId: number,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmPartnershipInterface["deletePartnership"]> {
    return this.apiClient.delete<DeletePartnershipResponse>(
      `/crm/partnership/${partnershipId}`,
      config
    );
  }

  async findPartnerships(
    query?: z.infer<(typeof appSchema.crm.partnership)["findManyPartnershipsSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmPartnershipInterface["findPartnerships"]> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params: { ...(config?.params ?? {}), ...(query ?? {}) },
    };
    return this.apiClient.get<FindPartnershipsResponse>(
      `/crm/partnerships`,
      mergedConfig
    );
  }
}

