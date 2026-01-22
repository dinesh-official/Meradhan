"use client";

import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { BondDetailsResponse } from "@root/apiGateway";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { formatNumberTS } from "@/global/utils/formate";
import { PiCurrencyInrBold } from "react-icons/pi";
import { Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CreditRatingBadge from "./CreaditRatingBadge";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import { AllowPurchaseCheckbox } from "./AllowPurchaseCheckbox";
import { calculateTimeUntilMaturity } from "../_utils/maturityUtils";

interface BondsTableProps {
  data: BondDetailsResponse[];
  pageSize?: number;
  isLoading?: boolean;
}

function BondsTable({ data, pageSize = 100, isLoading }: BondsTableProps) {
  return (
    <UniversalTable<BondDetailsResponse>
      initialPageSize={pageSize}
      data={data}
      isLoading={isLoading}

      fields={[
        {
          key: "isin",
          label: "ISIN & Issuer",
          cell: (row) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <AllowPurchaseCheckbox bond={row} />
                <Link href={`https://www.meradhan.co/bonds/detail/${row.isin}`} className="font-semibold text-primary text-sm hover:underline" target="_blank">{row.isin}</Link>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {row.bondName}
              </p>
            </div>
          ),
        },
        {
          key: "providerName",
          label: "Provider",
          cell: (row) => (
            <p className="text-sm">
              {row.providerName && String(row.providerName).trim()
                ? String(row.providerName)
                : "--"}
            </p>
          ),
        },
        {
          key: "yield",
          label: "Yield",
          cell: (row) => {
            const offeredYield =
              row.yield !== null && row.yield !== undefined && row.yield !== ""
                ? Number(row.yield)
                : null;
            const buyYield =
              row.buyYield !== null &&
                row.buyYield !== undefined &&
                row.buyYield !== ""
                ? Number(row.buyYield)
                : null;

            return (
              <div className="flex flex-col gap-1">
                <p className="text-sm">
                  <span className="text-muted-foreground">Offered : </span>
                  {offeredYield !== null && !isNaN(offeredYield)
                    ? `${offeredYield}%`
                    : "--"}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Buy : </span>
                  {buyYield !== null && !isNaN(buyYield)
                    ? `${buyYield}%`
                    : "--"}
                </p>
              </div>
            );
          },
        },
        {
          key: "coupon",
          label: "Coupon",
          cell: (row) => (
            <div className="flex flex-col gap-1">
              <p className="text-sm">
                <span className="text-muted-foreground">Coupon: </span>
                {row.couponRate !== null && row.couponRate !== undefined
                  ? `${row.couponRate}%`
                  : "--"}
              </p>
              <p className="text-sm flex items-center gap-1">
                <span className="text-muted-foreground">Face Value: </span>
                {row.faceValue !== null && row.faceValue !== undefined ? (
                  <>
                    <PiCurrencyInrBold size={12} />
                    {formatNumberTS(row.faceValue)}
                  </>
                ) : (
                  "--"
                )}
              </p>
            </div>
          ),
        },
        {
          key: "maturityDate",
          label: "Maturity Date",
          cell: (row) => {
            if (!row.maturityDate) {
              return <p className="text-sm">--</p>;
            }
            const timeUntil = calculateTimeUntilMaturity(row.maturityDate);
            return (
              <div className="flex flex-col gap-1">
                <p className="text-sm">
                  {dateTimeUtils.formatDateTime(row.maturityDate, "DD/MM/YYYY")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {timeUntil.formatted}
                </p>
              </div>
            );
          },
        },
        {
          key: "rating",
          label: "Rating",
          cell: (row) => (
            <div className="flex flex-col gap-1">
              {row.creditRating ? (
                <CreditRatingBadge creditRating={row.creditRating} />
              ) : (
                <p className="text-sm">--</p>
              )}
              <p className="text-xs text-muted-foreground">
                {row.ratingAgencyName && String(row.ratingAgencyName).trim()
                  ? String(row.ratingAgencyName)
                  : "--"}
              </p>
            </div>
          ),
        },
        {
          key: "providerPrice",
          label: "Provider Price",
          cell: (row) => {
            const price =
              row.providerPrice !== null &&
                row.providerPrice !== undefined &&
                row.providerPrice !== ""
                ? Number(row.providerPrice)
                : null;

            return (
              <p className="text-sm flex items-center gap-1">
                {price !== null && !isNaN(price) ? (
                  <>
                    <PiCurrencyInrBold size={15} />
                    {formatNumberTS(price)}
                  </>
                ) : (
                  "--"
                )}
              </p>
            );
          },
        },
        {
          key: "actions",
          label: "Action",
          stickyRight: true,
          sortable: false,
          cell: (row) => (
            <AllowOnlyView permissions={["edit:bonds"]}>
              <Link href={`/dashboard/bonds/update/${row.isin}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit size={14} />
                  Edit
                </Button>
              </Link>
            </AllowOnlyView>
          ),
        },
      ]}
      searchColumnKey="isin"
    />
  );
}

export default BondsTable;

