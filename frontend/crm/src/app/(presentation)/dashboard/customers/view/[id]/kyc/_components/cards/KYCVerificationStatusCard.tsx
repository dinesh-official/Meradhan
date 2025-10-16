import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import React from "react";

export interface KYCVerificationStatusCardProps {
  kycLevel: string;
  overallStatus: string;
  verifiedBy: string;
  verifiedDate: string;
}
function KYCVerificationStatusCard(
  KYCVerificationStatusInfo: KYCVerificationStatusCardProps
) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verification Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 grid-cols-2 gap-5">
          <LabelView title="KYC Level">
            <p className="font-medium text-sm">
              {KYCVerificationStatusInfo.kycLevel}
            </p>
          </LabelView>
          <LabelView title="Overall Status">
            <StatusBadge
              value={
                KYCVerificationStatusInfo.overallStatus
                  ? "completed"
                  : "Incomplete"
              }
            />
          </LabelView>
          <LabelView title="Verified By">
            <p className="font-medium text-sm">
              {KYCVerificationStatusInfo.verifiedBy}
            </p>
          </LabelView>
          <LabelView title="Verified Date">
            <p className="font-medium text-sm">
              {KYCVerificationStatusInfo.verifiedDate}
            </p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}

export default KYCVerificationStatusCard;
