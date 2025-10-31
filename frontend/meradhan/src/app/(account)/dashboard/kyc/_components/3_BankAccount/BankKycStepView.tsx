"use client";
import React, { memo } from "react";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import AddBankAccountForm from "./AddBankAccountForm";
import VerifyBankAccount from "./VerifyBankAccount";

const stepList = [
  <AddBankAccountForm key={0} />,
  <VerifyBankAccount key={1} />,
];

function BankKycStepView() {
  const { state } = useKycDataStorage();
  return <>
    {stepList?.[state.stepIndex]}
  </>
}
export default memo(BankKycStepView);
