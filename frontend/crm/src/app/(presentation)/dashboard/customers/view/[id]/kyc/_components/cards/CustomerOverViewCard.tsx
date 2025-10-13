import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/StatusBadge";
import React from "react";

interface CustomerOverViewCardProps {
  name: string;
  customerSince: string;
  kycStatus: boolean;
}
function CustomerOverViewCard(
  customerOverViewCardData: CustomerOverViewCardProps
) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 grid-cols-2 gap-5">
          <LabelView title="Customer Name">
            <p className="font-medium text-sm">
              {customerOverViewCardData.name}
            </p>
          </LabelView>
          <LabelView title="Current KYC Status">
            <StatusBadge
              value={
                customerOverViewCardData.kycStatus ? "completed" : "Incomplete"
              }
            />
          </LabelView>
          <LabelView title="Customer Since">
            <p className="font-medium text-sm">
              {customerOverViewCardData.customerSince}
            </p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerOverViewCard;
