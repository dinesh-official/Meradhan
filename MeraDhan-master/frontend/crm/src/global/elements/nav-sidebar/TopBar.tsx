"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavBarToggleStore } from "@/global/stores/useNavBarToggleStore";
import { UserSessionDataResponse } from "@root/apiGateway";
import { Menu } from "lucide-react";
import Image from "next/image";
import MobMenuBar from "./MobMenuBar";
import NotificationsSideBar from "./NotificationsSideBar";
import ProfileTopView from "./ProfileToogle";
function TopBar({ session }: { session: UserSessionDataResponse }) {
  const { isOpen, setNavOpen } = useNavBarToggleStore();

  return (
    <div className="top-0 right-0 left-0 z-50 sticky flex justify-between items-center bg-white px-5 border-gray-100 border-b w-full h-[65px]">
      <div className="flex justify-start items-center gap-6 h-full">
        {/* Mobile Menu Bar */}
        <MobMenuBar role={session.responseData.role} />

        <div className="flex justify-start items-center gap-3">
          <div className="flex justify-start items-center gap-6 pl-1">
            <Tooltip  >
              <TooltipTrigger className="hidden lg:block" >
                <Menu
                  onClick={() => setNavOpen(!isOpen)}
                  className="text-primary cursor-pointer"
                />
              </TooltipTrigger>
              <TooltipContent align="start" side="right">
                {isOpen ? (
                  <p>Hide navigation menu</p>
                ) : (
                  <p>Show navigation menu</p>
                )}
              </TooltipContent>
            </Tooltip>

            <Image
              src={`/logo/logo.png`}
              alt="meradhan"
              width={500}
              height={500}
              className="w-11 h-11"
            />
          </div>
          <div className="hidden lg:flex flex-col justify-center items-start">
            <p className="font-bold text-gray-800 text-lg">MeraDhan CRM</p>
            <p className="text-gray-500 text-xs">SEBI Registered OBPP</p>
          </div>
        </div>
      </div>
      {/* // Side Actions  */}
      <div className="flex justify-center items-center gap-8">
        <NotificationsSideBar />
        <ProfileTopView session={session.responseData} />
      </div>
    </div>
  );
}

export default TopBar;
