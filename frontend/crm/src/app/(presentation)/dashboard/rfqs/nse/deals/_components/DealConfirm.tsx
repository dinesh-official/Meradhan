/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import apiGateway, {
  ApiError,
  CreateNegotiationResponse,
} from "@root/apiGateway";
import React, { useState } from "react";
import DealSplitForm from "./deal-split-form/DealSplitForm";
import DealSplitInformation from "./deal-split-form/DealSplitInformation";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useMutation } from "@tanstack/react-query";
import z from "zod";
import { appSchema } from "@root/schema";
import Swal from "sweetalert2";
import { queryClient } from "@/core/config/reactQuery";

const DealConfirmPopup = ({
  children,
  data,
}: {
  children: React.ReactNode;
  data: CreateNegotiationResponse;
}) => {
  const [open, setOpen] = useState(false);
  const api = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);

  const dealSplitSubmit = useMutation({
    mutationKey: ["dealSplitSubmit", data.id],
    mutationFn: async (
      payload: z.infer<typeof appSchema.rfq.proposeDealSchema>
    ) => {
      return await api.proposeDeal(payload);
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Deal Proposed Successfully!",
        text: "Your deal has been submitted and recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["nseDealProposers"] });
    },

    onError: (error) => {
      setTimeout(() => setOpen(false), 1000)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>

      <DialogContent className="min-w-4xl">
        <DialogHeader>
          <DialogTitle>Consideration Confirmation / Deal Split</DialogTitle>
          <DialogDescription>
            edit consideration details for trade:
          </DialogDescription>
        </DialogHeader>
        <DealSplitInformation data={data} />
        <DealSplitForm
          data={data}
          loading={dealSplitSubmit.isPending}
          onSubmitForm={(e) => {
            dealSplitSubmit.mutate({
              accruedInterest: e.accruedInterest as any,
              calcMethod: e.calcMethod as any,
              clientCode: e.clientCode as any,
              consideration: e.consideration as any,
              dealType: e.dealType as any,
              price: e.price as any,
              putCallDate: e.putCallDate as any,
              remarks: e.remarks as any,
              ngId: data.id,
              ngRfqNumber: data.rfqNumber,
              participantCode: data.initClientCode as any,
              role: "I",
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default DealConfirmPopup;
