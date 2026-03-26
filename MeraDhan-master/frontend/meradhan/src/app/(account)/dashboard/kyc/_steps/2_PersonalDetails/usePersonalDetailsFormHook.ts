import { useState } from "react";
import {
  KycDataStorage,
  useKycDataStorage,
} from "../../_store/useKycDataStorage";
import { appSchema } from "@root/schema";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { useKycDataProvider } from "../../_context/KycDataProvider";
import { useKycStepStore } from "../../_store/useKycStepStore";
import { addActivityLog } from "@/analytics/UserTrackingProvider";

export const usePersonalDetailsFormHook = () => {
  const { state, setStepIndex, setStep2PersonalData } = useKycDataStorage();
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { nextStep } = useKycStepStore();

  const data = state.step_2;

  const [error, setError] =
    useState<Partial<Record<keyof KycDataStorage["step_2"], string[]>>>();

  const removeError = (field: keyof KycDataStorage["step_2"]) => {
    if (error && error[field]) {
      const newError = { ...error };
      delete newError[field];
      setError(newError);
    }
  };

  const handelPersonalSubmit = () => {
    try {
      appSchema.kyc.personalInfoSchema.parse(data);

      // this is the last `local step` for "step 2"
      addAuditLog({
        type: "PERSONAL_DETAILS_SUBMITTED",
        desc: "User submitted personal details during KYC process.",
      });

      const cdate = new Date().toISOString();
      setStep2PersonalData("confirmPersonalInfoTimestamp", cdate);
      addActivityLog({
        action: "PERSONAL_DETAILS_SUBMITTED",
        details: {
          step: "Personal Details step ",
          Reason: "User Confirmed the Personal Details",
          ...data,
          confirmPersonalInfoTimestamp: cdate,
        },
        entityType: "KYC",
      });
      setStepIndex(0);
      // this is the first `global step` for "step "
      nextStep();
      pushUserKycState();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = zodErrorToErrorMap(error);
        setError(errorMessage);
        console.log(errorMessage);
      }
    }
  };

  return {
    error,
    handelPersonalSubmit,
    removeError,
  };
};
