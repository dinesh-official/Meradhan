"use client";
import { useKycStepStore } from "../../_store/useKycStepStore";
import { StepMenu } from "./elements/StepMenu";

function KycWorkSpace({ children }: { children?: React.ReactNode }) {
  const { step, isComplete } = useKycStepStore();

  const steps = [
    "KYC Requirements",
    "Identity Validation",
    "Personal Details",
    "Bank Account",
    "Demat Account",
    "Risk Profiling",
    "e-Signature",
    "Congratulations!",
  ];

  return (
    <div className="lg:flex justify-start items-start gap-10">
      <div className="mb-8 lg:mb-0 w-full lg:max-w-[220px]">
        <div className="flex justify-between items-center pb-5 border-gray-200 border-b lg:border-none">
          <h2 className="font-medium text-2xl">
            My <span className="font-semibold">KYC</span>
          </h2>

          <p className="lg:hidden text-black">Step {step} of 6</p>

        </div>
        <StepMenu />
      </div>
      <div className="w-full">
        <p className="hidden lg:flex items-center gap-4 font-medium text-lg">
          {steps[step]}
          {!isComplete &&
            (step == 0 ? (
              <></>
            ) : (
              <span className="text-gray-600 text-xs">Step {step} of 6</span>
            ))}
        </p>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export default KycWorkSpace;
