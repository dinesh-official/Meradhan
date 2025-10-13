import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import PreviewCard from "./PriviewCard";
import LabelView from "@/global/elements/wrapper/LabelView";

function PersonalInformationCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 grid grid-cols-2 gap-5">
            <PreviewCard
              url="/images/user.jpeg"
              source="uploaded"
              type="Photograph"
            />
            <PreviewCard
              url="/images/sign.jpg"
              source="uploaded"
              type="Signature"
            />
          </div>
          <div className="grid lg:grid-cols-3 grid-cols-2 gap-5 lg:col-span-3 lg:pl-8">
            <LabelView title="Full Name">
              <p className="font-medium text-sm">Vikas Kukreja</p>
            </LabelView>
            <LabelView title="Date of Birth">
              <p className="font-medium text-sm">1983-05-30</p>
            </LabelView>
            <LabelView title="Gender">
              <p className="font-medium text-sm">MALE</p>
            </LabelView>
            <LabelView title="Marital Status">
              <p className="font-medium text-sm">Not provided</p>
            </LabelView>
            <LabelView title="Father / Spouse's Name">
              <p className="font-medium text-sm">Not provided</p>
            </LabelView>
            <LabelView title="Relationship with Person">
              <p className="font-medium text-sm">Not provided</p>
            </LabelView>
            <LabelView title="Mother's Name">
              <p className="font-medium text-sm">Not provided</p>
            </LabelView>
            <LabelView title="Qualification">
              <p className="font-medium text-sm">Not provided</p>
            </LabelView>
            <LabelView title="Occupation Type">
              <p className="font-medium text-sm">Not provided</p>
            </LabelView>
            <LabelView title="Annual Gross Income">
              <p className="font-medium text-sm">Not provided</p>
            </LabelView>
            <LabelView title="Nationality">
              <p className="font-medium text-sm">Not provided</p>
            </LabelView>
            <LabelView title="Residential Status">
              <p className="font-medium text-sm">Residential Status</p>
            </LabelView>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PersonalInformationCard;
