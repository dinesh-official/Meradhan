import { useState } from "react";
import { KycDataStorage, useKycDataStorage } from "../../_store/useKycDataStorage";
import { appSchema } from "@root/schema";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import { useKycDataProvider } from "../../_context/KycDataProvider";
import { useKycStepStore } from "../../_store/useKycStepStore";

export const usePersonalDetailsFormHook = () => {
    const { state, setStepIndex } = useKycDataStorage();
    const { pushUserKycState } = useKycDataProvider()
    const { nextStep } = useKycStepStore();

    const data = state.step_2;

    const [error, setError] = useState<Partial<Record<keyof KycDataStorage['step_2'], string[]>>>();

    const handelPersonalSubmit = () => {

        try {
            appSchema.kyc.personalInfoSchema.parse(data);

            // this is the last `local step` for "step 2"
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

    }

    return {
        error,
        handelPersonalSubmit
    };
};