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
import { MdOutlineArrowRight } from "react-icons/md";
import { useEffect } from "react";
import { KycDataStorage } from "@/app/(account)/dashboard/kyc/_store/useKycDataStorage";
function NewDematAccount({
  data,
  error,
  handelSubmit,
  isPending,
  updateData,
  myPan,
  showCancel,
  onCancel,
}: {
  data: KycDataStorage["step_4"][number];
  error?: Partial<Record<keyof KycDataStorage["step_4"][number], string[]>>;
  updateData: (
    key: keyof KycDataStorage["step_4"][number],
    data: string | boolean | unknown,
  ) => void;
  handelSubmit: () => void;
  isPending: boolean;
  myPan: string;
  showCancel?: boolean;
  onCancel?: () => void;
}) {
  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Add Demat Account</CardTitle>
      </CardHeader>
      <CardContent accountMode>
        <div className="flex flex-col gap-3 md:gap-5">
          {/* 3 for CDSL  */}
          <div
            className={cn(
              "gap-3 md:gap-5 grid lg:grid-cols-4",
              data.depositoryName === "CDSL" && "lg:grid-cols-3",
            )}
          >
            <LabelInput
              label="Depository Name"
              required
              error={error?.depositoryName?.[0]}
            >
              <Select
                value={data?.depositoryName}
                onValueChange={(e) => {
                  updateData("depositoryName", e);
                  // Clear DP ID if changing from NSDL to CDSL
                  if (e === "CDSL") {
                    updateData("dpId", "");
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDSL">CDSL</SelectItem>
                  <SelectItem value="NSDL">NSDL</SelectItem>
                </SelectContent>
              </Select>
            </LabelInput>

            {/* // Only for NSDL */}
            {data.depositoryName == "NSDL" && (
              <LabelInput label="DP ID" required error={error?.dpId?.[0]}>
                <Input
                  value={data?.dpId}
                  onChange={(e) => updateData("dpId", e.target.value)}
                />
              </LabelInput>
            )}

            {/* // Beneficiary (mens CDSL ID)  / Client ID */}
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

            {/* // Account Type */}
            <LabelInput
              label="Account Type"
              required
              error={error?.accountType?.[0]}
            >
              <Select
                value={data?.accountType}
                onValueChange={(e) => {
                  updateData("accountType", e);
                  if (e == "SOLO") {
                    updateData("panNumber", [myPan]);
                  } else {
                    updateData("panNumber", [myPan, "", ""]);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOLO">Solo</SelectItem>
                  <SelectItem value="JOINT">Joint</SelectItem>
                </SelectContent>
              </Select>
            </LabelInput>
          </div>

          {/* // Info text for Joint Account */}
          {data.accountType === "JOINT" && (
            <p className="text-sm">
              If you are adding a joint Demat account, please ensure that you
              are the primary holder, and that your PAN is the verified one.
            </p>
          )}

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

            {/* //  Primary Account Holder Details (PAN & Name) - Auto filled from Step 1 */}
            <LabelInput
              label="Primary Account Holder PAN"
              required
              error={error?.panNumber?.[0]}
            >
              <Input
                value={data?.panNumber[0]}
                disabled
                onChange={(e) =>
                  updateData("panNumber", [
                    e.target.value,
                    ...data.panNumber?.slice(1),
                  ])
                }
              // disabled
              // adminMode
              />
            </LabelInput>

            <LabelInput
              label="Name as per PAN"
              required
              error={error?.accountHolderName?.[0]}
            >
              <Input
                value={data?.accountHolderName}
                onChange={(e) =>
                  updateData("accountHolderName", e.target.value)
                }
                disabled
                adminMode
              />
            </LabelInput>

            {/* <Input /> */}
            {/* // Manage Other Account Holders PAN Inputs */}
            <ManageDematPanInputs
              data={data}
              updateData={updateData}
              errors={error?.panNumber}
            />
          </div>
          {/* // Terms and conditions checkbox */}
          <label className="flex lg:items-start gap-3 text-sm">
            <Checkbox
              onClick={() => {
                updateData("checkTerms", !data?.checkTerms);
              }}
              className="lg:mt-0.5"
              checked={data?.checkTerms}
            />
            <p>
              I hereby authorize MeraDhan to verify my Demat account details
              provided herein for the purpose of completing KYC and investment
              onboarding, in accordance with applicable regulatory guidelines.
            </p>
          </label>

          {error?.checkTerms?.[0] && (
            <small className="text-red-600 text-xs">
              {error?.checkTerms?.[0]}
            </small>
          )}
        </div>
      </CardContent>
      <CardFooter accountMode className="sm:flex-row flex-col gap-5">
        <Button
          className="flex items-center gap-1 w-full sm:w-auto"
          onClick={handelSubmit}
          disabled={isPending}
        >
          Continue to Verify <MdOutlineArrowRight />
        </Button>

        {/* // if add more than 1 demat account then show cancel button */}
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

export default NewDematAccount;

const panHanderLeablel = [
  "Second Account Holder PAN*",
  "Third Account Holder PAN",
];

function ManageDematPanInputs({
  errors,
  data,
  updateData,
}: {
  errors?: string[];
  data: KycDataStorage["step_4"][number];
  updateData: (
    key: keyof KycDataStorage["step_4"][number],
    data: string | boolean | unknown,
  ) => void;
}) {
  const pansData = data.panNumber;
  const isJoined = data.accountType === "JOINT";

  useEffect(() => {
    if (!isJoined) {
      if (pansData.length != 0) {
        updateData("panNumber", [data.panNumber[0]]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isJoined]);

  return (
    <>
      {pansData.slice(1, 3).map((item, subIndex) => (
        <LabelInput
          label={(isJoined && panHanderLeablel?.[subIndex]) || "PAN Number"}
          // required={subIndex != 2}
          key={subIndex}
          error={errors?.[subIndex + 1]}
        >
          <div className="relative">
            <Input
              className="peer pe-9"
              type="text"
              maxLength={10}
              value={item}
              disabled={false}
              onChange={(e) =>
                updateData("panNumber", [
                  data.panNumber[0],
                  ...data.panNumber
                    .slice(1)
                    .map((pan, idx) =>
                      idx === subIndex ? e.target.value.toUpperCase() : pan,
                    ),
                ])
              }
            />

            {/* Icons — only if isJoined is enabled */}
          </div>
        </LabelInput>
      ))}
    </>
  );
}
