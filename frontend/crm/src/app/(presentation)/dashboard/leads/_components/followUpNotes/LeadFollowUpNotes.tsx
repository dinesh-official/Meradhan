import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import React from "react";
import FollowUpMessageCard from "./FollowUpCard/FollowUpMessageCard";
import { IFollowUpNoteFormHook } from "./followUpFormData";

const LeadFollowUpNotes = ({ manager }: { manager: IFollowUpNoteFormHook }) => {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Follow-Up Note</DialogTitle>
        </DialogHeader>
        <Textarea
          id="notes"
          placeholder="enter follow-up notes"
          className="mt-1"
          value={manager.state.notes}
          onChange={(e) => manager.setFollowUpNoteData("notes", e.target.value)}
        />
        <div className="flex  flex-row gap-5">
          <Input
            type="date"
            placeholder="select date"
            value={manager.state.nextFollowUpDate || ""}
            onChange={(e) =>
              manager.setFollowUpNoteData("nextFollowUpDate", e.target.value)
            }
          />
          <Button
            onClick={() => {
              manager.validateFollowUpNoteData();
            }}
          >
            Add Note
          </Button>
        </div>
        <div>
          <p className="font-medium text-sm mb-2 ">Follow-up History</p>
          <div  className="max-h-64 overflow-auto flex flex-col gap-3" >
             <FollowUpMessageCard
            name="Hemant Bhatnagar"
            message="Followed up regarding document submission."
            date="13 Oct 2025"
          />
          <FollowUpMessageCard
            name="Hemant Bhatnagar"
            message="Followed up regarding document submission."
            date="13 Oct 2025"
          /><FollowUpMessageCard
            name="Hemant Bhatnagar"
            message="Followed up regarding document submission."
            date="13 Oct 2025"
          /><FollowUpMessageCard
            name="Hemant Bhatnagar"
            message="Followed up regarding document submission."
            date="13 Oct 2025"
          /><FollowUpMessageCard
            name="Hemant Bhatnagar"
            message="Followed up regarding document submission."
            date="13 Oct 2025"
          />
         </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFollowUpNotes;
