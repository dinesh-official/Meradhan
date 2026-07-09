"use client";

import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import NewRfqForm, { SchemaType } from "./forms/NewRfqForm";
import { useCreateRfqHook } from "./forms/useCreateRfqHook";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

function NewRfqFormView() {
  const { newRfqMutation } = useCreateRfqHook();
  const searchParams = useSearchParams();

  const initData = useMemo<Partial<SchemaType> | undefined>(() => {
    const isin = searchParams.get("isin")?.trim();
    if (!isin) return undefined;

    const buySellParam = searchParams.get("buySell");
    const quantityParam = searchParams.get("quantity");
    const yieldParam = searchParams.get("yield");
    const valueParam = searchParams.get("value");

    const quantity = quantityParam ? Number(quantityParam) : undefined;
    const yieldValue = yieldParam ? Number(yieldParam) : undefined;
    const value = valueParam ? Number(valueParam) : undefined;

    return {
      isin,
      buySell:
        buySellParam === "S" || buySellParam === "X" || buySellParam === "B"
          ? buySellParam
          : "B",
      quantity:
        quantity != null && Number.isFinite(quantity) && quantity > 0
          ? quantity
          : undefined,
      yield:
        yieldValue != null && Number.isFinite(yieldValue) && yieldValue >= 0
          ? yieldValue
          : undefined,
      value:
        value != null && Number.isFinite(value) && value > 0
          ? value
          : undefined,
    };
  }, [searchParams]);

  const handleFormSubmit = (data: SchemaType) => {
    newRfqMutation.mutate(data);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title="Create New RFQ"
        description="Create a new Request for Quote record"
        showBack
      />

      <NewRfqForm
        onSubmit={handleFormSubmit}
        isLoading={newRfqMutation.isPending}
        initData={initData}
      />
    </div>
  );
}

export default NewRfqFormView;
