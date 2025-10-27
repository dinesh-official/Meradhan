import React, { memo, ReactNode } from "react";
import AccountNavBar from "../NavBar/AccountNavBar";
import ActionSideBar from "../NavBar/ActionSideBar";
import Footer from "@/global/components/footer/Footer";

function AccountViewPort({
  children,
  showFooter = true,
  title,
  showSideBar = true,
}: {
  children?: React.ReactNode;
  showFooter?: boolean;
  title?: ReactNode | string;
  showSideBar?: boolean;
  hideTitle?: boolean;
}) {
  return (
    <div>
      <AccountNavBar />
      <div className="flex">
        {/* Sidebar */}
        <ActionSideBar showSideBar={showSideBar} />
        {/* Main Content */}
        <div className="mb-12 sm:mb-0 w-full transition-all duration-300">
          <div className="p-4 sm:p-8 min-h-[50vh]">
            {title && <h3 className="mb-5 font-medium text-xl sm:text-2xl">{title}</h3>}
            {children}
          </div>
          {showFooter && <Footer lightModded />}
        </div>
      </div>
    </div>
  );
}

export default memo(AccountViewPort);
