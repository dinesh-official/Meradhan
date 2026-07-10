import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import { Landmark } from "lucide-react";

interface BankCardProps {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  verifiedOn: string;
  isDefault?: boolean;
  verified?: boolean;
  isNameVerified?: boolean;
  holderName:string
}

export function BankCard({
  bankName,
  accountNumber,
  ifscCode,
  branch,
  verifiedOn,
  isDefault = false,
  verified = false,
  isNameVerified,
  holderName
}: BankCardProps) {
  return (
    <Card className="relative bg-gray-50 border-none overflow-hidden">
      {/* Background logo */}
      <div className="-right-14 -bottom-12 absolute opacity-[0.04]">
        <Landmark size={190} />
      </div>

      <div className="z-10 relative">
        <CardHeader>
          <CardTitle className="font-semibold">{bankName}</CardTitle>
          <CardAction>
            <StatusBadge value={verified ? "Verified" : "Not Verified"} />
          </CardAction>
        </CardHeader>

        <CardContent>
          <p className="flex flex-row justify-start items-center gap-2 mb-2 text-gray-700 text-xs capitalize">
            {holderName} <StatusBadge value={isNameVerified?"Verified":"Not Match"} />
          </p>
          <h4 className="font-semibold text-gray-800 text-xl tracking-widest">
            {accountNumber}
          </h4>
          <p className="mt-2 text-gray-500 text-sm">{ifscCode}</p>
          <p className="text-gray-500 text-sm">Branch: {branch}</p>
        </CardContent>

        <CardFooter className="pt-5">
          <div className="flex justify-between items-center w-full">
            <LabelView title="Default Account?">
              <StatusBadge value={isDefault ? "Yes" : "No"} />
            </LabelView>
            <LabelView title="Verified on" className="block text-right">
              <p className="text-sm text-right">{verifiedOn}</p>
            </LabelView>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
