import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { formatNumberTS } from "@/global/utils/formate";
import { cn } from "@/lib/utils";
import { BondDetailsResponse } from "@root/apiGateway";
import { PiCurrencyInrBold } from "react-icons/pi";

import Link from "next/link";
import { BondInfoLabel } from "./BondInfoLabel";
import CreditRatingBadge from "./CreaditRatingBadge";

export function BondListCard({
  gridMode,
  onlyShare,
  data,
}: {
  gridMode: boolean;
  onlyShare?: boolean;
  data: BondDetailsResponse;
}) {
  return (
    <Card className={cn("even:bg-white odd:bg-muted even:border odd:border-0")}>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <p className="font-semibold text-primary text-sm">{data.isin}</p>
            <CreditRatingBadge creditRating={data.creditRating} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <p className="text-xl line-clamp-1">{data.bondName}</p>
              {/* // make sure 2 buttons on that code deferent places */}
            </div>
            <div
              className={cn(
                "flex items-center gap-8 pb-5 border-b",
                onlyShare && "gap-3"
              )}
            ></div>
            <div
              className={cn(
                "gap-4 grid grid-cols-2 lg:grid-cols-6 pt-3",
                gridMode && "lg:grid-cols-2 "
              )}
            >
              <BondInfoLabel title="Issue Price">
                <p className="flex items-center">
                  <PiCurrencyInrBold size={15} />{" "}
                  {formatNumberTS(data.issuePrice)}
                </p>
              </BondInfoLabel>
              <BondInfoLabel title="Yield">
                <p> --</p>
              </BondInfoLabel>
              <BondInfoLabel title="Face Value">
                <p className="flex items-center">
                  <PiCurrencyInrBold size={15} />{" "}
                  {formatNumberTS(data.faceValue)}
                </p>
              </BondInfoLabel>
              <BondInfoLabel title="Coupon">
                <p>{data.couponRate}%</p>
              </BondInfoLabel>
              <BondInfoLabel title="Maturity Date">
                <p>
                  {dateTimeUtils.formatDateTime(
                    data.maturityDate,
                    "DD MMM YYYY"
                  )}
                </p>
              </BondInfoLabel>
              <BondInfoLabel title="Payment Term">
                <p className="capitalize">
                  {data.interestPaymentMode.replaceAll("_", " ").toLowerCase()}
                </p>
              </BondInfoLabel>
              {/* 
              <div
                className={cn(
                  "gap-5 grid grid-cols-1 col-span-2 mt-2",
                  !gridMode && "lg:hidden grid"
                )}
              >
               
                <Link
                  href={`/bonds/detail/${data.isin}`}
                  className="block w-full"
                >
                  <Button variant={`outline`} className="bg-transparent w-full">
                    View Details
                  </Button>
                </Link>
             
              </div> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
