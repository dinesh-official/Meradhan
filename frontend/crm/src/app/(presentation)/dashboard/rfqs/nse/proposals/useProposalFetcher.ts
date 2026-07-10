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
  pricingYield?: number | null;
};

export type ProposalFetchResult = {
  bond: BondDetailsResponse;
  pricing: BondOrderPricingData | null;
  dealAutofill: BondDealAutofillResponse | null;
  pricingError: string | null;
};

export function useProposalFetcher() {
  const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);

  const toIstYmd = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

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
      settlementType,
      pricingYield,
    }: ProposalPayload): Promise<ProposalFetchResult> => {
      const normalizedIsin = isin.trim().toUpperCase();
      const manualYield =
        pricingYield != null && Number.isFinite(pricingYield) ? pricingYield : undefined;

      const calcParams = {
        quantity,
        ...(settlementType === "T+0"
          ? { settlementDate: toIstYmd(new Date()) }
          : { automatedSettlement: true as const }),
        ...(manualYield != null ? { pricingYield: manualYield } : {}),
      };

      const [bondResponse, pricingResponse, dealAutofillResponse] = await Promise.all([
        bondsApi.getBondDetailsByIsin(normalizedIsin),
        bondsApi
          .getBondOrderPricing(normalizedIsin, quantity, {
            params: { settlementType },
          })
          .then((r) => ({ data: r.responseData ?? null, error: null as unknown }))
          .catch((error: unknown) => ({ data: null as null, error })),
        bondsApi.getBondDealAutofillCalc(normalizedIsin, calcParams),
      ]);

      const pricingError = pricingResponse.error
        ? extractApiMessage(pricingResponse.error)
        : null;

      return {
        bond: bondResponse.responseData,
        pricing: pricingResponse.data,
        dealAutofill: dealAutofillResponse?.responseData ?? null,
        pricingError,
      };
    },
  });

  return { fetchProposalMutation };
}
