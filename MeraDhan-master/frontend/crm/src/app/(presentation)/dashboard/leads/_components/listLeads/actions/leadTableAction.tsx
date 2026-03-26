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
import { useState } from "react";
import Swal from "sweetalert2";
import { useLeadTableActionHook } from "./useLeadTableActionHook";
import { useFollowUpNoteFormHook } from "../../followUpNotes/hooks/useFollowUpFormDataHook";
import UpdateLeadFormOnPopup from "../../../[id]/update/UpdatePopupForm";

const LeadTableActions = ({ lead }: { lead: NewLeadPayload }) => {
  const manager = useFollowUpNoteFormHook(lead.id);
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const { deleteLeadMutation } = useLeadTableActionHook({
    leadId: lead.id,
  });
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="p-0 w-8 h-8">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setUpdateOpen(true)}>
            Edit
          </DropdownMenuItem>
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
                deleteLeadMutation.mutate();
              }
            }}
          >
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <LeadFollowUpNotes
        leadId={lead.id}
        manager={manager}
        open={followUpOpen}
        onOpenChange={setFollowUpOpen}
      />
      {updateOpen && (
        <UpdateLeadFormOnPopup
          id={lead.id}
          open={updateOpen}
          setOpen={setUpdateOpen}
        />
      )}
    </>
  );
};

export default LeadTableActions;
