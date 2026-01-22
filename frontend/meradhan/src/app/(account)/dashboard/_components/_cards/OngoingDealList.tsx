import { Button } from "@/components/ui/button";
import { BondInfoLabel } from "@/global/components/Bond/BondInfoLabel";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { formatNumberTS } from "@/global/utils/formate";
import { BondDetailsResponse } from "@root/apiGateway";
import { PiCurrencyInrBold } from "react-icons/pi";
import Link from "next/link";

interface OngoingDealListProps {
  bond: BondDetailsResponse;
}

export function OngoingDealList({ bond }: OngoingDealListProps) {
  return (
    <div className="flex flex-col gap-5 py-6 last:pb-2 border-gray-200 border-t w-ful">
      <div className="flex lg:flex-row flex-col lg:justify-between lg:items-end gap-3">
        <div className="flex flex-col gap-2 w-full">
          <p className="font-bold text-primary">{bond.isin}</p>
          <p className="font-semibold text-xl">{bond.bondName}</p>
        </div>
        <div className="relative lg:flex lg:items-end gap-5 grid grid-cols-2 w-full lg:w-auto">
          <Button variant={`outlineSecondary`} className="w-full lg:w-auto" asChild>
            <Link href={`/bonds/detail/${bond.isin}`} target="_blank">View Details</Link>
          </Button>
          {/* {bond.allowForPurchase && <Button className="w-full lg:w-auto" asChild>
            <Link href={`/place-order/${bond.isin}`}>Buy Now</Link>
          </Button>} */}
        </div>
      </div>
      <div className="gap-5 grid grid-cols-2 lg:grid-cols-7">
        <BondInfoLabel title="Issue Price">
          <p className="flex items-center">
            <PiCurrencyInrBold size={15} /> {formatNumberTS(bond.issuePrice)}
          </p>
        </BondInfoLabel>
        <BondInfoLabel title="Coupon">
          <p className="font-semibold">{bond.couponRate}%</p>
        </BondInfoLabel>
        <BondInfoLabel title="Yield">
          <p className="flex items-center">
            {bond.yield ? `${bond.yield}%` : "--"}
          </p>
        </BondInfoLabel>
        <BondInfoLabel title="Maturity Date">
          <p className="flex items-center">
            {bond.maturityDate
              ? dateTimeUtils.formatDateTime(bond.maturityDate, "DD MMM YYYY")
              : "--"}
          </p>
        </BondInfoLabel>
        <BondInfoLabel title="Payment Term" className="col-span-2">
          <p className="flex items-center capitalize">
            {bond.interestPaymentMode
              ? bond.interestPaymentMode.replaceAll("_", " ").toLowerCase()
              : "--"}
          </p>
        </BondInfoLabel>
        <BondInfoLabel
          title="Debenture Trustee"
          className="col-span-2 lg:col-span-1"
        >
          <p className="flex items-center">
            {bond.debentureTrustee || "--"}
          </p>
        </BondInfoLabel>
      </div>
    </div>
  );
}
