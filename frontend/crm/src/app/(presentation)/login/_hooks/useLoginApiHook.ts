import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const useLoginApiHook = () => {

    const authApi = new apiGateway.auth.AuthApi(apiClientCaller)
    const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");

    const loginWithOtpMutation = useMutation({
        mutationKey: ['loginWithOtpMutate'],
        mutationFn: async (payload: { email: string }) => {
            // const response = await axios.post(API_URL + "/auth/login-with-otp", payload);
            // console.log(response.data);
            const response = await authApi.loginWithOtp(payload);
            return response.data
        },
        onSuccess() {
            toast.success("Otp Send successfully.")
            setStep("OTP")
        },
        onError(error) {
            if (error instanceof ApiError) {
                toast.error(error.response?.data?.message)
            } else {
                toast.error(error.message)
            }
        },
    });


    return { loginWithOtpMutation, step: { step, setStep } }

}