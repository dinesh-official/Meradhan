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
import apiGateway, { CrmUsersProfile } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ASSETS_URL } from "@/global/constants/domains";

interface ContactSelectProps {
  onSelect?: (contact: CrmUsersProfile | null) => void;
  value?: CrmUsersProfile;
  role?: CrmUsersProfile["role"];
  placeholder?: string;
  /** Render search list inline (no nested popover). Use inside dialogs/popovers. */
  inline?: boolean;
}

function RoleUserCommand({
  onSelect,
  value,
  role,
  placeholder = "Type a user name...",
  enabled,
  bordered = true,
}: {
  onSelect?: (contact: CrmUsersProfile | null) => void;
  value?: CrmUsersProfile;
  role?: CrmUsersProfile["role"];
  placeholder?: string;
  enabled: boolean;
  bordered?: boolean;
}) {
  const [searchValue, setSearchValue] = React.useState("");
  const userApi = new apiGateway.crm.user.CrmUsersApi(apiClientCaller);

  const fetchUserQuery = useQuery({
    queryKey: ["autoFillUserSelect", role, searchValue],
    queryFn: async () => {
      const response = await userApi.findUsers({
        page: "1",
        search: searchValue || undefined,
        role,
      });
      return response.data;
    },
    enabled,
  });

  const handleSelect = (contact: CrmUsersProfile) => {
    onSelect?.(contact);
  };

  const { data, isLoading } = fetchUserQuery;

  return (
    <Command
      shouldFilter={false}
      className={cn(bordered && "rounded-md border")}
    >
      <CommandInput
        placeholder={placeholder}
        className="shadow-none"
        value={searchValue}
        onValueChange={setSearchValue}
      />
      <CommandList className="max-h-56">
        {isLoading && (
          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Searching...
          </div>
        )}

        {!isLoading && data?.responseData.data?.length === 0 && (
          <CommandEmpty>No users found.</CommandEmpty>
        )}

        {!isLoading && (data?.responseData?.data || []).length > 0 && (
          <CommandGroup>
            {data?.responseData.data.map((user) => (
              <CommandItem
                key={user.id + user.email}
                value={user.id.toString()}
                onSelect={() => handleSelect(user)}
              >
                <div className="flex flex-row gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={ASSETS_URL + "/" + user.avatar} />
                    <AvatarFallback />
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate">{user.name}</p>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value?.id === user.id ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}

export function SelectRoleUser({
  onSelect,
  value,
  role,
  placeholder,
  inline = false,
}: ContactSelectProps) {
  const [open, setOpen] = React.useState(false);

  if (inline) {
    return (
      <RoleUserCommand
        onSelect={onSelect}
        value={value}
        role={role}
        placeholder={placeholder ?? "Search by name..."}
        enabled
        bordered={false}
      />
    );
  }

  const handleSelect = (contact: CrmUsersProfile) => {
    onSelect?.(contact);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal shadow-none"
        >
          {value ? value.name : placeholder || "Search user..."}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-72 p-0 shadow-none" style={{ width: "18rem" }}>
        <RoleUserCommand
          onSelect={handleSelect}
          value={value}
          role={role}
          placeholder="Type a user name..."
          enabled={open}
        />
      </PopoverContent>
    </Popover>
  );
}
