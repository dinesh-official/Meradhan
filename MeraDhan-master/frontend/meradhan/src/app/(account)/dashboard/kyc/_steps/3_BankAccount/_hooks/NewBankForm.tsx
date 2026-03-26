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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { IoMdArrowDropright } from "react-icons/io";
import { BankAccountData } from "../../../_store/useKycDataStorage";
const accountTypeOptions = [
  { label: "Savings Account", value: "savings" },
  { label: "Current Account", value: "current" },
  // { label: "Salary Account", value: "salary" },
  // { label: "NRE Account", value: "nre" },
  // { label: "NRO Account", value: "nro" },
  // { label: "Joint Account", value: "joint" },
];

function NewBankForm({
  data,
  updateData,
  error,
  fetchBankIfsc,
  isPending,
  handleBankAccountSubmit,
  showCancel,
  onCancel,
  showSetDefault,
}: {
  data: BankAccountData;
  updateData: (
    key: keyof BankAccountData,
    data: string | boolean | unknown
  ) => void;
  error?: Record<string, string[]>;
  fetchBankIfsc?: () => void;
  isPending?: boolean;
  handleBankAccountSubmit?: () => void;
  showCancel?: boolean;
  onCancel?: () => void;
  showSetDefault?: boolean;
}) {
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
              label="Account Number"
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
                  updateData("ifscCode", e.target.value.toUpperCase());
                  if (e.target.value.length >= 11) {
                    fetchBankIfsc?.();
                  }
                }}
                value={data?.ifscCode}
              />
            </LabelInput>
          </div>
          <div
            className={cn(
              "gap-3 md:gap-5 grid lg:grid-cols-2",
              showSetDefault && "lg:grid-cols-3"
            )}
          >
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
            {showSetDefault && (
              <label className="flex lg:items-center gap-3 text-sm">
                <Checkbox
                  onClick={() => {
                    updateData("isDefault", !data?.isDefault);
                  }}
                  checked={data?.isDefault}
                />
                <p>Use this as Default Bank Account</p>
              </label>
            )}
          </div>
          <label className="flex gap-3 text-sm">
            <Checkbox
              onClick={() => {
                updateData("checkTerms", !data?.checkTerms);
              }}
              checked={data?.checkTerms}
              className="mt-0.5"
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
          className="flex items-center gap-1 w-full sm:w-auto"
          onClick={handleBankAccountSubmit}
        >
          Continue to Verify{" "}
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>
        {showCancel && (
          <Button
            variant={`link`}
            className="flex items-center gap-1 w-full sm:w-auto"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default NewBankForm;
