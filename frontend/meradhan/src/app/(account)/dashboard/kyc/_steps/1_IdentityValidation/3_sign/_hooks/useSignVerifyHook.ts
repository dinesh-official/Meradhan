import { useMutation } from "@tanstack/react-query";
import { useKycDataProvider } from "../../../../_context/KycDataProvider";
import { useDigioSDK } from "../../../../_providers/useDigioSDK";
import { useKycDataStorage } from "../../../../_store/useKycDataStorage";
import apiGateway, { ApiError } from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { addActivityLog } from "@/analytics/UserTrackingProvider";

export const useSignVerifyHook = () => {
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { state, nextLocalStep, setStep1SignData } = useKycDataStorage();
  const digio = useDigioSDK();

  const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller
  );

  const verifySignInfoMutation = useMutation({
    mutationKey: ["verifySignInfo"],
    mutationFn: async (kid: string) =>
      await kycApi.verifySignVerification({ kid }),
    onSuccess: (data) => {
      if (data.responseData) {
        setStep1SignData("response", data.responseData);
        setStep1SignData("url", data.responseData.file_url);
        // its navigate to next step view pan info
        nextLocalStep();
        // update step
        pushUserKycState();
      }
    },
    onError(error) {
      if (error instanceof ApiError) {
        const errorMessage = error.response?.data?.message || error.message;
        Swal.fire({
          icon: "error",
          title: "Sign Kyc Failed!",
          text: errorMessage,
        });
      } else {
        console.log(error);
        toast.error("Something went wrong");
      }
    },
  });

  const requestSignMutation = useMutation({
    mutationKey: ["sendSignInfoRequest"],
    mutationFn: async () =>
      await kycApi.requestSignVerification({
        firstName: state.step_1.pan.firstName,
        lastName: state.step_1.pan.lastName,
        middleName: state.step_1.pan.middleName,
      }),
    onSuccess: (data) => {
      console.log(data);
      if (data.responseData.access_token.id) {
        addActivityLog({
          action: "START_SIGN",
          details: {
            step: "Sign Verification step ",
            Reason: "User Confirmed the Sign",
          },
          entityType: "KYC",
        });
        const kycInstance = digio.createInstance({
          callback(response) {
            if (response.error_code) {
              toast.error(response.message || "Something went wrong");
              addActivityLog({
                action: "FAILED_SIGN_VERIFICATION",
                details: {
                  step: "Sign Verification step",
                  Reason: response.message || "Unknown Error",
                },
                entityType: "KYC",
              });
            } else if (response.digio_doc_id) {
              verifySignInfoMutation.mutate(response.digio_doc_id);
            } else {
              toast.error(response.message || "Something went wrong");
            }
          },
        });
        kycInstance.init();
        kycInstance.submit(
          data.responseData.access_token.entity_id,
          data.responseData.customer_identifier,
          data.responseData.access_token.id
        );
      }
    },
    onError(error) {
      if (error instanceof ApiError) {
        const errorMessage = error.response?.data?.message || error.message;
        Swal.fire({
          icon: "error",
          title: "Sign Kyc Failed!",
          text: errorMessage,
        });
      } else {
        console.log(error);
        toast.error("Something went wrong");
      }
    },
  });

  const handelSignVerification = () => {
    requestSignMutation.mutate();

    addAuditLog({
      type: "START_SIGN_VERIFICATION",
      desc: "User started the KYC process : Sign Verification step.",
    });
  };
  return {
    handelSignVerification,
    isPending:
      requestSignMutation.isPending || verifySignInfoMutation.isPending,
  };
};
