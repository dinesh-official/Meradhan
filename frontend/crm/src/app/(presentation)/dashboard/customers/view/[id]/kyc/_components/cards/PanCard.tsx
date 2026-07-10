import { CircleCheckBig } from "lucide-react";
import Image from "next/image";
import React from "react";

export interface PanCardProps {
  panNumber: string;
  name: string;
  gender?: string;
  dateOfBirth: string;
  isVerified: boolean;
}

function PanCard(panCardData: PanCardProps) {
  return (
    <div className="relative bg-gradient-to-br from-[#6c9daf] via-[#8e81ac] to-[#b38590] shadow p-5 rounded-2xl w-96 aspect-video">
      <div className="flex justify-between">
        <div className="w-96">
          <p className="font-black">आयकर विभाग</p>
          <p className="font-semibold text-[10px]">INCOME TAX DEPARTMENT</p>
        </div>
        <div className="flex justify-center items-center w-full">
          <Image
            alt=""
            src={`/icons/india/emblem.png`}
            width={100}
            height={400}
            className="w-7 h-auto"
          />
        </div>
        <div className="w-96 text-right">
          <p className="font-black">भारत सरकार</p>
          <p className="font-semibold text-[10px]">GOVT. OF INDIA</p>
        </div>
      </div>
      <div className="mt-2 mb-1 text-[10px] text-center">
        <p className="font-medium text-blue-950">Permanent Account Number</p>
        <p className="font-bold text-xs">{panCardData.panNumber}</p>
      </div>

      <div className="flex flex-col gap-1 font-medium">
        <div className="text-xs">
          <p className="text-blue-950">नाम / Name</p>
          <p>{panCardData.name}</p>
        </div>

        {/* <div className="text-xs">
           <p className="text-blue-950">लिंग / Gender</p>
          <p>{panCardData.gender}</p>
        </div> */}
        <div className="text-xs">
          <p className="text-blue-950">जन्म तिथि / Date Of Birth</p>
          <p>{panCardData.dateOfBirth}</p>
        </div>
      </div>
      {panCardData.isVerified && (
        <div className="right-0 bottom-5 absolute flex justify-center items-center gap-3 bg-[#3ac727] p-2 px-3 rounded-full rounded-r-none font-medium text-white">
          <CircleCheckBig size={20} className="text-white" />
          <p>Verified</p>
        </div>
      )}
    </div>
  );
}

export default PanCard;
