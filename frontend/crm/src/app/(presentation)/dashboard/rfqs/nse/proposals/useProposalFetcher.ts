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
};

export type ProposalFetchResult = {
  bond: BondDetailsResponse;
  pricing: BondOrderPricingData | null;
  dealAutofill: BondDealAutofillResponse | null;
  pricingError: string | null;
};

export function useProposalFetcher() {
  const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);

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
    }: ProposalPayload): Promise<ProposalFetchResult> => {
      const normalizedIsin = isin.trim().toUpperCase();

      const [bondResponse, pricingResponse, dealAutofillResponse] = await Promise.all([
        bondsApi.getBondDetailsByIsin(normalizedIsin),
        bondsApi
          .getBondOrderPricing(normalizedIsin, quantity)
          .then((response) => ({ response, error: null }))
          .catch((error: unknown) => ({ response: null, error })),
        side === "SELL"
          ? bondsApi.getBondDealAutofill(normalizedIsin, { quantity })
          : Promise.resolve(null),
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
