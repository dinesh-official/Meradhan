import { useMutation } from "@tanstack/react-query";
import { useKycDataProvider } from "../../../../_context/KycDataProvider";
import { useDigioSDK } from "../../../../_providers/useDigioSDK";
import { useKycDataStorage } from "../../../../_store/useKycDataStorage";
import apiGateway, { ApiError } from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { addActivityLog } from "@/analytics/UserTrackingProvider";

export const useSelfieVerifyHook = () => {
  const { pushUserKycState, addAuditLog } = useKycDataProvider();
  const { state, nextLocalStep, setStep1SelfieFaceData } = useKycDataStorage();
  const digio = useDigioSDK();

  const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(
    apiClientCaller
  );

  const verifySelfieInfoMutation = useMutation({
    mutationKey: ["verifySelfieInfo"],
    mutationFn: async (kid: string) =>
      await kycApi.verifySelfieVerification({ kid }),
    onSuccess: (data) => {
      if (data.responseData) {
        setStep1SelfieFaceData("response", data.responseData);
        setStep1SelfieFaceData("url", data.responseData.file_url);
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
          title: "Selfie Kyc Failed!",
          text: errorMessage,
        });
      } else {
        console.log(error);
        toast.error("Something went wrong");
      }
    },
  });

  const requestSelfieMutation = useMutation({
    mutationKey: ["sendSelfieInfoRequest"],
    mutationFn: async () =>
      await kycApi.requestSelfieVerification({
        firstName: state.step_1.pan.firstName,
        lastName: state.step_1.pan.lastName,
        middleName: state.step_1.pan.middleName,
      }),
    onSuccess: (data) => {
      if (data.responseData.access_token.id) {
        addActivityLog({
          action: "STARTED_SELFIE_VERIFICATION",
          details: {
            step: "Selfie Verification step ",
          },
          entityType: "KYC",
        });

        const kycInstance = digio.createInstance({
          callback(response) {
            if (response.error_code) {
              toast.error(response.message || "Something went wrong");
              addActivityLog({
                action: "FAILED_SELFIE_VERIFICATION",
                details: {
                  step: "Selfie Verification step ",
                  Reason: response.message || "Unknown Error",
                },
                entityType: "KYC",
              });
            } else if (response.digio_doc_id) {
              verifySelfieInfoMutation.mutate(response.digio_doc_id);
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
          title: "Selfie Kyc Failed!",
          text: errorMessage,
        });
      } else {
        console.log(error);
        toast.error("Something went wrong");
      }
    },
  });

  const handelSelfieVerification = () => {
    requestSelfieMutation.mutate();
    addAuditLog({
      type: "START_SELFIE_VERIFICATION",
      desc: "User started the KYC process : Selfie Verification step.",
    });
  };
  return {
    handelSelfieVerification,
    isPending:
      requestSelfieMutation.isPending || verifySelfieInfoMutation.isPending,
  };
};
