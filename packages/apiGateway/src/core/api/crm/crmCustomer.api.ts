import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import type z from "zod";
import type {
  CreateCustomerResponse,
  CustomerProfile,
  DeleteCustomerResponse,
  GetCorporateKycResponse,
  GetCustomerResponse,
  GetCustomerResponseById,
  SaveCorporateKycResponse,
  UpdateCustomerResponse,
} from "../../../types/response.types";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import { ApiError } from "../../connection/error";
import type { BaseResponseData } from "../../../types/base";

export type CorporateKraPastExecution =
  | "MODIFY"
  | "REGISTER"
  | "NONE"
  | "CBRICS_ONLY";

export type TriggerCorporateKraPayload = {
  pastExecution: CorporateKraPastExecution;
  delayMs?: number;
};

export type CorporateKraValidationIssue = {
  field: string;
  message: string;
  severity: "ERROR" | "WARN";
  xmlTag?: string;
};

export type CorporateKraFieldMapRow = {
  group: string;
  label: string;
  source: string;
  sourceValue: string | null;
  xmlTag: string;
  mappedValue: string;
};

export type CorporateKraCodeEntry = {
  code: string;
  label: string;
  aliases?: string[];
};

export type CorporateKraCodeReference = {
  iopFlag: CorporateKraCodeEntry[];
  addlUpdateFlag: CorporateKraCodeEntry[];
  entityType: CorporateKraCodeEntry[];
  yesNo: CorporateKraCodeEntry[];
  docProof: CorporateKraCodeEntry[];
  dumpType: CorporateKraCodeEntry[];
  kycStatus: CorporateKraCodeEntry[];
  companyStatus: CorporateKraCodeEntry[];
  annualIncome: CorporateKraCodeEntry[];
  occupation: CorporateKraCodeEntry[];
  politicalConnection: CorporateKraCodeEntry[];
  relationship: CorporateKraCodeEntry[];
  addressProof: CorporateKraCodeEntry[];
  idProof: CorporateKraCodeEntry[];
  tinType: CorporateKraCodeEntry[];
  tinExemptReason: CorporateKraCodeEntry[];
  fatcaOtherServices: CorporateKraCodeEntry[];
};

export type CorporateKraDecodedTag = {
  /** Dot/bracket path on `responseData` where the code was found. */
  field: string;
  code: string;
  label?: string;
};

/**
 * Headline fields decoded from the latest NDML Non-Individual download.
 * Stable schema — driven by `summariseCorporateKraDownload` on the backend.
 */
export type CorporateKraDownloadSummary = {
  pan: string | null;
  entityName: string | null;
  status: { code: string | null; label?: string };
  errorDesc: { code: string | null; label?: string };
  downloadDate: string | null;
  kraInfo: string | null;
  fatcaApplicable: string | null;
  registeredAddress: string | null;
  correspondenceAddress: string | null;
  doi: string | null;
  commencement: string | null;
  compStatus: string | null;
  registrationNo: string | null;
  ipvFlag: string | null;
  ipvDate: string | null;
  additionalRecords: number;
  fatcaRecords: number;
};

/**
 * The last successful "manual" KRA download for a corporate customer.
 *
 * `request` is the exact JSON we sent to NDML, `response` is the full parsed
 * NDML response (large), and `summary` is the picked-out highlights used by
 * the CRM card.
 */
export type CorporateKraLastDownload = {
  logId: number;
  kycId: number;
  storedAt: string;
  summary: CorporateKraDownloadSummary;
  request: unknown;
  response: unknown;
};

export type CorporateKraDownloadResponse = {
  logId: number;
  storedAt: string;
  download: unknown;
  summary: CorporateKraDownloadSummary;
};

/**
 * Payload accepted by `autofillCorporateKra` — the operator-supplied
 * identifiers used to query NDML's Non-Individual KRA download.
 */
export type AutofillCorporateKraPayload = {
  pan: string;
  /** Date of Incorporation. Accepts ISO `YYYY-MM-DD` or `DD-MM-YYYY`. */
  dateOfIncorporation: string;
};

/**
 * Form-shape patch returned by the "Autofill from KRA" action. Every field
 * is optional — only keys NDML actually populated come through, so the CRM
 * form can merge without clobbering operator-typed values.
 */
