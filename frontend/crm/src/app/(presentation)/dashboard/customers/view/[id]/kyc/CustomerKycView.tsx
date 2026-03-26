"use client";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import ViewKycDataComponent from "./_components/ViewKycDataComponent";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

function CustomerKycView({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const profileApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller,
  );
  const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["KycView", id],
    queryFn: async () => {
      const { data } = await profileApi.customerInfoById(id);
      return data.responseData;
    },
  });

  const { data: kycStore } = useQuery({
    queryKey: ["KycProgressStoreChecks", id],
    queryFn: async () => {
      const resp = await kycApi.getKycProgressStoreCrm(id);
      return resp.responseData;
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: (kycDataStoreId: number) =>
      kycApi.rescheduleKra({ customerId: id, kycDataStoreId }),
    onSuccess: () => {
      toast.success("KRA process rescheduled successfully.");
      queryClient.invalidateQueries({ queryKey: ["KycKraLogsView", id] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const message =
        err?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to reschedule KRA");
      toast.error(message);
    },
  });

  const kycDataStoreId =
    kycStore && typeof kycStore === "object" && "id" in kycStore
      ? (kycStore as { id: number }).id
      : null;
  const canRetriggerKra =
    kycDataStoreId != null && data?.kycStatus !== "PENDING";

  const handleRetriggerKra = () => {
    if (kycDataStoreId == null) {
      toast.error("No KYC flow found for this customer.");
      return;
    }
    if (data?.kycStatus === "VERIFIED") {
      toast.error("Cannot retrigger KRA: customer KYC is already VERIFIED.");
      return;
    }
    rescheduleMutation.mutate(kycDataStoreId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>NO KYC Data Found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageInfoBar
        title={"KYC Data - " + data.firstName}
        description="Comprehensive KYC information and document verification status"
        showBack
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetriggerKra}
            disabled={rescheduleMutation.isPending || !canRetriggerKra}
            title={
              !canRetriggerKra && kycDataStoreId == null
                ? "No KYC flow found"
                : !canRetriggerKra && data?.kycStatus === "VERIFIED"
                  ? "KYC already verified"
                  : undefined
            }
          >
            {rescheduleMutation.isPending ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Retrigger KRA
          </Button>
        }
      />
      <ViewKycDataComponent data={data} />
    </div>
  );
}

export default CustomerKycView;
