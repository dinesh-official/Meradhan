"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SelectRoleUser } from "@/global/elements/autocomplete/SelectRoleUser";
import { queryClient } from "@/core/config/reactQuery";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { ASSETS_URL } from "@/global/constants/domains";
import { cn } from "@/lib/utils";
import { hasOneOfPermission } from "@/global/utils/role.utils";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway, { ApiError, type CrmUsersProfile, type CustomerProfile } from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

function RmPickerPopover({
  rm,
  open,
  onOpenChange,
  onSelect,
  trigger,
}: {
  rm?: CrmUsersProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (user: CrmUsersProfile | null) => void;
  trigger: ReactNode;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 shadow-md"
        align="start"
        sideOffset={6}
        style={{ width: "20rem", minWidth: "20rem" }}
      >
        <div className="border-b px-3 py-2.5">
          <p className="text-sm font-medium leading-none">
            {rm ? "Change relationship manager" : "Assign relationship manager"}
          </p>
        </div>
        <div className="p-2">
          <SelectRoleUser
            inline
            role="RELATIONSHIP_MANAGER"
            placeholder="Search by name..."
            value={rm}
            onSelect={onSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function AssignRelationshipManagerCell({
  profile,
}: {
  profile: CustomerProfile;
}) {
  const { cookies } = useAppCookie();
  const canEdit = hasOneOfPermission(cookies.role, ["edit:customer"]);
  const [open, setOpen] = useState(false);
  const customerApi = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
  const rm = profile.utility.relationshipManager ?? undefined;

  const assignMutation = useMutation({
    mutationFn: async (relationshipManagerId: number) => {
      const res = await customerApi.updateCustomer(
        { relationshipManagerId },
        String(profile.id),
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchCustomersList"] });
      setOpen(false);
      toast.success("Relationship manager assigned");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message ?? "Failed to assign relationship manager");
      } else {
        toast.error(error?.message ?? "Failed to assign relationship manager");
      }
    },
  });

  const handleSelect = (user: CrmUsersProfile | null) => {
    if (!user || user.id === rm?.id) {
      setOpen(false);
      return;
    }
    assignMutation.mutate(user.id);
  };

  if (!rm && !canEdit) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <UserRound className="h-3.5 w-3.5 opacity-50" />
        No RM
      </span>
    );
  }

  if (!rm && canEdit) {
    return (
      <RmPickerPopover
        rm={rm}
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
        trigger={
          <button
            type="button"
            className={cn(
              "group/assign inline-flex max-w-[190px] items-center gap-2 rounded-md border border-dashed px-2 py-1",
              "border-muted-foreground/25 bg-muted/40 text-muted-foreground",
              "transition-colors hover:border-primary/35 hover:bg-primary/5 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              open && "border-primary/35 bg-primary/5 text-foreground",
            )}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background shadow-sm">
              {assignMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <UserRound className="h-3.5 w-3.5" />
              )}
            </span>
            <span className="truncate text-xs font-medium">Assign RM</span>
            <Plus className="h-3 w-3 shrink-0 opacity-60 transition-opacity group-hover/assign:opacity-100" />
          </button>
        }
      />
    );
  }

  if (!rm) return null;

  const assignedRow = (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarImage src={`${ASSETS_URL}/${rm.avatar}`} alt={rm.name} />
        <AvatarFallback className="text-[10px]">
          {rm.name?.charAt(0) ?? "R"}
        </AvatarFallback>
      </Avatar>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="truncate text-sm">{rm.name}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{rm.name}</p>
          <p className="text-muted-foreground">{rm.email}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  if (!canEdit) {
    return <div className="max-w-[180px]">{assignedRow}</div>;
  }

  return (
    <div className="group/rm flex max-w-[200px] items-center gap-1">
      {assignedRow}

      <RmPickerPopover
        rm={rm}
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover/rm:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            aria-label="Change relationship manager"
          >
            {assignMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Pencil className="h-3.5 w-3.5" />
            )}
          </Button>
        }
      />
    </div>
  );
}
