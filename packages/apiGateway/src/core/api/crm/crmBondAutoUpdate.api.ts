import type { AxiosRequestConfig } from "axios";
import type { IApiCaller } from "../../connection/apiCaller.interface";
import type {
  BondDealAutofillApiResponse,
} from "../bonds/bonds.response";

export type BondAutoUpdateAutofillParams = {
  quantity?: number;
  settlementDate?: string;
  pricingYield?: number;
  cleanPrice?: number;
  pricingMode?: "ytm" | "cleanPrice";
};

/** DeriData issue-detail + calculator can exceed the default 30s CRM proxy timeout. */
const BOND_AUTOFILL_TIMEOUT_MS = 120_000;

export class CrmBondAutoUpdateApi {
  constructor(private apiClient: IApiCaller) { }

  /**
   * CRM bond auto-update screen only: calc-based autofill via isolated CRM endpoint.
   */
  public async postBondAutoUpdateAutofill(
    isin: string,
    params?: BondAutoUpdateAutofillParams,
    config?: AxiosRequestConfig,
  ): Promise<BondDealAutofillApiResponse> {
    const safeIsin = encodeURIComponent(isin);
    const body = {
      quantity: params?.quantity ?? 1,
      ...(params?.pricingMode != null ? { pricingMode: params.pricingMode } : {}),
      ...(params?.settlementDate != null && params.settlementDate !== ""
        ? { settlementDate: params.settlementDate }
        : {}),
      ...(params?.pricingYield != null && Number.isFinite(params.pricingYield)
        ? { pricingYield: params.pricingYield }
        : {}),
      ...(params?.cleanPrice != null && Number.isFinite(params.cleanPrice)
        ? { cleanPrice: params.cleanPrice }
        : {}),
    };
    const response = await this.apiClient.post<BondDealAutofillApiResponse>(
      `/crm/bonds/${safeIsin}/auto-update-autofill`,
      body,
      { timeout: BOND_AUTOFILL_TIMEOUT_MS, ...config },
    );
    return response.data;
  }

  /**
   * Create-bond ISIN fetch: DeriData issue-detail only (no calculator / DB merge).
   */
  public async postBondDeriDataAutofill(
    isin: string,
    config?: AxiosRequestConfig,
  ): Promise<BondDealAutofillApiResponse> {
    const safeIsin = encodeURIComponent(isin);
    const response = await this.apiClient.post<BondDealAutofillApiResponse>(
      `/crm/bonds/${safeIsin}/deridata-autofill`,
      {},
      { timeout: BOND_AUTOFILL_TIMEOUT_MS, ...config },
    );
    return response.data;
  }
}
