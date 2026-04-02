"use client";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import ViewKycDataComponent from "./_components/ViewKycDataComponent";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Check, RefreshCw } from "lucide-react";
import React from "react";

function CustomerKycView({ id }: { id: number}) {
  const profileApi = new apiGateway.crm.customer.CrmCustomerApi(
    apiClientCaller,
  );
  const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller,
  );

  const [kraRunning, setKraRunning] = React.useState<boolean>(false);
  const [kraRunningLoading, setKraRunningLoading] =
    React.useState<boolean>(true);
  const [kycDataStoreId, setKycDataStoreId] = React.useState<number | null>(null);

  React.useEffect(() => {
    let ignore = false;
    async function checkKraStatus() {
      setKraRunningLoading(true);
      try {
        const resp = await kycApi.customerKraStatus(id);
        const data = resp.data.responseData;
        if (!ignore) setKraRunning(data?.isRunning);
        if (!ignore) setKycDataStoreId(data?.kycDataStoreId);
      } catch (e) {
        if (!ignore) setKraRunning(false);
      } finally {
        if (!ignore) setKraRunningLoading(false);
      }
    }
    checkKraStatus();
    return () => {
      ignore = true;
    };
  }, [id]);
  const queryClient = useQueryClient();

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

  const pastExecutionOptions = ["MODIFY", "REGISTER", "NONE"] as const;
  type PastExecution = (typeof pastExecutionOptions)[number];

  const [retriggerOpen, setRetriggerOpen] = React.useState(false);
  const [pastExecution, setPastExecution] =
    React.useState<PastExecution>("MODIFY");
  const [confirmValue, setConfirmValue] = React.useState("");

  const rescheduleMutation = useMutation({
    mutationFn: (payload: {
      kycDataStoreId: number;
      pastExecution: PastExecution;
    }) =>
      kycApi.rescheduleKra({
        customerId: id,
        kycDataStoreId: payload.kycDataStoreId,
        pastExecution: payload.pastExecution,
      }),
    onSuccess: () => {
      toast.success("KRA process rescheduled successfully.");
      queryClient.invalidateQueries({ queryKey: ["KycKraLogsView", id] });
      setRetriggerOpen(false);
      setConfirmValue("");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const message =
        err?.response?.data?.message ??
        (err instanceof Error ? err.message : "Failed to reschedule KRA");
      toast.error(message);
    },
  });

  const canRetriggerKra =
    kycDataStoreId != null &&
    data?.kycStatus !== "PENDING" &&
    !kraRunning &&
    !kraRunningLoading;

  const confirmationRequiredValue = "CONFIRM";
  const isConfirmValid =
    confirmValue.trim().toUpperCase() === confirmationRequiredValue;

  const handleOpenRetriggerKraPopup = () => {
    if (kycDataStoreId == null) {
      toast.error("No KYC flow found for this customer.");
      return;
    }
   
    if (kraRunning) {
      toast.error("KRA process is already running for this customer.");
      return;
    }
    // if (data?.kycStatus === "VERIFIED") {
    //   toast.error("KYC already verified");
    //   return;
    // }

    // Reset form each time you open the popup.
    setPastExecution("MODIFY");
    setConfirmValue("");
    setRetriggerOpen(true);
  };

  const handleConfirmRetriggerKra = () => {
    if (kycDataStoreId == null) {
      toast.error("No KYC flow found for this customer.");
      return;
    }
    if (!isConfirmValid) {
      toast.error("Please type CONFIRM to proceed.");
      return;
    }
    if (!canRetriggerKra) return;

    rescheduleMutation.mutate({
      kycDataStoreId,
      pastExecution,
    });
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
            onClick={handleOpenRetriggerKraPopup}
            disabled={rescheduleMutation.isPending}
            title={
              kraRunningLoading
                ? "Checking KRA status..."
                : kraRunning
                  ? "KRA process is already running"
                  : canRetriggerKra && kycDataStoreId == null
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

      <Dialog
        open={retriggerOpen}
        onOpenChange={(open) => {
          setRetriggerOpen(open);
          if (!open) setConfirmValue("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Retrigger KRA</DialogTitle>
            <DialogDescription>
              Select `pastExecution` and type `CONFIRM` to proceed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Past execution</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {pastExecutionOptions.map((opt) => {
                  const selected = pastExecution === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPastExecution(opt)}
                      className={[
                        "w-full text-left min-h-[52px] rounded-xl border px-4 py-3 transition-colors",
                        selected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white hover:bg-gray-50",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3 h-full">
                        <div className="font-semibold">{opt}</div>
                        {selected ? (
                          <Check className="size-4 text-blue-700" />
                        ) : (
                          <span className="size-4 block" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retrigger-confirm">Write confirm</Label>
              <Input
                id="retrigger-confirm"
                placeholder="Type CONFIRM"
                value={confirmValue}
                onChange={(e) => setConfirmValue(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Type <span className="font-semibold">CONFIRM</span> to enable retrigger.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="secondary"
              onClick={() => setRetriggerOpen(false)}
              disabled={rescheduleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRetriggerKra}
              disabled={!isConfirmValid || rescheduleMutation.isPending || !canRetriggerKra}
            >
              {rescheduleMutation.isPending ? (
                <Spinner className="mr-2 h-4 w-4" />
              ) : null}
              Retrigger KRA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ViewKycDataComponent data={data} />
    </div>
  );
}

export default CustomerKycView;
