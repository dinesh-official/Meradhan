"use client"
import Image from "next/image";
import NotificationsSideBar from "./NotificationsSideBar";
import ProfileTopView from "./ProfileToogle";
import MobMenuBar from "./MobMenuBar";

function TopBar() {
  return (
    <div className="w-full h-[65px] border-b flex sticky top-0 right-0 left-0 z-50 justify-between items-center px-5 bg-white border-gray-100">
      <div className="flex justify-start items-center gap-6 h-full ">
        {/* Mobile Menu Bar */}
        <MobMenuBar role="ADMIN" />

        <div className="flex justify-start items-center gap-3">
          <Image
            src={`/logo/logo.png`}
            alt="meradhan"
            width={500}
            height={500}
            className="w-11 h-11"
          />
          <div className="lg:flex hidden flex-col justify-center items-start ">
            <p className="font-bold text-lg text-gray-800">MeraDhan CRM</p>
            <p className="text-xs text-gray-500">SEBI Registered OBPP</p>
          </div>
        </div>
      </div>
      {/* // Side Actions  */}
      <div className="flex justify-center items-center gap-8">
        <NotificationsSideBar />
        <ProfileTopView />
      </div>
    </div>
  );
}

export default TopBar;
