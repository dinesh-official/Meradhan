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
import { BondInfoLabel } from "./BondInfoLabel";



export function BondListCard({
  gridMode,
  onlyShare,
}: {
  gridMode: boolean;
  onlyShare?: boolean;
}) {
  return (
    <Card
      className={cn("even:bg-white odd:bg-muted even:border-1 odd:border-0")}
    >
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <p className="font-semibold text-primary text-sm">INE01YL07342</p>
            <Badge className="flex">
              <FaStar />
              <span className="font-semibold">A-</span>
            </Badge>
            <BondAddToWatchList />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <p className="text-gray-700 text-xl line-clamp-1">
                EARLYSALARY SERVICES PRIVATE LIMITED
              </p>
              {!gridMode && (
                <div className="hidden lg:flex gap-5">
                  <Button variant={`outline`} className="bg-transparent">
                    View Details
                  </Button>
                  <Button>Buy Now</Button>
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
                  />
                  <span className="text-gray-800 text-sm">Add to Compare</span>
                </label>
              )}
              {onlyShare && (
                <Label className="font-normal text-gray-600">Share this</Label>
              )}
              <RiShareFill className="text-gray-600 cursor-pointer" size={18} />
            </div>
            <div
              className={cn(
                "gap-4 grid grid-cols-2 lg:grid-cols-6 pt-3",
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
                  "gap-5 grid grid-cols-2 col-span-2 mt-2",
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
