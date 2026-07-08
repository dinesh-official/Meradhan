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

export class CrmBondAutoUpdateApi {
  constructor(private apiClient: IApiCaller) {}

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
      config,
    );
    return response.data;
  }
}
