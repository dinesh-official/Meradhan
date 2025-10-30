"use client";
import React from "react";
import { useKycStepStore } from "./_store/useKycStepStore";
import IdentityValidationStep from "./_components/1_IdentityValidation/IdentityValidationStep";
import PersonalDetailsForm from "./_components/2_PersonalDetails/PersonalDetailsForm";
import BankKycStepView from "./_components/3_BankAccount/BankKycStepView";

const stepList = [
  <IdentityValidationStep key={0} />,
  <PersonalDetailsForm key={1} />,
  <BankKycStepView key={2} />,
  <></>,
  <></>,
  <></>,
  <></>,
  <></>,
  <></>,
];

function KycFlowStepsView() {
  const { step } = useKycStepStore();
    return <>
    {step}
       { stepList?.[step - 1]}
    </>
}

export default KycFlowStepsView;
