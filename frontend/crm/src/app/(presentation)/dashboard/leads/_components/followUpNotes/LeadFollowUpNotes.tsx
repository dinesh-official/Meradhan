import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { NewFollowUpPayload } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import FollowUpMessageCard from "./FollowUpCard/FollowUpMessageCard";
import { IFollowUpNoteFormHook } from "./hooks/followUpFormData";

type LeadFollowUpNotesProps = {
  manager: IFollowUpNoteFormHook;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: number;
};
const LeadFollowUpNotes = ({
  manager,
  open,
  onOpenChange,
  leadId,
}: LeadFollowUpNotesProps) => {
  const [followUps, setFollowUps] = useState<NewFollowUpPayload[]>([]);

  const leadFollowUpApi = useMemo(
    () => new apiGateway.crm.crmFollowup.CrmFollowUpApi(apiClientCaller),
    []
  );

  const fetchFollowUps = async () => {
    const res = await leadFollowUpApi.getAllFollowUpById(leadId);
    const list = res.data?.responseData || [];
    setFollowUps(Array.isArray(list) ? (list as NewFollowUpPayload[]) : []);
  };

  const { isLoading: isLoadingFollowUps } = useQuery({
    queryKey: ["followUpsNotes", leadId],
    enabled: Number.isFinite(leadId) && open, // <- remove `&& open` if you want it to fetch even when dialog is closed
    queryFn: fetchFollowUps,
    refetchOnWindowFocus: false,
  });

  // ✅ Extract actual array
  console.log("foolowUps", followUps);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Follow-Up Note</DialogTitle>
        </DialogHeader>
        <Textarea
          id="notes"
          placeholder="enter follow-up notes"
          className="mt-1"
          value={manager.state.text}
          onChange={(e) => manager.setFollowUpNoteData("text", e.target.value)}
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
          <div className="min-h-64 max-h-64 overflow-auto flex flex-col gap-3 ">
            {isLoadingFollowUps && followUps.length == 0 ? (
              <p className="text-sm text-muted-foreground">
                Loading follow-ups...
              </p>
            ) : followUps.length > 0 ? (
              <div className="min-h-64 max-h-64 overflow-auto flex flex-col gap-3">
                {followUps.map((note: NewFollowUpPayload) => (
                  <FollowUpMessageCard
                    key={note.id}
                    leadFollowUpId={note.id}
                    name={note.createdByName}
                    message={note.text}
                    date={new Date(
                      note.nextDate || note.createdAt
                    ).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No follow-ups added yet.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadFollowUpNotes;
