import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import React from "react";

export interface AdditionalInformationDataProps {
  sector: string;
  rating: string;
  remarks: string;
}
const NseAdditionalInformation = (
  additionalInformationData: AdditionalInformationDataProps
) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle> Additional Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-5">
          <LabelView title="Sector">
            <p className="font-medium text-sm">
              {additionalInformationData.sector}
            </p>
          </LabelView>
          <LabelView title="Rating">
            <p className="font-medium text-sm">
              {additionalInformationData.rating}
            </p>
          </LabelView>
          <div className="col-span-2" >
            <LabelView title="Remarks">
            <p className="font-medium text-sm">
              {additionalInformationData.remarks}
            </p>
          </LabelView>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NseAdditionalInformation;
