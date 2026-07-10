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
        <CardTitle className="text-sm" >KYC Verification Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="gap-5 grid grid-cols-2 md:grid-cols-4">
          <LabelView title="KYC Level">
            <p className="text-sm">
              {KYCVerificationStatusInfo.kycLevel}
            </p>
          </LabelView>
          <LabelView title="Overall Status">
            <StatusBadge value={KYCVerificationStatusInfo.overallStatus} />
          </LabelView>
          <LabelView title="Verified By">
            <p className="text-sm">
              {KYCVerificationStatusInfo.verifiedBy}
            </p>
          </LabelView>
          <LabelView title="Verified Date">
            <p className="text-sm">
              {KYCVerificationStatusInfo.verifiedDate}
            </p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}

export default KYCVerificationStatusCard;
