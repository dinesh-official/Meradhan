"use client";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
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
  useEffect(() => {
    setUserData(session.responseData);
  }, [session, setUserData]);

  return children;
}

export default SessionManager;
