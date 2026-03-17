import { addActivityLog } from "@/analytics/UserTrackingProvider";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { convertUTCtoIST } from "@/global/utils/datetime.utils";
import { makeFullname } from "@/global/utils/formate";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { ZodError } from "zod";
import { useKycDataProvider } from "../../../../_context/KycDataProvider";
import {
  KycDataStorage,
  useKycDataStorage,
} from "../../../../_store/useKycDataStorage";

/** Extract user-facing message from API or unknown error so PAN failures always show a message. */
function getPanErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.response?.data) {
    const data = error.response.data as { message?: string; responseData?: { message?: string } };
    return (data.message ?? data.responseData?.message ?? error.message ?? fallback).trim() || fallback;
  }
  if (error && typeof error === "object" && "response" in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response;
    const msg = res?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  if (error instanceof Error && error.message?.trim()) return error.message;
  return fallback;
}

export const usePanCardVerifyHook = (options?: { skipKraSteps?: boolean }) => {
  const [error, setError] =
    useState<
      Partial<Record<keyof KycDataStorage["step_1"]["pan"], string[]>>
    >();
  const panKycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller
  );
  const { state, nextLocalStep, setStepIndex, setStep1PanData, incrementPanRetryCount } = useKycDataStorage();
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const skipKraSteps = options?.skipKraSteps ?? false;
  const skipKraStepsRef = useRef(skipKraSteps);
  skipKraStepsRef.current = skipKraSteps;


  const verifyPanCardInfoMutation = useMutation({
    mutationKey: ["verifyPanCardInfo"],
    mutationFn: async (kid: string) =>
      await panKycApi.verifyPanVerification({ kid }),
    onSuccess: (data) => {
      console.log(data);
      if (data.responseData) {
        setStep1PanData("response", data.responseData);
        setStep1PanData(
          "fetchedTimestamp",
          new Date(data?.responseData?.completed_at).toISOString()
        );
        addActivityLog({
          action: "DIGIO_PAN_VERIFICATION_COMPLETED",
          details: {
            step: "PAN and Identity Validation step",
            PanNo: state.step_1.pan.panCardNo,
            DateOfBirth: state.step_1.pan.dateOfBirth,
            FirstName: state.step_1.pan.firstName,
            MiddleName: state.step_1.pan.middleName,
            LastName: state.step_1.pan.lastName,
            "Not a Politically Exposed Person": "CHECKED",
            "Not debarred from securities market": "CHECKED",
            "Indian citizen and solely a tax resident of India": "CHECKED",
            "Consent for KYC and KRA": "CHECKED",
          },
          entityType: "KYC",
        });
        // Used Existing KRA: skip PAN info and Aadhaar steps, go to selfie (step 5)
        if (state.step_1.usedExistingKra) {
          setStepIndex(5);
        } else {
          nextLocalStep();
        }
        pushUserKycState();
      }
    },
    onError(error) {
      const message = getPanErrorMessage(
        error,
        "PAN verification failed. Please check your details and try again."
      );
      Swal.fire({
        icon: "error",
        title: "KYC Failed",
        text: message,
      });
      toast.error(message);
    },
  });

  useEffect(() => {
    if (error) {
      setError(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step_1.pan]);

  const requestPanCardVerificationMutation = useMutation({
    mutationKey: ["requestPanCardVerification"],
    mutationFn: async (data: KycDataStorage["step_1"]["pan"]) =>
      await panKycApi.requestPanVerification(data),
    onSuccess: (data) => {

      if (data.responseData?.status === "valid") {
        incrementPanRetryCount();
        addActivityLog({
          action: "START_DIGIO_KYC_PROCESS",
          details: {
            step: "PAN and Identity Validation step",
            PanNo: state.step_1.pan.panCardNo,
            DateOfBirth: state.step_1.pan.dateOfBirth,
            FirstName: state.step_1.pan.firstName,
            MiddleName: state.step_1.pan.middleName,
            LastName: state.step_1.pan.lastName,
            "Not a Politically Exposed Person": "CHECKED",
            "Not debarred from securities market": "CHECKED",
            "Indian citizen and solely a tax resident of India": "CHECKED",
            "Consent for KYC and KRA": "CHECKED",
          },
          entityType: "KYC",
        });

        setStep1PanData("response", {
          type: "digilocker",
          status: "success",
          details: {
            pan: {
              dob:
                convertUTCtoIST(state.step_1.pan.dateOfBirth)
                  ?.split("T")[0]
                  .split("-")
                  .reverse()
                  .join("/") || "",
              name: makeFullname({
                firstName: state.step_1.pan.firstName,
                middleName: state.step_1.pan.middleName,
                lastName: state.step_1.pan.lastName,
              }),
              id_number: state.step_1.pan.panCardNo,
              document_type: "pan",
              id_proof_type: "ID_PROOF",
            },
            panInfo: data.responseData,
          },
        });
        setStep1PanData("fetchedTimestamp", new Date().toISOString());
        if (!state.step_1.usedExistingKra) {
          Swal.fire({
            icon: "success",
            title: "PAN verified successfully.",
            text: "Please proceed to the next step.",
          });
        }

        setTimeout(() => {
          if (state.step_1.usedExistingKra) {
            setStepIndex(5);
          } else {
            nextLocalStep();
            if (skipKraStepsRef.current) nextLocalStep();
          }
          pushUserKycState();
        }, 500);

        // const kycWindow = digio.createInstance({
        //   callback(response) {
        //     if (response.error_code) {
        //       toast.error(response.message || "Something went wrong");
        //       addActivityLog({
        //         action: "FAILED_DIGIO_KYC_PROCESS",
        //         details: {
        //           step: "PAN and Identity Validation step",
        //           Reason: response.message || "Unknown Error",
        //           PanNo: state.step_1.pan.panCardNo,
        //           DateOfBirth: state.step_1.pan.dateOfBirth,
        //           FirstName: state.step_1.pan.firstName,
        //           MiddleName: state.step_1.pan.middleName,
        //           LastName: state.step_1.pan.lastName,
        //           "Not a Politically Exposed Person": "CHECKED",
        //           "Not debarred from securities market": "CHECKED",
        //           "Indian citizen and solely a tax resident of India":
        //             "CHECKED",
        //           "Consent for KYC and KRA": "CHECKED",
        //         },
        //         entityType: "KYC",
        //       });
        //     } else if (response.digio_doc_id) {
        //       verifyPanCardInfoMutation.mutate(response.digio_doc_id);
        //     } else {
        //       toast.error(response.message || "Something went wrong");
        //     }
        //   },
        // });
        // kycWindow.init();
        // kycWindow.submit(
        //   data.responseData.access_token.entity_id,
        //   data.responseData.customer_identifier,
        //   data.responseData.access_token.id
        // );
      }
    },
    onError: (error) => {
      const message = getPanErrorMessage(
        error,
        "We couldn't verify the PAN details. Please check the PAN number and try again."
      );
      Swal.fire({
        imageUrl: "/images/icons/sad-emoji.svg",
        title: "Unable to Verify PAN",
        text: message,
      });
      toast.error(message);
      addAuditLog({
        type: "PAN_VERIFICATION_FAILED",
        desc: `Unable to Verify PAN: ${message}`,
      });
    },
  });

  const handelPanVerification = () => {
    try {
      const panData = appSchema.kyc.kycPanInfoDataSchema.parse(
        state.step_1.pan
      );
      const dateOfBirth =
        convertUTCtoIST(panData.dateOfBirth)
          ?.split("T")[0]
          .split("-")
          .reverse()
          .join("/") || "";
      requestPanCardVerificationMutation.mutate({
        ...panData,
        dateOfBirth,
      });
      addAuditLog({
        type: "PAN_VERIFICATION_INITIATED",
        desc: "User initiated PAN verification process",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = zodErrorToErrorMap(error);
        setError(errorMessage);
        console.log(errorMessage);
      }
    }
  };

  return {
    isPending:
      requestPanCardVerificationMutation.isPending ||
      verifyPanCardInfoMutation.isPending,
    handelPanVerification,
    error,
    setError,
  };
};
