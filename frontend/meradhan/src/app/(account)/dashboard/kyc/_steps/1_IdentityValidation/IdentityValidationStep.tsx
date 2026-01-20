"use client";
import { useKycDataProvider } from "../../_context/KycDataProvider";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import IdentityValidationAadharInfo from "./1_panAndAadhar/IdentityValidationAadharInfo";
import IdentityValidationForm from "./1_panAndAadhar/IdentityValidationForm";
import IdentityValidationPanInfo from "./1_panAndAadhar/IdentityValidationPanInfo";
import IdentityValidationCaptureSelfie from "./2_selfie/IdentityValidationCaptureSelfie";
import IdentityValidationSelfiePreview from "./2_selfie/IdentityValidationSelfiePreview";
import IdentityValidationAddSign from "./3_sign/IdentityValidationAddSign";
import IdentityValidationPreviewSign from "./3_sign/IdentityValidationPreviewSign";
import AdharInfoForm from "./1_panAndAadhar/AdharInfoForm";

function IdentityValidationStep() {
  const { state } = useKycDataStorage();
  const Steps = [
    <IdentityValidationForm key={0} />,
    <IdentityValidationPanInfo key={1} />,
    <AdharInfoForm key={2} />,
    <IdentityValidationAadharInfo key={3} />,
    <IdentityValidationCaptureSelfie key={4} />,
    <IdentityValidationSelfiePreview key={5} />,
    <IdentityValidationAddSign key={6} />,
    <IdentityValidationPreviewSign key={7} />,
  ];
  return <>{Steps[state.stepIndex]}</>;
}

export default IdentityValidationStep;
