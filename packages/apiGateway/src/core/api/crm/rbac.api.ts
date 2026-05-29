import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export class CrmRbacApi {
  constructor(private apiClient: IApiCaller) {}

  listRoles(config?: AxiosRequestConfig) {
    return this.apiClient.get<unknown>("/crm/rbac/roles", config);
  }

  createRole(
    data: z.infer<(typeof appSchema.crm.rbac)["createRoleSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.post<unknown>("/crm/rbac/roles", data, config);
  }

  updateRole(
    roleId: number,
    data: z.infer<(typeof appSchema.crm.rbac)["updateRoleSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.patch<unknown>(`/crm/rbac/roles/${roleId}`, data, config);
  }

  deactivateRole(roleId: number, config?: AxiosRequestConfig) {
    return this.apiClient.delete<unknown>(`/crm/rbac/roles/${roleId}`, config);
  }

  listModules(config?: AxiosRequestConfig) {
    return this.apiClient.get<unknown>("/crm/rbac/modules", config);
  }

  listActions(moduleId: number, config?: AxiosRequestConfig) {
    return this.apiClient.get<unknown>(
      `/crm/rbac/modules/${moduleId}/actions`,
      config
    );
  }

  createAction(
    data: z.infer<(typeof appSchema.crm.rbac)["createActionSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.post<unknown>("/crm/rbac/actions", data, config);
  }

  updateAction(
    actionId: number,
    data: z.infer<(typeof appSchema.crm.rbac)["updateActionSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.patch<unknown>(
      `/crm/rbac/actions/${actionId}`,
      data,
      config
    );
  }

  saveActionPolicies(
    actionId: number,
    data: z.infer<(typeof appSchema.crm.rbac)["saveActionPoliciesSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.put<unknown>(
      `/crm/rbac/actions/${actionId}/policies`,
      data,
      config
    );
  }
}
