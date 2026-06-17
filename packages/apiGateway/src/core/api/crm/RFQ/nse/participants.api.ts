import {
  appSchema,
  CBRICS_UNREG_WORKFLOW_STATUS_OPTIONS,
  type CbricsUnregAllQuery,
  type CbricsUnregisteredWorkflowStatus,
  type NseRfqParticipantInfoUpsertBody,
} from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type z from "zod";
import type { BaseResponseData } from "../../../../../types/base";
import type { IApiCaller } from "../../../../connection/apiCaller.interface";
import {
  type CbricsKraResyncResponseData,
  type ParticipantData,
} from "./participants.response";

/**
 * Shape returned by the CRM-private NSE-RFQ participant enrichment API.
 * Mirrors `NseRfqParticipantInfoRecord` on the backend; surfaced here so
 * the CRM can render the form without re-deriving the type.
 */
export interface NseRfqParticipantBankAccountData {
  id: number;
  bankName: string;
  bankIFSC: string;
  bankAccountNo: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NseRfqParticipantDpAccountData {
  id: number;
  dpType: "NSDL" | "CDSL";
  dpId: string | null;
  benId: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NseRfqParticipantInfoData {
  id: number;
  code: string;
  nameOverride: string | null;
  contactPerson: string | null;
  emailList: string[];
  mobileList: string[];
  telephone: string | null;
  address: string | null;
  address2: string | null;
  address3: string | null;
  stateCode: string | null;
  panNo: string | null;
  leiCode: string | null;
  custodian: string | null;
  dobDoi: string | null;
  notes: string | null;
  bankAccounts: NseRfqParticipantBankAccountData[];
  dematAccounts: NseRfqParticipantDpAccountData[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Lightweight per-participant summary used by the list view to render
 * extra columns (contact / PAN / banks / demats / notes) without
 * fetching each row's full payload.
 */
export interface NseRfqParticipantInfoSummary {
  code: string;
  nameOverride: string | null;
  contactPerson: string | null;
  emailList: string[];
  mobileList: string[];
  telephone: string | null;
  address: string | null;
  address2: string | null;
  address3: string | null;
  stateCode: string | null;
  panNo: string | null;
  leiCode: string | null;
  custodian: string | null;
  dobDoi: string | null;
  notes: string | null;
  bankAccountsCount: number;
  dematAccountsCount: number;
  updatedAt: string;
}

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

  async resyncKraFromCbricsParticipants(
    body: z.infer<
      typeof appSchema.crm.rfq.nse.getParticipants.ResyncKraFromCbricsParticipantsBodyZ
    >,
    config?: AxiosRequestConfig,
  ) {
    const data = await this.apiClient.post<
      BaseResponseData<CbricsKraResyncResponseData>,
      typeof body
    >("/crm/rfq/nse/cbrics/participants/resync-kra-status", body, config);
    return data;
  }

  /**
   * CRM-private participant enrichment. Returns the list of codes that
   * already have any saved info — used to render a "saved" badge in the
   * participants list.
   */
  async listSavedRfqParticipantInfoCodes(config?: AxiosRequestConfig) {
    const data = await this.apiClient.get<
      BaseResponseData<{ codes: string[] }>
    >("/crm/rfq/nse/rfq/participants/info/codes", config);
    return data;
  }

  /**
   * Returns a richer summary for every saved participant — scalar fields
   * plus bank / demat counts. Used by the NSE participants list view to
   * render contact / PAN / banks / demats / notes columns alongside the
   * upstream `{ code, name }` from NSE.
   */
  async listRfqParticipantInfoSummaries(config?: AxiosRequestConfig) {
    const data = await this.apiClient.get<
      BaseResponseData<{ summaries: NseRfqParticipantInfoSummary[] }>
    >("/crm/rfq/nse/rfq/participants/info/summary", config);
    return data;
  }

  /**
   * Returns the saved info for a single participant `code`, or `null` if
   * the operator hasn't entered anything yet.
   */
  async getRfqParticipantInfo(code: string, config?: AxiosRequestConfig) {
    const data = await this.apiClient.get<
      BaseResponseData<NseRfqParticipantInfoData | null>
    >(`/crm/rfq/nse/rfq/participants/${encodeURIComponent(code)}/info`, config);
    return data;
  }

  /**
   * Replaces the saved info for a single participant `code` wholesale.
   * The backend overwrites bank and demat lists; the form posts the
   * entire shape on every save.
   */
  async upsertRfqParticipantInfo(
    code: string,
    body: NseRfqParticipantInfoUpsertBody,
    config?: AxiosRequestConfig,
  ) {
    const data = await this.apiClient.put<
      BaseResponseData<NseRfqParticipantInfoData>,
      typeof body
    >(
      `/crm/rfq/nse/rfq/participants/${encodeURIComponent(code)}/info`,
      body,
      config,
    );
    return data;
  }
}
