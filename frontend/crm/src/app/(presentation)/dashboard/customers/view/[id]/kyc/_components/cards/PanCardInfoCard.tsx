import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LabelView from "@/global/elements/wrapper/LabelView";
import StatusBadge from "@/global/elements/wrapper/StatusBadge";
import React from "react";

export default function PanCardInfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PAN Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-4 grid-cols-2 gap-5">
          <LabelView title="PAN Number">
            <p className="font-medium">
              AVEPK6139M <StatusBadge value="Verified" />
            </p>
          </LabelView>
          <LabelView title="Date of Birth">
            <p className="font-medium">1983-05-30</p>
          </LabelView>
          <LabelView title="Gender">
            <p className="font-medium">MALE</p>
          </LabelView>
          <LabelView title="Full Name">
            <p className="font-medium">
              Vikas Kukreja <StatusBadge value="Verified" />{" "}
            </p>
          </LabelView>
        </div>
      </CardContent>
    </Card>
  );
}
