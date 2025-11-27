import { HOST_URL } from "@/global/constants/domains";
import { SharePopupTrigger } from "@/global/module/share/SharePopupView";
import Image from "next/image";
import React from "react";
import { FaEye } from "react-icons/fa6";
import { RiShareFill } from "react-icons/ri";

interface AuthorViewSharePostCardProps {
  name: string;
  profilePic: string;
  views: string;
  share: string;
  type?: "blog" | "news";
}

function AuthorViewSharePostCard({
  name,
  profilePic,
  views,
  share,
  type = "blog",
}: AuthorViewSharePostCardProps) {
  return (
    <div className="flex justify-between items-center text-[#666666]">
      <div className="flex items-center gap-4">
        <Image
          src={profilePic}
          alt="Blog"
          width={100}
          height={100}
          className="rounded-full w-10 h-10 object-cover"
        />
        <p>{name}</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <FaEye size={22} /> {views}
        </div>
        <div>
          <SharePopupTrigger
            title={`Share ${type === "blog" ? "Blog" : "News"}`}
            url={`${HOST_URL}${share}`}
          >
            <RiShareFill size={22} className="cursor-pointer" />
          </SharePopupTrigger>
        </div>
      </div>
    </div>
  );
}

export default AuthorViewSharePostCard;
