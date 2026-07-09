"use client";
import IdentityValidationStep from "./_steps/1_IdentityValidation/IdentityValidationStep";
import PersonalDetailsForm from "./_steps/2_PersonalDetails/PersonalDetailsForm";
import BankKycStepView from "./_steps/3_BankAccount/BankKycStepView";
import DematKycStepView from "./_steps/4_DematAccount/DematKycStepView";
import RiskProfilingCard from "./_steps/5_RiskProfiling/RiskProfilingCard";
import KycESign from "./_steps/6_E_Signature/KycESign";
import FinishKyc from "./_steps/End_Finish/FinishKyc";
import { useKycStepStore } from "./_store/useKycStepStore";
import StarterKycStep from "./_steps/1_IdentityValidation/StarterKyc";
import { useEffect } from "react";
import { useKycDataStorage } from "./_store/useKycDataStorage";

const stepList = [
  <StarterKycStep key={0} />,
  <IdentityValidationStep key={1} />,
  <PersonalDetailsForm key={2} />,
  <BankKycStepView key={3} />,
  <DematKycStepView key={4} />,
  <RiskProfilingCard key={5} />,
  <KycESign key={6} />,
];

function KycFlowStepsView() {
  const { step, isComplete } = useKycStepStore();
  const { state } = useKycDataStorage();

  useEffect(() => {
    // make scroll to top
    window?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, state.stepIndex]);

  if (isComplete) {
    return <FinishKyc key={6} />;
  }
  return <>{stepList?.[step]}</>;
}

export default KycFlowStepsView;
