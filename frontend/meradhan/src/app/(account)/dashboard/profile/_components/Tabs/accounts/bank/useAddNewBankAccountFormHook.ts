import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { ZodError } from "zod";

import { KycDataStorage } from "@/app/(account)/dashboard/kyc/_store/useKycDataStorage";
import { queryClient } from "@/core/config/service-clients";

export const useAddNewBankAccountFormHook = ({onComplete}:{onComplete?: () => void}) => {

    const apiModel = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
        apiClientCaller
    );


    const [data, setData] = useState<KycDataStorage['step_3'][number]>({
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        branchName: "",
        beneficiary_name: "",
        isDefault: false,
        isVerified: false,
        bankAccountType: "",
        checkTerms: false,
    })

    const [error, setError] = useState<Partial<Record<keyof KycDataStorage['step_3'][number], string[]>>>();

    const updateData = (
        key: keyof KycDataStorage["step_3"][number],
        data: string | boolean | unknown
    ) => {
        setData((prevData) => ({
            ...prevData,
            [key]: data,
        }));

    };
    const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(apiClientCaller);


    const fetchBankIfsc = useMutation({
        mutationKey: ["fetchBankIfsc"],
        mutationFn: async () => await kycApi.verifyIfscCode({ ifsc: data.ifscCode }),
        onSuccess: (data) => {
            updateData("bankName", data?.responseData.BANK);
            updateData("branchName", data?.responseData.BRANCH);

        }
    });


    const addNewBankAccountMutation = useMutation({
        mutationKey: ["add-bank-account", data],
        mutationFn: async () => {
            return await apiModel.addBankAccount(data);
        },
        onSuccess: (data) => {
            console.log("Bank account added successfully", data);
            toast.success("Bank account added successfully");
            queryClient.invalidateQueries({ queryKey: ["profile-page"] });
            onComplete?.();
        },
        onError: (error: unknown) => {
            console.error("Error adding bank account", error);
            if (error instanceof ApiError) {
                toast.error(
                    `${error.response?.data.message ||
                    "An error occurred while adding the bank account."
                    } `
                );
            } else {
                toast.error("An unexpected error occurred. Please try again later.");
            }
        },
    });



    const verifyBankAccountMutation = useMutation({
        mutationKey: ["verifyBankAccount"],
        mutationFn: async (data: KycDataStorage["step_3"][number]) => await kycApi.verifyBankAccount(data),
        onSuccess: (data) => {
            if (data.responseData.verified) {
                updateData("response", data.responseData)
                updateData("beneficiary_name", data.responseData.beneficiary_name_with_bank)
                updateData("isVerified", data.responseData.verified)
                addNewBankAccountMutation.mutate();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Bank verification Failed!',
                    text: 'The bank account could not be verified. Please check the details and try again.',
                });
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
            verifyBankAccountMutation.mutate(bankData);
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
        isPending: verifyBankAccountMutation.isPending || fetchBankIfsc.isPending || addNewBankAccountMutation.isPending,
        data,
        updateData,


    }


}