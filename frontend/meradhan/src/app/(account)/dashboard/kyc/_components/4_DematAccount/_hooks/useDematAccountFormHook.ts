import { appSchema } from "@root/schema";
import { KycDataStorage, useKycDataStorage } from "../../../_store/useKycDataStorage";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import toast from "react-hot-toast";
import { useState } from "react";

export const useDematAccountFormHook = () => {
    const [error, setError] = useState<Partial<Record<keyof KycDataStorage['step_4'][number], string[]>>>();

    const { updateDepository, state } = useKycDataStorage();
    const data = state.step_4[state.step_4.length - 1];

    const handelSubmit = () => {
        try {
            const bankData = appSchema.kyc.dpAccountInfoSchema.parse(data);
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = zodErrorToErrorMap(error);
                setError(errorMessage);
                console.log(errorMessage);
            } else {
                console.log(error);
                toast.error("Something went wrong");
            }
        }

    };

    return {
        handelSubmit,
        error
    };
};