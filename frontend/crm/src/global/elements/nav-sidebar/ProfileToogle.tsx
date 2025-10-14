"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ASSETS_URL } from "@/global/constants/domains";
import { UserSessionDataResponse } from "@root/apiGateway";
import { LogOut, User, User2 } from "lucide-react";
function ProfileTopView({
  session,
}: {
  session: UserSessionDataResponse["responseData"];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-0">
        <div className="flex flex-row justify-center items-center gap-3 select-none cursor-pointer">
          <div className="lg:flex flex-col hidden text-right">
            <p className="text-sm font-medium text-gray-800">{session?.name}</p>
            <p className="text-xs text-gray-500">{session?.role}</p>
          </div>
          <Avatar>
            <AvatarImage src={ASSETS_URL + session?.avatar} />
            <AvatarFallback>
              <User2 size={15} className="text-gray-500" />
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-start items-center group gap-3">
          <User className="group hover:text-primary" /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-start items-center group gap-3">
          <LogOut size={10} className="group hover:text-primary" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileTopView;
