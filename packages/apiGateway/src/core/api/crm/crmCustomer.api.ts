import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type z from "zod";
import type {
  CreateCustomerResponse,
  DeleteCustomerResponse,
  GetCustomerResponse,
  GetCustomerResponseById,
  UpdateCustomerResponse,
} from "../../../types/response.types";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export interface TCrmCustomerInterface {
  createCustomer(
    data: z.infer<(typeof appSchema.customer)["createNewCustomerSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<CreateCustomerResponse>>;

  customerInfoById(
    customerId: number,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<GetCustomerResponseById>>;

  deleteCustomerById(
    customerId: number,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<DeleteCustomerResponse>>;

  getCustomer(
    query?: z.infer<(typeof appSchema.customer)["findManyCustomerSchema"]>,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<GetCustomerResponse>>;

  updateCustomer(
    data: z.infer<(typeof appSchema.customer)["updateCustomerProfileSchema"]>,
    customerId: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<UpdateCustomerResponse>>;
}

export class CrmCustomerApi implements TCrmCustomerInterface {
  constructor(private apiClient: IApiCaller) {}

  async createCustomer(
    data: z.infer<(typeof appSchema.customer)["createNewCustomerSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmCustomerInterface["createCustomer"]> {
    return this.apiClient.post<CreateCustomerResponse>(
      "/crm/customer",
      data,
      config
    );
  }

  async customerInfoById(
    customerId: number,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmCustomerInterface["customerInfoById"]> {
    return this.apiClient.get<GetCustomerResponseById>(
      `/crm/customer/${customerId}`,
      config
    );
  }

  async deleteCustomerById(
    customerId: number,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmCustomerInterface["deleteCustomerById"]> {
    return this.apiClient.delete<DeleteCustomerResponse>(
      `/crm/customer/${customerId}`,
      config
    );
  }

  async getCustomer(
    query?: z.infer<(typeof appSchema.customer)["findManyCustomerSchema"]>,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmCustomerInterface["getCustomer"]> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params: { ...(config?.params ?? {}), ...(query ?? {}) },
    };
    return this.apiClient.get<GetCustomerResponse>(
      `/crm/customers`,
      mergedConfig
    );
  }

  async updateCustomer(
    data: z.infer<(typeof appSchema.customer)["updateCustomerProfileSchema"]>,
    customerId: string,
    config?: AxiosRequestConfig
  ): ReturnType<TCrmCustomerInterface["updateCustomer"]> {
    return this.apiClient.patch<UpdateCustomerResponse>(
      `/crm/customer/${customerId}`,
      data,
      config
    );
  }
}
