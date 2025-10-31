import { BondListCard } from "@/global/components/Bond/BondListCard";
 import { cn } from "@/lib/utils";
import React from "react";

function LatestBondReleases() {
  return (
    <div className="py-14">
      <div className="container flex flex-col gap-5">
        <h3
          className={cn(
            "text-center lg:text-3xl  text-2xl font-medium",
            "quicksand-medium"
          )}
        >
          <span className="text-secondary font-semibold">Latest</span> Bond
          Releases
        </h3>
        <p className="text-center">
          New bonds are in! See what’s just been released in the market.
        </p>
        <div className="grid md:grid-cols-3 gap-5 mt-2">
          <BondListCard gridMode={true} onlyShare></BondListCard>
          <BondListCard gridMode={true} onlyShare></BondListCard>
          <BondListCard gridMode={true} onlyShare></BondListCard>
        </div>
      </div>
    </div>
  );
}

export default LatestBondReleases;
