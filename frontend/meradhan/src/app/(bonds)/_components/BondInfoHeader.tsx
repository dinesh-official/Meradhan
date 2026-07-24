"use client";

import { formatBondListingYield } from "@/global/utils/bondListingYield";
import { cn } from "@/lib/utils";
import { BondDetailResponse } from "@root/apiGateway";
import { FaStar } from "react-icons/fa6";
import BondLogoImage from "./BondLogoImage";

function hasText(v: string | null | undefined): boolean {
  if (!v) return false;
  const t = v.trim();
  if (!t) return false;
  return !/^(n\/?a|none|-+|null|undefined)$/i.test(t);
}

/** Formats listing `yield` as "10.50%", or null when absent / invalid. */
function formatYield(v: string | number | null | undefined): string | null {
  return formatBondListingYield(v);
}

function BondInfoHeader({
  bond,
}: {
  bond: BondDetailResponse["responseData"];
}) {
  const logoAlt = bond.bondName ? `${bond.bondName} logo` : "Bond logo";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <BondLogoImage
          logoUrl={bond.logoUrl}
          alt={logoAlt}
          className="border-0 bg-transparent sm:h-32 sm:w-32"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex md:flex-row flex-col justify-between md:items-center gap-5">
            <p className={cn("font-medium text-2xl", "quicksand-medium")}>
              ISIN:{" "}
              <span className="font-semibold text-secondary">{bond.isin}</span>
            </p>
            {hasText(bond.creditRatingInfo) && (
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 bg-muted px-2 py-0.5 rounded-sm max-w-[350px] text-primary">
                  <div className="w-5">
                    <FaStar size={17} className="text-secondary" aria-hidden="true" />
                  </div>
                  <span className="text-sm line-clamp-1">
                    {bond.creditRatingInfo}
                  </span>
                </div>
              </div>
            )}
          </div>
          {hasText(bond.bondName) && (
            <div className="flex flex-wrap items-center gap-3">
              <h2 className={cn("text-2xl md:text-3xl quicksand-medium")}>
                {bond.bondName}
              </h2>
              {formatYield(bond.yield) && (
                <span className="yield-badge inline-flex items-center rounded-full bg-green-100 px-4 py-1.5 text-base md:text-lg font-bold text-green-700">
                  Yield ({formatYield(bond.yield)})
                </span>
              )}
            </div>
          )}
          {hasText(bond.description) && (
            <p className="text-base">{bond.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default BondInfoHeader;
