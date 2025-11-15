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
  confirmTimeStamp: string;
}

function AadhaarCardInfo(addressCardInfoData: AadhaarCardInfoDataProps) {
  return (
    <Card id="aadhaar-address">
      <CardHeader>
        <CardTitle className="text-sm">
          Aadhaar and Address Information
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="gap-5 grid grid-cols-2 lg:grid-cols-4">
          <LabelView title="Last 4-digit Aadhaar Number">
            <p className="text-sm">{addressCardInfoData.aadhaarNumber}</p>
          </LabelView>
          <LabelView title="Name as per Aadhaar">
            <p className="text-sm">
              {addressCardInfoData.name}{" "}
              {!addressCardInfoData.aadhaarNumber.startsWith("----") && (
                <StatusBadge
                  value={
                    addressCardInfoData.nameVerificationStatus
                      ? "Verified"
                      : "Not Match"
                  }
                />
              )}
            </p>
          </LabelView>
          <LabelView title="Date of Birth">
            <p className="text-sm">{addressCardInfoData.dateOfBirth}</p>
          </LabelView>
          <LabelView title="Gender">
            <p className="text-sm">{addressCardInfoData.gender}</p>
          </LabelView>
        </div>
      </CardContent>
      <CardContent className="border-t">
        <CardTitle className="mb-5 pt-6 text-sm">Permanent Address</CardTitle>
        <AddressCard {...addressCardInfoData.permanentAddress} />
      </CardContent>
      <CardContent className="border-t">
        <CardTitle className="mb-5 pt-6 text-sm">
          Current Address as per Aadhaar
        </CardTitle>
        <AddressCard {...addressCardInfoData.currentAddress} />
      </CardContent>
      <CardFooter className="border-t">
        <div className="flex  gap-8 flex-col">
          <CardTitle className="text-sm">Verification Status</CardTitle>
          <div className="flex gap-8">
            <LabelView title="Verification Timestamp">
              <p className="text-sm">
                {addressCardInfoData.verificationTimeStamp}
              </p>
            </LabelView>
            <LabelView title="Confirm Timestamp">
              <p className="text-sm">{addressCardInfoData.confirmTimeStamp}</p>
            </LabelView>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default AadhaarCardInfo;
