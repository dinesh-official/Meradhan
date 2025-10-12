import { CircleCheckBig } from "lucide-react";
import Image from "next/image";
import React from "react";

function AdharaCard() {
  return (
    <div className="p-5 w-96 aspect-video rounded-2xl  relative shadow bg-white">
      <div className="flex justify-between">
        <div className="flex items-center gap-4">
          <Image
            alt=""
            src={`/icons/india/emblem.png`}
            width={100}
            height={400}
            className="w-7 h-auto"
          />
          <div className="flex flex-col leading-tight">
            <p className="font-bold text-sm text-gray-800">भारत सरकार</p>
            <p className="font-semibold text-xs text-gray-600">
              Government of India
            </p>
          </div>
        </div>
        <div className="text-right ">
          <Image
            alt=""
            src={`/icons/india/adhar.png`}
            width={100}
            height={400}
            className="w-18 h-auto"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 font-medium mt-5">
        <div className="text-xs">
          <p className="text-[9px]">नाम / Name</p>
          <p>JOHN DOE WALTERS</p>
        </div>

        <div className="text-xs">
          <p className="text-[9px]">जन्म तिथि / Date Of Birth</p>
          <p>21/10/1980</p>
        </div>
        <div className="text-xs">
          <p className="text-[9px]">जन्म तिथि / Gender</p>
          <p>MALE</p>
        </div>
      </div>
      <div className="flex justify-center items-center bg-green-500 absolute bottom-14 right-0 rounded-full  rounded-r-none gap-3 p-2 px-3  font-bold text-white ">
        <CircleCheckBig size={20} className=" text-white " />
        <p>Verified</p>
      </div>
      <div className="absolute bottom-0 left-0 w-full text-center py-2 font-medium bg-gradient-to-r from-orange-500 via-white to-green-600 rounded-b-2xl">
        <p>xxx-xxx-xxx-1234</p>
      </div>
    </div>
  );
}

export default AdharaCard;
