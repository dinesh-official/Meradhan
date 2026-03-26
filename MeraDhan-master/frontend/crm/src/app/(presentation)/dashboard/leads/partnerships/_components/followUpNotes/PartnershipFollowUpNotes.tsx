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
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FollowUpMessageCard from "../../../_components/followUpNotes/FollowUpCard/FollowUpMessageCard";
import { IFollowUpNoteFormHook } from "./hooks/usePartnershipFollowUpFormDataHook";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import type { BaseResponseData } from "@root/apiGateway";

type PartnershipFollowUpNotesProps = {
  manager: IFollowUpNoteFormHook;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnershipId: number;
};

interface PartnershipFollowUpPayload {
  id: number;
  partnershipId: number;
  createdByName: string;
  createdByID: number;
  text: string;
  nextDate: string | null;
  createdAt: string;
  updatedAt: string;
}

const PartnershipFollowUpNotes = ({
  manager,
  open,
  onOpenChange,
  partnershipId,
}: PartnershipFollowUpNotesProps) => {
  const [followUps, setFollowUps] = useState<PartnershipFollowUpPayload[]>([]);

  const fetchFollowUps = async () => {
    const res = await apiClientCaller.get<BaseResponseData<PartnershipFollowUpPayload[]>>(
      `/crm/partnership/followup/${partnershipId}`
    );
    const list = res.data?.responseData || [];
    setFollowUps(
      Array.isArray(list) ? (list as PartnershipFollowUpPayload[]) : []
    );
  };

  const { isLoading: isLoadingFollowUps } = useQuery({
    queryKey: ["partnershipFollowUps", partnershipId],
    enabled: Number.isFinite(partnershipId) && open,
    queryFn: fetchFollowUps,
    refetchOnWindowFocus: false,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:min-w-[800px]">
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
        {manager.errors.text?.[0] && (
          <p className="text-sm text-destructive">{manager.errors.text[0]}</p>
        )}
        <div className="flex flex-row gap-5">
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
          <p className="mb-2 font-medium text-sm">Follow-up History</p>
          <div className="flex flex-col gap-3 min-h-64 max-h-64 overflow-auto">
            {isLoadingFollowUps && followUps.length == 0 ? (
              <p className="text-muted-foreground text-sm">
                Loading follow-ups...
              </p>
            ) : followUps.length > 0 ? (
              <div className="flex flex-col gap-3 min-h-64 max-h-64 overflow-auto">
                {followUps.map((note: PartnershipFollowUpPayload) => (
                  <FollowUpMessageCard
                    key={note.id}
                    leadFollowUpId={note.id}
                    name={note.createdByName}
                    message={note.text}
                    date={dateTimeUtils.formatDateTime(
                      note.nextDate || note.createdAt,
                      "DD MMMM YYYY hh:mm AA"
                    )}
                  />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No follow-ups added yet.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnershipFollowUpNotes;

