"use client";
import IdentityValidationStep from "./_steps/1_IdentityValidation/IdentityValidationStep";
import PersonalDetailsForm from "./_steps/2_PersonalDetails/PersonalDetailsForm";
import BankKycStepView from "./_steps/3_BankAccount/BankKycStepView";
import DematKycStepView from "./_steps/4_DematAccount/DematKycStepView";
import RiskProfilingCard from "./_steps/5_RiskProfiling/RiskProfilingCard";
import KycESign from "./_steps/6_E_Signature/KycESign";
import FinishKyc from "./_steps/End_Finish/FinishKyc";
import { useKycStepStore } from "./_store/useKycStepStore";

const stepList = [
  <IdentityValidationStep key={0} />,
  <PersonalDetailsForm key={1} />,
  <BankKycStepView key={2} />,
  <DematKycStepView key={3} />,
  <RiskProfilingCard key={4} />,
  <KycESign key={5} />,
];

function KycFlowStepsView() {
  const { step, isComplete } = useKycStepStore();
  if (isComplete) {
    return <FinishKyc key={6} />;
  }
  return <>{stepList?.[step - 1]}</>;
}

export default KycFlowStepsView;
