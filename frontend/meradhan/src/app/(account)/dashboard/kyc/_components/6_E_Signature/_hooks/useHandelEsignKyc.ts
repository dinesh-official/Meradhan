import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useKycDataProvider } from "../../../_context/KycDataProvider";
import { useDigioSDK } from "../../../_providers/useDigioSDK";
import { useKycStepStore } from "../../../_store/useKycStepStore";
import { useKycDataStorage } from "../../../_store/useKycDataStorage";

export const useHandelEsignKyc = () => {
    const digio = useDigioSDK();
    const { nextStep, setIsComplete } = useKycStepStore();
    const { pushUserKycState } = useKycDataProvider()
    const { state, setStep6Data } = useKycDataStorage();
    const kycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(apiClientCaller);

    const verifyEsignKycMutation = useMutation({
        mutationKey: ['verify-esign-kyc'],
        mutationFn: async (digioDocId: string) => {
            const response = await kycApi.esignVerifyResponse(digioDocId);
            return response.responseData;
        },
        onSuccess: async (data) => {
            toast.success("KYC e-Sign completed successfully");
            setStep6Data("response", data);
            nextStep();
            setIsComplete(true);
            pushUserKycState();
        },
        onError: (error) => {
            toast.error(error?.message || "Something went wrong");
        }

    })


    const esignRequestMutasion = useMutation({
        mutationKey: ['esign-kyc-request', 'verify-esign-kyc'],
        mutationFn: async () => {
            const response = await kycApi.esignRequest();
            return response.responseData;
        },
        onSuccess: async (data) => {
            if (data.access_token.id) {
                const kycWindow = digio.createInstance({
                    callback(response) {
                        console.log(response);

                        if (response.error_code) {
                            toast.error(response.message || "Something went wrong");
                        } else if (response.digio_doc_id) {
                            verifyEsignKycMutation.mutate(response.digio_doc_id);
                        } else {
                            toast.error(response.message || "Something went wrong");
                        }
                    },
                });
                kycWindow.init();
                kycWindow.submit(data.access_token.entity_id, data.signing_parties?.[0].identifier || "", data.access_token.id);
            }
        },
        onError: (error) => {
            toast.error(error?.message || "Something went wrong");
        }

    })

    const handleEsignKyc = async () => {
        if (!state.step_6.terms) {
            toast.error("Please agree to the following terms to proceed");
            return;
        }
        esignRequestMutasion.mutate();
    }

    return {
        handleEsignKyc,
        isPending: esignRequestMutasion.isPending || verifyEsignKycMutation.isPending,
    }
}