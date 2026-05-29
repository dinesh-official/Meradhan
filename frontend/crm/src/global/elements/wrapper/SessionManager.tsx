"use client";
import { PermissionsProvider } from "@/global/context/PermissionsContext";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import { UserSessionDataResponse } from "@root/apiGateway";
import { ReactNode, useEffect } from "react";
import IdleLogoutHandler from "./IdleLogoutHandler";
import ImpersonationBanner from "./ImpersonationBanner";
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

  const permissions = session.responseData.permissions ?? [];

  return (
    <PermissionsProvider permissions={permissions}>
      <ImpersonationBanner />
      <IdleLogoutHandler />
      <TabCloseConfirm />
      {children}
    </PermissionsProvider>
  );
}

export default SessionManager;
