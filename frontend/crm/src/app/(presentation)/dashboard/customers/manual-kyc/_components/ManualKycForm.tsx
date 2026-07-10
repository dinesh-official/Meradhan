"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useManualKycFormHook } from "../_hooks/useManualKycFormHook";
import { Step1BasicIdentity } from "./steps/Step1BasicIdentity";
import { Step2PersonalInfo } from "./steps/Step2PersonalInfo";
import { Step3AddressDetails } from "./steps/Step3AddressDetails";
import { Step4AadhaarKyc } from "./steps/Step4AadhaarKyc";
import { Step5PanKyc } from "./steps/Step5PanKyc";
import { Step6BankAccount } from "./steps/Step6BankAccount";
import { Step7RiskProfile } from "./steps/Step7RiskProfile";
import { Step8ComplianceDeclarations } from "./steps/Step8ComplianceDeclarations";
import { Step9FinalSubmission } from "./steps/Step9FinalSubmission";
import { Step10FileAttachments } from "./steps/Step10FileAttachments";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ManualKycFormProps {
  customerId?: number;
  initialData?: Partial<import("../_types/manualKycForm.types").ManualKycFormData>;
  onSuccess?: () => void;
  /** When provided, form changes are synced (e.g. to store). Used for [id]/manual-kyc. */
  onFormDataChange?: (formData: import("../_types/manualKycForm.types").ManualKycFormData) => void;
}

const stepTitles = [
  "Basic Identity",
  "Personal Information",
  "Address Details",
  "Aadhaar KYC",
  "PAN KYC",
  "Bank Account",
  "Risk Profile",
  "Compliance Declarations",
  "Final Submission",
  "File Attachments",
];

export function ManualKycForm({ customerId, initialData, onSuccess, onFormDataChange }: ManualKycFormProps) {
  const formHook = useManualKycFormHook(customerId, initialData, { onFormDataChange });

  const { currentStep, goToNextStep, goToPreviousStep, submitForm, isSubmitting } =
    formHook;

  const progress = ((currentStep - 1) / 9) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicIdentity formHook={formHook} />;
      case 2:
        return <Step2PersonalInfo formHook={formHook} />;
      case 3:
        return <Step3AddressDetails formHook={formHook} />;
      case 4:
        return <Step4AadhaarKyc formHook={formHook} />;
      case 5:
        return <Step5PanKyc formHook={formHook} />;
      case 6:
        return <Step6BankAccount formHook={formHook} />;
      case 7:
        return <Step7RiskProfile formHook={formHook} />;
      case 8:
        return <Step8ComplianceDeclarations formHook={formHook} />;
      case 9:
        return <Step9FinalSubmission formHook={formHook} />;
      case 10:
        return <Step10FileAttachments formHook={formHook} />;
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep === 10) {
      submitForm().then((success) => {
        if (success && onSuccess) {
          onSuccess();
        }
      });
    } else {
      goToNextStep();
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            Step {currentStep} of 10: {stepTitles[currentStep - 1]}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {stepTitles.map((title, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;
          return (
            <div
              key={stepNum}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${isActive
                  ? "bg-primary text-primary-foreground"
                  : isCompleted
                    ? "bg-muted text-muted-foreground"
                    : "bg-background border text-muted-foreground"
                }`}
            >
              {stepNum}. {title}
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{stepTitles[currentStep - 1]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {currentStep === 10 ? (
                "Submit KYC"
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

