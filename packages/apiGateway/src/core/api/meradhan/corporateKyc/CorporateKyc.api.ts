/**
 * Customer-facing corporate KYC API surface.
 *
 * Pairs with `backend/src/resource/customer/profile/corporateESign.service.ts`
 * — these are the calls the meradhan client makes when the customer signs a
 * CRM-uploaded corporate KYC PDF through Digio.
 *
 * The CRM-side surface (operator uploads PDF, picks signatory, marks
 * complete/rejected) stays in `crm/crmCustomer.api.ts` — see
 * `CorporateESignRequest` and friends there. We re-use that same row
 * shape here.
 */

import type { AxiosRequestConfig } from "axios";
import type { IApiCaller } from "../../../connection/apiCaller.interface";
import type { BaseResponseData } from "../../../../types/base";
import type { CorporateESignRequest } from "../../crm/crmCustomer.api";

/**
 * Single corporate risk-profile question, as served by the meradhan
 * `/risk-profile/questions` helper endpoint. Matches the
 * `CorporateRiskProfileQuestion` type the backend exports, but lives here
 * so the frontend doesn't have to reach into backend internals.
 */
export type CorporateRiskProfileQuestion = {
  qus: string;
  ans: string;
  index: number;
  opt: string[];
};

/**
 * Iframe handoff payload returned by `/digio-request`. The frontend feeds
 * these three fields into `window.Digio.submit(entityId, identifier, id)`.
 */
export type CorporateESignDigioRequestData = {
  accessToken: {
    entityId: string;
    id: string | null;
    validTill: string | null;
  };
  signingParties: Array<{
    name: string;
    status: string;
    type: string;
    signature_type: string;
    identifier: string;
    reason: string;
    expire_on: string;
  }>;
  documentId: string;
};

/** Verify-success payload returned after the customer signs. */
export type CorporateESignVerifyData = {
  status: "PENDING" | "COMPLETED" | "REJECTED";
  signFileUrl: string | null;
  submittedAt: string | Date | null;
};

export type ListCorporatePendingESignRequestsResponse = BaseResponseData<{
  requests: CorporateESignRequest[];
}>;

export type GetCorporateESignRequestResponse = BaseResponseData<{
  request: CorporateESignRequest;
}>;

export type CorporateESignDigioRequestResponse =
  BaseResponseData<CorporateESignDigioRequestData>;

export type CorporateESignVerifyResponse =
  BaseResponseData<CorporateESignVerifyData>;

export type GetCorporateRiskProfileQuestionsResponse = BaseResponseData<{
  questions: CorporateRiskProfileQuestion[];
}>;

export class CorporateKycApi {
  constructor(private apiClient: IApiCaller) {}

  /**
   * Lists PENDING corporate e-sign requests for the logged-in customer.
   * Used by the dashboard banner.
   */
  async listPendingESignRequests(config?: AxiosRequestConfig) {
    const { data } =
      await this.apiClient.get<ListCorporatePendingESignRequestsResponse>(
        `/auth/customer/corporate-kyc/e-sign-requests/pending`,
        config,
      );
    return data;
  }

  /**
   * Fetches one e-sign request by id. Ownership is enforced on the
   * backend — non-owners get a 404.
   */
  async getESignRequest(requestId: number, config?: AxiosRequestConfig) {
    const { data } =
      await this.apiClient.get<GetCorporateESignRequestResponse>(
        `/auth/customer/corporate-kyc/e-sign-requests/${requestId}`,
        config,
      );
    return data;
  }

  /**
   * Starts a Digio signing session for the request. Backend downloads
   * the operator-uploaded PDF, hands it to Digio, and returns the
   * iframe handoff payload (entity id + access-token id + signing
   * parties).
   */
  async digioRequestESign(requestId: number, config?: AxiosRequestConfig) {
    const { data } =
      await this.apiClient.post<CorporateESignDigioRequestResponse>(
        `/auth/customer/corporate-kyc/e-sign-requests/${requestId}/digio-request`,
        undefined,
        config,
      );
    return data;
  }

  /**
   * Verifies a Digio signing completion. Called from the Digio iframe
   * callback with the `digio_doc_id` it returns. The backend pulls the
   * signed PDF from Digio, uploads it to S3, and flips the row to
   * COMPLETED.
   */
  async digioVerifyESign(
    requestId: number,
    digio_doc_id: string,
    config?: AxiosRequestConfig,
  ) {
    const { data } = await this.apiClient.post<CorporateESignVerifyResponse>(
      `/auth/customer/corporate-kyc/e-sign-requests/${requestId}/digio-verify`,
      { digio_doc_id },
      config,
    );
    return data;
  }

  /**
   * Returns the corporate risk-profile question set verbatim. The
   * meradhan client uses this in Step 1 of the e-sign flow so the
   * question text stays in sync with the CRM-side constant. Submission
   * goes through the existing `/api/auth/customer/profile/risk-profile`
   * POST.
   */
  async getRiskProfileQuestions(config?: AxiosRequestConfig) {
    const { data } =
      await this.apiClient.get<GetCorporateRiskProfileQuestionsResponse>(
        `/auth/customer/corporate-kyc/risk-profile/questions`,
        config,
      );
    return data;
  }
}
