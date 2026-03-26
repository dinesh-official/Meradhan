import type { appSchema } from "@root/schema";

import type z from "zod";
import type { AxiosRequestConfig } from "axios";
import type { BaseResponseData } from "../../../types/base";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type {
  T_ACTIVITY_LOGS_CRM_RESPONSE,
  T_LOGIN_LOGS_CRM_RESPONSE,
  T_SESSION_LOGS_CRM_RESPONSE,
  T_LOGIN_LOGS_MERADHAN_RESPONSE,
  T_ACTIVITY_LOGS_MERADHAN_RESPONSE,
  T_SESSION_LOGS_MERADHAN_RESPONSE,
} from "./auditlog.response";

export class AuditLogsApiV2 {
  constructor(private apiClient: IApiCaller) { }

  async startPageTrackingCrm(
    data: z.infer<(typeof appSchema.auditlogsSchema)["PageViewSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return await this.apiClient.post<BaseResponseData<{ pageViewId: number }>>(
      "/auditlogs/crm/page-tracking/start",
      data,
      config
    );
  }

  async endPageTrackingCrm(
    pageViewId: number,
    data: Partial<
      z.infer<(typeof appSchema.auditlogsSchema)["PageViewSchema"]>
    >,
    config?: AxiosRequestConfig
  ) {
    return await this.apiClient.post<BaseResponseData<{ pageViewId: number }>>(
      "/auditlogs/crm/page-tracking/end/" + pageViewId,
      data,
      config
    );
  }

  async updatePageTrackingCrm(
    pageViewId: number,
    data: Partial<
      z.infer<(typeof appSchema.auditlogsSchema)["PageViewSchema"]>
    >,
    config?: AxiosRequestConfig
  ) {
    return await this.apiClient.post<BaseResponseData<{ pageViewId: number }>>(
      "/auditlogs/crm/page-tracking/update/" + pageViewId,
      data,
      config
    );
  }

  // Paginated fetchers
  private toQuery(params: Record<string, unknown> = {}) {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (v instanceof Date) qp.set(k, v.toISOString());
      else qp.set(k, String(v));
    });
    const s = qp.toString();
    return s ? `?${s}` : "";
  }

  async getLoginLogsCrm(
    params: {
      userId?: number;
      page?: number;
      pageSize?: number;
      startDate?: string | Date;
      endDate?: string | Date;
    },
    config?: AxiosRequestConfig
  ) {
    const query = this.toQuery(params);
    return await this.apiClient.get<T_LOGIN_LOGS_CRM_RESPONSE>(
      `/auditlogs/crm/login-logs${query}` as string,
      config
    );
  }

  async getActivityLogsCrm(
    params: {
      userId?: number;
      page?: number;
      pageSize?: number;
      startDate?: string | Date;
      endDate?: string | Date;
      entityType?: string;
      search?: string;
    },
    config?: AxiosRequestConfig
  ) {
    const query = this.toQuery(params);
    return await this.apiClient.get<T_ACTIVITY_LOGS_CRM_RESPONSE>(
      `/auditlogs/crm/activity-logs${query}` as string,
      config
    );
  }

  async getSessionLogsCrm(
    params: {
      userId?: number;
      page?: number;
      pageSize?: number;
      startDate?: string | Date;
      endDate?: string | Date;
    },
    config?: AxiosRequestConfig
  ) {
    const query = this.toQuery(params);
    return await this.apiClient.get<T_SESSION_LOGS_CRM_RESPONSE>(
      `/auditlogs/crm/session-logs${query}` as string,
      config
    );
  }

  // ==================== Meradhan Audit Log Methods ====================

  async createNewTrackingSessionMeradhan(
    data: {
      sessionId: string;
      userId?: number;
    },
    config?: AxiosRequestConfig
  ) {
    return await this.apiClient.post<BaseResponseData<{ pageViewId: number }>>(
      "/auditlogs/meradhan/tracing/init",
      data,
      config
    );
  }

  async startPageTrackingMeradhan(
    data: z.infer<(typeof appSchema.auditlogsSchema)["PageViewSchema"]>,
    config?: AxiosRequestConfig
  ) {
    return await this.apiClient.post<BaseResponseData<{ pageViewId: number }>>(
      "/auditlogs/meradhan/page-tracking/start",
      data,
      config
    );
  }

  async endPageTrackingMeradhan(
    pageViewId: number,
    data: Partial<
      z.infer<(typeof appSchema.auditlogsSchema)["PageViewSchema"]>
    >,
    config?: AxiosRequestConfig
  ) {
    return await this.apiClient.post<BaseResponseData<{ pageViewId: number }>>(
      "/auditlogs/meradhan/page-tracking/end/" + pageViewId,
      data,
      config
    );
  }

  async updatePageTrackingMeradhan(
    pageViewId: number,
    data: Partial<
      z.infer<(typeof appSchema.auditlogsSchema)["PageViewSchema"]>
    >,
    config?: AxiosRequestConfig
  ) {
    return await this.apiClient.post<BaseResponseData<{ pageViewId: number }>>(
      "/auditlogs/meradhan/page-tracking/update/" + pageViewId,
      data,
      config
    );
  }

  async getLoginLogsMeradhan(
    params: {
      userId?: number;
      page?: number;
      pageSize?: number;
      startDate?: string | Date;
      endDate?: string | Date;
    },
    config?: AxiosRequestConfig
  ) {
    const query = this.toQuery(params);
    return await this.apiClient.get<T_LOGIN_LOGS_MERADHAN_RESPONSE>(
      `/auditlogs/meradhan/login-logs${query}` as string,
      config
    );
  }

  async getActivityLogsMeradhan(
    params: {
      userId?: number;
      page?: number;
      pageSize?: number;
      startDate?: string | Date;
      endDate?: string | Date;
    },
    config?: AxiosRequestConfig
  ) {
    const query = this.toQuery(params);
    return await this.apiClient.get<T_ACTIVITY_LOGS_MERADHAN_RESPONSE>(
      `/auditlogs/meradhan/activity-logs${query}` as string,
      config
    );
  }

  async getSessionLogsMeradhan(
    params: {
      userId?: number;
      sessionToken?: string;
      trackingToken?: string;
      page?: number;
      pageSize?: number;
      startDate?: string | Date;
      endDate?: string | Date;
    },
    config?: AxiosRequestConfig
  ) {
    const query = this.toQuery(params);
    return await this.apiClient.get<T_SESSION_LOGS_MERADHAN_RESPONSE>(
      `/auditlogs/meradhan/session-logs${query}` as string,
      config
    );
  }

  async createActivityLogMeradhan(
    data: {
      action: string;
      details: object;
      entityType: string;
      entityId?: number;
    },
    config?: AxiosRequestConfig
  ) {
    return await this.apiClient.post<
      BaseResponseData<{ activityLogId: number }>
    >("/auditlogs/meradhan/create/activity", data, config);
  }
}
