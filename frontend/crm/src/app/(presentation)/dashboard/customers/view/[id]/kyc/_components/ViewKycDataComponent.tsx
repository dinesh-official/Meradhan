import React from "react";
import CustomerOverViewCard from "./cards/CustomerOverViewCard";
import KYCVerificationStatusCard from "./cards/KYCVerificationStatusCard";
import PersonalInformationCard from "./cards/PersonalInformationCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PanCard from "./cards/PanCard";
import AdharaCard from "./cards/AdharaCard";
import PanCardInfoCard from "./cards/PanCardInfoCard";
import AadhaarCardInfo from "./cards/AadhaarCardInfo";

function ViewKycDataComponent() {
  return (
    <div className="flex flex-col gap-5" >
      <div className="grid xl:grid-cols-2 gap-5">
        <CustomerOverViewCard />
        <KYCVerificationStatusCard />
      </div>

      <PersonalInformationCard />

      <Card>
        <CardHeader>
          <CardTitle>Identity Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-8">
            <PanCard />
            <AdharaCard />
          </div>
        </CardContent>
      </Card>

      <PanCardInfoCard />
      <AadhaarCardInfo />
    </div>
  );
}

export default ViewKycDataComponent;
