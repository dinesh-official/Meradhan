import {
  appSchema,
  CBRICS_UNREG_WORKFLOW_STATUS_OPTIONS,
  type CbricsUnregAllQuery,
  type CbricsUnregisteredWorkflowStatus,
} from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { BaseResponseData } from "../../../../../types/base";
import type { IApiCaller } from "../../../../connection/apiCaller.interface";
import { type ParticipantData } from "./participants.response";

type CbricsWorkflowCatalogRow =
  (typeof CBRICS_UNREG_WORKFLOW_STATUS_OPTIONS)[number];

export class RfqParticipantsApi {
  constructor(private apiClient: IApiCaller) {}

  async getCbricsWorkflowStatuses(config?: AxiosRequestConfig) {
    const data = await this.apiClient.get<
      BaseResponseData<CbricsWorkflowCatalogRow[]>
    >("/crm/rfq/nse/cbrics/workflow-statuses", config);
    return data;
  }

  async getCbricsParticipantsByWorkflow(
    workflowStatus: CbricsUnregisteredWorkflowStatus,
    payload?: CbricsUnregAllQuery,
    config?: AxiosRequestConfig
  ) {
    const path = `/crm/rfq/nse/cbrics/participants/workflow/${workflowStatus}`;
    const data = await this.apiClient.get<
      BaseResponseData<{
        workflowStatus: number;
        workflowLabel: string;
        participants: ParticipantData[];
      }>
    >(path, { ...config, params: payload });
    return data;
  }

  async getAllParticipants(
    payload: z.infer<
      typeof appSchema.crm.rfq.nse.getParticipants.GetParticipantsZ
    >,
    config?: AxiosRequestConfig
  ) {
    const data = await this.apiClient.get<BaseResponseData<ParticipantData[]>>(
      "/crm/rfq/nse/cbrics/participants",
      {
        ...config,
        params: payload,
      }
    );
    return data;
  }

  async getAllRfqParticipants(config?: AxiosRequestConfig) {
    const data = await this.apiClient.get<
      BaseResponseData<{ code: string; name: string }[]>
    >("/crm/rfq/nse/rfq/participants", {
      ...config,
    });
    return data;
  }
}
