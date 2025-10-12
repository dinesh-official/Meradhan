import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/StatusBadge";
import React from "react";
import AddressCard from "./AddressCard";

function AadhaarCardInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adhara and Address Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid lg:grid-cols-4 grid-cols-2 gap-5">
          <LabelView title="12-digit Aadhaar Number">
            <p className="font-medium">XXXX XXXX 5868</p>
          </LabelView>
          <LabelView title="Name as per Aadhaar">
            <p className="font-medium">
              Vikas Kukreja <StatusBadge value="Verified" />
            </p>
          </LabelView>
          <LabelView title="Date of Birth">
            <p className="font-medium">30/05/1983</p>
          </LabelView>
          <LabelView title="Gender">
            <p className="font-medium">MALE</p>
          </LabelView>
        </div>
      </CardContent>
      <CardContent className="border-t ">
        <CardTitle className="pt-6 mb-5">Permanent Address</CardTitle>
        <AddressCard />
      </CardContent>
      <CardContent className="border-t">
        <CardTitle className="pt-6 mb-5">
          Current Address as per Aadhaar
        </CardTitle>
        <AddressCard />
      </CardContent>
      <CardFooter className="border-t">
        <div className="flex flex-col gap-4">
          <CardTitle>Verification Status</CardTitle>
          <LabelView title="Verification Timestamp">
            09 Oct 2025, 02:28 PM
          </LabelView>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AadhaarCardInfo;
