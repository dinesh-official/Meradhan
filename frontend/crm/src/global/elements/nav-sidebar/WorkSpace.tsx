import apiServerCaller from "@/core/connection/apiServerCaller";
import apiGateway from "@root/apiGateway";
import { ReactNode } from "react";
import "server-only";
import AllowOnlyView from "../permissions/AllowOnlyView";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import SessionManager from "../wrapper/SessionManager";

export default async function Workspace({
  children,
  actionKey,
  actionKeys,
}: {
  children?: ReactNode;
  actionKey?: string;
  actionKeys?: string[];
}) {
  const authClient = new apiGateway.auth.AuthApi(apiServerCaller);
  const session = await authClient.getSession();
  const isImpersonating = Boolean(session.data.responseData.impersonatedBy);

  const pageContent =
    actionKey || actionKeys?.length ? (
      <AllowOnlyView actionKey={actionKey} actionKeys={actionKeys}>
        {children}
      </AllowOnlyView>
    ) : (
      children
    );

  return (
    <SessionManager session={session.data}>
      <div className="flex flex-col h-screen transition-all">
        {/* Top Bar */}
        <TopBar session={session.data} />
        {/* Main Section */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <SideBar
              role={session.data.responseData.role}
              permissions={session.data.responseData.permissions ?? []}
              isImpersonating={isImpersonating}
            />
          </div>
          {/* Scrollable Content Area */}
          <main
            className="relative flex-1 bg-gray-50 p-6 overflow-x-hidden overflow-y-auto"
            id="mainpage"
          >
            {pageContent}
          </main>
        </div>
      </div>
    </SessionManager>
  );
}
