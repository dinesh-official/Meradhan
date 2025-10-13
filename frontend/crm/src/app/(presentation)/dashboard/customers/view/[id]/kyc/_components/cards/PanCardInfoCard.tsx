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

export interface PanCardInfoProps {
  panCardNumber: string;
  DateOFBirth: String;
  gender: String;
  Name: string;
  nameVerificationStatus: boolean;
  panVerificationStatus: boolean;
  verificationTimeStamp: String;
}

export default function PanCardInfoCard(panCardInfoData: PanCardInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PAN Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-4 grid-cols-2 gap-5">
          <LabelView title="PAN Number">
            <p className="font-medium text-sm">
              {panCardInfoData.panCardNumber}{" "}
              <StatusBadge
                value={
                  panCardInfoData.panVerificationStatus ? "Verified" : "Pending"
                }
              />
            </p>
          </LabelView>
          <LabelView title="Date of Birth">
            <p className="font-medium text-sm">{panCardInfoData.DateOFBirth}</p>
          </LabelView>
          <LabelView title="Gender">
            <p className="font-medium text-sm">{panCardInfoData.gender}</p>
          </LabelView>
          <LabelView title="Full Name">
            <p className="font-medium text-sm">
              {panCardInfoData.Name}{" "}
              <StatusBadge
                value={
                  panCardInfoData.nameVerificationStatus
                    ? "Verified"
                    : "Pending"
                }
              />{" "}
            </p>
          </LabelView>
        </div>
      </CardContent>
      <CardFooter className="border-t">
        <LabelView title="Verification Timestamp">
          <p className="font-semibold text-sm">
            {panCardInfoData.verificationTimeStamp}
          </p>
        </LabelView>
      </CardFooter>
    </Card>
  );
}
