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

function AddBankAccountForm() {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Add Bank Account</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex flex-col gap-3 md:gap-5">
          <div className="gap-3 md:gap-5 grid lg:grid-cols-3">
            <LabelInput label="Bank Account Type" required>
              <Input />
            </LabelInput>
            <LabelInput label="Account NO" required>
              <Input />
            </LabelInput>
            <LabelInput label="IFSC Code" required>
              <Input />
            </LabelInput>
          </div>
          <div className="gap-3 md:gap-5 grid lg:grid-cols-2">
            <LabelInput label="Bank Name" required>
              <Input />
            </LabelInput>
            <LabelInput label="Branch" required>
              <Input />
            </LabelInput>
          </div>
          <div className="flex lg:items-center gap-3 text-sm">
            <Checkbox />
            <p>
              I hereby authorise MeraDhan to verify the bank account details
              provided by initiating a nominal amount transfer (₹1) to my
              account for verification purposes
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button className="w-full sm:w-auto">
          Confirm & Continue <MdOutlineArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddBankAccountForm;
