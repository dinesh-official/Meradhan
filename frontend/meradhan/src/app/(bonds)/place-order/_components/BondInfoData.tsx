import React from "react";
import { BsArrowUpRightSquareFill } from "react-icons/bs";

function BondInfoData() {
  return (
    <div>
      <p className="text-sm">Issuer Name</p>
      <h6 className="text-xl text-black">KRAZYBEE SERVICES LIMITED</h6>
      <p className="flex ">
        ISIN:{" "}
        <span className="text-primary flex items-center ml-1 gap-2">
          INE02DT07019 <BsArrowUpRightSquareFill />
        </span>
      </p>
    </div>
  );
}

export default BondInfoData;