export type CorporateKycAutofillFormPatch = {
  entityName?: string;
  panNumber?: string;
  cinOrRegistrationNumber?: string;
  dateOfIncorporation?: string;
  dateOfCommencementOfBusiness?: string;
  placeOfIncorporation?: string;
  countryOfIncorporation?: string;
  entityConstitutionType?:
    | "PRIVATE_LIMITED"
    | "PUBLIC_LIMITED"
    | "OPC"
    | "LLP"
    | "PARTNERSHIP"
    | "TRUST"
    | "OTHER";
  annualIncome?: string;

  correspondenceLine1?: string;
  correspondenceLine2?: string;
  correspondenceLine3?: string;
  correspondenceCity?: string;
  correspondencePinCode?: string;
  correspondenceState?: string;
  correspondenceAddressProofType?: string;

  registeredLine1?: string;
  registeredLine2?: string;
  registeredLine3?: string;
  registeredCity?: string;
  registeredPinCode?: string;
  registeredState?: string;
  registeredAddressProofType?: string;

  fatcaApplicable?: boolean;

  directors?: Array<{
    fullName: string;
    pan: string;
    din?: string;
    designation?: string;
  }>;
  authorisedSignatories?: Array<{
    fullName: string;
    pan: string;
    din?: string;
    designation?: string;
  }>;
};

export type CorporateKraAutofillResponse = {
  /** `null` when the corporate KYC row doesn't exist yet (first-time fill). */
  logId: number | null;
  storedAt: string;
  summary: CorporateKraDownloadSummary;
  formPatch: CorporateKycAutofillFormPatch;
};

export type CorporateKraPreviewResponse =
  | {
      hasCorporateKyc: false;
      isRunning: false;
      kycDataStoreId: null;
    }
  | {
      hasCorporateKyc: true;
      kycDataStoreId: number;
      isRunning: boolean;
      runnerStartedAt: string | null;
      kraStatus: {
        kraStatus: string | null;
        kycStatus: string | null;
        verifyDate: string | null;
      } | null;
      validation: {
        errors: CorporateKraValidationIssue[];
        warnings: CorporateKraValidationIssue[];
        canTrigger: boolean;
      };
      mapping: {
        fields: CorporateKraFieldMapRow[];
        notes: Array<{ xmlTag: string; note: string }>;
      };
      payload: Record<string, unknown>;
      xml: {
        /** `<APP_REQ_ROOT>` payload (the actual KRA document). */
        inner: string;
        /** Full SOAP envelope for the `registration` action (credentials masked). */
        soapRegister: string;
        /** Full SOAP envelope for the `processModification` action (credentials masked). */
        soapModify: string;
        credentialsMasked: boolean;
        soapAction: {
          register: string;
          modify: string;
        };
      };
      codeReference: CorporateKraCodeReference;
      /**
       * Latest persisted NDML download for this customer (manual or worker
       * trigger). `null` until at least one `Download from KRA` call has been
       * made.
       */
      lastDownload: CorporateKraLastDownload | null;
      recentLogs: Array<{
        id: number;
        stage: string;
        kycId: number;
        reqTime: string | null;
        requestData: unknown;
        responseData: unknown;
        decoded?: CorporateKraDecodedTag[];
      }>;
    };

