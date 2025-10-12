import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/StatusBadge";
import React from "react";

function KYCVerificationStatusCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>KYC Verification Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 grid-cols-2 gap-5">
          <LabelView title="KYC Level">
            <p className="font-medium">Basic</p>
          </LabelView>
          <LabelView title="Overall Status">
            <StatusBadge value="Incomplete" />
          </LabelView>
          <LabelView title="Verified By">
            <p className="font-medium">Not verified</p>
          </LabelView>
          <LabelView title="Verified Date">
            <p className="font-medium">Not verified</p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}

export default KYCVerificationStatusCard;
