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
import apiGateway, { CustomerProfile } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import * as React from "react";
interface ContactSelectProps {
  onSelect?: (contact: CustomerProfile | null) => void;
  value?: CustomerProfile;
  placeholder?: string;
}

export function SelectCustomerUser({
  onSelect,
  value,
  placeholder,
}: ContactSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const userApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);

  const fetchUserQuery = useQuery({
    queryKey: ["autoFillCustomerUserSelect", searchValue],
    queryFn: async () => {
      const params = {
        page: "1",
        search: searchValue || undefined,
      };

      const response = await userApi.getCustomer(params);
      return response.data;
    },
    enabled: open, // only fetch when dropdown is open
  });

  const handleSelect = (contact: CustomerProfile) => {
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
          className="justify-between shadow-none w-full font-normal"
        >
          {value
            ? value.firstName + " " + value.lastName
            : placeholder || "Search  user..."}
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
              <div className="flex justify-center items-center py-4 text-muted-foreground text-sm">
                <Loader2 className="mr-2 w-4 h-4 animate-spin" /> Searching...
              </div>
            )}

            {!isLoading && data?.responseData.data?.length === 0 && (
              <CommandEmpty>No users found.</CommandEmpty>
            )}

            {!isLoading && (data?.responseData?.data || []).length > 0 && (
              <CommandGroup>
                {data?.responseData.data.map((user) => (
                  <CommandItem
                    key={user.id + user.emailAddress}
                    value={user.id.toString()}
                    onSelect={() => handleSelect(user)}
                  >
                    <div className="flex flex-row gap-2">
                      <div className="w-full">
                        <p>{user.firstName + " " + user.lastName}</p>
                        <span className="text-muted-foreground text-xs">
                          {user.emailAddress}
                        </span>
                      </div>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto w-4 h-4",
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
