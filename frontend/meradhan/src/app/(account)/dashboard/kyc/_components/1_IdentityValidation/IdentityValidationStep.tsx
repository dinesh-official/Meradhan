"use client";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import IdentityValidationAadharInfo from "./1_panAndAadhar/IdentityValidationAadharInfo";
import IdentityValidationForm from "./1_panAndAadhar/IdentityValidationForm";
import IdentityValidationPanInfo from "./1_panAndAadhar/IdentityValidationPanInfo";
import IdentityValidationCaptureSelfie from "./2_selfie/IdentityValidationCaptureSelfie";
import IdentityValidationSelfiePreview from "./2_selfie/IdentityValidationSelfiePreview";
import IdentityValidationAddSign from "./3_sign/IdentityValidationAddSign";
import IdentityValidationPreviewSign from "./3_sign/IdentityValidationPreviewSign";

function IdentityValidationStep() {
  const { state } = useKycDataStorage();

  const Steps = [
    <IdentityValidationForm key={0} />,
    <IdentityValidationPanInfo key={1} />,
    <IdentityValidationAadharInfo key={2} />,
    <IdentityValidationCaptureSelfie key={3} />,
    <IdentityValidationSelfiePreview key={4} />,
    <IdentityValidationAddSign key={5} />,
    <IdentityValidationPreviewSign key={6} />,
  ];
  return <>{Steps[state.stepIndex]}</>;
}

export default IdentityValidationStep;
