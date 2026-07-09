"use client";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { BondOrderPricingData } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getMaxOrderQuantityFromBond } from "../_utils/quantity";
import type { BondDetailsResponse } from "@root/apiGateway";

export function useBondOrderPricing({
  isin,
  quantity,
  bond,
  initialPricing,
}: {
  isin: string;
  quantity: number;
  bond: BondDetailsResponse;
  initialPricing: BondOrderPricingData | null;
}) {
  const maxQuantity = useMemo(() => getMaxOrderQuantityFromBond(bond), [bond]);
  const safeQuantity = useMemo(() => {
    const q = Number.isFinite(quantity) && quantity >= 1 ? Math.floor(quantity) : 1;
    return Math.min(maxQuantity, Math.max(1, q));
  }, [quantity, maxQuantity]);

  return useQuery({
    queryKey: ["bond-order-pricing", isin, safeQuantity],
    queryFn: async () => {
      const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);
      const envelope = await bondsApi.getBondOrderPricing(isin, safeQuantity);
      return envelope.responseData ?? null;
    },
    initialData:
      initialPricing && safeQuantity === quantity
        ? initialPricing
        : undefined,
    enabled: maxQuantity >= 1,
    staleTime: 0,
    refetchOnMount: true,
  });
}
