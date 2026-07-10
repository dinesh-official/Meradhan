import type z from "zod";
import type { IApiCaller } from "../../../connection/apiCaller.interface";
import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type { AuditLogDataResponse } from "./auditlogs.response";

export class AuditLogsApi {
    constructor(private apiClient: IApiCaller) { }

    async getAuditLogs(payload?: z.infer<typeof appSchema.crm.auditlogs.trackingListQuerySchema>, config?: AxiosRequestConfig) {
        return this.apiClient.get<AuditLogDataResponse>(`/crm/tracking/list`, { ...config, params: payload });
    }
    async revalidateAuditLogs(payload?: {
        trackId: string;
        token: string;
        userId: number;
    }, config?: AxiosRequestConfig) {
        return this.apiClient.post<AuditLogDataResponse>(`/crm/tracking/revalidate`, payload, { ...config });
    }

    async getGroupedAuditLogs(payload?: {
        page?: number;
        limit?: number;
        userId?: string;
        search?: string;
    }, config?: AxiosRequestConfig) {
        return this.apiClient.get<AuditLogDataResponse>(`/crm/tracking/group`, { ...config, params: payload });
    }

    async getAuthGroupedAuditLogs(payload?: {
        page?: number;
        limit?: number;
        userId?: string;
        search?: string;

    }, config?: AxiosRequestConfig) {
        return this.apiClient.get<AuditLogDataResponse>(`/crm/tracking/group/auth`, { ...config, params: payload });
    }

    async getUnknownGroupedAuditLogs(payload?: {
        page?: number;
        limit?: number;
        userId?: string;
        search?: string;
    }, config?: AxiosRequestConfig) {
        return this.apiClient.get<AuditLogDataResponse>(`/crm/tracking/group/unknown`, { ...config, params: payload });
    }



    async getWebAuditLogs(payload?: z.infer<typeof appSchema.crm.auditlogs.trackingListQuerySchema>, config?: AxiosRequestConfig) {
        return this.apiClient.get<AuditLogDataResponse>(`/web/tracking/list`, { ...config, params: payload });
    }

    async revalidateWebAuditLogs(payload?: {
        trackId: string;
        token: string;
        userId: number;
    }, config?: AxiosRequestConfig) {
        return this.apiClient.post<AuditLogDataResponse>(`/web/tracking/revalidate`, payload, { ...config });
    }

    async getGroupedWebAuditLogs(payload?: {
        page?: number;
        limit?: number;
        userId?: string;
        search?: string;
    }, config?: AxiosRequestConfig) {
        return this.apiClient.get<AuditLogDataResponse>(`/web/tracking/group`, { ...config, params: payload });
    }

    async getAuthWebGroupedAuditLogs(payload?: {
        page?: number;
        limit?: number;
        userId?: string;
        search?: string;

    }, config?: AxiosRequestConfig) {
        return this.apiClient.get<AuditLogDataResponse>(`/web/tracking/group/auth`, { ...config, params: payload });
    }

    async getUnknownWebGroupedAuditLogs(payload?: {
        page?: number;
        limit?: number;
        userId?: string;
        search?: string;
    }, config?: AxiosRequestConfig) {
        return this.apiClient.get<AuditLogDataResponse>(`/web/tracking/group/unknown`, { ...config, params: payload });
    }

}