import Image from "next/image";
import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { IoShareSocialSharp } from "react-icons/io5";

function AvatarDetailCard() {
  return (
    <div className="flex flex-col gap-5" >
      <p>Author:</p>
      <div className="flex items-start gap-3">
        <Image
          src="/avatars/person.jpeg"
          alt="Blog"
          width={100}
          height={100}
          className="w-12 h-12 rounded-full  object-cover"
        />
        <div className="w-full">
          <p className="text-gray-800 text-lg">Vikas Kukreja</p>
          <p className="text-gray-500 text-sm">Marketing Head</p>
          <div className="flex gap-3 mt-3">
            <div className="w-7 h-7 flex justify-center items-center rounded-full text-white  bg-gray-400">
              <FaFacebookF size={14} />
            </div>
            <div className="w-7 h-7 flex justify-center items-center rounded-full text-white  bg-gray-400">
              <FaXTwitter size={14} />
            </div>
            <div className="w-7 h-7 flex justify-center items-center rounded-full text-white  bg-gray-400">
              <FaLinkedinIn size={14} />
            </div>
            <div className="w-7 h-7 flex justify-center items-center rounded-full text-white  bg-gray-400">
              <FaInstagram size={14} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between w-full border-t border-b py-3 border-gray-200 text-gray-600">
        <p>Share Article:</p>
        <IoShareSocialSharp />
      </div>
    </div>
  );
}

export default AvatarDetailCard;
