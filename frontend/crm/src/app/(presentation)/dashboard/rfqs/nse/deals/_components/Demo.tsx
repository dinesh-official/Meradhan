"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDealSplitFormHook } from "./deal-split-form/useDealSplitFormHook";
import DealSplitInformation from "./deal-split-form/DealSplitInformation";
import DealSplitForm from "./deal-split-form/DealSplitForm";
import { Button } from "@/components/ui/button";

const Demo = () => {
  const manager = useDealSplitFormHook();
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>

      <DialogContent className="min-w-4xl">
        <DialogHeader>
          <DialogTitle>Consideration Confirmation / Deal Split</DialogTitle>
          <DialogDescription>
            edit consideration details for trade:
          </DialogDescription>
        </DialogHeader>
        <DealSplitInformation />
        <DealSplitForm manager={manager} />
        <DialogFooter>
          <div className="flex gap-4 ">
            <Button variant="secondary">Cancel</Button>
            <Button
              onClick={() => {
                manager.validateDealSplitData();
              }}
            >
              Submit Quote
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Demo;
