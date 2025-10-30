import { appSchema } from "@root/schema";
import { KycDataStorage, useKycDataStorage } from "../../../_store/useKycDataStorage";
import { ZodError } from "zod";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import toast from "react-hot-toast";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import Swal from "sweetalert2";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
const statusCodes = {
    "00": "VALID Record",
    "01": "DP ID does not match",
    "02": "Client ID does not match",
    "03": "DP ID, Client ID and PAN combination does not match",
    "04": "Account Status - Suspended",
    "05": "Account Status - Closed",
    "91": "Timeout"
};

export const useDematAccountFormHook = () => {
    const { pushUserKycState } = useKycDataProvider()
    const [error, setError] = useState<Partial<Record<keyof KycDataStorage['step_4'][number], string[]>>>();
    const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(apiClientCaller);

    const { state, nextLocalStep, updateDepository } = useKycDataStorage();
    const data = state.step_4[state.step_4.length - 1];

    const verifyDematAccount = useMutation({
        mutationFn: async () => kycApi.verifyDematAccount(data),
        onSuccess: (data) => {
            if (data.responseData.status == "00") {
                nextLocalStep();
                pushUserKycState();
                updateDepository(state.step_4.length - 1, {
                    isVerified: true,
                    response: data.responseData
                })
            } else {
                toast.error(statusCodes?.[data.responseData.status as keyof typeof statusCodes] || "Something went wrong");
            }

        },
        onError(error) {
            if (error instanceof ApiError) {
                const errorMessage = error.response?.data?.message || error.message;
                Swal.fire({
                    icon: 'error',
                    title: 'Demat verification Failed!',
                    text: errorMessage,
                });
            } else {
                console.log(error);
                toast.error("Something went wrong");
            }
        },
    })


    const handelSubmit = () => {
        try {
            appSchema.kyc.dpAccountInfoSchema.parse(data);

            const existingAccount = state.step_4
                .slice(0, -1) // exclude last item
                .find((item) => item.beneficiaryClientId === data.beneficiaryClientId);


            if (existingAccount) {
                Swal.fire({
                    icon: 'error',
                    title: 'Demat account already exist!',
                    text: 'Please add another demat account',
                })
                return;
            }


            setError(undefined);
            verifyDematAccount.mutate();
        } catch (error) {
            console.log(error);
            
            if (error instanceof ZodError) {
                const errorMessage = zodErrorToErrorMap(error);
                setError(errorMessage);
            } else {
                console.log(error);
                toast.error("Something went wrong");
            }
        }

    };

    return {
        handelSubmit,
        isPending: verifyDematAccount.isPending,
        error
    };
};