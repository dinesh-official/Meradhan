"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import React, { useState } from "react";
import LeadFormManagementForm from "../_components/manageLeads/form/LeadFormManagementForm";
import { useLeadFormDataHook } from "../_components/manageLeads/form/hooks/useLeadFormDataHook";
import { Button } from "@/components/ui/button";

function NewLeadFormOnPopup({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const manager = useLeadFormDataHook(undefined, {
    goBackOnSuccess: false,
    onComplete() {
      setOpen(false);
    },
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="lg:min-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create Lead</DialogTitle>
        </DialogHeader>
        <LeadFormManagementForm manager={manager} />
        <DialogFooter>
          <Button
            className="w-full md:w-auto"
            onClick={manager.validateLeadData}
            disabled={manager.createLeadMutation.isPending}
          >
            Save Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewLeadFormOnPopup;
