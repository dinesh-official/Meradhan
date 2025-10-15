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
    <div className="w-full h-[65px] border-b flex sticky top-0 right-0 left-0 z-50 justify-between items-center px-5 bg-white border-gray-100">
      <div className="flex justify-start items-center gap-6 h-full ">
        {/* Mobile Menu Bar */}
        <MobMenuBar role={session.responseData.role} />

        <div className="flex justify-start items-center gap-3">
          <div className="flex justify-start items-center gap-6 pl-1">
            <Tooltip  >
              <TooltipTrigger className="lg:block hidden" >
                <Menu
                  onClick={() => setNavOpen(!isOpen)}
                  className="cursor-pointer text-primary "
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
          <div className="lg:flex hidden flex-col justify-center items-start ">
            <p className="font-bold text-lg text-gray-800">MeraDhan CRM</p>
            <p className="text-xs text-gray-500">SEBI Registered OBPP</p>
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
