"use client"; // if you use interactivity

import { ReactNode } from "react";
import SideBar from "./SideBar";
import TopBar from "./TopBar";

export default function Workspace({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Bar */}
      <TopBar />
      {/* Main Section */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="lg:block hidden">
          <SideBar role="ADMIN" />
        </div>
        {/* Scrollable Content Area */}
        <main className="relative flex-1 overflow-y-auto overflow-x-hidden p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
