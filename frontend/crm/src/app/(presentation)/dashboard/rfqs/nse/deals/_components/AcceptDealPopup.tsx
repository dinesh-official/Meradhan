import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import apiGateway, {
  ApiError,
  CreateNegotiationResponse,
} from "@root/apiGateway";
import { ReactNode, useState } from "react";
import DealSplitInformation from "./deal-split-form/DealSplitInformation";
import { Button } from "@/components/ui/button";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/core/config/reactQuery";
import Swal from "sweetalert2";
function AcceptDealPopup({
  children,
  data,
  status,
}: {
  children: ReactNode;
  data: CreateNegotiationResponse;
  status: "PC" | "PR";
}) {
  const [open, setOpen] = useState(false);
  const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);

  const acceptDealMutation = useMutation({
    mutationKey: ["conform", status],
    mutationFn: async () => {
      return await rfqApi.acceptRejectDeal({
        confirmStatus: status,
        id: data.id,
        rfqNumber: data.rfqNumber,
        acceptedPrice: data.acceptedPrice,
        acceptedAccruedInterest: data.acceptedAccruedInterest,
        acceptedConsideration: data.acceptedConsideration,
        acceptedPutCallDate: data.acceptedPutCallDate,
      });
    },
    onSettled: () => {
      setOpen(false);
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: `Deal ${
          status === "PC" ? "Accepted" : "Rejected"
        } Successfully!`,
        text: "Your deal has been submitted and recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["nseDealProposers"] });
    },

    onError: (error) => {
      // Properly type guard for ApiError
      if (error instanceof ApiError) {
        Swal.fire({
          icon: "error",
          title: "Deal Proposal Failed",
          text:
            error.response?.data.responseData.join(", ") ||
            "The deal could not be proposed. Please review the form and try again.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Unexpected Error",
          text: "Something went wrong. Please try again later.",
          confirmButtonText: "Got it",
          confirmButtonColor: "#2563eb",
        });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e)}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmation</DialogTitle>
          <DialogDescription>
            Are you sure you want to {status === "PC" ? "accept" : "reject"}{" "}
            this deal?
          </DialogDescription>
        </DialogHeader>
        <DealSplitInformation data={data} className="md:grid-cols-3" />
        <DialogFooter>
          {status === "PC" && (
            <Button
              onClick={() => acceptDealMutation.mutate()}
              disabled={acceptDealMutation.isPending}
            >
              Accept
            </Button>
          )}
          {status === "PR" && (
            <Button
              onClick={() => acceptDealMutation.mutate()}
              disabled={acceptDealMutation.isPending}
              variant={`destructive`}
            >
              Reject
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AcceptDealPopup;
