"use client";
import Footer from "@/global/components/footer/Footer";
import AccountNavBar from "../_components/NavBar/AccountNavBar";
import ActionSideBar from "../_components/NavBar/ActionSideBar";

// Shadcn UI Tooltip Components

function Page() {
  return (
    <div>
      <AccountNavBar />
      <div className="flex">
        {/* Sidebar */}
        <ActionSideBar />

        {/* Main Content */}
        <div className="w-full transition-all duration-300">
          <div className="h-96"></div>
          <div className="h-96"></div>
          <div className="h-96"></div>
          <div className="h-96"></div>
          <div className="h-96"></div>
          <div className="h-96"></div>
          <div className="h-96"></div>
          <div className="mb-12 lg:mb-0">
            <Footer lightModded />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;
