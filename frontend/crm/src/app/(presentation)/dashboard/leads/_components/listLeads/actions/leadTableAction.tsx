import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewLeadPayload } from "@root/apiGateway";
import { MoreHorizontal } from "lucide-react";
import LeadFollowUpNotes from "../../followUpNotes/LeadFollowUpNotes";
import { useFollowUpNoteFormHook } from "../../followUpNotes/useFollowUpFormDataHook";
import { useState } from "react";
import Swal from "sweetalert2";
import { useLeadTableActionHook } from "./useLeadTableActionHook";

const LeadTableActions = ({ lead }: { lead: NewLeadPayload }) => {
const manager = useFollowUpNoteFormHook(lead.id);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const { handleLeadUpdate,deleteLeadMutation } = useLeadTableActionHook({
    leadId: lead.id,
  });
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLeadUpdate}>Edit</DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setFollowUpOpen(true);
            }}
          >
            FollowUp
          </DropdownMenuItem>{" "}
          <DropdownMenuItem
            className="bg-red-50 text-red-500"
            onClick={async () => {
              const result = await Swal.fire({
                title: "Are you sure?",
                text: "This action will  delete the lrads.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Yes, delete it!",
                cancelButtonText: "Cancel",
              });

              if (result.isConfirmed) {
                 deleteLeadMutation.mutate()
              }
            }}
          >
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LeadFollowUpNotes
      // leadId={lead.id}
        manager={manager}
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
      />
    </>
  );
};

export default LeadTableActions;
