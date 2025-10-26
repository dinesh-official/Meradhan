import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { FaBell, FaSearch, FaUser } from "react-icons/fa";
import { FaCartShopping } from "react-icons/fa6";
import { MdLogout } from "react-icons/md";
import { SideBarCollapseButton } from "./ActionSideBar";
import MobSideBar from "./MobSideBar";
function AccountNavBar() {
  return (
    <div className="top-0 right-0 left-0 z-50 sticky bg-white shadow shadow-black/10 w-full h-16 md:h-18">
      <div className="flex justify-between items-center px-6 h-full">
        <div className="flex items-center gap-5 lg:gap-10">
          <SideBarCollapseButton />
          <MobSideBar />
          <Link href={`/`}>
            <Image
              src={`/logo/mera-dhan-logo.svg`}
              width={400}
              height={200}
              alt="meradhan"
              className="w-auto h-8 lg:h-10"
            />
          </Link>
        </div>

        {/* // Actions  */}
        <div className="flex items-center gap-8">
          <div className="right-0 bottom-0 z-40 fixed lg:relative flex justify-between lg:justify-end items-center gap-8 bg-white lg:bg-none shadow lg:shadow-none px-4 lg:px-0 py-2 lg:py-0 border-gray-100 lg:border-0 border-t w-full lg:w-auto">
            <Button variant={`secondaryLight`} className="gap-3 w-24">
              <FaUser /> KYC
            </Button>

            
            <div className="flex items-center gap-10">
              <button className="text-primary cursor-pointer">
                <FaCartShopping size={20} />
              </button>
              <button className="text-primary cursor-pointer">
                <FaSearch size={20} />
              </button>
              <button className="relative text-primary cursor-pointer">
                <div className="-top-2.5 -right-1.5 absolute flex justify-center items-center bg-secondary rounded-full w-5 h-5 font-medium text-white text-xs">
                  5
                </div>
                <FaBell size={20} />
              </button>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="bottom"
              align="end"
              className="shadow-none"
            >
              <DropdownMenuItem>
                <FaUser /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MdLogout /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default AccountNavBar;
