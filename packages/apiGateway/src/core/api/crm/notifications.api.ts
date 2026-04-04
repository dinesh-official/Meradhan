import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";

export class CrmNotificationsApi {
  constructor(private apiClient: IApiCaller) {}

  queryCustomers(
    data: z.infer<(typeof appSchema.crm.notifications)["queryCustomersPromptSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.post<unknown>(
      "/crm/notifications/query-customers",
      data,
      config
    );
  }

  createSavedList(
    data: z.infer<(typeof appSchema.crm.notifications)["createSavedListSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.post<unknown>(
      "/crm/notifications/saved-lists",
      data,
      config
    );
  }

  listSavedLists(config?: AxiosRequestConfig) {
    return this.apiClient.get<unknown>("/crm/notifications/saved-lists", config);
  }

  getSavedList(id: number, config?: AxiosRequestConfig) {
    return this.apiClient.get<unknown>(
      `/crm/notifications/saved-lists/${id}`,
      config
    );
  }

  patchSavedList(
    id: number,
    data: z.infer<(typeof appSchema.crm.notifications)["patchSavedListSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.patch<unknown>(
      `/crm/notifications/saved-lists/${id}`,
      data,
      config
    );
  }

  deleteSavedList(id: number, config?: AxiosRequestConfig) {
    return this.apiClient.delete<unknown>(
      `/crm/notifications/saved-lists/${id}`,
      config
    );
  }

  send(
    data: z.infer<(typeof appSchema.crm.notifications)["sendNotificationSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.post<unknown>("/crm/notifications/send", data, config);
  }

  smsTemplates(config?: AxiosRequestConfig) {
    return this.apiClient.get<unknown>("/crm/notifications/sms-templates", config);
  }

  listLogs(
    query?: z.infer<
      (typeof appSchema.crm.notifications)["listNotificationLogsQuerySchema"]
    >,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<unknown>> {
    return this.apiClient.get<unknown>("/crm/notifications/logs", {
      ...config,
      params: query,
    });
  }

  savedListMembers(listId: number, config?: AxiosRequestConfig) {
    return this.apiClient.get<unknown>(
      `/crm/notifications/saved-lists/${listId}/members`,
      config
    );
  }

  removeSavedListMember(
    listId: number,
    customerProfileId: number,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.delete<unknown>(
      `/crm/notifications/saved-lists/${listId}/members/${customerProfileId}`,
      config
    );
  }

  customerNotificationLogs(
    customerProfileId: number,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.get<unknown>(
      `/crm/customers/${customerProfileId}/notification-logs`,
      config
    );
  }

  /* ─── DLT Templates ──────────────────────────────────────── */

  listTemplates(config?: AxiosRequestConfig) {
    return this.apiClient.get<unknown>("/crm/notifications/templates", config);
  }

  createTemplate(
    data: z.infer<(typeof appSchema.crm.notifications)["createTemplateSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.post<unknown>("/crm/notifications/templates", data, config);
  }

  updateTemplate(
    id: number,
    data: z.infer<(typeof appSchema.crm.notifications)["updateTemplateSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return this.apiClient.patch<unknown>(
      `/crm/notifications/templates/${id}`,
      data,
      config
    );
  }

  deleteTemplate(id: number, config?: AxiosRequestConfig) {
    return this.apiClient.delete<unknown>(
      `/crm/notifications/templates/${id}`,
      config
    );
  }
}
