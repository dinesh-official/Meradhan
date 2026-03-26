"use client";
import { useKycDataStorage } from "../../_store/useKycDataStorage";
import IdentityValidationAadharInfo from "./1_panAndAadhar/IdentityValidationAadharInfo";
import IdentityValidationForm from "./1_panAndAadhar/IdentityValidationForm";
import IdentityValidationPanInfo from "./1_panAndAadhar/IdentityValidationPanInfo";
import AdharInfoForm from "./1_panAndAadhar/AdharInfoForm";
import KraInfoStep from "./2_kraInfo/KraInfoStep";
import IdentityValidationCaptureSelfie from "./2_selfie/IdentityValidationCaptureSelfie";
import IdentityValidationSelfiePreview from "./2_selfie/IdentityValidationSelfiePreview";
import IdentityValidationAddSign from "./3_sign/IdentityValidationAddSign";
import IdentityValidationPreviewSign from "./3_sign/IdentityValidationPreviewSign";

function IdentityValidationStep() {
  const { state } = useKycDataStorage();
  const Steps = [
    <IdentityValidationForm key={0} />,
    <KraInfoStep key={1} />,
    <IdentityValidationPanInfo key={2} />,
    <AdharInfoForm key={3} />,
    <IdentityValidationAadharInfo key={4} />,
    <IdentityValidationCaptureSelfie key={5} />,
    <IdentityValidationSelfiePreview key={6} />,
    <IdentityValidationAddSign key={7} />,
    <IdentityValidationPreviewSign key={8} />,
  ];
  return <>{Steps[state.stepIndex]}</>;
}

export default IdentityValidationStep;
