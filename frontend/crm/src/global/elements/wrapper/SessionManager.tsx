"use client";
import { COOKIE_OPTIONS } from "@/core/config/cookies.config";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { UserSessionDataResponse } from "@root/apiGateway";
import { ReactNode, useEffect } from "react";

function SessionManager({
  children,
  session,
}: {
  session: UserSessionDataResponse;
  children: ReactNode;
}) {
  const { setUserData } = useCurrentUserData();
  const { setCookie } = useAppCookie();
  useEffect(() => {
    setUserData(session.responseData);
    setCookie("role", session.responseData.role, COOKIE_OPTIONS);
    setCookie("userId", session.responseData.id, COOKIE_OPTIONS);
  }, [session, setUserData, setCookie]);

  return children;
}

export default SessionManager;
