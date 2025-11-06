"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import React from "react";
import LeadFormManagementForm from "../_components/manageLeads/form/LeadFormManagementForm";
import { useLeadFormDataHook } from "../_components/manageLeads/form/hooks/useLeadFormDataHook";
import { Button } from "@/components/ui/button";

function NewLeadView() {
  const manager = useLeadFormDataHook(undefined, {
    goBackOnSuccess: true,
  });
  return (
    <div className="mx-auto mt-6 max-w-3xl">
      <Card>
        <CardContent>
          <LeadFormManagementForm manager={manager} />
        </CardContent>
        <CardFooter>
          <Button
            className="w-full md:w-auto"
            onClick={manager.validateLeadData}
            disabled={manager.createLeadMutation.isPending}
          >
            Save Lead
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default NewLeadView;
