import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { zodErrorToErrorMap } from "@/global/utils/validation.utils";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ZodError } from "zod";
import { useDigioSDK } from "../../../../_providers/useDigioSDK";
import { KycDataStorage, useKycDataStorage } from "../../../../_store/useKycDataStorage";
import Swal from 'sweetalert2'
import { useKycDataProvider } from "../../../../_context/KycDataProvider";
export const usePanCardVerifyHook = () => {

    const [error, setError] = useState<Partial<Record<keyof KycDataStorage['step_1']['pan'], string[]>>>();
    const panKycApi = new apiGateway.meradhan.customerKycApi.CustomerKycApi(apiClientCaller);
    const { state, nextLocalStep, setStep1PanData } = useKycDataStorage()
    const { pushUserKycState } = useKycDataProvider()


    const digio = useDigioSDK();


    const verifyPanCardInfoMutation = useMutation({
        mutationKey: ["verifyPanCardInfo"],
        mutationFn: async (kid: string) => await panKycApi.verifyPanVerification({ kid }),
        onSuccess: (data) => {
            console.log(data);
            if (data.responseData) {
                setStep1PanData("response", data.responseData);
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
                    icon: 'error',
                    title: 'Kyc Failed!',
                    text: errorMessage
                })
            } else {
                console.log(error);
                toast.error("Something went wrong");
            }
        },
    });


    useEffect(() => {
        if (error) {
            setError(undefined)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.step_1.pan]);



    const requestPanCardVerificationMutation = useMutation({
        mutationKey: ["requestPanCardVerification"],
        mutationFn: async (data: KycDataStorage['step_1']['pan']) => await panKycApi.requestPanVerification(data),
        onSuccess: (data) => {
            if (data.responseData?.id) {
                const kycWindow = digio.createInstance({
                    callback(response) {
                        if (response.error_code) {
                            toast.error(response.message || "Something went wrong");
                        } else if (response.digio_doc_id) {
                            verifyPanCardInfoMutation.mutate(response.digio_doc_id);
                        } else {
                            toast.error(response.message || "Something went wrong");
                        }
                    },
                });
                kycWindow.init();
                kycWindow.submit(data.responseData.access_token.entity_id, data.responseData.customer_identifier, data.responseData.access_token.id);
            }
        },
        onError: (error) => {
            if (error instanceof ApiError) {
                const errorMessage = error.response?.data?.message || error.message;
                toast.error(errorMessage);
            } else {
                console.log(error);
                toast.error("Something went wrong");
            }
        }
    });

    const handelPanVerification = () => {

        try {
            const panData = appSchema.kyc.kycPanInfoDataSchema.parse(state.step_1.pan);
            requestPanCardVerificationMutation.mutate(panData);
        } catch (error) {

            if (error instanceof ZodError) {
                const errorMessage = zodErrorToErrorMap(error);
                setError(errorMessage);
                console.log(errorMessage);
            }

        }

    }


    return {
        isPending: requestPanCardVerificationMutation.isPending || verifyPanCardInfoMutation.isPending,
        handelPanVerification,
        error
    };
};