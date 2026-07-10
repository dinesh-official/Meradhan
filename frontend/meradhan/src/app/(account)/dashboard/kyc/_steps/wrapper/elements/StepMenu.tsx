"use client";
import {
  FaFileSignature,
  FaFingerprint,
  FaUniversity,
  FaUser,
} from "react-icons/fa";
import { HiIdentification } from "react-icons/hi2";
import { MdOutlineAssessment } from "react-icons/md";
import { useKycStepStore } from "../../../_store/useKycStepStore";
import { KycSteListItem } from "./KycSteListItem";

export function StepMenu() {
  const { step, isComplete } = useKycStepStore();

  return (
    <div className="pb-4 overflow-hidden overflow-x-auto scrollbar-hide">
      <div className="border-gray-200 border-b lg:border-b-0 min-w-[580px] lg:min-w-auto">
        <div className="flex flex-row lg:flex-col gap-5 lg:gap-0">
          <KycSteListItem
            icon={<FaFingerprint />}
            label="Identity Validation"
            isActive={step === 1}
            isDone={step > 1 || isComplete}
          />
          <KycSteListItem
            icon={<FaUser />}
            label="Personal Details"
            isActive={step === 2}
            isDone={step > 2 || isComplete}
          />
          <KycSteListItem
            icon={<FaUniversity />}
            label="Bank Account"
            isActive={step === 3}
            isDone={step > 3 || isComplete}
          />
          <KycSteListItem
            icon={<HiIdentification />}
            label="Demat Account"
            isActive={step === 4}
            isDone={step > 4 || isComplete}
          />
          <KycSteListItem
            icon={<MdOutlineAssessment />}
            label="Risk Profiling"
            isActive={step === 5}
            isDone={step > 5 || isComplete}
          />
          <KycSteListItem
            icon={<FaFileSignature />}
            label="e-Signature"
            isActive={step === 6}
            isDone={isComplete}
          />
        </div>
      </div>
    </div>
  );
}
