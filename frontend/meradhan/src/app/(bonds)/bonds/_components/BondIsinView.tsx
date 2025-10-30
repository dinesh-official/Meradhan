import BondsByCategories from "@/global/components/Bond/BondsByCategories";
import React from "react";
import BondBuyNowCalc from "./BondBuyNowCalc";
import BondInfoHeader from "./BondInfoHeader";
import { SortInfoBox } from "@/global/components/wrapper/cards/SortInfoBox";

export default function BondIsinView() {
  return (
    <div className="py-10">
      <BondInfoHeader />
      <div className="gap-8 grid lg:grid-cols-6 py-10">
        <div className="lg:col-span-4">
          <div className="gap-5 grid md:grid-cols-3">
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
