"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";
import PartnershipFormManagementForm from "../../_components/managePartnerships/form/PartnershipFormManagementForm";
import { usePartnershipFormDataHook } from "../../_components/managePartnerships/form/hooks/usePartnershipFormDataHook";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { CrmUsersProfile } from "@root/apiGateway";

const UpdatePartnershipView = ({ id }: { id: number }) => {
  const manager = usePartnershipFormDataHook(undefined, {
    goBackOnSuccess: true,
    partnershipId: id,
  });

  const fetchPartnership = async () => {
    const fetchPartnershipApi =
      new apiGateway.crm.crmPartnership.CrmPartnershipApi(apiClientCaller);
    try {
      const { data } = await fetchPartnershipApi.getPartnershipById(id);
      const cs = data.responseData;

      manager.setPartnershipDataMany({
        organizationName: cs.organizationName ?? "",
        organizationType: cs.organizationType ?? "",
        city: cs.city ?? "",
        state: cs.state ?? "",
        website: cs.website ?? "",
        fullName: cs.fullName ?? "",
        designation: cs.designation ?? "",
        emailAddress: cs.emailAddress ?? "",
        mobileNumber: cs.mobileNumber ?? "",
        partnershipModel: cs.partnershipModel as "distribution" | "api" | "white-label" | "institutional",
        clientBase: cs.clientBase ?? "",
        message: cs.message ?? "",
        status: cs.status as "NEW" | "CONTACTED" | "QUALIFIED" | "UNQUALIFIED" | "CONVERTED" | "REJECTED",
        assignTo: cs.assignTo?.id,
      });

      if (cs.assignTo) {
        manager.relationManager.setRelationManager(cs.assignTo as CrmUsersProfile);
      }
    } catch {
      // Silently handle error
    }
  };

  const { isLoading } = useQuery({
    queryKey: ["fetchPartnership", id],
    queryFn: fetchPartnership,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <Card className="mt-5">
      <CardContent className="pt-6">
        <PartnershipFormManagementForm manager={manager} />
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => {
            manager.validatePartnershipData();
          }}
          disabled={manager.updatePartnershipMutation.isPending}
        >
          {manager.updatePartnershipMutation.isPending
            ? "Updating..."
            : "Update Partnership"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UpdatePartnershipView;

