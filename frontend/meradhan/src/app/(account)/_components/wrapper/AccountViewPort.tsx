import Footer from "@/global/components/footer/Footer";
import React, { memo, ReactNode } from "react";
import AccountNavBar from "../NavBar/AccountNavBar";
import ActionSideBar from "../NavBar/ActionSideBar";
import { getSession } from "@/core/auth/_server/getSession";

export const revalidate = 0;

async function AccountViewPort({
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
  const session = await getSession();
  return (
    <div className="account-viewport">
      <AccountNavBar session={session} />
      <div className="flex min-w-0">
        {/* Sidebar */}
        <ActionSideBar showSideBar={showSideBar} />
        {/* Main Content — min-w-0 so wide charts/tables scroll inside the column instead of expanding the viewport */}
        <div className="mb-12 sm:mb-0 w-full min-w-0 transition-all duration-300">
          <div className="p-[15px] sm:p-[24px] min-h-[50vh] min-w-0">
            {title && (
              <h3 className="mb-5 font-medium text-xl sm:text-2xl">{title}</h3>
            )}
            {children}
          </div>
          {showFooter && <Footer lightModded />}
        </div>
      </div>
    </div>
  );
}

export default memo(AccountViewPort);
