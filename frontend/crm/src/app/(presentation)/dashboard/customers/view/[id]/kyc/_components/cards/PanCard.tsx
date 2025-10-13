import { CircleCheckBig } from "lucide-react";
import Image from "next/image";
import React from "react";

export interface PanCardProps {
  panNumber: string;
  name: string;
  fatherName: string;
  dateOfBirth: string;
  isVerified: boolean;
}

function PanCard(panCardData: PanCardProps) {
  return (
    <div className="p-5 w-96 aspect-video rounded-2xl  relative shadow bg-gradient-to-br from-[#6c9daf] via-[#8e81ac] to-[#b38590]">
      <div className="flex justify-between">
        <div className="w-96 ">
          <p className="font-black">आयकर विभाग</p>
          <p className="text-[10px] font-semibold">INCOME TAX DEPARTMENT</p>
        </div>
        <div className="w-full flex justify-center items-center">
          <Image
            alt=""
            src={`/icons/india/emblem.png`}
            width={100}
            height={400}
            className="w-7 h-auto"
          />
        </div>
        <div className="text-right w-96 ">
          <p className="font-black">भारत सरकार</p>
          <p className="text-[10px] font-semibold">GOVT. OF INDIA</p>
        </div>
      </div>
      <div className="text-[10px] text-center mt-2 mb-1">
        <p className="text-blue-950 font-medium ">Permanent Account Number</p>
        <p className="font-bold text-xs">{panCardData.panNumber}</p>
      </div>

      <div className="flex flex-col gap-1 font-medium">
        <div className="text-xs">
          <p className="text-blue-950">नाम / Name</p>
          <p>{panCardData.name}</p>
        </div>

        <div className="text-xs">
          <p className="text-blue-950">पिता का नाम / Fathers Name</p>
          <p>{panCardData.fatherName}</p>
        </div>
        <div className="text-xs">
          <p className="text-blue-950">जन्म तिथि / Date Of Birth</p>
          <p>{panCardData.dateOfBirth}</p>
        </div>
      </div>
      {panCardData.isVerified && (
        <div className="flex justify-center items-center bg-[#3ac727] absolute bottom-5 right-0 rounded-r-none gap-3 p-2 rounded-full px-3   font-bold text-white ">
          <CircleCheckBig size={20} className=" text-white " />
          <p>Verified</p>
        </div>
      )}
    </div>
  );
}

export default PanCard;
