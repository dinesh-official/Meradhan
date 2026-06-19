import type z from "zod";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type { appSchema } from "@root/schema";
import type { AxiosRequestConfig } from "axios";
import type { BaseResponseData } from "../../../types/base";
import type {
  BondDealAutofillResponse,
  BondDetailResponse,
  BondDocumentItem,
  BondDocumentMutationResponse,
  BondDocumentsListResponse,
  BondFilterOptionsResponse,
  BondLogoResponse,
  BondOrderPricingResponse,
  BondCashflowResponse,
  LatestBondsResponse,
  HomepageBondsResponse,
  ListedBondsResponse,
} from "./bonds.response";

export class BondsApi {
  constructor(private apiClient: IApiCaller) { }

  public async getListedBonds(
    payload: {
      filters?: z.infer<typeof appSchema.bonds.bondsFilterSchema>;
      params: {
        page?: number | string;
        limit?: number | string;
        category?: string;
        all?: string;
      };
    },
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.post<ListedBondsResponse>(
      "/bonds/listed/filter",
      payload.filters,
      { ...config, params: payload.params }
    );
    return response.data;
  }

  // [Ticket: Maturity and Credit Rating dropdown filters should display only bonds we hold]
  // Fetches only the filter option buckets that have actual active bonds in the DB.
  public async getBondFilterOptions(
    params?: { category?: string },
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.get<BondFilterOptionsResponse>(
      "/bonds/filter-options",
      { ...config, params }
    );
    return response.data;
  }

  public async getBondDetailsByIsin(isin: string, config?: AxiosRequestConfig) {
    const response = await this.apiClient.get<BondDetailResponse>(
      `/bonds/${isin}`,
      config
    );
    return response.data;
  }

  public async getBondCashflow(
    isin: string,
    params?: {
      quantity?: number;
      settlementDate?: string;
      pricingYield?: number;
    },
    config?: AxiosRequestConfig,
  ) {
    const response = await this.apiClient.get<BondCashflowResponse>(
      `/bonds/${isin}/cashflow`,
      {
        ...config,
        params: {
          ...(config?.params ?? {}),
          quantity: params?.quantity,
          settlementDate: params?.settlementDate,
          pricingYield: params?.pricingYield,
        },
      },
    );
    return response.data;
  }

  public async getBondOrderPricing(
    isin: string,
    quantity: number,
    config?: AxiosRequestConfig,
  ) {
    const response = await this.apiClient.get<BondOrderPricingResponse>(
      `/bonds/${isin}/order-pricing`,
      { ...config, params: { ...(config?.params ?? {}), quantity } },

    );
    return response.data;
  }

  /**
   * CRM: auto-fill bond update form fields + sale price from DB, margin rules, and calc.meradhan.co.
   * When `pricingYield` is set, uses POST with a JSON body (no query-string `pricingYield` param).
   */
  public async getBondDealAutofill(
    isin: string,
    params?: {
      quantity?: number;
      settlementDate?: string;
      pricingYield?: number;
    },
    config?: AxiosRequestConfig,
  ) {
    const safeIsin = encodeURIComponent(isin);
    const quantity = params?.quantity ?? 1;
    const settlementDate = params?.settlementDate;
    const pricingYield = params?.pricingYield;

    if (pricingYield != null && Number.isFinite(pricingYield)) {
      const response = await this.apiClient.post<
        BaseResponseData<BondDealAutofillResponse>
      >(
        `/bonds/${safeIsin}/deal-autofill`,
        {
          quantity,
          ...(settlementDate != null && settlementDate !== ""
            ? { settlementDate }
            : {}),
          pricingYield,
        },
        config,
      );
      return response.data;
    }

    const response = await this.apiClient.get<BaseResponseData<BondDealAutofillResponse>>(
      `/bonds/${safeIsin}/deal-autofill`,
      {
        ...config,
        params: {
          quantity,
          ...(settlementDate != null && settlementDate !== ""
            ? { settlementDate }
            : {}),
        },
      },
    );
    return response.data;
  }

  /**
   * CRM bond auto-update: calc-based autofill (new API).
   * Same response type as `getBondDealAutofill`, but backed by `/deal-autofill-calc`.
   */
  public async getBondDealAutofillCalc(
    isin: string,
    params?: {
      quantity?: number;
      pricingYield?: number;
    },
    config?: AxiosRequestConfig,
  ) {
    const safeIsin = encodeURIComponent(isin);
    const quantity = params?.quantity ?? 1;
    const pricingYield = params?.pricingYield;

    if (pricingYield != null && Number.isFinite(pricingYield)) {
      const response = await this.apiClient.post<
        BaseResponseData<BondDealAutofillResponse>
      >(
        `/bonds/${safeIsin}/deal-autofill-calc`,
        {
          quantity,
          pricingYield,
        },
        config,
      );
      return response.data;
    }

    const response = await this.apiClient.get<BaseResponseData<BondDealAutofillResponse>>(
      `/bonds/${safeIsin}/deal-autofill-calc`,
      {
        ...config,
        params: { quantity },
      },
    );
    return response.data;
  }

  public async getHomepageBonds(
    limit: number = 40,
    config?: AxiosRequestConfig,
  ) {
    const response = await this.apiClient.get<HomepageBondsResponse>(
      `/bonds/homepage`,
      { ...config, params: { limit } },
    );
    return response.data;
  }

