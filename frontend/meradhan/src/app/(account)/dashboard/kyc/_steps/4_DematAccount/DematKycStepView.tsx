"use client";
import { memo } from "react";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import AddDematAccountForm from "./AddDematAccountForm";
import VerifyDematAccount from "./VerifyDematAccount";

//  Step List for Demat KYC
const stepList = [
  <AddDematAccountForm key={0} />,
  <VerifyDematAccount key={1} />,
];

function DematKycStepView() {
  const { state } = useKycDataStorage();
  return <>{stepList?.[state.stepIndex]}</>;
}
export default memo(DematKycStepView);
