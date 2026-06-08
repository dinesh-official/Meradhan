"use client";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import { UserSessionDataResponse } from "@root/apiGateway";
import { ReactNode, useEffect } from "react";
import IdleLogoutHandler from "./IdleLogoutHandler";
import TabCloseConfirm from "./TabCloseConfirm";

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
      <TabCloseConfirm />
      {children}
    </>
  );
}

export default SessionManager;
