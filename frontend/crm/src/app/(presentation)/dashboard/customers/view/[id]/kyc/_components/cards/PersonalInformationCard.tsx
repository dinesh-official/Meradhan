import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import PreviewCard from "./PriviewCard";
import LabelView from "@/global/elements/wrapper/LabelView";
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
}
function PersonalInformationCard(personalInfoCardData:PersonalInformationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 grid grid-cols-2 gap-5">
            <PreviewCard
              url={personalInfoCardData.photoUrl}
              source="uploaded"
              type="Photograph"
            />
            <PreviewCard
              url={personalInfoCardData.signatureUrl}
              source="uploaded"
              type="Signature"
            />
          </div>
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-5 lg:col-span-3 lg:pl-8">
             <LabelView title="Full Name">
              <p className="font-medium text-sm">{personalInfoCardData.fullName}</p>
            </LabelView>
            <LabelView title="Date of Birth">
              <p className="font-medium text-sm">{personalInfoCardData.dateOfBirth}</p>
            </LabelView>
            <LabelView title="Gender">
              <p className="font-medium text-sm">{personalInfoCardData.gender}</p>
            </LabelView>
            <LabelView title="Marital Status">
              <p className="font-medium text-sm">{personalInfoCardData.maritalStatus}</p>
            </LabelView>
            <LabelView title="Father / Spouse's Name">
              <p className="font-medium text-sm">{personalInfoCardData.fatherOrSpouseName}</p>
            </LabelView>
            <LabelView title="Relationship with Person">
              <p className="font-medium text-sm">{personalInfoCardData.relationshipWithPerson}</p>
            </LabelView>
            <LabelView title="Mother's Name">
              <p className="font-medium text-sm">{personalInfoCardData.motherName}</p>
            </LabelView>
            <LabelView title="Qualification">
              <p className="font-medium text-sm">{personalInfoCardData.qualification}</p>
            </LabelView>
            <LabelView title="Occupation Type">
              <p className="font-medium text-sm">{personalInfoCardData.occupationType}</p>
            </LabelView>
            <LabelView title="Annual Gross Income">
              <p className="font-medium text-sm">{personalInfoCardData.annualGrossIncome}</p>
            </LabelView>
            <LabelView title="Nationality">
              <p className="font-medium text-sm">{personalInfoCardData.nationality}</p>
            </LabelView>
            <LabelView title="Residential Status">
              <p className="font-medium text-sm">{personalInfoCardData.residentialStatus}</p>
            </LabelView>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PersonalInformationCard;
