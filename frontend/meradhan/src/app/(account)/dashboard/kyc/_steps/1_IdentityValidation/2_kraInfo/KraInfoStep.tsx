"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { queryClient } from "@/core/config/service-clients";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway from "@root/apiGateway";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { toDdMmYyyy } from "../../../_utils/kraRequestFormat";
import { useKraInfoStep } from "./_hooks/useKraInfoStep";
import { KraInfoView } from "./KraInfoView";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { Spinner } from "@/components/ui/spinner";

export default function KraInfoStep() {
  const { state, setKraResponse, prevLocalStep } = useKycDataStorage();
  const { pushUserKycState } = useKycDataProvider();

  const kra = state.step_1.kraResponse;
  const { handleUseExisting, handleStartFresh, isPending } = useKraInfoStep();
  const [kraConfirmed, setKraConfirmed] = useState(true);
  const { cookies } = useAppCookie();

  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const panKycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller
  );

  const profileQuery = useQuery({
    queryKey: ["getProfileDataForKyc"],
    queryFn: async () => {
      const response = await customerApi.customerInfoById(Number(cookies.userId));
      return response.data.responseData;
    },
    enabled: Boolean(cookies.userId),
  });



  const refreshKraMutation = useMutation({
    mutationKey: ["kra-refresh-rematch", kra?.id],
    mutationFn: async () => {
      const pan = state.step_1.pan.panCardNo;
      const dob = toDdMmYyyy(state.step_1.pan.dateOfBirth);
      if (!pan || !dob) {
        throw new Error("PAN and date of birth are required to refresh KRA data.");
      }
      const res = await panKycApi.createKraVerifyRequest({ pan, dob });
      return res.responseData;
    },
    onSuccess: (data) => {
      if (data) {
        setKraResponse(data);
        setTimeout(() => {
          pushUserKycState();
        }, 1000);
      }
      queryClient.invalidateQueries({ queryKey: ["getProfileDataForKyc"] });
      toast.success("KRA data refreshed");
    },
    onError: (error: unknown) => {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || err?.message || "Could not refresh KRA data"
      );
    },
  });


  if (refreshKraMutation.isPending) {
    return (
      <Card accountMode>
        <CardContent accountMode className="py-8 flex justify-center items-center">
          <Spinner className="size-10" />
        </CardContent>
      </Card>
    );
  }


  if (!kra) {
    return (
      <Card accountMode>
        <CardContent accountMode className="py-8">
          <p className="text-muted-foreground text-center">
            No KRA data available. Please go back and try again.
          </p>
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button onClick={() => {
              prevLocalStep();
            }}>Retry Verification</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <KraInfoView
      kra={kra}
      confirmed={kraConfirmed}
      onConfirmedChange={setKraConfirmed}
      onUseExisting={handleUseExisting}
      onStartFresh={handleStartFresh}
      isPending={isPending}
      accountEmail={profileQuery.data?.emailAddress ?? null}
      accountMobile={profileQuery.data?.phoneNo ?? null}
      onRefreshKra={() => refreshKraMutation.mutate()}
      isRefreshKraPending={refreshKraMutation.isPending}
    />
  );
}
