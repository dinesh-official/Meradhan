import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import React from "react";

interface CustomerOverViewCardProps {
  name: string;
  customerSince: string;
  kycStatus: string;
}
function CustomerOverViewCard(
  customerOverViewCardData: CustomerOverViewCardProps
) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Customer Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="gap-5 grid grid-cols-2 md:grid-cols-3">
          <LabelView title="Customer Name">
            <p className="text-sm">{customerOverViewCardData.name}</p>
          </LabelView>
          <LabelView title="Current KYC Status">
            <StatusBadge value={customerOverViewCardData.kycStatus} />
          </LabelView>
          <LabelView title="Customer Since">
            <p className="text-sm">{customerOverViewCardData.customerSince}</p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerOverViewCard;