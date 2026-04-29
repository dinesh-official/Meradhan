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
  const addUtcDays = (isoDate: string, days: number) => {
    const [y, m, d] = isoDate.split("-").map(Number);
    const dt = new Date(Date.UTC(y!, (m ?? 1) - 1, (d ?? 1) + days, 12, 0, 0));
    return toIstYmd(dt);
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
      pricingYield,
    }: ProposalPayload): Promise<ProposalFetchResult> => {
      const normalizedIsin = isin.trim().toUpperCase();
      const settlementDate =
        settlementType === "T+0"
          ? toIstYmd(new Date())
          : addUtcDays(toIstYmd(new Date()), 1);

      const [bondResponse, previewResponse, dealAutofillResponse] = await Promise.all([
        bondsApi.getBondDetailsByIsin(normalizedIsin),
        apiClientCaller
          .post("/customer/order/preview", { isin: normalizedIsin, quantity })
          .then((r) => ({ data: r.data as { responseData?: { pricing?: BondOrderPricingData | null } }, error: null as unknown }))
          .catch((error: unknown) => ({ data: null as null, error })),
        // Fetch calc/YTM pricing for both BUY & SELL so proposal has complete pricing fields.
        bondsApi.getBondDealAutofill(normalizedIsin, {
          quantity,
          settlementDate,
          pricingYield: pricingYield != null && Number.isFinite(pricingYield) ? pricingYield : undefined,
        }),
      ]);

      const pricingError = previewResponse.error
        ? extractApiMessage(previewResponse.error)
        : null;

      return {
        bond: bondResponse.responseData,
        pricing: previewResponse.data?.responseData?.pricing ?? null,
        dealAutofill: dealAutofillResponse?.responseData ?? null,
        pricingError,
      };
    },
  });

  return { fetchProposalMutation };
}