export interface TCrmCustomerInterface {
  createCustomer(
    data: z.infer<(typeof appSchema.customer)["createNewCustomerSchema"]>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<CreateCustomerResponse>>;

  customerInfoById(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<GetCustomerResponseById>>;

  deleteCustomerById(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<DeleteCustomerResponse>>;

  getCustomer(
    query?: z.infer<(typeof appSchema.customer)["findManyCustomerSchema"]>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<GetCustomerResponse>>;

  updateCustomer(
    data: z.infer<(typeof appSchema.customer)["updateCustomerProfileSchema"]>,
    customerId: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<UpdateCustomerResponse>>;

  getCorporateKyc(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<GetCorporateKycResponse>>;

  /** Binary PDF — use `responseType: "blob"` internally. */
  getCorporateKycPdf(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<Blob>;

  saveCorporateKyc(
    customerId: number,
    data: z.infer<(typeof appSchema.customer)["createCorporateKycSchema"]>,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<SaveCorporateKycResponse>>;

  corporateKraStatus(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{ isRunning: boolean; kycDataStoreId: number | null }>>>;

  /**
   * Returns the exact NDML Non-Individual KRA payload that the worker would
   * send for this customer, plus a validation report and a row-by-row source
   * → XML mapping. No SOAP call is made — pure preview.
   */
  corporateKraPreview(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<CorporateKraPreviewResponse>>>;

  triggerCorporateKra(
    customerId: number,
    payload: TriggerCorporateKraPayload,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{ isTriggered: boolean }>>>;

  /**
   * Performs a one-shot NDML Non-Individual KRA download for this customer
   * and persists the response as a `kraDataLogs` row. Does not enqueue any
   * worker job. Returns the parsed download + a UI-friendly summary.
   */
  downloadCorporateKra(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<CorporateKraDownloadResponse>>>;

  /**
   * CRM "Autofill from KRA" — runs a Non-Individual download against the
   * operator-supplied PAN + DOI and returns a form-shape patch (entity name,
   * addresses, directors, etc.) for the corporate-KYC form to merge in.
   */
  autofillCorporateKra(
    customerId: number,
    payload: AutofillCorporateKraPayload,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<CorporateKraAutofillResponse>>>;

  /**
   * CRM action: forcibly finish a running corporate KRA process so the
   * Trigger KRA button becomes enabled again. Drains pending Bull jobs,
   * clears Redis runner/retry keys, sets `kraStatus = MANUAL_FINISHED`
   * (unless already VERIFIED), and writes a `MANUAL_FINISHED_BY_CRM` log.
   */
  finishCorporateKra(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{ isFinished: boolean; removedJobIds: Array<string | number> }>>>;

  listCorporateKycAttachments(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<Array<{
    id: number;
    corporateKycModelId: number;
    label: string;
    fileUrl: string;
    createdByCrmUserId?: number | null;
    createdAt: string;
    updatedAt: string;
  }>>>>;

  createCorporateKycAttachment(
    customerId: number,
    data: { label: string; fileUrl: string },
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{
    id: number;
    corporateKycModelId: number;
    label: string;
    fileUrl: string;
    createdByCrmUserId?: number | null;
    createdAt: string;
    updatedAt: string;
  }>>>;

  deleteCorporateKycAttachment(
    customerId: number,
    attachmentId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{ isDeleted: boolean }>>>;

  /** SUPER_ADMIN — same backend flow as customer profile default bank. */
  setPrimaryBankAccountAsCrm(
    customerId: number,
    bankAccountId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{ success: boolean }>>>;

  /** SUPER_ADMIN — same backend flow as customer profile default demat. */
  setPrimaryDematAccountAsCrm(
    customerId: number,
    dematAccountId: number,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<BaseResponseData<{ success: boolean }>>>;
}

export class CrmCustomerApi implements TCrmCustomerInterface {
  constructor(private apiClient: IApiCaller) { }

  async createCustomer(
    data: z.infer<(typeof appSchema.customer)["createNewCustomerSchema"]>,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["createCustomer"]> {
    return this.apiClient.post<CreateCustomerResponse>(
      "/crm/customer",
      data,
      config,
    );
  }

  async customerInfoById(
    customerId: number | string,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["customerInfoById"]> {
    return this.apiClient.get<GetCustomerResponseById>(
      `/crm/customer/${customerId}`,
      config,
    );
  }

  async deleteCustomerById(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["deleteCustomerById"]> {
    return this.apiClient.delete<DeleteCustomerResponse>(
      `/crm/customer/${customerId}`,
      config,
    );
  }

  async getCustomer(
    query?: z.infer<(typeof appSchema.customer)["findManyCustomerSchema"]>,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["getCustomer"]> {
    const mergedConfig: AxiosRequestConfig = {
      ...config,
      params: { ...(config?.params ?? {}), ...(query ?? {}) },
    };
    return this.apiClient.get<GetCustomerResponse>(
      `/crm/customers`,
      mergedConfig,
    );
  }

  async getCustomerByParticipantCode(
    participantCode: string,
    config?: AxiosRequestConfig,
  ) {
    return this.apiClient.get<BaseResponseData<CustomerProfile>>(
      `/crm/customer/participant/${participantCode}`,
      config,
    );
  }

  async updateCustomer(
    data: z.infer<(typeof appSchema.customer)["updateCustomerProfileSchema"]>,
    customerId: string,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["updateCustomer"]> {
    return this.apiClient.patch<UpdateCustomerResponse>(
      `/crm/customer/${customerId}`,
      data,
      config,
    );
  }

  async getCorporateKyc(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["getCorporateKyc"]> {
    return this.apiClient.get<GetCorporateKycResponse>(
      `/crm/customer/${customerId}/corporate-kyc`,
      config,
    );
  }

  async getCorporateKycPdf(
    customerId: number,
    config?: AxiosRequestConfig,
  ): Promise<Blob> {
    try {
      const response = await this.apiClient.get<Blob>(
        `/crm/customer/${customerId}/corporate-kyc/pdf`,
        { ...config, responseType: "blob" },
      );
      return response.data;
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.response?.data instanceof Blob &&
        err.response.data.type?.includes("json")
      ) {
        try {
          const text = await err.response.data.text();
          const j = JSON.parse(text) as { message?: string };
          throw new Error(j.message ?? "Failed to download corporate KYC PDF");
        } catch (e) {
          if (e instanceof SyntaxError) {
            /* ignore — fall through to rethrow Axios error */
          } else {
            throw e;
          }
        }
      }
      throw err instanceof Error ? err : new Error("Failed to download corporate KYC PDF");
    }
  }

  async saveCorporateKyc(
    customerId: number,
    data: z.infer<(typeof appSchema.customer)["createCorporateKycSchema"]>,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["saveCorporateKyc"]> {
    return this.apiClient.put<SaveCorporateKycResponse>(
      `/crm/customer/${customerId}/corporate-kyc`,
      data,
      config,
    );
  }

  async corporateKraStatus(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["corporateKraStatus"]> {
    return this.apiClient.get<BaseResponseData<{ isRunning: boolean; kycDataStoreId: number | null }>>(
      `/crm/customer/${customerId}/corporate-kyc/kra/status`,
      config,
    );
  }

  async corporateKraPreview(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["corporateKraPreview"]> {
    return this.apiClient.get<BaseResponseData<CorporateKraPreviewResponse>>(
      `/crm/customer/${customerId}/corporate-kyc/kra/preview`,
      config,
    );
  }

  async triggerCorporateKra(
    customerId: number,
    payload: TriggerCorporateKraPayload,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["triggerCorporateKra"]> {
    return this.apiClient.post<BaseResponseData<{ isTriggered: boolean }>>(
      `/crm/customer/${customerId}/corporate-kyc/kra/trigger`,
      payload,
      config,
    );
  }

  async downloadCorporateKra(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["downloadCorporateKra"]> {
    return this.apiClient.post<BaseResponseData<CorporateKraDownloadResponse>>(
      `/crm/customer/${customerId}/corporate-kyc/kra/download`,
      {},
      config,
    );
  }

  async autofillCorporateKra(
    customerId: number,
    payload: AutofillCorporateKraPayload,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["autofillCorporateKra"]> {
    return this.apiClient.post<BaseResponseData<CorporateKraAutofillResponse>>(
      `/crm/customer/${customerId}/corporate-kyc/kra/autofill`,
      payload,
      config,
    );
  }

  async finishCorporateKra(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["finishCorporateKra"]> {
    return this.apiClient.post<
      BaseResponseData<{ isFinished: boolean; removedJobIds: Array<string | number> }>
    >(
      `/crm/customer/${customerId}/corporate-kyc/kra/finish`,
      {},
      config,
    );
  }

  async listCorporateKycAttachments(
    customerId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["listCorporateKycAttachments"]> {
    return this.apiClient.get<
      BaseResponseData<
        Array<{
          id: number;
          corporateKycModelId: number;
          label: string;
          fileUrl: string;
          createdByCrmUserId?: number | null;
          createdAt: string;
          updatedAt: string;
        }>
      >
    >(`/crm/customer/${customerId}/corporate-kyc/attachments`, config);
  }

  async createCorporateKycAttachment(
    customerId: number,
    data: { label: string; fileUrl: string },
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["createCorporateKycAttachment"]> {
    return this.apiClient.post<
      BaseResponseData<{
        id: number;
        corporateKycModelId: number;
        label: string;
        fileUrl: string;
        createdByCrmUserId?: number | null;
        createdAt: string;
        updatedAt: string;
      }>
    >(`/crm/customer/${customerId}/corporate-kyc/attachments`, data, config);
  }

  async deleteCorporateKycAttachment(
    customerId: number,
    attachmentId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["deleteCorporateKycAttachment"]> {
    return this.apiClient.delete<BaseResponseData<{ isDeleted: boolean }>>(
      `/crm/customer/${customerId}/corporate-kyc/attachments/${attachmentId}`,
      config,
    );
  }

  async setPrimaryBankAccountAsCrm(
    customerId: number,
    bankAccountId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["setPrimaryBankAccountAsCrm"]> {
    return this.apiClient.post<BaseResponseData<{ success: boolean }>>(
      `/crm/customer/${customerId}/bank-account/primary/${bankAccountId}`,
      {},
      config,
    );
  }

  async setPrimaryDematAccountAsCrm(
    customerId: number,
    dematAccountId: number,
    config?: AxiosRequestConfig,
  ): ReturnType<TCrmCustomerInterface["setPrimaryDematAccountAsCrm"]> {
    return this.apiClient.post<BaseResponseData<{ success: boolean }>>(
      `/crm/customer/${customerId}/demat-account/primary/${dematAccountId}`,
      {},
      config,
    );
  }
}
