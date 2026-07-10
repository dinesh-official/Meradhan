import type { appSchema } from "@root/schema";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type z from "zod";
import type {
  CreateUsersResponse,
  CrmUsersSummaryResponse,
  DeleteUserResponse,
  FindManyUsersResponse,
  UpdateUserResponse,
  UserByIdResponse,
} from "../../../types/response.types";

export interface TCrmUsersInterface {
  createUser(
    data: z.infer<(typeof appSchema.crm.user)["createCRMUserSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<CreateUsersResponse>>;

  updateUser(
    id: number,
    data: z.infer<(typeof appSchema.crm.user)["updateUserSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<UpdateUserResponse>>;

  deleteUser(
    id: number,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<DeleteUserResponse>>;

  getUserById(
    id: number,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<UserByIdResponse>>;

  findUsers(
    query?: z.infer<(typeof appSchema.crm.user)["findManyUserSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<FindManyUsersResponse>>;

  getSummary(
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<CrmUsersSummaryResponse>>;
}

export class CrmUsersApi implements TCrmUsersInterface {
  constructor(private apiClient: IApiCaller) {}

  async createUser(
    data: z.infer<(typeof appSchema.crm.user)["createCRMUserSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmUsersInterface["createUser"]> {
    return this.apiClient.post<CreateUsersResponse>("/crm/user", data, config);
  }

  async updateUser(
    id: number,
    data: z.infer<(typeof appSchema.crm.user)["updateUserSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmUsersInterface["updateUser"]> {
    return this.apiClient.patch<UpdateUserResponse>(
      `/crm/user/${id}`,
      data,
      config
    );
  }

  async getUserById(
    id: number,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmUsersInterface["getUserById"]> {
    return this.apiClient.get<UserByIdResponse>(`/crm/user/${id}`, config);
  }

  async deleteUser(
    id: number,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmUsersInterface["deleteUser"]> {
    return this.apiClient.delete<DeleteUserResponse>(`/crm/user/${id}`, config);
  }

  async findUsers(
    query?: z.infer<(typeof appSchema.crm.user)["findManyUserSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<FindManyUsersResponse>> {
    // Merge any existing config.params with our query object
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params: { ...(config?.params ?? {}), ...(query ?? {}) },
    };

    return this.apiClient.get<FindManyUsersResponse>(
      "/crm/users",
      mergedConfig
    );
  }

  async getSummary(
    config?: AxiosRequestConfig
  ): ReturnType<TCrmUsersInterface["getSummary"]> {
    return this.apiClient.get<CrmUsersSummaryResponse>(
      "/crm/users/summary",
      config
    );
  }
}
