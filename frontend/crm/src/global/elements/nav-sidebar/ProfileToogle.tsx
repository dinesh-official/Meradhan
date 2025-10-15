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
    </ProfileToggleAction>
  );
}

export default ProfileTopView;
