"use client";

import LabelInput from "@/app/(account)/_components/wrapper/LableInput";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";

const panHanderLeablel = [
  "Second Account Holder PAN*",
  "Third Account Holder PAN",
];

function ManageDematPanInputs({
  index,
  errors,
}: {
  index: number;
  errors?: string[];
}) {
  const { updateDepositoryPan, state, setDepositoryPan } = useKycDataStorage();

  const pansData = state.step_4[index].panNumber;
  const isJoined = state.step_4[index].accountType === "JOINT";

  useEffect(() => {
    if (!isJoined) {
      if (pansData.length != 0) {
        setDepositoryPan(index, [state.step_4[index].panNumber[0]]);
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
              onChange={(e) =>
                updateDepositoryPan(
                  index, // array index of step_4 manage demat account
                  subIndex + 1, // pan number input index not need to +1 for first pan number in "state"
                  e.target.value.toUpperCase()
                )
              }
            />

            {/* Icons — only if isJoined is enabled */}
          </div>
        </LabelInput>
      ))}
    </>
  );
}

export default ManageDematPanInputs;
