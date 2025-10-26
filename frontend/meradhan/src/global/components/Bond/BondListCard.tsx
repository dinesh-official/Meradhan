import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FaStar } from "react-icons/fa";
import { PiCurrencyInrBold } from "react-icons/pi";
import { RiShareFill } from "react-icons/ri";
import BondAddToWatchList from "./BondAddToWatchList";

function BondInfoLabel({
  children,
  title,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-gray-600 font-normal">{title}</Label>
      {children}
    </div>
  );
}

export function BondListCard({
  gridMode,
  onlyShare,
}: {
  gridMode: boolean;
  onlyShare?: boolean;
}) {
  return (
    <Card
      className={cn("odd:bg-muted odd:border-0 even:bg-white even:border-1")}
    >
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <p className="font-semibold text-primary text-sm">INE01YL07342</p>
            <Badge className="flex">
              <FaStar />
              <span className="font-semibold ">A-</span>
            </Badge>
            <BondAddToWatchList />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between ">
              <p className="text-xl text-gray-700 line-clamp-1">
                EARLYSALARY SERVICES PRIVATE LIMITED
              </p>
              {!gridMode && (
                <div className="lg:flex hidden gap-5">
                  <Button variant={`outline`} className="bg-transparent">
                    View Details
                  </Button>
                  <Button>Buy Now</Button>
                </div>
              )}
            </div>
            <div
              className={cn(
                "flex items-center gap-8 border-b pb-5",
                onlyShare && "gap-3"
              )}
            >
              {!onlyShare && (
                <label className="flex items-center gap-2 select-none cursor-pointer">
                  <Checkbox
                    className="bg-white border-gray-200 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                    checkClass="text-white"
                  />
                  <span className="text-sm text-gray-800">Add to Compare</span>
                </label>
              )}
              {onlyShare && (
                <Label className="text-gray-600 font-normal">Share this</Label>
              )}
              <RiShareFill className="text-gray-600 cursor-pointer" size={18} />
            </div>
            <div
              className={cn(
                "grid lg:grid-cols-6 grid-cols-2 gap-4 pt-3",
                gridMode && "lg:grid-cols-2 "
              )}
            >
              <BondInfoLabel title="Issue Price">
                <p className="flex items-center">
                  <PiCurrencyInrBold size={15} /> 62,500.00
                </p>
              </BondInfoLabel>
              <BondInfoLabel title="Yield">
                <p> --</p>
              </BondInfoLabel>
              <BondInfoLabel title="Face Value">
                <p className="flex items-center">
                  <PiCurrencyInrBold size={15} /> 62,500.00
                </p>
              </BondInfoLabel>
              <BondInfoLabel title="Coupon">
                <p> 10.40%</p>
              </BondInfoLabel>
              <BondInfoLabel title="Maturity Date">
                <p> 02 Dec 2026</p>
              </BondInfoLabel>
              <BondInfoLabel title="Payment Term">
                <p> Monthly</p>
              </BondInfoLabel>

              <div
                className={cn(
                  "grid grid-cols-2 gap-5 col-span-2 mt-2",
                  !gridMode && "lg:hidden grid"
                )}
              >
                <Button variant={`outline`} className="bg-transparent">
                  View Details
                </Button>
                <Button>Buy Now</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
