import React from "react";
import { BsArrowUpRightSquareFill } from "react-icons/bs";
import Link from "next/link";

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
        {bondData?.isin ? (
          <Link
            href={`/bonds/detail/${bondData.isin}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`View details for ${bondData.isin}`}
            aria-label={`View details for ${bondData.isin}`}
            className="text-primary flex items-center ml-1 gap-2"
          >
            {bondData.isin} <BsArrowUpRightSquareFill aria-hidden="true" />
          </Link>
        ) : (
          <span className="text-primary flex items-center ml-1 gap-2">
            Loading... <BsArrowUpRightSquareFill />
          </span>
        )}
      </p>
    </div>
  );
}

export default BondInfoData;
