import React, { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";
import { parseError } from "@/core/error/parseError";
import { ManualKycFormData, ManualKycStep } from "../_types/manualKycForm.types";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  step8Schema,
  step9Schema,
  step10Schema,
} from "../_schemas/manualKycForm.schema";
import { gender } from "../../../../../../../../../packages/schema/lib/enums";

const initialFormData: ManualKycFormData = {
  step1: {
    firstName: "",
    lastName: "",
    gender: gender[0] || "",
    emailAddress: "",
    username: "",
  },
  step2: {
    dateOfBirth: "",
    fatherOrSpouseName: "",
    mothersName: "",
    maritalStatus: "",
    nationality: "",
    residentialStatus: "",
    occupationType: "",
    annualGrossIncome: "",
    politicallyExposedPerson: "no",
    confirmPersonalInfoTimestamp: "",
  },
  step3: {
    currentAddress: {
      addressLine1: "",
      postOffice: "",
      cityOrDistrict: "",
      state: "",
      pinCode: "",
      country: "India",
      fullAddress: "",
    },
    permanentAddress: {
      sameAsCurrent: "yes",
    },
  },
  step4: {
    aadhaarNumber: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: gender[0] || "",
    documentFileUrl: "",
    aadhaarConsent: false,
    confirmAadhaarTimestamp: "",
  },
  step5: {
    panNumber: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: gender[0] || "",
    documentFileUrl: "",
    panConsent: false,
    confirmPanTimestamp: "",
  },
  step6: {
    bankAccounts: [
      {
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        ifscCode: "",
        accountType: "",
        isPrimary: true,
        bankAccountConsent: false,
        confirmBankTimestamp: "",
      },
    ],
  },
  step7: {
    riskQuestionnaireResponses: [
      {
        qus: "How many years of investment experience do you have?",
        ans: "",
        index: 0,
        opt: ["None", "Up to 1 year", "1 – 5 years", "More than 5 years"],
      },
      {
        qus: "What is your investment goal?",
        ans: "",
        index: 1,
        opt: [
          "Steady Income",
          "Capital Gains",
          "Short-term Parking",
          "Risk Diversification",
        ],
      },
      {
        qus: "What is your risk appetite?",
        ans: "",
        index: 2,
        opt: [
          "Low Risk & Low Returns",
          "Moderate Risk & Moderate Returns",
          "High Risk & High Returns",
        ],
      },
      {
        qus: "What is your investment time horizon?",
        ans: "",
        index: 3,
        opt: ["Up to 1 year", "1 – 3 years", "3 – 5 years", "More than 5 years"],
      },
    ],
  },
  step8: {
    fatcaDeclaration: "no",
    pepDeclaration: "no",
    sebiTermsAcceptance: false,
  },
  step9: {
    confirmAccuracy: false,
    kycSubmissionDate: "",
    kycStatus: "UNDER_REVIEW",
  },
  step10: {
    eSignDocument: "",
    attachments: [],
  },
};

export interface UseManualKycFormHookOptions {
  /** When provided, called whenever formData changes (e.g. to sync to store). */
  onFormDataChange?: (formData: ManualKycFormData) => void;
}

