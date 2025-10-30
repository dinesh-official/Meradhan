"use client";
import IdentityValidationStep from "./_components/1_IdentityValidation/IdentityValidationStep";
import PersonalDetailsForm from "./_components/2_PersonalDetails/PersonalDetailsForm";
import BankKycStepView from "./_components/3_BankAccount/BankKycStepView";
import DematKycStepView from "./_components/4_DematAccount/DematKycStepView";
import RiskProfilingCard from "./_components/5_RiskProfiling/RiskProfilingCard";
import KycESign from "./_components/6_E_Signature/KycESign";
import { useKycStepStore } from "./_store/useKycStepStore";

const stepList = [
  <IdentityValidationStep key={0} />,
  <PersonalDetailsForm key={1} />,
  <BankKycStepView key={2} />,
  <DematKycStepView key={3} />,
  <RiskProfilingCard key={4} />,
  <KycESign key={5} />,
  <></>,
  <></>,
  <></>,
];

function KycFlowStepsView() {
  const { step } = useKycStepStore();
  return <>{stepList?.[step - 1]}</>;
}

export default KycFlowStepsView;
