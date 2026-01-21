import { KycDataStorage } from "@/app/(account)/dashboard/kyc/_store/useKycDataStorage";
import { queryClient } from "@/core/config/service-clients";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { ZodError } from "zod";

const statusCodes = {
  "00": "VALID Record",
  "01": "DP ID does not match",
  "02": "Client ID does not match",
  "03": "DP ID, Client ID and PAN combination does not match",
  "04": "Account Status - Suspended",
  "05": "Account Status - Closed",
  "91": "Timeout",
};

export const useAddNewDematAccountFormHook = ({
  onComplete,
}: {
  onComplete?: () => void;
}) => {
  const [error, setError] =
    useState<
      Partial<Record<keyof KycDataStorage["step_4"][number], string[]>>
    >();
  const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller,
  );
  const apiModel = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller,
  );

  const [data, setData] = useState<KycDataStorage["step_4"][number]>({
    depositoryName: "NSDL",
    dpId: "",
    beneficiaryClientId: "",
    accountHolderName: "",
    panNumber: [],
    accountType: "SOLO",
    isVerified: false,
    checkTerms: false,
    depositoryParticipantName: "",
    isDefault: false,
  });

  const useAddNewDematAccountMutation = useMutation({
    mutationKey: ["add-demat-account", data],
    mutationFn: async () =>
      await apiModel.addDematAccount({
        depositoryName: data.depositoryName!,
        dpId: data.dpId!,

        accountHolderName: data.accountHolderName!,
        primaryPanNumber: data.panNumber ? data.panNumber[0] : "",
        accountType: data.accountType,
        clientId: data.beneficiaryClientId!,
        depositoryParticipantName: data.depositoryParticipantName!,
        isPrimary: data.isDefault || false,
        isVerified: data.isVerified || false,
      }),
    onSuccess: () => {
      toast.success("Demat Account added successfully");
      queryClient.invalidateQueries({
        queryKey: ["profile-page"],
      });
      onComplete?.();
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const errorMessage = error.response?.data?.message || error.message;
        Swal.fire({
          icon: "error",
          title: "Add Demat Account Failed!",
          text: errorMessage,
        });
      } else {
        console.log(error);
        toast.error("Something went wrong");
      }
    },
  });

  const verifyDematAccount = useMutation({
    mutationFn: async () => kycApi.verifyDematAccount(data),
    onSuccess: (data) => {
      // if verified then move to next step
      if (data.responseData.isVerified) {
        useAddNewDematAccountMutation.mutate();
      } else {
        toast.error(
          data.responseData.message ||
            statusCodes?.[
              data.responseData.status as keyof typeof statusCodes
            ] ||
            "Something went wrong",
        );
      }
    },
    onError(error) {
      if (error instanceof ApiError) {
        const errorMessage =
          error.response?.data?.message || "Failed To Verify Demat Account";
        Swal.fire({
          icon: "error",
          title: "Demat verification Failed!",
          text: errorMessage,
        });
      } else {
        console.log(error);
        toast.error("Something went wrong");
      }
    },
  });

  const handelSubmit = () => {
    try {
      appSchema.kyc.dpAccountInfoSchema.parse(data);

      setError(undefined);
      verifyDematAccount.mutate();
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
        toast.error("Something went wrong");
      }
    }
  };

  return {
    handelSubmit,
    isPending: verifyDematAccount.isPending,
    error,
    data,
    updateData: (
      key: keyof KycDataStorage["step_4"][number],
      value: string | boolean | unknown,
    ) => {
      setData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
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
