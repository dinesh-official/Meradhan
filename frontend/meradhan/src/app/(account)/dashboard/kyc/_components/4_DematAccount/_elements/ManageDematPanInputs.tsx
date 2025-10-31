"use client";

import LabelInput from "@/app/(account)/_components/wrapper/LableInput";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";
import { useEffect } from "react";

const panHanderLeablel = [
  "Primary PAN Number",
  "Secondary PAN Number",
  "Tertiary PAN Number",
];

function ManageDematPanInputs({
  index,
  errors,
}: {
  index: number;
  errors?: string[];
}) {
  const {
    addDepositoryPan,
    removeDepositoryPan,
    updateDepositoryPan,
    state,
    setDepositoryPan,
  } = useKycDataStorage();

  const pansData = state.step_4[index].panNumber;
  const MAX_PAN_COUNT = 3;
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
      {pansData.map((item, subIndex) => (
        <LabelInput
          label={(isJoined && panHanderLeablel?.[subIndex]) || "PAN Number"}
          required
          key={subIndex}
          error={errors?.[subIndex]}
        >
          <div className="relative">
            <Input
              className="peer pe-9"
              type="text"
              maxLength={10}
              disabled={subIndex === 0}
              adminMode
              value={item}
              onChange={(e) =>
                updateDepositoryPan(
                  index,
                  subIndex,
                  e.target.value.toUpperCase()
                )
              }
            />

            {/* Icons — only if isJoined is enabled */}
            {isJoined && (
              <div className="absolute inset-y-0 flex justify-center items-center text-muted-foreground/80 end-2">
                {/* ➕ Add new PAN when last item and under max */}
                {subIndex == 0 && pansData.length < MAX_PAN_COUNT ? (
                  <Plus
                    size={18}
                    className="hover:text-primary cursor-pointer"
                    onClick={() => addDepositoryPan(index)}
                  />
                ) : subIndex != 0 ? (
                  // 🗑 Remove existing PAN
                  <Trash
                    size={15}
                    className="text-red-500 cursor-pointer"
                    onClick={() => removeDepositoryPan(index, subIndex)}
                  />
                ) : null}
              </div>
            )}
          </div>
        </LabelInput>
      ))}
    </>
  );
}

export default ManageDematPanInputs;
