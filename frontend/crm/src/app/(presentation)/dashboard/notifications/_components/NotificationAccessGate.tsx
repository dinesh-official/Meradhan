"use client";

import { useNotificationAccess } from "@/global/elements/permissions/AllowOnlyView";
import { ReactNode } from "react";

export function NotificationAccessGate({
  check,
  children,
}: {
  check: (access: ReturnType<typeof useNotificationAccess>) => boolean;
  children: ReactNode;
}) {
  const access = useNotificationAccess();
  if (!check(access)) {
    return (
      <p className="p-2 text-muted-foreground">
        You do not have access to this page.
      </p>
    );
  }
  return children;
}
