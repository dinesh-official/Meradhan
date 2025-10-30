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

function AddDematAccountForm() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Add Demat Account</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex flex-col gap-3 md:gap-5">
          <div className="gap-3 md:gap-5 grid lg:grid-cols-4">
            <LabelInput label="Depository Name" required>
              <Input />
            </LabelInput>
            <LabelInput label="DP ID" required>
              <Input />
            </LabelInput>
            <LabelInput label="Beneficiary / Client ID" required>
              <Input />
            </LabelInput>

            <LabelInput label="Account Type" required>
              <Input />
            </LabelInput>
          </div>
          <div className="gap-3 md:gap-5 grid lg:grid-cols-3">
            <LabelInput label="Depository Participant Name" required>
              <Input />
            </LabelInput>
            <LabelInput label="PAN Number" required>
              <Input />
            </LabelInput>
            <LabelInput label="Account Holder Name" required>
              <Input />
            </LabelInput>
          </div>
          <div className="flex lg:items-center gap-3 text-sm">
            <Checkbox />
            <p>
              I hereby authorize MeraDhan to verify my Demat account details
              provided herein for the purpose of completing KYC and investment
              onboarding, in accordance with applicable regulatory guidelines.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button className="w-full sm:w-auto">
          Confirm & Verify <MdOutlineArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddDematAccountForm;
