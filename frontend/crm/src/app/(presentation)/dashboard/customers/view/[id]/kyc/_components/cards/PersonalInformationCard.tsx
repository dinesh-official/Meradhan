import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import PreviewCard from "./PriviewCard";
import LabelView from "@/global/elements/wrapper/LabelView";
import { genMediaUrl } from "@/global/utils/url.utils";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
export interface PersonalInformationCardProps {
  photoUrl: string;
  signatureUrl: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  fatherOrSpouseName: string;
  relationshipWithPerson: string;
  motherName: string;
  qualification: string;
  occupationType: string;
  annualGrossIncome: string;
  nationality: string;
  residentialStatus: string;
  faceTimeStamp?: string,
  signTimeStamp?: string
}
function PersonalInformationCard(personalInfoCardData: PersonalInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm" >Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="gap-8 grid lg:grid-cols-5">
          <div className="gap-5 grid grid-cols-2 lg:col-span-2">
            <div>
              <PreviewCard
                url={genMediaUrl(personalInfoCardData.photoUrl)}
                source="uploaded"
                type="Photograph"
              />
              {personalInfoCardData.faceTimeStamp && <p className="text-center text-xs mt-3" >Confirmd At: {dateTimeUtils.formatDateTime(personalInfoCardData.faceTimeStamp, "DD MMM YYYY hh:mm:ss AA")}</p>}
            </div>
            <div>
              <PreviewCard
                url={genMediaUrl(personalInfoCardData.signatureUrl)}
                source="uploaded"
                type="Signature"
              />
              {personalInfoCardData.signTimeStamp && <p className="text-center text-xs mt-3" >Confirmd At: {dateTimeUtils.formatDateTime(personalInfoCardData.signTimeStamp, "DD MMM YYYY hh:mm:ss AA")}</p>}

            </div>
          </div>
          <div className="gap-5 grid grid-cols-2 lg:grid-cols-3 lg:col-span-3 lg:pl-8">
            <LabelView title="Full Name">
              <p className="text-sm">{personalInfoCardData.fullName}</p>
            </LabelView>
            <LabelView title="Date of Birth">
              <p className="text-sm">{personalInfoCardData.dateOfBirth}</p>
            </LabelView>
            <LabelView title="Gender">
              <p className="text-sm">{personalInfoCardData.gender}</p>
            </LabelView>
            <LabelView title="Marital Status">
              <p className="text-sm">{personalInfoCardData.maritalStatus}</p>
            </LabelView>
            <LabelView title="Father / Spouse's Name">
              <p className="text-sm">{personalInfoCardData.fatherOrSpouseName}</p>
            </LabelView>
            <LabelView title="Relationship with Person">
              <p className="text-sm">{personalInfoCardData.relationshipWithPerson}</p>
            </LabelView>
            <LabelView title="Mother's Name">
              <p className="text-sm">{personalInfoCardData.motherName}</p>
            </LabelView>
            <LabelView title="Qualification">
              <p className="text-sm">{personalInfoCardData.qualification}</p>
            </LabelView>
            <LabelView title="Occupation Type">
              <p className="text-sm">{personalInfoCardData.occupationType}</p>
            </LabelView>
            <LabelView title="Annual Gross Income">
              <p className="text-sm">{personalInfoCardData.annualGrossIncome}</p>
            </LabelView>
            <LabelView title="Nationality">
              <p className="text-sm">{personalInfoCardData.nationality}</p>
            </LabelView>
            <LabelView title="Residential Status">
              <p className="text-sm">{personalInfoCardData.residentialStatus}</p>
            </LabelView>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PersonalInformationCard;