  public async getLatestBonds(count: number = 3, config?: AxiosRequestConfig) {
    const response = await this.apiClient.get<LatestBondsResponse>(
      `/bonds/latest`,
      { ...config, params: { limit: count } }
    );
    return response.data;
  }

  public async getUpcomingBonds(
    limit: number = 6,
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.get<LatestBondsResponse>(
      `/bonds/upcoming`,
      { ...config, params: { limit } }
    );
    return response.data;
  }

  public async getHighYieldBonds(
    count: number = 3,
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.get<LatestBondsResponse>(
      `/bonds/high-yield`,
      { ...config, params: { limit: count } }
    );
    return response.data;
  }

  public async getZeroCouponBonds(
    count: number = 3,
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.get<LatestBondsResponse>(
      `/bonds/zero-coupon`,
      { ...config, params: { limit: count } }
    );
    return response.data;
  }

  public async createBond(
    payload: z.infer<typeof appSchema.bonds.bondCreateUpdateSchema>,
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.post<BondDetailResponse>(
      `/bonds`,
      payload,
      config
    );
    return response.data;
  }

  public async updateBond(
    isin: string,
    payload: z.infer<typeof appSchema.bonds.bondCreateUpdateSchema>,
    options?: {
      /**
       * When true, the backend will stamp `autofillSavedAt` with the current
       * server time. Only pass this from the Auto-Update "Accept & Save" path.
       */
      autofillSave?: boolean;
    },
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.put<BondDetailResponse>(
      `/bonds/${isin}`,
      // Inject the meta-flag alongside the bond payload.
      // The backend reads it from raw body before Zod strips unknown keys.
      { ...payload, ...(options?.autofillSave ? { _autofillSave: true } : {}) },
      config
    );
    return response.data;
  }

  public async getOngoingDeals(config?: AxiosRequestConfig) {
    const response = await this.apiClient.get<LatestBondsResponse>(
      `/bonds/ongoing-deals`,
      config
    );
    return response.data;
  }

  /** Records bond order request (lead) and triggers acknowledgement email. */
  public async placeOrder(
    payload: z.infer<typeof appSchema.bonds.orderPlaceSchema>,
    config?: AxiosRequestConfig
  ) {
    const response = await this.apiClient.post<
      BaseResponseData<unknown>
    >(`/bonds/place-order`, payload, config);
    return response.data;
  }

  public async listBondDocumentsByIsin(
    isin: string,
    config?: AxiosRequestConfig,
  ) {
    const response = await this.apiClient.get<BondDocumentsListResponse>(
      `/bonds/${encodeURIComponent(isin)}/documents`,
      config,
    );
    return response.data;
  }

  public async listBondDocuments(isin: string, config?: AxiosRequestConfig) {
    const response = await this.apiClient.get<BondDocumentsListResponse>(
      `/crm/bonds/${encodeURIComponent(isin)}/documents`,
      config,
    );
    return response.data;
  }

  public async createBondDocument(
    isin: string,
    payload: { name: string; fileUrl: string; fileName?: string | null },
    config?: AxiosRequestConfig,
  ) {
    const response = await this.apiClient.post<BondDocumentMutationResponse>(
      `/crm/bonds/${encodeURIComponent(isin)}/documents`,
      payload,
      config,
    );
    return response.data;
  }

  public async updateBondDocument(
    isin: string,
    documentId: number,
    payload: { name?: string; fileUrl?: string; fileName?: string | null },
    config?: AxiosRequestConfig,
  ) {
    const response = await this.apiClient.patch<BondDocumentMutationResponse>(
      `/crm/bonds/${encodeURIComponent(isin)}/documents/${documentId}`,
      payload,
      config,
    );
    return response.data;
  }

  public async deleteBondDocument(
    isin: string,
    documentId: number,
    config?: AxiosRequestConfig,
  ) {
    const response = await this.apiClient.delete<BaseResponseData<{ success: boolean }>>(
      `/crm/bonds/${encodeURIComponent(isin)}/documents/${documentId}`,
      config,
    );
    return response.data;
  }

  public async getBondLogo(isin: string, config?: AxiosRequestConfig) {
    const response = await this.apiClient.get<BondLogoResponse>(
      `/crm/bonds/${encodeURIComponent(isin)}/logo`,
      config,
    );
    return response.data;
  }

  public async updateBondLogo(
    isin: string,
    logoUrl: string,
    config?: AxiosRequestConfig,
  ) {
    const response = await this.apiClient.put<BondLogoResponse>(
      `/crm/bonds/${encodeURIComponent(isin)}/logo`,
      { logoUrl },
      config,
    );
    return response.data;
  }

  public async deleteBondLogo(isin: string, config?: AxiosRequestConfig) {
    const response = await this.apiClient.delete<BondLogoResponse>(
      `/crm/bonds/${encodeURIComponent(isin)}/logo`,
      config,
    );
    return response.data;
  }

  /** TEMPORARY — logo.dev import; remove with backend `_temp/logo_dev_fetch.ts`. */
  public async importBondLogoFromLogoDev(
    isin: string,
    bondName: string,
    config?: AxiosRequestConfig,
  ) {
    const response = await this.apiClient.post<BondLogoResponse>(
      `/crm/bonds/${encodeURIComponent(isin)}/logo/import-logo-dev`,
      { bondName },
      config,
    );
    return response.data;
  }
}
