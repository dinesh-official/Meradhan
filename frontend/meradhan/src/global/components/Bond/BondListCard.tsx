"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HOST_URL } from "@/global/constants/domains";
import { SharePopupTrigger } from "@/global/module/share/SharePopupView";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { formatNumberTS } from "@/global/utils/formate";
import { cn } from "@/lib/utils";
import { BondDetailsResponse } from "@root/apiGateway";
import Link from "next/link";
import { PiCurrencyInrBold } from "react-icons/pi";
import { RiShareFill } from "react-icons/ri";
import BondAddToWatchList from "./BondAddToWatchList";
import { BondInfoLabel } from "./BondInfoLabel";
import CreditRatingBadge from "./CreaditRatingBadge";
import { useCompareSelectStore } from "@/app/(bonds)/_hooks/useCompareSelectStore";

export function BondListCard({
  gridMode,
  onlyShare,
  data,
  odd,
}: {
  gridMode: boolean;
  onlyShare?: boolean;
  data: BondDetailsResponse;
  odd?: boolean;
}) {
  const { addItem, removeItem, selectedItems } = useCompareSelectStore();
  return (
    <Card
      className={cn(
        !odd && "even:bg-white odd:bg-muted even:border odd:border-0"
      )}
    >
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <p className="font-semibold text-primary text-sm">{data.isin}</p>
            <CreditRatingBadge creditRating={data.creditRating} />
            <BondAddToWatchList isin={data.isin} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <p className="text-xl line-clamp-1">{data.bondName}</p>
              {/* // make sure 2 buttons on that code deferent places */}
              {!gridMode && (
                <div className="hidden lg:flex gap-5 col-span-2">
                  <Link href={`/bonds/detail/` + data.isin}>
                    <Button variant={`outline`} className="bg-transparent">
                      View Details
                    </Button>
                  </Link>
                  {/* <Button>Buy Now</Button> */}
                </div>
              )}
            </div>
            <div
              className={cn(
                "flex items-center gap-8 pb-5 border-b",
                onlyShare && "gap-3"
              )}
            >
              {!onlyShare && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <Checkbox
                    className="bg-white data-[state=checked]:bg-secondary border-gray-200 data-[state=checked]:border-secondary"
                    checkClass="text-white"
                    checked={selectedItems.some((item) => item.id === data.id)}
                    onClick={() => {
                      if (selectedItems.some((item) => item.id === data.id)) {
                        removeItem(data.id);
                      } else {
                        addItem(data);
                      }
                    }}
                  />
                  <span className="text-gray-800 text-sm">Add to Compare</span>
                </label>
              )}
              {onlyShare && (
                <Label className="font-normal text-gray-600">Share this</Label>
              )}
              <SharePopupTrigger
                title="Share Bond"
                url={HOST_URL + "/detail/" + data.isin}
              >
                <RiShareFill
                  className="text-gray-600 cursor-pointer"
                  size={18}
                />
              </SharePopupTrigger>
            </div>
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
                <p>{data.yield !== null && data.yield !== undefined ? `${data.yield}%` : "Coming Soon"}</p>
              </BondInfoLabel>
              <BondInfoLabel title="Face Value">
                <p className="flex items-center">
                  <PiCurrencyInrBold size={15} />{" "}
                  {formatNumberTS(data.faceValue)}
                </p>
              </BondInfoLabel>
              <BondInfoLabel title="Coupon">
                <p>{data.couponRate.toFixed(2)}%</p>
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

              <div
                className={cn(
                  "gap-5 grid grid-cols-1 col-span-2 mt-2",
                  !gridMode && "lg:hidden grid"
                )}
              >
                {/* // make sure 2 buttons on that code deferent places */}
                <Link
                  href={`/bonds/detail/${data.isin}`}
                  className="block w-full"
                >
                  <Button variant={`outline`} className="bg-transparent w-full">
                    View Details
                  </Button>
                </Link>
                {/* <Button>Buy Now</Button> */}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
