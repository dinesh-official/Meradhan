"use client";

import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import { useSessionPermissions } from "@/global/context/PermissionsContext";
import useAppCookie from "@/hooks/useAppCookie.hook";
import type { Role } from "@/global/constants/role.constants";
import { useCallback, useMemo } from "react";

export function usePermissions() {
  const user = useCurrentUserData((s) => s.user);
  const sessionPermissions = useSessionPermissions();
  const { cookies } = useAppCookie();

  const permissions = useMemo(() => {
    if (user?.permissions?.length) return user.permissions;
    if (sessionPermissions.length) return sessionPermissions;
    return [];
  }, [user?.permissions, sessionPermissions]);

  const role = (user?.role ?? cookies.role) as Role | undefined;
  const isImpersonating = Boolean(user?.impersonatedBy);

  const can = useCallback(
    (actionKey: string) => {
      if (role === "SUPER_ADMIN" && !isImpersonating) return true;
      return permissions.includes(actionKey);
    },
    [permissions, role, isImpersonating]
  );

  const canAny = useCallback(
    (keys: string[]) => keys.some((k) => can(k)),
    [can]
  );

  return { can, canAny, permissions, role };
}

export default usePermissions;
