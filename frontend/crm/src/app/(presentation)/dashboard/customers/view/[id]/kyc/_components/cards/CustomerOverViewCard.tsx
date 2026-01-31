"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import apiGateway from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

interface CustomerOverViewCardProps {
  name: string;
  customerSince: string;
  kycStatus: string;
  kraStatus: string;
  userId: number;
}
function CustomerOverViewCard(
  customerOverViewCardData: CustomerOverViewCardProps,
) {
  const apiGate = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller,
  );

  const applyRekycMutate = useMutation({
    mutationKey: ["rekyc"],
    mutationFn: async () => {
      return await apiGate.applyRekyc(customerOverViewCardData.userId);
    },
    onSuccess(data) {
      toast.success("ReKyc apply successfully");
    },
    onError(error) {
      toast.error("Failed to apply for rekyc");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Customer Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="gap-5 grid grid-cols-2 md:grid-cols-4">
          <LabelView title="Customer Name">
            <p className="text-sm">{customerOverViewCardData.name}</p>
          </LabelView>
          <LabelView title="Current KYC Status">
            <div className="flex justify-start items-center gap-3">
              <StatusBadge value={customerOverViewCardData.kycStatus} />
              {customerOverViewCardData.kycStatus == "VERIFIED" &&
                !applyRekycMutate.data && (
                  <p
                    className="text-xs cursor-pointer text-primary"
                    onClick={
                      applyRekycMutate.isPending
                        ? undefined
                        : () => {
                            const ask = prompt(
                              "are you sure? write (confirm) too continue",
                            );
                            if (ask == "confirm") {
                              applyRekycMutate.mutate();
                            }
                          }
                    }
                  >
                    {applyRekycMutate.isPending ? "Applying" : "Request ReKyc"}
                  </p>
                )}
            </div>
          </LabelView>
          <LabelView title="Current KRA Status">
            <StatusBadge
              value={customerOverViewCardData?.kraStatus || "Not Started"}
            />
          </LabelView>
          <LabelView title="Customer Since">
            <p className="text-sm">{customerOverViewCardData.customerSince}</p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerOverViewCard;
