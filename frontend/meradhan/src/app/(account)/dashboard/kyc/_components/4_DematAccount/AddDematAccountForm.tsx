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
import React, { useEffect } from "react";
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
  const { updateDepository, state, removeDepository, nextLocalStep } =
    useKycDataStorage();
  const data = state.step_4[state.step_4.length - 1];
  const { handelSubmit, error, isPending } = useDematAccountFormHook();

  const updateData = (
    key: keyof KycDataStorage["step_4"][number],
    data: string | boolean | unknown
  ) => {
    updateDepository(state.step_4.length - 1, {
      [key]: data,
    });
  };

  useEffect(() => {
    if (state.step_1.pan.panCardNo != data.panNumber?.[0]) {
      updateData("panNumber", [
        state.step_1.pan.panCardNo,
        ...data.panNumber?.slice(1),
      ]);
      updateData(
        "accountHolderName",
        state.step_1.pan.firstName +
          " " +
          state.step_1.pan.middleName +
          " " +
          state.step_1.pan.lastName
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card accountMode>
      <CardHeader accountMode>
        <CardTitle className="font-normal">Add Demat Account</CardTitle>
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
                  <SelectItem value="CDSL" disabled>
                    CDSL (under development)
                  </SelectItem>
                  <SelectItem value="NSDL">NSDL</SelectItem>
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
                  updateData("panNumber", [state.step_1.pan.panCardNo]);
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
            <ManageDematPanInputs
              index={state.step_4.length - 1}
              errors={error?.panNumber}
            />
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
          </div>
          <label className="flex lg:items-start gap-3 text-sm">
            <Checkbox
              onClick={() => {
                updateData("checkTerms", !data?.checkTerms);
              }}
              className="lg:mt-[2px]"
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
          className="w-full sm:w-auto"
          onClick={handelSubmit}
          disabled={isPending}
        >
          Confirm & Verify <MdOutlineArrowRight />
        </Button>
        {state.step_4.length > 1 && (
          <Button
            variant={`link`}
            className="w-full sm:w-auto"
            disabled={isPending}
            onClick={() => {
              removeDepository(state.step_4.length - 1);
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

export default AddDematAccountForm;
