"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import React from "react";

import { Button } from "@/components/ui/button";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import LeadFormManagementForm from "../../_components/manageLeads/form/LeadFormManagementForm";
import { useLeadFormDataHook } from "../../_components/manageLeads/form/hooks/useLeadFormDataHook";
import { useLeadFollowUpApiHook } from "../../_components/manageLeads/form/hooks/useLeadApiHook";
import { appSchema } from "@root/schema";
import { toast } from "sonner";

function UpdateLeadFormOnPopup({
  id,
  open,
  setOpen,
}: {
  children?: React.ReactNode;
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const manager = useLeadFormDataHook(undefined, {
    goBackOnSuccess: false,
    onComplete() {
      setOpen(false);
    },
  });
  const { updateLeadMutation } = useLeadFollowUpApiHook({
    goBackOnSuccess: false,
    onComplete() {
      setOpen(false);
    },
  });

  const fetchUser = async () => {
    const fetchLeadApi = new apiGateway.crm.crmLeads.CrmLeadApi(
      apiClientCaller
    );
    try {
      const { data } = await fetchLeadApi.getNewLeadById(id);
      const cs = data.responseData;

      manager.setLeadDataMany({
        fullName: cs.fullName ?? "",
        emailAddress: cs.emailAddress ?? "",
        phoneNo: cs.phoneNo ?? "",
        companyName: cs.companyName ?? undefined,
        leadSource: cs.leadSource,
        status: cs.status,
        bondType: cs.bondType ?? undefined,
        exInvestmentAmount: cs.exInvestmentAmount ?? undefined,
        note: cs.note ?? "",
        assignTo: cs.assignTo?.id,
      });

      manager.relationManager.setRelationManager(cs.assignTo);
    } catch {
      // Silently handle error
    }
  };

  const handleUpdate = () => {
    try {
      // parse/validate with the UPDATE schema
      const payload = appSchema.crm.leads.updateLeadSchema.parse(manager.state);
      updateLeadMutation.mutate({ leadId: id, data: payload });
    } catch {
      toast.error("Invalid input");
    }
  };

  const { isLoading } = useQuery({
    queryKey: ["fetchLead", id],
    queryFn: fetchUser,
    refetchOnWindowFocus: false,
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Lead</DialogTitle>
        </DialogHeader>
        <LeadFormManagementForm manager={manager} />
        <DialogFooter>
          <Button
            className="w-full md:w-auto"
            onClick={handleUpdate}
            disabled={updateLeadMutation.isPending || isLoading}
          >
            Save Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateLeadFormOnPopup;
