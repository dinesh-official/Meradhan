import { Button } from "@/components/ui/button";
import { BondInfoLabel } from "@/global/components/Bond/BondInfoLabel";
import { PiCurrencyInrBold } from "react-icons/pi";
import Link from "next/link";
export function OngoingDealList() {
  return (
    <div className="flex flex-col gap-5 py-6 last:pb-2 border-gray-200 border-t w-ful">
      <div className="flex lg:flex-row flex-col lg:justify-between lg:items-end gap-3">
        <div className="flex flex-col gap-2 w-full">
          <p className="font-bold text-primary">INE909H08394</p>
          <p className="font-semibold text-xl">TMF HOLDINGS LIMITED</p>
        </div>
        <div className="relative lg:flex lg:items-end gap-5 grid grid-cols-2 w-full lg:w-auto">
          <Button variant={`outlineSecondary`} className="w-full lg:w-auto">
            View Details
          </Button>
          <Button className="w-full lg:w-auto" asChild>
            <Link href={`/place-order/INE909H08394`}>Buy Now</Link>
          </Button>
        </div>
      </div>
      <div className="gap-5 grid grid-cols-2 lg:grid-cols-7">
        <BondInfoLabel title="Issue Price">
          <p className="flex items-center">
            <PiCurrencyInrBold size={15} /> 62,500.00
          </p>
        </BondInfoLabel>
        <BondInfoLabel title="Coupon">
          <p className="font-semibold">0.073029%</p>
        </BondInfoLabel>
        <BondInfoLabel title="Yield">
          <p className="flex items-center">--</p>
        </BondInfoLabel>
        <BondInfoLabel title="Maturity Date">
          <p className="flex items-center">31 Dec 9999</p>
        </BondInfoLabel>
        <BondInfoLabel title="Payment Term" className="col-span-2">
          <p className="flex items-center">
            PAYABLE ON ANNUALLY BASIS ON 23/06/2022,23/06/2023 AND SO ON .
          </p>
        </BondInfoLabel>
        <BondInfoLabel
          title="Debenture Trustee"
          className="col-span-2 lg:col-span-1"
        >
          <p className="flex items-center">IDBI Trusteeship Services Limited</p>
        </BondInfoLabel>
      </div>
    </div>
  );
}
