import { CircleCheckBig } from "lucide-react";
import Image from "next/image";
import React from "react";

export interface AdharaCardProps {
  name: string;
  dateOfBirth: string;
  gender: string;
  aadhaarNumberMasked: string;
  isVerified: boolean;
}

function AdharaCard(adharaCardInfo: AdharaCardProps) {
  return (
    <div className="relative bg-white shadow p-5 rounded-2xl w-96 aspect-video">
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
            <p className="font-bold text-gray-800 text-sm">भारत सरकार</p>
            <p className="font-semibold text-gray-600 text-xs">
              Government of India
            </p>
          </div>
        </div>
        <div className="text-right">
          <Image
            alt=""
            src={`/icons/india/adhar.png`}
            width={100}
            height={400}
            className="w-18 h-auto"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 mt-5 pb-10 font-medium">
        <div className="text-xs">
          <p className="text-[9px]">नाम / Name</p>
          <p>{adharaCardInfo.name}</p>
        </div>

        <div className="text-xs">
          <p className="text-[9px]">जन्म तिथि / Date Of Birth</p>
          <p>{adharaCardInfo.dateOfBirth}</p>
        </div>
        <div className="text-xs">
          <p className="text-[9px]">लिंग / Gender</p>
          <p>{adharaCardInfo.gender}</p>
        </div>
      </div>
      {adharaCardInfo.isVerified && (
        <div className="right-0 bottom-14 absolute flex justify-center items-center gap-3 bg-green-500 p-2 px-3 rounded-full rounded-r-none font-bold text-white">
          <CircleCheckBig size={20} className="text-white" />
          <p>Verified</p>
        </div>
      )}
      
      
      <div className="bottom-0 left-0 absolute bg-gradient-to-r from-orange-500 via-white to-green-600 py-2 rounded-b-2xl w-full font-medium text-center">
        <p>{adharaCardInfo.aadhaarNumberMasked}</p>
      </div>
    </div>
  );
}

export default AdharaCard;
