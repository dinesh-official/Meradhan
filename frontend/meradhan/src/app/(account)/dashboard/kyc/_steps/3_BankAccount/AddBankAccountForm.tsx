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
import { useAddBankAccountFormHook } from "./_hooks/useAddBankAccountFormHook";
import {
  KycDataStorage,
  useKycDataStorage,
} from "../../_store/useKycDataStorage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const accountTypeOptions = [
  { label: "Savings Account", value: "savings" },
  { label: "Current Account", value: "current" },
  { label: "Salary Account", value: "salary" },
  { label: "NRE Account", value: "nre" },
  { label: "NRO Account", value: "nro" },
  { label: "Joint Account", value: "joint" },
];

function AddBankAccountForm() {
  const { error, handleBankAccountSubmit, fetchBankIfsc, isPending } =
    useAddBankAccountFormHook();
  const { updateBankAccount, state, removeBankAccount, nextLocalStep } =
    useKycDataStorage();
  const data = state.step_3[state.step_3.length - 1];

  const updateData = (
    key: keyof KycDataStorage["step_3"][number],
    data: string | boolean | unknown
  ) => {
    updateBankAccount(state.step_3.length - 1, {
      [key]: data,
    });
  };

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Add Bank Account</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex flex-col gap-3 md:gap-5">
          <div className="gap-3 md:gap-5 grid lg:grid-cols-3">
            <LabelInput
              label="Bank Account Type"
              required
              error={error?.bankAccountType?.[0]}
            >
              <Select
                value={data?.bankAccountType}
                onValueChange={(e) => updateData("bankAccountType", e)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypeOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabelInput>
            <LabelInput
              label="Account NO"
              required
              error={error?.accountNumber?.[0]}
            >
              <Input
                onChange={(e) => updateData("accountNumber", e.target.value)}
                value={data?.accountNumber}
              />
            </LabelInput>
            <LabelInput label="IFSC Code" required error={error?.ifscCode?.[0]}>
              <Input
                onChange={(e) => {
                  updateData("ifscCode", e.target.value);
                  if (e.target.value.length >= 11) {
                    fetchBankIfsc.mutate();
                  }
                }}
                value={data?.ifscCode}
              />
            </LabelInput>
          </div>
          <div className="gap-3 md:gap-5 grid lg:grid-cols-2">
            <LabelInput label="Bank Name" required error={error?.bankName?.[0]}>
              <Input
                onChange={(e) => updateData("bankName", e.target.value)}
                value={data?.bankName}
                disabled
                adminMode
              />
            </LabelInput>
            <LabelInput label="Branch" required error={error?.branchName?.[0]}>
              <Input
                onChange={(e) => updateData("branchName", e.target.value)}
                value={data?.branchName}
                disabled
                adminMode
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
              I hereby authorise MeraDhan to verify the bank account details
              provided by initiating a nominal amount transfer (₹1) to my
              account for verification purposes
            </p>
          </label>
          <small className="text-red-500 text-xs">
            {error?.checkTerms?.[0]}
          </small>
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          disabled={isPending}
          className="w-full sm:w-auto"
          onClick={handleBankAccountSubmit}
        >
          Confirm & Continue <MdOutlineArrowRight />
        </Button>
        {state.step_3.length > 1 && (
          <Button
            variant={`link`}
            className="w-full sm:w-auto"
            disabled={isPending}
            onClick={() => {
              removeBankAccount(state.step_3.length - 1);
              nextLocalStep();
            }}
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default AddBankAccountForm;