export const useManualKycFormHook = (
  customerId?: number,
  initialData?: Partial<ManualKycFormData>,
  options?: UseManualKycFormHookOptions
) => {
  const [currentStep, setCurrentStep] = useState<ManualKycStep>(1);

  // Merge initial data with default form data
  const mergedInitialData: ManualKycFormData = {
    step1: { ...initialFormData.step1, ...initialData?.step1 },
    step2: { ...initialFormData.step2, ...initialData?.step2 },
    step3: {
      currentAddress: {
        ...initialFormData.step3.currentAddress,
        ...initialData?.step3?.currentAddress,
      },
      permanentAddress: {
        ...initialFormData.step3.permanentAddress,
        ...initialData?.step3?.permanentAddress,
      },
    },
    step4: initialData?.step4
      ? { ...initialFormData.step4, ...initialData.step4 }
      : initialFormData.step4,
    step5: initialData?.step5
      ? { ...initialFormData.step5, ...initialData.step5 }
      : initialFormData.step5,
    step6: {
      bankAccounts: initialData?.step6?.bankAccounts
        ? initialData.step6.bankAccounts
        : initialFormData.step6.bankAccounts,
    },
    step7: {
      riskQuestionnaireResponses: initialData?.step7?.riskQuestionnaireResponses &&
        Array.isArray(initialData.step7.riskQuestionnaireResponses) &&
        initialData.step7.riskQuestionnaireResponses.length > 0
        ? initialData.step7.riskQuestionnaireResponses
        : initialFormData.step7.riskQuestionnaireResponses,
    },
    step8: { ...initialFormData.step8, ...initialData?.step8 },
    step9: { ...initialFormData.step9, ...initialData?.step9 },
    step10: {
      eSignDocument: initialData?.step10?.eSignDocument || "",
      attachments: initialData?.step10?.attachments || [],
    },
  };

  const [formData, setFormData] = useState<ManualKycFormData>(mergedInitialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep latest callback in a ref so effect only depends on formData (avoids infinite loop)
  const onFormDataChangeRef = useRef(options?.onFormDataChange);
  onFormDataChangeRef.current = options?.onFormDataChange;
  React.useEffect(() => {
    onFormDataChangeRef.current?.(formData);
  }, [formData]);

  // Get validation schema for a specific step
  const getStepSchema = (step: ManualKycStep) => {
    switch (step) {
      case 1:
        return step1Schema;
      case 2:
        return step2Schema;
      case 3:
        return step3Schema;
      case 4:
        return step4Schema;
      case 5:
        return step5Schema;
      case 6:
        return step6Schema;
      case 7:
        return step7Schema;
      case 8:
        return step8Schema;
      case 9:
        return step9Schema;
      case 10:
        return step10Schema;
      default:
        return null;
    }
  };

  // Validate a specific step
  const validateStep = useCallback(
    (step: ManualKycStep): boolean => {
      const schema = getStepSchema(step);
      if (!schema) return false;

      try {
        let stepData = formData[`step${step}` as keyof ManualKycFormData];

        // Auto-set timestamps if missing for steps that require them
        if (step === 2) {
          const step2Data = stepData as ManualKycFormData["step2"];
          if (!step2Data.confirmPersonalInfoTimestamp) {
            const updated = { ...step2Data, confirmPersonalInfoTimestamp: new Date().toISOString() };
            setFormData((prev) => ({ ...prev, step2: updated }));
            stepData = updated as typeof stepData;
          }
        } else if (step === 4) {
          const step4Data = stepData as ManualKycFormData["step4"];
          if (!step4Data.confirmAadhaarTimestamp) {
            const updated = { ...step4Data, confirmAadhaarTimestamp: new Date().toISOString() };
            setFormData((prev) => ({ ...prev, step4: updated }));
            stepData = updated as typeof stepData;
          }
        } else if (step === 5) {
          const step5Data = stepData as ManualKycFormData["step5"];
          if (!step5Data.confirmPanTimestamp) {
            const updated = { ...step5Data, confirmPanTimestamp: new Date().toISOString() };
            setFormData((prev) => ({ ...prev, step5: updated }));
            stepData = updated as typeof stepData;
          }
        } else if (step === 6) {
          const step6Data = stepData as ManualKycFormData["step6"];
          const bankAccounts = step6Data.bankAccounts.map((acc) => ({
            ...acc,
            confirmBankTimestamp: acc.confirmBankTimestamp || new Date().toISOString(),
          }));
          const updated = { ...step6Data, bankAccounts };
          setFormData((prev) => ({ ...prev, step6: updated }));
          stepData = updated as typeof stepData;
        } else if (step === 9) {
          const step9Data = stepData as ManualKycFormData["step9"];
          if (!step9Data.kycSubmissionDate) {
            const updated = { ...step9Data, kycSubmissionDate: new Date().toISOString() };
            setFormData((prev) => ({ ...prev, step9: updated }));
            stepData = updated as typeof stepData;
          }
        }

        schema.parse(stepData);
        setErrors((prev) => {
          const newErrors = { ...prev };
          Object.keys(newErrors).forEach((key) => {
            if (key.startsWith(`step${step}`)) {
              delete newErrors[key];
            }
          });
          return newErrors;
        });
        return true;
      } catch (error) {
        const err = parseError<ZodError>(error);
        if (err.issues.length) {
          const stepErrors: Record<string, string[]> = {};
          err.issues.forEach((issue) => {
            const path = issue.path.join(".");
            const key = `step${step}.${path}`;
            if (!stepErrors[key]) {
              stepErrors[key] = [];
            }
            stepErrors[key].push(issue.message);
          });
          setErrors((prev) => ({ ...prev, ...stepErrors }));
          toast.error(err.issues[0].message || "Validation failed");
        }
        return false;
      }
    },
    [formData]
  );

  // Update form data for a specific step
  const updateStepData = useCallback(
    <K extends keyof ManualKycFormData>(
      stepKey: K,
      data: Partial<ManualKycFormData[K]>
    ) => {
      setFormData((prev) => ({
        ...prev,
        [stepKey]: {
          ...prev[stepKey],
          ...data,
        },
      }));
      // Clear errors for this step
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith(stepKey)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    },
    []
  );

  // Navigate to next step
  const goToNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      if (currentStep < 10) {
        setCurrentStep((prev) => (prev + 1) as ManualKycStep);
      }
    }
  }, [currentStep, validateStep]);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as ManualKycStep);
    }
  }, [currentStep]);

  // Go to specific step
  const goToStep = useCallback((step: ManualKycStep) => {
    setCurrentStep(step);
  }, []);

  // Submit final form
  const submitForm = useCallback(async () => {
    // Validate step 9 (Final Submission) and step 10 (File Attachments)
    if (!validateStep(9)) {
      return false;
    }
    if (!validateStep(10)) {
      return false;
    }

    setIsSubmitting(true);
    try {
      // Add timestamps
      const finalData = {
        ...formData,
        step2: {
          ...formData.step2,
          confirmPersonalInfoTimestamp: new Date().toISOString(),
        },
        step4: {
          ...formData.step4,
          confirmAadhaarTimestamp: new Date().toISOString(),
        },
        step5: {
          ...formData.step5,
          confirmPanTimestamp: new Date().toISOString(),
        },
        step6: {
          ...formData.step6,
          bankAccounts: formData.step6.bankAccounts.map((acc) => ({
            ...acc,
            confirmBankTimestamp: new Date().toISOString(),
          })),
        },
        step9: {
          ...formData.step9,
          kycSubmissionDate: new Date().toISOString(),
        },
      };

      // TODO: Call API to submit KYC data
      // Example API call:
      // const api = new apiGateway.crm.customer.CrmCustomerApi(apiClientCaller);
      // await api.updateCustomer(finalData, customerId?.toString() || "");

      // For now, just log it
      console.log("Submitting KYC data:", finalData);

      toast.success("KYC data submitted successfully");
      return true;
    } catch (error) {
      const err = parseError<Error>(error);
      toast.error(err.message || "Failed to submit KYC data");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateStep]);

  // Get error for a specific field
  const getFieldError = useCallback(
    (step: ManualKycStep, fieldPath: string): string | undefined => {
      const key = `step${step}.${fieldPath}`;
      return errors[key]?.[0];
    },
    [errors]
  );

  return {
    currentStep,
    formData,
    errors,
    isSubmitting,
    updateStepData,
    validateStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    submitForm,
    getFieldError,
  };
};

