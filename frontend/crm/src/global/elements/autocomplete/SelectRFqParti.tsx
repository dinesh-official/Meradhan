"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import * as React from "react";
interface ContactSelectProps {
  onSelect?: (contact: { code: string; name: string } | null) => void;
  value?: { code: string; name: string } | null;
  placeholder?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function SelectRFqParti({
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
    queryKey: ["SelectRFqParti", open],
    queryFn: async () => {
      const response = await userApi.getAllRfqParticipants();
      return response.data;
    },
    enabled: open, // only fetch when dropdown is open
  });

  const handleSelect = (contact: { code: string; name: string } | null) => {
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
        <div className="max-h-64 overflow-auto">
          {data?.responseData
            .filter(
              (e) =>
                e.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                e.code?.toLowerCase().includes(searchValue.toLowerCase())
            )
            .map((participant) => (
              <div
                key={participant.code}
                className=" hover:bg-gray-100 cursor-pointer  p-1  border-b"
                onClick={() => {
                  handleSelect(participant);
                  setOpen?.(false);
                }}
              >
                <div className="font-medium text-sm">{participant.name}</div>
                <div className="text-sm text-gray-500">{participant.code}</div>
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
