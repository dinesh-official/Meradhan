import Image from "next/image";
import React from "react";
import { FaEye } from "react-icons/fa6";
import { RiShareFill } from "react-icons/ri";

function AuthorViewSharePostCard() {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Image
          src="/avatars/person.jpeg"
          alt="Blog"
          width={100}
          height={100}
          className="w-10 h-10 rounded-full  object-cover"
        />
        <p className="text-gray-500">Vikas Kukreja</p>
      </div>
      <div className="flex gap-6 text-gray-500 items-center">
        <div className="flex items-center gap-2">
          <FaEye size={22} /> 9
        </div>
        <div>
          <RiShareFill size={22} />
        </div>
      </div>
    </div>
  );
}

export default AuthorViewSharePostCard;
