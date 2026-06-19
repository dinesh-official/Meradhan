"use client";

import { useState } from "react";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import BondCashflowTable from "./BondCashflowTable";
import { BondCashflowTabShimmer } from "./BondDetailTabShimmers";
import { BondTabErrorState } from "./BondTabErrorState";

export default function BondCashflowTab({ isin }: { isin: string }) {
  const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);
  const [applyTds, setApplyTds] = useState(false);

  const query = useQuery({
    queryKey: ["bondCashflow", isin],
    queryFn: async () => {
      const res = await bondsApi.getBondCashflow(isin, { quantity: 1 });
      return res.responseData ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (query.isLoading) {
    return <BondCashflowTabShimmer />;
  }

  if (query.isError || !query.data) {
    return (
      <BondTabErrorState
        title="Couldn't load cashflow schedule"
        description="We couldn't fetch the payment dates and amounts for this bond."
        error={query.error}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
      />
    );
  }

  const { cashflow, warnings } = query.data;

  if (cashflow.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        No cashflow rows returned for this bond.
      </div>
    );
  }

  return (
    <div className="space-y-4 py-6">
      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {warnings.join(" ")}
        </div>
      )}

      <BondCashflowTable
        rows={cashflow}
        applyTds={applyTds}
        tdsToggle={
          <div className="flex items-center gap-2">
            <Switch
              id="bond-cashflow-tds"
              checked={applyTds}
              onCheckedChange={setApplyTds}
              className="border border-slate-300 data-[state=checked]:border-secondary data-[state=checked]:bg-secondary data-[state=unchecked]:bg-slate-300 [&_[data-slot=switch-thumb]]:bg-white"
            />
            <Label
              htmlFor="bond-cashflow-tds"
              className="cursor-pointer text-sm font-medium text-slate-700"
            >
              10% TDS
            </Label>
          </div>
        }
      />
    </div>
  );
}
