import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/StatusBadge";
import { Landmark } from "lucide-react";

interface BankCardProps {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  verifiedOn: string;
  isDefault?: boolean;
  verified?: boolean;
}

export function BankCard({
  bankName,
  accountNumber,
  ifscCode,
  branch,
  verifiedOn,
  isDefault = false,
  verified = false,
}: BankCardProps) {
  return (
    <Card className="relative overflow-hidden  bg-gray-50 border-none shadow-sm ">
      {/* Background logo */}
      <div className="absolute -right-14 -bottom-12  opacity-[0.04]">
        <Landmark size={190} />
      </div>

      <div className="relative z-10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{bankName}</CardTitle>
          <CardAction>
            <StatusBadge value={verified ? "Verified" : "Unverified"} />
          </CardAction>
        </CardHeader>

        <CardContent>
          <p className="text-xs capitalize text-gray-700 flex flex-row gap-2 justify-start mb-2 items-center" >
            sourav bapari <StatusBadge value="Verified" />
          </p>
          <h4 className="text-2xl font-semibold text-gray-800 tracking-widest">
            {accountNumber}
          </h4>
          <p className="text-sm text-gray-500 mt-2">{ifscCode}</p>
          <p className="text-sm text-gray-500">Branch: {branch}</p>
        </CardContent>

        <CardFooter className="pt-5">
          <div className="flex justify-between items-center w-full">
            <LabelView title="Default Account?">
              <StatusBadge value={isDefault ? "Yes" : "No"} />
            </LabelView>
            <LabelView title="Verified on" className="text-right block">
              <p className="text-sm font-medium text-right">{verifiedOn}</p>
            </LabelView>
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
