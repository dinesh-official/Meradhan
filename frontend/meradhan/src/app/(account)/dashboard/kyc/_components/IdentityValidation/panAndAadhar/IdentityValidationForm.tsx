import LabelInput from "@/app/(account)/_components/wrapper/LableInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import React from "react";
import { MdOutlineArrowRight } from "react-icons/md";

function IdentityValidationForm() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Enter PAN Details</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="gap-3 md:gap-5 grid lg:grid-cols-3">
          <div className="gap-3 md:gap-5 grid lg:grid-cols-2 lg:col-span-3">
            <LabelInput label="PAN Number" required>
              <Input type="text" />
            </LabelInput>
            <LabelInput label="Date of Birth" required>
              <Input type="date" />
            </LabelInput>
          </div>
          <LabelInput label="First Name" required>
            <Input type="text" />
          </LabelInput>
          <LabelInput label="Middle Name" required>
            <Input type="text" />
          </LabelInput>
          <LabelInput label="Last Name" required>
            <Input type="text" />
          </LabelInput>
        </div>
        <p className="mt-2 text-gray-500 text-xs">
          * Full name must match exactly as on your PAN Card.
        </p>
        <div className="flex flex-col gap-3 mt-5">
          <p className="flex gap-3 text-sm">
            <Checkbox
              checkClass="text-white"
              className="mt-[2px] border border-gray-200"
            />
            I hereby confirm that I am not a Politically Exposed Person (PEP)
            nor related to any PEP
          </p>
          <p className="flex items-start gap-3 text-sm">
            <Checkbox
              checkClass="text-white"
              className="mt-[2px] border border-gray-200"
            />
            I hereby confirm that I am not a person and/or entity debarred from
            accessing the securities market or dealing in securities, as per
            directions or orders issued by the Securities and Exchange Board of
            India (SEBI), any recognized stock exchange, or other competent
            regulatory authorities from time to time.
          </p>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button className="w-full sm:w-auto">
          Continue To verify <MdOutlineArrowRight />
        </Button>
        <Button variant={`link`}>Save & Exit</Button>
      </CardFooter>
    </Card>
  );
}

export default IdentityValidationForm;
