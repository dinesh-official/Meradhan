import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import React from "react";

export interface RecordInformationDataProps {
  created: string;
  lastUpdated: string;
}

const NseRecordInformation = (
  RecordInformationData: RecordInformationDataProps
) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle> Record Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-5">
          <LabelView title="Created">
            <p className="font-medium text-sm">
              {RecordInformationData.created}
            </p>
          </LabelView>
          <LabelView title="Last Updated">
            <p className="font-medium text-sm">
              {RecordInformationData.lastUpdated}
            </p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
};

export default NseRecordInformation;
