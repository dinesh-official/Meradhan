import AccountViewPort from "../../_components/wrapper/AccountViewPort";
import IdentityValidationAadharInfo from "./_components/1_IdentityValidation/1_panAndAadhar/IdentityValidationAadharInfo";
import IdentityValidationAddSign from "./_components/1_IdentityValidation/3_sign/IdentityValidationAddSign";
import IdentityValidationCaptureSelfie from "./_components/1_IdentityValidation/2_selfie/IdentityValidationCaptureSelfie";
import IdentityValidationForm from "./_components/1_IdentityValidation/1_panAndAadhar/IdentityValidationForm";
import IdentityValidationPanInfo from "./_components/1_IdentityValidation/1_panAndAadhar/IdentityValidationPanInfo";
import IdentityValidationPreviewSign from "./_components/1_IdentityValidation/3_sign/IdentityValidationPreviewSign";
import IdentityValidationSelfiePreview from "./_components/1_IdentityValidation/2_selfie/IdentityValidationSelfiePreview";
import KycWorkSpace from "./_components/wrapper/KycWorkSpace";
import PersonalDetailsForm from "./_components/2_PersonalDetails/PersonalDetailsForm";
import AddBankAccountForm from "./_components/3_BankAccount/AddBankAccountForm";
import VerifyBankAccount from "./_components/3_BankAccount/VerifyBankAccount";
import AddDematAccountForm from "./_components/4_DematAccount/AddDematAccountForm";
import VerifyDematAccount from "./_components/4_DematAccount/VerifyDematAccount";
import RiskProfilingCard from "./_components/5_RiskProfiling/RiskProfilingCard";
import KycESign from "./_components/6_E_Signature/KycESign";
import FinishKyc from "./_components/End_Finish/FinishKyc";
import KycDataProvider from "./_context/KycDataProvider";
import IdentityValidationStep from "./_components/1_IdentityValidation/IdentityValidationStep";
import KycFlowStepsView from "./KycFlowStepsView";
function KycPage() {
  return (
    <KycDataProvider>
      <AccountViewPort showSideBar={false}>
        <KycWorkSpace>
          <KycFlowStepsView />
          {/* <IdentityValidationStep /> */}
          {/* 
          <AddBankAccountForm />
          <VerifyBankAccount /> */}
          {/*
      
          <PersonalDetailsForm />
         
          <VerifyBankAccount />
          <AddDematAccountForm />
          <VerifyDematAccount />
          <RiskProfilingCard />
          <KycESign />
          <FinishKyc /> */}
        </KycWorkSpace>
      </AccountViewPort>
    </KycDataProvider>
  );
}

export default KycPage;
