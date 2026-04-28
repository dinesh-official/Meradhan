"use client";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import type { AxiosError } from "axios";
import apiGateway, {
  type BondDealAutofillResponse,
  type BondDetailsResponse,
  type BondOrderPricingData,
} from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";

export type ProposalPayload = {
  isin: string;
  quantity: number;
  side: "BUY" | "SELL";
  settlementType: "T+0" | "T+1";
};

export type ProposalFetchResult = {
  bond: BondDetailsResponse;
  pricing: BondOrderPricingData | null;
  dealAutofill: BondDealAutofillResponse | null;
  pricingError: string | null;
};

export function useProposalFetcher() {
  const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);

  const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);
  const addUtcDays = (isoDate: string, days: number) => {
    const [y, m, d] = isoDate.split("-").map(Number);
    const dt = new Date(Date.UTC(y!, (m ?? 1) - 1, (d ?? 1) + days, 12, 0, 0));
    return toIsoDate(dt);
  };

  const extractApiMessage = (error: unknown) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    return (
      axiosError.response?.data?.message ||
      (error instanceof Error ? error.message : null) ||
      "Order pricing is unavailable for this bond."
    );
  };

  const fetchProposalMutation = useMutation({
    mutationFn: async ({
      isin,
      quantity,
      side,
      settlementType,
    }: ProposalPayload): Promise<ProposalFetchResult> => {
      const normalizedIsin = isin.trim().toUpperCase();
      const settlementDate =
        settlementType === "T+0"
          ? toIsoDate(new Date())
          : addUtcDays(toIsoDate(new Date()), 1);

      const [bondResponse, pricingResponse, dealAutofillResponse] = await Promise.all([
        bondsApi.getBondDetailsByIsin(normalizedIsin),
        bondsApi
          .getBondOrderPricing(normalizedIsin, quantity, {
            params: { settlementType },
          })
          .then((response) => ({ response, error: null }))
          .catch((error: unknown) => ({ response: null, error })),
        // Fetch calc/YTM pricing for both BUY & SELL so proposal has complete pricing fields.
        bondsApi.getBondDealAutofill(normalizedIsin, { quantity, settlementDate }),
      ]);

      const pricingError = pricingResponse.error
        ? extractApiMessage(pricingResponse.error)
        : null;

      return {
        bond: bondResponse.responseData,
        pricing: pricingResponse.response?.responseData ?? null,
        dealAutofill: dealAutofillResponse?.responseData ?? null,
        pricingError,
      };
    },
  });

  return { fetchProposalMutation };
}
