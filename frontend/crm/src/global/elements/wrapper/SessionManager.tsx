"use client";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import { UserSessionDataResponse } from "@root/apiGateway";
import { ReactNode, useEffect } from "react";
import IdleLogoutHandler from "./IdleLogoutHandler";

function SessionManager({
  children,
  session,
}: {
  session: UserSessionDataResponse;
  children: ReactNode;
}) {
  const { setUserData } = useCurrentUserData();
  useEffect(() => {
    setUserData(session.responseData);
  }, [session, setUserData]);

  return (
    <>
      <IdleLogoutHandler />
      {children}
    </>
  );
}

export default SessionManager;
