"use client";
import { Permission } from "@/global/constants/role.constants";
import { hasOneOfPermission } from "@/global/utils/role.utils";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { ReactNode } from "react";

function AllowOnlyView({
  permissions,
  children,
  condition = true,
}: {
  permissions: Permission[];
  children: ReactNode;
  condition?: boolean;
}) {
  const { cookies } = useAppCookie();
  const isAllow = hasOneOfPermission(cookies.role, permissions);

  if (isAllow && condition) {
    return children;
  }
  return null;
}

export default AllowOnlyView;
