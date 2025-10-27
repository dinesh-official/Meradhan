import AccountViewPort from "../../_components/wrapper/AccountViewPort";
import IdentityValidationAadharInfo from "./_components/IdentityValidation/panAndAadhar/IdentityValidationAadharInfo";
import IdentityValidationAddSign from "./_components/IdentityValidation/sign/IdentityValidationAddSign";
import IdentityValidationCaptureSelfie from "./_components/IdentityValidation/selfie/IdentityValidationCaptureSelfie";
import IdentityValidationForm from "./_components/IdentityValidation/panAndAadhar/IdentityValidationForm";
import IdentityValidationPanInfo from "./_components/IdentityValidation/panAndAadhar/IdentityValidationPanInfo";
import IdentityValidationPreviewSign from "./_components/IdentityValidation/sign/IdentityValidationPreviewSign";
import IdentityValidationSelfiePreview from "./_components/IdentityValidation/selfie/IdentityValidationSelfiePreview";
import KycWorkSpace from "./_components/wrapper/KycWorkSpace";
import PersonalDetailsForm from "./_components/PersonalDetails/PersonalDetailsForm";
import AddBankAccountForm from "./_components/BankAccount/AddBankAccountForm";
import VerifyBankAccount from "./_components/BankAccount/VerifyBankAccount";
import AddDematAccountForm from "./_components/DematAccount/AddDematAccountForm";
import VerifyDematAccount from "./_components/DematAccount/VerifyDematAccount";
import RiskProfilingCard from "./_components/RiskProfiling/RiskProfilingCard";
import KycESign from "./_components/E_Signature/KycESign";
import FinishKyc from "./_components/Finish/FinishKyc";
function KycPage() {
  return (
    <AccountViewPort showSideBar={false}>
      <KycWorkSpace>
        <IdentityValidationForm/>
        {/* <IdentityValidationPanInfo />
        <IdentityValidationAadharInfo />
        <IdentityValidationCaptureSelfie />
        <IdentityValidationSelfiePreview />
        <IdentityValidationAddSign />
        <IdentityValidationPreviewSign />
        <PersonalDetailsForm />
        <AddBankAccountForm />
        <VerifyBankAccount />
        <AddDematAccountForm />
        <VerifyDematAccount />
        <RiskProfilingCard />
        <KycESign />
        <FinishKyc /> */}
      </KycWorkSpace>
    </AccountViewPort>
  );
}

export default KycPage;
