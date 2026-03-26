import React from "react";
import { BsArrowUpRightSquareFill } from "react-icons/bs";

interface BondInfoDataProps {
  bondData?: {
    bondName?: string;
    isin?: string;
    instrumentName?: string;
  };
}

function BondInfoData({ bondData }: BondInfoDataProps) {
  return (
    <div>
      <p className="text-sm">Bond Name</p>
      <h6 className="text-xl text-black">
        {bondData?.bondName || "Loading..."}
      </h6>
      <p className="flex ">
        ISIN:{" "}
        <span className="text-primary flex items-center ml-1 gap-2">
          {bondData?.isin || "Loading..."} <BsArrowUpRightSquareFill />
        </span>
      </p>
    </div>
  );
}

export default BondInfoData;
