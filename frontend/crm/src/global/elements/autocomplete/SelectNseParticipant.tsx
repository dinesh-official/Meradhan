"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { cn } from "@/lib/utils";
import apiGateway, { ParticipantData } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import * as React from "react";
interface ContactSelectProps {
  onSelect?: (contact: ParticipantData | null) => void;
  value?: ParticipantData;
  placeholder?: string;
}

export function SelectNseParticipant({
  onSelect,
  value,
  placeholder,
}: ContactSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const userApi = new apiGateway.crm.rfq.participants.RfqParticipantsApi(
    apiClientCaller
  );

  const fetchUserQuery = useQuery({
    queryKey: ["SelectNseParticipant", searchValue],
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
    setOpen(false);
  };

  const { data, isLoading } = fetchUserQuery;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="shadow-none justify-between w-full font-normal"
        >
          {value ? value.firstName : placeholder || "Search  user..."}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="shadow-none p-0 w-72">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type a user name..."
            className="shadow-none"
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
              </div>
            )}

            {!isLoading && data?.responseData.data?.length === 0 && (
              <CommandEmpty>No users found.</CommandEmpty>
            )}

            {!isLoading && (data?.responseData?.data || []).length > 0 && (
              <CommandGroup>
                {data?.responseData.data.map((user) => (
                  <CommandItem
                    key={user.id + user.emailList[0]}
                    value={user.id.toString()}
                    onSelect={() => handleSelect(user)}
                  >
                    <div className="flex flex-row gap-2 ">
                      <div className="w-full">
                        <p>{user.firstName}</p>
                        <span className="text-xs text-muted-foreground">
                          {user.loginId}
                        </span>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        value?.id === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
