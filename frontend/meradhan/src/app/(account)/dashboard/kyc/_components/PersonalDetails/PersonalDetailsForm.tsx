import LabelInput from "@/app/(account)/_components/wrapper/LableInput";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import React from "react";
import { MdOutlineArrowRight } from "react-icons/md";

function PersonalDetailsForm() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Personal Details</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="gap-3 md:gap-5 grid sm:grid-cols-2 lg:grid-cols-3">
          <LabelInput label="Marital Status" required>
            <Input type="text" />
          </LabelInput>
          <LabelInput label="Father’s / Spouse Name" required>
            <Input type="text" />
          </LabelInput>
          <LabelInput label="Relationship with this Person" required>
            <Input type="text" />
          </LabelInput>
          <LabelInput label="Qualification" required>
            <Input type="text" />
          </LabelInput>
          <LabelInput label="Occupation Type" required>
            <Input type="text" />
          </LabelInput>
          <LabelInput label="Annual Gross Income" required>
            <Input type="text" />
          </LabelInput>
          <LabelInput label="Mother’s Name" required>
            <Input type="text" />
          </LabelInput>
          <LabelInput label="Nationality" required>
            <Input type="text" />
          </LabelInput>
          <LabelInput label="Residential Status" required>
            <Input type="text" />
          </LabelInput>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button className="w-full sm:w-auto">
          Save & Continue <MdOutlineArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PersonalDetailsForm;
