"use client";

import useAppCookie from "@/hooks/useAppCookie.hook";
import { ReactNode } from "react";

function HideForMe({
  userId,
  children,
}: {
  userId: number;
  children: ReactNode;
}) {
  const { cookies } = useAppCookie();
  if (cookies.userId != userId) {
    return children;
  }
  return null;
}

export default HideForMe;
