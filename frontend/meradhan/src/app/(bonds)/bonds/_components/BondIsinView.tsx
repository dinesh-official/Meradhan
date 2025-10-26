import BondsByCategories from "@/global/components/Bond/BondsByCategories";
import React from "react";
import BondBuyNowCalc from "./BondBuyNowCalc";
import BondInfoHeader from "./BondInfoHeader";
import { SortInfoBox } from "@/global/components/wrapper/SortInfoBox";

export default function BondIsinView() {
  return (
    <div className="py-10">
      <BondInfoHeader />
      <div className="grid lg:grid-cols-6 gap-8 py-10">
        <div className="lg:col-span-4">
          <div className="grid md:grid-cols-3 gap-5">
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
            <SortInfoBox title="Issue Price">99,000.00</SortInfoBox>
          </div>
        </div>
        <div className="lg:col-span-2">
          <BondBuyNowCalc />
        </div>
      </div>

      <BondsByCategories />
    </div>
  );
}
