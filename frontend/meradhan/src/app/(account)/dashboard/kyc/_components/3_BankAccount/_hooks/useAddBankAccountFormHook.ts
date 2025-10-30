import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { ZodError } from "zod";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { KycDataStorage, useKycDataStorage } from "../../../_store/useKycDataStorage";

export const useAddBankAccountFormHook = () => {
    const { state, updateBankAccount, nextLocalStep } = useKycDataStorage();
    const { pushUserKycState } = useKycDataProvider();
    const [error, setError] = useState<Partial<Record<keyof KycDataStorage['step_3'][number], string[]>>>();
    const data = state.step_3[state.step_3.length - 1];
    const updateData = (
        key: keyof KycDataStorage["step_3"][number],
        data: string | boolean | unknown
    ) => {
        updateBankAccount(state.step_3.length - 1, {
            [key]: data,
        });

    };
    const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(apiClientCaller);


    const fetchBankIfsc = useMutation({
        mutationKey: ["fetchBankIfsc"],
        mutationFn: async () => await kycApi.verifyIfscCode({ ifsc: data.ifscCode }),
        onSuccess: (data) => {
            updateData("bankName", data?.responseData.BANK);
            updateData("branchName", data?.responseData.BRANCH);
            updateData("beneficiary_name", state.step_1.pan.firstName + " " + state.step_1.pan.middleName + " " + state.step_1.pan.lastName);
        }
    });


    const verifyBankAccountMutation = useMutation({
        mutationKey: ["verifyBankAccount"],
        mutationFn: async (data: KycDataStorage["step_3"][number]) => await kycApi.verifyBankAccount(data),
        onSuccess: (data) => {
            if (data.responseData.verified) {
                updateData("response", data.responseData)
                updateData("beneficiary_name", data.responseData.beneficiary_name_with_bank)
                updateData("isVerified", data.responseData.verified)
                nextLocalStep();
                pushUserKycState();
            }
        },
        onError(error) {
            if (error instanceof ApiError) {
                const errorMessage = error.response?.data?.message || error.message;
                Swal.fire({
                    icon: 'error',
                    title: 'Bank verification Failed!',
                    text: errorMessage,
                });
            } else {
                console.log(error);
                toast.error("Something went wrong");
            }
        },
    });


    const handleBankAccountSubmit = () => {
        try {
            const bankData = appSchema.kyc.bankInfoSchema.parse(data);

            // check already exist account

            const existingAccount = state.step_3
                .slice(0, -1) // exclude last item
                .find((item) => item.accountNumber === bankData.accountNumber);

            
            if (existingAccount) {
                Swal.fire({
                    icon: 'error',
                    title: 'Bank account already exist!',
                    text: 'Please add another bank account',
                })
                return;
            }

            setError(undefined);
            verifyBankAccountMutation.mutate(data);
        } catch (error) {
            console.log(error);
            
            if (error instanceof ZodError) {
                const errorMessage = zodErrorToErrorMap(error);
                setError(errorMessage);
                console.log(errorMessage);
            } else {
                console.log(error);
                toast.error("Something went wrong");
            }
        }
    }

    return {
        handleBankAccountSubmit,
        error,
        fetchBankIfsc,
        isPending: verifyBankAccountMutation.isPending || fetchBankIfsc.isPending
    }


}