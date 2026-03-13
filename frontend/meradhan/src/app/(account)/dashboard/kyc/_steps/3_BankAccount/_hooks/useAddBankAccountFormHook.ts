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
import {
  KycDataStorage,
  useKycDataStorage,
} from "../../../_store/useKycDataStorage";
import { makeFullname } from "@/global/utils/formate";
import { addActivityLog } from "@/analytics/UserTrackingProvider";

export const useAddBankAccountFormHook = () => {
  const { state, updateBankAccount, nextLocalStep } = useKycDataStorage();
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const [error, setError] =
    useState<
      Partial<Record<keyof KycDataStorage["step_3"][number], string[]>>
    >();
  const data = state.step_3[state.step_3.length - 1];
  const updateData = (
    key: keyof KycDataStorage["step_3"][number],
    data: string | boolean | unknown,
  ) => {
    removeError(key);
    updateBankAccount(state.step_3.length - 1, {
      [key]: data,
    });
  };

  const removeError = (key: keyof KycDataStorage["step_3"][number]) => {
    if (error && error[key]) {
      const newError = { ...error };
      delete newError[key];
      setError(newError);
    }
  };

  const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller,
  );

  const fetchBankIfsc = useMutation({
    mutationKey: ["fetchBankIfsc"],
    mutationFn: async () =>
      await kycApi.verifyIfscCode({ ifsc: data.ifscCode }),
    onSuccess: (data) => {
      updateData(
        "beneficiary_name",
        makeFullname({
          firstName: state.step_1.pan.firstName,
          middleName: state.step_1.pan.middleName,
          lastName: state.step_1.pan.lastName,
        }),
      );
      updateData("bankName", data.responseData.BANK);
      updateData("branchName", data.responseData.BRANCH);
      setError({
        ...error,
        branchName: undefined,
        bankName: undefined,
        ifscCode: undefined,
      });
    },
  });

  const verifyBankAccountMutation = useMutation({
    mutationKey: ["verifyBankAccount"],
    mutationFn: async (data: KycDataStorage["step_3"][number]) =>
      await kycApi.verifyBankAccount(data),
    onSuccess: (data, payloadd) => {
      setError(undefined);
      if (data.responseData.verified) {
        updateData("response", data.responseData);
        updateData(
          "beneficiary_name",
          data.responseData.beneficiary_name_with_bank,
        );

        updateData("isVerified", data.responseData.verified);

        // set confirm timestamp
        updateData("verifyTimestamp", new Date().toISOString());
        Swal.fire({
          icon: "success",
          title: "Bank account verified successfully!",
          text: "Your bank account has been successfully verified.",
        });

        setTimeout(() => {
          nextLocalStep();
          pushUserKycState();
          addAuditLog({
            type: "BANK_ACCOUNT_VERIFIED",
            desc: "User bank account verified successfully during KYC process.",
          });
          addActivityLog({
            action: "BANK_ACCOUNT_VERIFIED",
            details: {
              step: "Bank Account step",
              Reason: "User bank account verified successfully",
              ...payloadd,
            },
            entityType: "KYC",
          });
        }, 500);
      } else {
        Swal.fire({
          imageUrl: "/images",
          title: "Bank verification Failed!",
          text: "The bank account could not be verified. Please check the details and try again.",
        });
      }
    },
    onError(error) {
      if (error instanceof ApiError) {
        const errorMessage = error.response?.data?.message || error.message;
        Swal.fire({
          imageUrl: "/images/icons/sad-emoji.svg",
          title: "Bank verification Failed!",
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
          imageUrl: "/images/icons/sad-emoji.svg",
          title: "Bank account already exist!",
          text: "Please add another bank account",
        });
        return;
      }

      setError(undefined);
      verifyBankAccountMutation.mutate(data);
      addAuditLog({
        type: "START_BANK_ACCOUNT_VERIFICATION",
        desc: "User added a bank account during KYC process.",
      });
    } catch (error) {
      console.log(error);

      if (error instanceof ZodError) {
        const errorMessage = zodErrorToErrorMap(error);
        setError(errorMessage);
        console.log(errorMessage);
      } else {
        addAuditLog({
          type: "FAILED_BANK_ACCOUNT_VERIFICATION",
          desc:
            "User bank account verification failed during KYC process. " +
            (error as Error).toString(),
        });
        console.log(error);
        toast.error("Something went wrong");
      }
    }
  };

  return {
    handleBankAccountSubmit,
    error,
    fetchBankIfsc,
    isPending: verifyBankAccountMutation.isPending || fetchBankIfsc.isPending,
    updateData,
  };
};
