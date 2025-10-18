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
import { ChartNoAxesCombined } from "lucide-react";

interface DematCardProps {
  dpId: string;
  clientId: string;
  depository: string;
  accountType: string;
  pan1: { value: string; verified: boolean };
  pan2?: { value: string; verified?: boolean };
  pan3?: { value: string; verified?: boolean };
  depositoryParticipantName: string;
  isDefault?: boolean;
  verifiedOn: string;
  isVerified: boolean;
}

export function DematCard({
  dpId,
  clientId,
  depository,
  accountType,
  pan1,
  pan2,
  pan3,
  depositoryParticipantName,
  isDefault = false,
  isVerified = false,

  verifiedOn,
}: DematCardProps) {
  return (
    <Card className="relative overflow-hidden bg-gray-50 border-none shadow-sm">
      {/* Background logo */}
      <div className="absolute -right-5 -bottom-10 opacity-[0.04]">
        <ChartNoAxesCombined size={190} />
      </div>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{depository}</CardTitle>
        <CardAction>
          <StatusBadge value={isVerified ? "Verified" : "Not Verify"} />
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="grid grid-cols-3 gap-5">
          <LabelView title="DP ID">
            <p>{dpId}</p>
          </LabelView>
          <LabelView title="Client ID">
            <p>{clientId}</p>
          </LabelView>
          <LabelView title="Account Type">
            <p>{accountType}</p>
          </LabelView>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-700 flex gap-2 items-center">
            PAN 1 (Primary): {pan1.value}
          </p>
          {pan2 && (
            <p className="text-sm text-gray-700 flex gap-2 items-center">
              PAN 2 (Joint): {pan2.value}
            </p>
          )}
          {pan3 && (
            <p className="text-sm text-gray-700 flex gap-2 items-center">
              PAN 3 (Joint): {pan3.value}
            </p>
          )}
        </div>

        <p className="text-sm text-gray-500">
          Depository Participant Name: {depositoryParticipantName}
        </p>
      </CardContent>

      <CardFooter className="pt-5">
        <div className="flex justify-between items-center w-full">
          <LabelView title="Default Account?">
            <StatusBadge value={isDefault ? "Yes" : "No"} />
          </LabelView>
          <LabelView title="Verification Status" className="text-right block">
            <p className="text-sm font-medium text-right">{verifiedOn}</p>
          </LabelView>
        </div>
      </CardFooter>
    </Card>
  );
}
