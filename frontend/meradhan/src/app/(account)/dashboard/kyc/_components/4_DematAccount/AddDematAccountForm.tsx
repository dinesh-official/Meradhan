"use client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ManageDematPanInputs from "./_elements/ManageDematPanInputs";
import {
  KycDataStorage,
  useKycDataStorage,
} from "../../_store/useKycDataStorage";
import { useDematAccountFormHook } from "./_hooks/useDematAccountFormHook";
function AddDematAccountForm() {
  const { updateDepository, state } = useKycDataStorage();
  const data = state.step_4[state.step_4.length - 1];
  const { handelSubmit, error } = useDematAccountFormHook();

  const updateData = (
    key: keyof KycDataStorage["step_4"][number],
    data: string | boolean | unknown
  ) => {
    updateDepository(state.step_4.length - 1, {
      [key]: data,
    });
  };

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-medium">Add Demat Account</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex flex-col gap-3 md:gap-5">
          <div className="gap-3 md:gap-5 grid lg:grid-cols-4">
            <LabelInput
              label="Depository Name"
              required
              error={error?.depositoryName?.[0]}
            >
              <Select
                value={data?.depositoryName}
                onValueChange={(e) => updateData("depositoryName", e)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">CDSL</SelectItem>
                  <SelectItem value="dark">NSDL</SelectItem>
                </SelectContent>
              </Select>
            </LabelInput>
            <LabelInput label="DP ID" required error={error?.dpId?.[0]}>
              <Input
                value={data?.dpId}
                onChange={(e) => updateData("dpId", e.target.value)}
              />
            </LabelInput>
            <LabelInput
              label="Beneficiary / Client ID"
              required
              error={error?.beneficiaryClientId?.[0]}
            >
              <Input
                value={data.beneficiaryClientId}
                onChange={(e) =>
                  updateData("beneficiaryClientId", e.target.value)
                }
              />
            </LabelInput>

            <LabelInput
              label="Account Type"
              required
              error={error?.accountType?.[0]}
            >
              <Select
                value={data?.accountType}
                onValueChange={(e) => {
                  updateData("accountType", e);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Single</SelectItem>
                  <SelectItem value="JOINT">Joint</SelectItem>
                  <SelectItem value="HUF">HUF</SelectItem>
                </SelectContent>
              </Select>
            </LabelInput>
          </div>
          <div className="gap-3 md:gap-5 grid lg:grid-cols-3">
            <LabelInput
              label="Depository Participant Name"
              required
              error={error?.depositoryParticipantName?.[0]}
            >
              <Input
                value={data?.depositoryParticipantName}
                onChange={(e) =>
                  updateData("depositoryParticipantName", e.target.value)
                }
              />
            </LabelInput>

            {/* <Input /> */}
            <ManageDematPanInputs index={0} errors={error?.panNumber} />

            <LabelInput
              label="Account Holder Name"
              required
              error={error?.accountHolderName?.[0]}
            >
              <Input
                value={data?.accountHolderName}
                onChange={(e) =>
                  updateData("accountHolderName", e.target.value)
                }
              />
            </LabelInput>
          </div>
          <label className="flex lg:items-center gap-3 text-sm">
            <Checkbox
              onClick={() => {
                updateData("checkTerms", !data?.checkTerms);
              }}
              checked={data?.checkTerms}
            />
            <p>
              I hereby authorize MeraDhan to verify my Demat account details
              provided herein for the purpose of completing KYC and investment
              onboarding, in accordance with applicable regulatory guidelines.
            </p>
          </label>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button className="w-full sm:w-auto" onClick={handelSubmit}>
          Confirm & Verify <MdOutlineArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddDematAccountForm;
