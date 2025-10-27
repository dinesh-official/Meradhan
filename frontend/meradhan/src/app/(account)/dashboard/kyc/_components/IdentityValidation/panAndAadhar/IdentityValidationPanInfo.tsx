import DataInfoLabel from "@/app/(account)/_components/cards/DataInfoLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import { MdOutlineArrowRight } from "react-icons/md";

function IdentityValidationPanInfo() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Confirm PAN Details</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="gap-5 grid md:grid-cols-2 lg:grid-cols-3">
          <DataInfoLabel
            title="PAN Number"
            status="SUCCESS"
            statusLabel="Verify"
            showStatus
          >
            <p className="font-medium">AVEPK6139M</p>
          </DataInfoLabel>
          <DataInfoLabel
            title="Name as per PAN"
            status="SUCCESS"
            statusLabel="Matched"
            showStatus
          >
            <p className="font-medium">VIKAS KUKREJA</p>
          </DataInfoLabel>
          <DataInfoLabel
            title="Date of Birth"
            status="SUCCESS"
            statusLabel="Verified"
            showStatus
          >
            <p className="font-medium">30-05-1983</p>
          </DataInfoLabel>
          <DataInfoLabel
            title="Father’s Name"
            status="SUCCESS"
            statusLabel="Fetched"
            showStatus
          >
            <p className="font-medium">SURENDER PAL KUKREJA</p>
          </DataInfoLabel>
          <DataInfoLabel
            title="Gender"
            status="SUCCESS"
            statusLabel="Verified"
            showStatus
          >
            <p className="font-medium">MALE</p>
          </DataInfoLabel>

          <div className="gap-5 grid lg:grid-cols-3 md:col-span-2 lg:col-span-3">
            <Image
              src="/avatars/person.jpeg"
              alt="PAN Card"
              width={1140}
              height={597}
              className="bg-gray-50 rounded-2xl w-48 object-cover aspect-[3/4]"
            />
            <div className="md:col-span-2">
              <div className="bg-gray-200 rounded-2xl w-full h-64"></div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5 mt-5">
        <Button className="w-full sm:w-auto">
          Continue To verify <MdOutlineArrowRight />
        </Button>
        <Button variant={`link`}>Save & Exit</Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationPanInfo;
