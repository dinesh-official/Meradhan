"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { genMediaUrl } from "@/global/utils/url.utils";
import { cn } from "@/lib/utils";
import apiGateway, { CustomerProfile } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, User } from "lucide-react";
import * as React from "react";

type CustomerWithAvatar = CustomerProfile & { avatar?: string | null };

function customerDisplayName(c: CustomerProfile): string {
  return [c.firstName, c.middleName, c.lastName].filter(Boolean).join(" ").trim() || "—";
}

function kycBadgeVariant(
  status: string | undefined
): "default" | "secondary" | "destructive" | "outline" {
  const s = String(status ?? "").toUpperCase();
  if (s === "VERIFIED" || s === "APPROVED") return "default";
  if (s === "PENDING") return "secondary";
  if (s === "REJECTED") return "destructive";
  return "outline";
}

function CustomerOptionRow({ user }: { user: CustomerWithAvatar }) {
  const avatarSrc = user.avatar ? genMediaUrl(user.avatar) : undefined;
  const initials = [user.firstName, user.lastName]
    .map((n) => (n ?? "").charAt(0))
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";
  return (
    <div className="flex flex-row items-center gap-3 w-full min-w-0">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarImage src={avatarSrc} alt={customerDisplayName(user)} />
        <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{customerDisplayName(user)}</p>
        <p className="text-muted-foreground text-xs truncate">{user.emailAddress || "—"}</p>
        {user.kycStatus != null && (
          <Badge variant={kycBadgeVariant(user.kycStatus)} className="mt-1 w-fit text-[10px]">
            {user.kycStatus}
          </Badge>
        )}
      </div>
    </div>
  );
}

interface ContactSelectProps {
  onSelect?: (contact: CustomerProfile | null) => void;
  value?: CustomerProfile;
  placeholder?: string;
  disabled?: boolean;
}

export function SelectCustomerUser({
  onSelect,
  value,
  placeholder,
  disabled,
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
    enabled: open,
  });

  const handleSelect = (contact: CustomerProfile) => {
    onSelect?.(contact);
    setOpen(false);
  };

  const { data, isLoading } = fetchUserQuery;
  const selected = value as CustomerWithAvatar | undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal shadow-none"
          disabled={disabled}
        >
          {selected ? (
            <span className="truncate">{customerDisplayName(selected)}</span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              {placeholder || "Search and select customer..."}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="shadow-none p-0 w-[320px]" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or email..."
            className="shadow-none"
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {isLoading && (
              <div className="flex justify-center items-center py-6 text-muted-foreground text-sm">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
              </div>
            )}

            {!isLoading && data?.responseData.data?.length === 0 && (
              <CommandEmpty>No customers found.</CommandEmpty>
            )}

            {!isLoading && (data?.responseData?.data || []).length > 0 && (
              <CommandGroup>
                {(data?.responseData?.data as CustomerWithAvatar[]).map((user) => (
                  <CommandItem
                    key={user.id + (user.emailAddress ?? "")}
                    value={String(user.id)}
                    onSelect={() => handleSelect(user)}
                    className="py-3"
                  >
                    <CustomerOptionRow user={user} />
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
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
