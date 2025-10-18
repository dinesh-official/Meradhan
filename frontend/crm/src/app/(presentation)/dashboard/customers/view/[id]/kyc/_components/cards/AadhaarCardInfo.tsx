import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/badges/StatusBadge";
import React from "react";
import AddressCard, { AddressCardDataProp } from "./AddressCard";

export interface AadhaarCardInfoDataProps {
  aadhaarNumber: string;
  name: string;
  nameVerificationStatus: boolean;
  dateOfBirth: string;
  gender: string;
  permanentAddress: AddressCardDataProp;
  currentAddress: AddressCardDataProp;
  verificationTimeStamp: string;
}

function AadhaarCardInfo(addressCardInfoData: AadhaarCardInfoDataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aadhaar and Address Information</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="grid lg:grid-cols-4 grid-cols-2 gap-5">
          <LabelView title="12-digit Aadhaar Number">
            <p className="font-medium text-sm">
              {addressCardInfoData.aadhaarNumber}
            </p>
          </LabelView>
          <LabelView title="Name as per Aadhaar">
            <p className="font-medium text-sm">
              {addressCardInfoData.name}{" "}
              <StatusBadge
                value={
                  addressCardInfoData.nameVerificationStatus
                    ? "Verified"
                    : "Not Match"
                }
              />
            </p>
          </LabelView>
          <LabelView title="Date of Birth">
            <p className="font-medium text-sm">
              {addressCardInfoData.dateOfBirth}
            </p>
          </LabelView>
          <LabelView title="Gender">
            <p className="font-medium text-sm">{addressCardInfoData.gender}</p>
          </LabelView>
        </div>
      </CardContent>
      <CardContent className="border-t ">
        <CardTitle className="pt-6 mb-5">Permanent Address</CardTitle>
        <AddressCard {...addressCardInfoData.permanentAddress} />
      </CardContent>
      <CardContent className="border-t">
        <CardTitle className="pt-6 mb-5">
          Current Address as per Aadhaar
        </CardTitle>
        <AddressCard {...addressCardInfoData.currentAddress} />
      </CardContent>
      <CardFooter className="border-t">
        <div className="flex flex-col gap-4">
          <CardTitle>Verification Status</CardTitle>
          <LabelView title="Verification Timestamp">
            <p className="font-medium text-sm">
              {addressCardInfoData.verificationTimeStamp}
            </p>
          </LabelView>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AadhaarCardInfo;
