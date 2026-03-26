"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ParticipantData } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import * as React from "react";
interface ContactSelectProps {
  onSelect?: (contact: ParticipantData | null) => void;
  value?: ParticipantData;
  placeholder?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function SelectNseParticipant({
  onSelect,

  placeholder,
  open,
  setOpen,
}: ContactSelectProps) {
  const [searchValue, setSearchValue] = React.useState("");

  const userApi = new apiGateway.crm.rfq.participants.RfqParticipantsApi(
    apiClientCaller
  );

  const fetchUserQuery = useQuery({
    queryKey: ["SelectNseParticipant", searchValue, open],
    queryFn: async () => {
      const response = await userApi.getAllParticipants({
        search: searchValue,
        workflowStatus: "1",
      });
      return response.data;
    },
    enabled: open, // only fetch when dropdown is open
  });

  const handleSelect = (contact: ParticipantData) => {
    onSelect?.(contact);
  };

  const { data, isLoading } = fetchUserQuery;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <Input
            placeholder={placeholder || "Search..."}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="animate-spin text-gray-500" />
          </div>
        ) : null}
        <div className="max-h-44 overflow-auto">
          {data?.responseData.map((participant) => (
            <div
              key={participant.loginId}
              className=" hover:bg-gray-100 cursor-pointer  p-1  border-b"
              onClick={() => {
                handleSelect(participant);
                setOpen?.(false);
              }}
            >
              <div className="font-medium text-sm">{participant.firstName}</div>
              <div className="text-sm text-gray-500">{participant.loginId}</div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
