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

export interface PanCardInfoProps {
  panCardNumber: string;
  DateOFBirth: string;
  gender: string;
  Name: string;
  nameVerificationStatus: boolean;
  panVerificationStatus: boolean;
  verificationTimeStamp: string;
  confirmTimeStamp?: string;
}

export default function PanCardInfoCard(panCardInfoData: PanCardInfoProps) {
  return (
    <Card id="pan-details">
      <CardHeader>
        <CardTitle className="text-sm">PAN Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="gap-5 grid grid-cols-2 lg:grid-cols-4">
          <LabelView title="PAN Number">
            <p className="text-sm">
              {panCardInfoData.panCardNumber}{" "}
              {!panCardInfoData.panCardNumber.startsWith("----") && (
                <StatusBadge
                  value={
                    panCardInfoData.panVerificationStatus
                      ? "Verified"
                      : "Pending"
                  }
                />
              )}
            </p>
          </LabelView>
          <LabelView title="Date of Birth">
            <p className="text-sm">{panCardInfoData.DateOFBirth}</p>
          </LabelView>
          <LabelView title="Gender">
            <p className="text-sm">{panCardInfoData.gender}</p>
          </LabelView>
          <LabelView title="Full Name">
            <p className="text-sm">
              {panCardInfoData.Name}
              {!panCardInfoData.panCardNumber.startsWith("----") && (
                <StatusBadge
                  value={
                    panCardInfoData.nameVerificationStatus
                      ? "Verified"
                      : "Not Matched"
                  }
                />
              )}
            </p>
          </LabelView>
        </div>
      </CardContent>
      <CardFooter className="flex gap-8 border-t">
        <LabelView title="Verification Timestamp">
          <p className="text-sm">{panCardInfoData.verificationTimeStamp}</p>
        </LabelView>
        <LabelView title="Confirmation Timestamp">
          <p className="text-sm">{panCardInfoData.confirmTimeStamp}</p>
        </LabelView>
      </CardFooter>
    </Card>
  );
}
