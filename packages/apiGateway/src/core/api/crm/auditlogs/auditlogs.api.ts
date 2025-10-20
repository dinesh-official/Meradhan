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
}