"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import apiGateway, { BondDetailsResponse } from "@root/apiGateway";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AllowPurchaseCheckboxProps {
  bond: BondDetailsResponse;
}

export function AllowPurchaseCheckbox({ bond }: AllowPurchaseCheckboxProps) {
  const [allowForPurchase, setAllowForPurchase] = useState(
    bond.allowForPurchase ?? false
  );
  const queryClient = useQueryClient();
  const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);

  // keep local state in sync if parent data changes
  useEffect(() => {
    setAllowForPurchase(bond.allowForPurchase ?? false);
  }, [bond.allowForPurchase]);

  const updateAllowForPurchase = useMutation({
    mutationFn: async (newValue: boolean) => {
      // fetch latest bond to avoid missing fields
      const current = await bondsApi.getBondDetailsByIsin(bond.isin);
      return bondsApi.updateBond(bond.isin, {
        ...current.responseData,
        allowForPurchase: newValue,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    },
    onSuccess: (_, newValue) => {
      setAllowForPurchase(newValue);
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
      queryClient.invalidateQueries({ queryKey: ["bond", bond.isin] });
      toast.success(`Updated allow for purchase for ${bond.isin}`);
    },
    onError: (error: AxiosError) => {
      toast.error(
        (error?.response?.data as { message?: string })?.message ||
        error?.message ||
        "Failed to update"
      );
      setAllowForPurchase(bond.allowForPurchase ?? false);
    },
  });

  const handleAllowForPurchaseChange = (checked: boolean) => {
    setAllowForPurchase(checked); // optimistic
    updateAllowForPurchase.mutate(checked);
  };

  return (
    <AllowOnlyView permissions={["edit:bonds"]}>
      <Checkbox
        id={`allow-for-purchase-${bond.isin}`}
        checked={allowForPurchase}
        disabled={updateAllowForPurchase.isPending}
        onCheckedChange={handleAllowForPurchaseChange}
      />
    </AllowOnlyView>
  );
}

