/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { formatNumberTS } from "@/global/utils/formate";
import { cn } from "@/lib/utils";
import apiGateway, { BondDetailsResponse } from "@root/apiGateway";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Edit } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PiCurrencyInrBold } from "react-icons/pi";

import { BondInfoLabel } from "./BondInfoLabel";
import CreditRatingBadge from "./CreaditRatingBadge";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";

export function BondListCard({
  gridMode,
  onlyShare,
  data,
}: {
  gridMode: boolean;
  onlyShare?: boolean;
  data: BondDetailsResponse;
}) {
  const [allowForPurchase, setAllowForPurchase] = useState(
    data.allowForPurchase ?? false
  );
  const queryClient = useQueryClient();
  const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);

  // keep local state in sync if parent data changes
  useEffect(() => {
    setAllowForPurchase(data.allowForPurchase ?? false);
  }, [data.allowForPurchase]);

  const updateAllowForPurchase = useMutation({
    mutationFn: async (newValue: boolean) => {
      // fetch latest bond to avoid missing fields
      const current = await bondsApi.getBondDetailsByIsin(data.isin);
      return bondsApi.updateBond(data.isin, {
        ...current.responseData,
        allowForPurchase: newValue,
      } as any);
    },
    onSuccess: (_, newValue) => {
      setAllowForPurchase(newValue);
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
      queryClient.invalidateQueries({ queryKey: ["bond", data.isin] });
      toast.success("Updated allow for purchase");
    },
    onError: (error: AxiosError) => {
      toast.error(
        (error?.response?.data as { message?: string })?.message ||
          error?.message ||
          "Failed to update"
      );
      setAllowForPurchase(data.allowForPurchase ?? false);
    },
  });

  const handleAllowForPurchaseChange = (checked: boolean) => {
    setAllowForPurchase(checked); // optimistic
    updateAllowForPurchase.mutate(checked);
  };

  return (
    <Card className={cn("even:bg-white odd:bg-muted even:border odd:border-0")}>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <p className="font-semibold text-primary text-sm">{data.isin}</p>
            <CreditRatingBadge creditRating={data.creditRating} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <p className="text-xl line-clamp-1">{data.bondName}</p>
              <AllowOnlyView permissions={["edit:bonds"]}>
                <Link href={`/dashboard/bonds/update/${data.isin}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit size={14} />
                    Edit
                  </Button>
                </Link>
              </AllowOnlyView>
            </div>
            <AllowOnlyView permissions={["edit:bonds"]}>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`allow-for-purchase-${data.isin}`}
                  checked={allowForPurchase}
                  disabled={updateAllowForPurchase.isPending}
                  onCheckedChange={handleAllowForPurchaseChange}
                />
                <Label
                  htmlFor={`allow-for-purchase-${data.isin}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  Allow for Purchase
                </Label>
              </div>
            </AllowOnlyView>
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
                <p>
                  {data.yield !== null && data.yield !== undefined
                    ? `${data.yield}%`
                    : "--"}
                </p>
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
