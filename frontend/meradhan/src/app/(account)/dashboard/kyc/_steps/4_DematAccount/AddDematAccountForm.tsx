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
import { makeFullname } from "@/global/utils/formate";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import {
  KycDataStorage,
  useKycDataStorage,
} from "../../_store/useKycDataStorage";
import ManageDematPanInputs from "./_elements/ManageDematPanInputs";
import { useDematAccountFormHook } from "./_hooks/useDematAccountFormHook";
import { findDpId } from "../../_utils/nsdlDpid";
import { findCdslDpId } from "../../_utils/cdslDpid";

function AddDematAccountForm() {
  const { updateDepository, state, removeDepository, nextLocalStep } =
    useKycDataStorage();
  const data = state.step_4[state.step_4.length - 1];
  const { handelSubmit, error, isPending, removeError } =
    useDematAccountFormHook();

  // user for update state data with type safety
  const updateData = (
    key: keyof KycDataStorage["step_4"][number],
    data: string | boolean | unknown,
  ) => {
    removeError(key);
    updateDepository(state.step_4.length - 1, {
      [key]: data,
    });
  };

  // Sync "PAN Number" and "Account Holder Name" from Step 1 auto fill
  useEffect(() => {
    if (state.step_1.pan.panCardNo != data.panNumber?.[0]) {
      // update first index of pan number array with step 1 pan card no
      updateData("panNumber", [
        state.step_1.pan.panCardNo,
        ...data.panNumber?.slice(1),
      ]);
      updateData(
        "accountHolderName",
        makeFullname({
          firstName: state.step_1.pan.firstName,
          middleName: state.step_1.pan.middleName,
          lastName: state.step_1.pan.lastName,
        }),
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
          {/* 3 for CDSL  */}
          <div
            className={cn("gap-3 md:gap-5 grid md:grid-cols-2 lg:grid-cols-4")}
          >
            <LabelInput
              label="Depository Name"
              required
              error={error?.depositoryName?.[0]}
            >
              <Select
                value={data?.depositoryName}
                onValueChange={(e) => {
                  updateData("depositoryParticipantName", "");
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
                  onChange={(e) => {
                    updateData("dpId", e.target.value);
                    if (data.depositoryName == "NSDL") {
                      const name = findDpId(e.target.value);
                      updateData("depositoryParticipantName", name || "");
                    } else {
                      const name = findCdslDpId(e.target.value);
                      updateData("depositoryParticipantName", name || "");
                    }
                  }}
                />
              </LabelInput>
            )}

            {/* // Beneficiary (mens CDSL ID)  / Client ID */}
            <LabelInput
              label="Beneficiary / Client ID"
              required
              error={error?.beneficiaryClientId?.[0]}
              className={data.depositoryName == "CDSL" ? "lg:col-span-2" : ""}
            >
              <Input
                value={data.beneficiaryClientId}
                onChange={(e) => {
                  updateData("beneficiaryClientId", e.target.value);
                  if (data.depositoryName != "NSDL") {
                    const name = findCdslDpId(e.target.value);
                    updateData("depositoryParticipantName", name || "");
                  }
                }}
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
                    updateData("panNumber", [state.step_1.pan.panCardNo]);
                  } else {
                    updateData("panNumber", [
                      state.step_1.pan.panCardNo,
                      "",
                      "",
                    ]);
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

          <div className="gap-3 md:gap-5 grid md:grid-cols-3">
            <LabelInput
              label="Depository Participant Name"
              required
              error={error?.depositoryParticipantName?.[0]}
            >
              <Input
                disabled
                adminMode
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
                // onChange={(e) =>
                //   updateData("panNumber", [
                //     e.target.value,
                //     ...data.panNumber?.slice(1),
                //   ])
                // }
                disabled
                adminMode
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
              // for use get last index of step_4 array mins last item update [{A1},{A2},{manage new account index}]
              index={state.step_4.length - 1}
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
          Continue to Verify{" "}
          <div className="flex justify-center items-center p-0 h-full">
            <IoMdArrowDropright className="p-0 text-4xl" />
          </div>
        </Button>

        {/* // if add more than 1 demat account then show cancel button */}
        {state.step_4.length > 1 && (
          <Button
            variant={`link`}
            className="flex items-center gap-1 w-full sm:w-auto"
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
