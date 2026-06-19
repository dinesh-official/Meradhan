"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ASSETS_URL } from "@/global/constants/domains";
import LabelView from "@/global/elements/wrapper/LabelView";
import UserRoleBadge from "@/global/elements/wrapper/badges/UserRoleBadge";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import type { CrmUsersProfile } from "@root/apiGateway";

export function RelationshipManagerUserInfo({
  user,
  compact = false,
}: {
  user: CrmUsersProfile;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={`${ASSETS_URL}/${user.avatar}`} alt={user.name} />
          <AvatarFallback>{user.name?.charAt(0) ?? "R"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={`${ASSETS_URL}/${user.avatar}`} alt={user.name} />
          <AvatarFallback>{user.name?.charAt(0) ?? "R"}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.name}</p>
          <UserRoleBadge value={user.role} className="mt-1 bg-transparent p-0" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <LabelView title="Email">
          <p className="break-all text-sm">{user.email}</p>
        </LabelView>
        <LabelView title="Phone">
          <p className="text-sm">{user.phoneNo || "—"}</p>
        </LabelView>
        <LabelView title="Account Status">
          <StatusBadge value={user.accountStatus} />
        </LabelView>
        <LabelView title="Last Login">
          <p className="text-sm">
            {user.lastLogin
              ? dateTimeUtils.formatDateTime(user.lastLogin, "DD MMM YYYY hh:mm AA")
              : "—"}
          </p>
        </LabelView>
      </div>
    </div>
  );
}
