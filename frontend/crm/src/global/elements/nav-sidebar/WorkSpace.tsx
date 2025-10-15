import apiServerCaller from "@/core/connection/apiServerCaller";
import apiGateway from "@root/apiGateway";
import { ReactNode } from "react";
import "server-only";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
import SessionManager from "../wrapper/SessionManager";

export default async function Workspace({
  children,
}: {
  children?: ReactNode;
}) {
  const authClient = new apiGateway.auth.AuthApi(apiServerCaller);
  const session = await authClient.getSession();

  return (
    <SessionManager session={session.data}>
      <div className="flex flex-col h-screen transition-all">
        {/* Top Bar */}
        <TopBar session={session.data} />
        {/* Main Section */}
        <div className="flex flex-1 overflow-hidden   ">
          {/* Sidebar */}
          <div className="lg:block hidden">
            <SideBar role={session.data.responseData.role} />
          </div>
          {/* Scrollable Content Area */}
          <main className="relative flex-1 overflow-y-auto overflow-x-hidden p-6 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SessionManager>
  );
}
