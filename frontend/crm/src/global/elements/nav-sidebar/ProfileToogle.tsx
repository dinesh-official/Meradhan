"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ASSETS_URL } from "@/global/constants/domains";
import { UserSessionDataResponse } from "@root/apiGateway";
import { User2 } from "lucide-react";
import ProfileToggleAction from "./actions/ProfileToogleAction";
function ProfileTopView({
  session,
}: {
  session: UserSessionDataResponse["responseData"];
}) {
  return (
    <ProfileToggleAction id={session.id}>
      <div className="flex flex-row justify-center items-center gap-3 cursor-pointer select-none">
        <div className="hidden lg:flex flex-col text-right">
          <p className="font-medium text-gray-800 text-sm">{session?.name}</p>
          <p className="text-gray-500 text-xs">{session?.role}</p>
        </div>
        <Avatar>
          <AvatarImage src={ASSETS_URL + session?.avatar} />
          <AvatarFallback>
            <User2 size={15} className="text-gray-500" />
          </AvatarFallback>
        </Avatar>
      </div>
    </ProfileToggleAction>
  );
}

export default ProfileTopView;
