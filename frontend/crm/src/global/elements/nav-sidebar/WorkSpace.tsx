"use server";
import { ReactNode } from "react";
import SideBar from "./SideBar";
import TopBar from "./TopBar";
async function Workspace({ children }: { children?: ReactNode }) {
  return (
    <div>
      <TopBar />
      <div className="flex flex-1 ">
        <div className="lg:block hidden">
          <SideBar role="ADMIN" />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 min-h-[calc(100vh-65px)]  bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Workspace;
