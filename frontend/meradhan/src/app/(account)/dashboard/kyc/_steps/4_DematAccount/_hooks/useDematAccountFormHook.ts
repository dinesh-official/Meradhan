import { addActivityLog } from "@/analytics/UserTrackingProvider";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Swal from "sweetalert2";
import { ZodError } from "zod";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import {
  KycDataStorage,
  useKycDataStorage,
} from "../../../_store/useKycDataStorage";
const statusCodes = {
  "00": "VALID Record",
  "01": "DP ID does not match",
  "02": "Client ID does not match",
  "03": "DP ID, Client ID and PAN combination does not match",
  "04": "Account Status - Suspended",
  "05": "Account Status - Closed",
  "91": "Timeout",
};

export const useDematAccountFormHook = () => {
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const [error, setError] =
    useState<
      Partial<Record<keyof KycDataStorage["step_4"][number], string[]>>
    >();
  const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller,
  );

  const { state, nextLocalStep, updateDepository } = useKycDataStorage();
  const indexAccount = state.step_4.length - 1;
  const data = state.step_4[indexAccount];

  const removeError = (key: keyof KycDataStorage["step_4"][number]) => {
    if (error && error[key]) {
      const newError = { ...error };
      delete newError[key];
      setError(newError);
    }
  };

  const verifyDematAccount = useMutation({
    mutationFn: async () => kycApi.verifyDematAccount(data),
    onSuccess: (data) => {
      // if verified then move to next step
      if (data.responseData.isVerified) {
        updateDepository(indexAccount, {
          isVerified: true,
          verifyTimestamp: new Date().toISOString(),
          response: data.responseData,
        });
        addActivityLog({
          action: "DEMAT_ACCOUNT_VERIFIED",
          details: {
            step: "Demat Account step",
            Reason: "User failed to verify the demat account details",
            ...data,
          },
          entityType: "KYC",
        });
        nextLocalStep();
        pushUserKycState();
      } else {
        addActivityLog({
          action: "DEMAT_ACCOUNT_VERIFICATION_FAILED",
          details: {
            step: "Demat Account step",
            Reason: "User failed to verify the demat account details",
            ...data,
          },
          entityType: "KYC",
        });
        addAuditLog({
          type: "DEMAT_ACCOUNT_VERIFICATION_FAILED",
          desc:
            "Demat account verification failed during KYC process. " +
            `Status Code: ${data.responseData.status}, ` +
            `Status Description: ${
              statusCodes?.[
                data.responseData.status as keyof typeof statusCodes
              ] || "Unknown status code"
            }`,
        });
        Swal.fire({
          imageUrl: "/images/icons/sad-emoji.svg",
          title: "Failed to verify demat account",
          text:
            data.responseData.message ||
            statusCodes?.[
              data.responseData.status as keyof typeof statusCodes
            ] ||
            "Something went wrong",
        });
      }
    },
    onError(error) {
      if (error instanceof ApiError) {
        const errorMessage =
          error.response?.data?.message || "Failed To Verify Demat Account";
        Swal.fire({
          imageUrl: "/images/icons/sad-emoji.svg",
          title: "Demat verification Failed!",
          text: errorMessage,
        });
      } else {
        console.log(error);
        Swal.fire({
          imageUrl: "/images/icons/sad-emoji.svg",
          text: "Demat account Verification Failed!",
        });
      }
    },
  });

  const handelSubmit = () => {
    try {
      appSchema.kyc.dpAccountInfoSchema.parse(data);

      const existingAccount = state.step_4
        .slice(0, -1) // exclude last item
        .find((item) => item.beneficiaryClientId === data.beneficiaryClientId);

      if (existingAccount) {
        Swal.fire({
          imageUrl: "/images/icons/sad-emoji.svg",
          title: "Demat account already exist!",
          text: "Please add another demat account",
        });
        return;
      }
      //  const name = findCdslDpId(e.target.value);
      //  updateData("depositoryParticipantName", name || "");
      setError(undefined);
      updateDepository(indexAccount, {
        ...data,
      });

      verifyDematAccount.mutate();
      addAuditLog({
        type: "START_DEMAT_ACCOUNT_VERIFICATION",
        desc: "User completed the Demat Account Verification step during KYC process.",
      });
    } catch (error) {
      console.log(error);

      if (error instanceof ZodError) {
        const errorMessage = zodErrorToErrorMap<typeof data>(error);

        // Specific validation for PAN numbers for joint accounts : 1. First two PANs are required
        const panErrors = validatePanNumbers(data.panNumber || []);

        console.log(panErrors);
        setError({
          ...errorMessage,
          panNumber: panErrors,
        });
      } else {
        console.log(error);
        addAuditLog({
          type: "DEMAT_ACCOUNT_VERIFICATION_FAILED",
          desc: "Demat account verification failed during KYC process.",
        });
        Swal.fire({
          imageUrl: "/images/icons/sad-emoji.svg",
          title: "Demat account Verification Failed!",
          text: "",
        });
      }
    }
  };

  return {
    handelSubmit,
    isPending: verifyDematAccount.isPending,
    error,
    removeError,
  };
};

// reason to validate here: FOR JOIN ACCOUNT NEED MIn 2 PANs 3 is optional but if filled must be valid
// 1. First two PANs are required
// 2. Last PAN is optional
// 3. All PANs must match the regex if filled
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const validatePanNumbers = (panNumber: string[]): string[] => {
  // create an error array matching the same length
  const errors = Array(panNumber.length).fill("");

  panNumber.forEach((value, index) => {
    const isLast = index === panNumber.length - 1;

    if (isLast) {
      // Last one optional but must match if filled
      if (value && !panRegex.test(value)) {
        errors[index] = "Invalid PAN format (e.g., ABCDE1234F)";
      }
    } else {
      // All before last are required and must match
      if (!value) {
        errors[index] = "PAN number is required";
      } else if (!panRegex.test(value)) {
        errors[index] = "Invalid PAN format (e.g., ABCDE1234F)";
      }
    }
  });

  return errors;
};
