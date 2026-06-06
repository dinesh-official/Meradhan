"use client";

import { NOTIFICATION_ACTION_KEYS } from "@/global/constants/rbac-actions.constants";
import usePermissions from "@/hooks/usePermissions.hook";
import { ReactNode } from "react";

function AllowOnlyView({
  actionKey,
  actionKeys,
  children,
  condition = true,
}: {
  actionKey?: string;
  actionKeys?: string[];
  children: ReactNode;
  condition?: boolean;
}) {
  const { can, canAny } = usePermissions();

  let isAllow = false;

  if (actionKey) {
    isAllow = can(actionKey);
  } else if (actionKeys?.length) {
    isAllow = canAny(actionKeys);
  }

  if (isAllow && condition) {
    return children;
  }

  if (actionKey || actionKeys?.length) {
    return (
      <p className="text-muted-foreground">
        You do not have permission to view this page.
      </p>
    );
  }

  return null;
}

export default AllowOnlyView;

export function useNotificationAccess() {
  const { can, canAny } = usePermissions();
  return {
    canAccessNotifications: () => canAny([...NOTIFICATION_ACTION_KEYS]),
    canViewCustomerList: () => can("notifications.customer_list.view"),
    canViewLists: () => can("notifications.lists.view"),
    canCreateList: () => can("notifications.lists.create"),
    canDeleteList: () => can("notifications.lists.delete"),
    canSend: () => can("notifications.send"),
    canViewTemplates: () => can("notifications.templates.view"),
    canManageTemplates: () =>
      canAny([
        "notifications.templates.create",
        "notifications.templates.edit",
        "notifications.templates.delete",
      ]),
    canViewLogs: () => can("notifications.logs.view"),
  };
}
