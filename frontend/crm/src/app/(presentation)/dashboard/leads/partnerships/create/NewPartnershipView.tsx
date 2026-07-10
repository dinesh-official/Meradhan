"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";
import PartnershipFormManagementForm from "../_components/managePartnerships/form/PartnershipFormManagementForm";
import { usePartnershipFormDataHook } from "../_components/managePartnerships/form/hooks/usePartnershipFormDataHook";
import { Button } from "@/components/ui/button";

function NewPartnershipView() {
  const manager = usePartnershipFormDataHook(undefined, {
    goBackOnSuccess: true,
  });

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
          disabled={manager.createPartnershipMutation.isPending}
        >
          {manager.createPartnershipMutation.isPending
            ? "Creating..."
            : "Create Partnership"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default NewPartnershipView;

