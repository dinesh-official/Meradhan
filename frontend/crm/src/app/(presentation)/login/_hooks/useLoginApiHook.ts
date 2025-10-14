import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

export const useLoginApiHook = () => {
  const authApi = new apiGateway.auth.AuthApi(apiClientCaller);
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const router = useRouter();
  const usersStore = useCurrentUserData();
  const loginWithOtpMutation = useMutation({
    mutationKey: ["loginWithOtpMutate"],
    mutationFn: async (payload: { email: string }) => {
      const response = await authApi.loginWithOtp(payload);
      return response.data;
    },
    onSuccess() {
      toast.success("Otp Send successfully.");
      setStep("OTP");
    },
    onError(error) {
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error.message);
      }
    },
  });

  const otpVerificationMutation = useMutation({
    mutationKey: ["otpVerification"],
    mutationFn: async (
      payload: z.infer<typeof appSchema.auth.verifyOtpSchema>
    ) => {
      const response = await authApi.verifyOtp(payload);
      return response.data;
    },
    onSuccess(data) {
      toast.success("Login Successful");
      usersStore.setUserData({
        name: data.responseData.name,
        role: data.responseData.role,
        email: data.responseData.email,
        avatar: data.responseData.avatar,
        id: data.responseData.id,
        phoneNo: data.responseData.phoneNo,
      });
      router.replace("/dashboard");
    },
    onError(error) {
      if (error instanceof ApiError) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error(error.message);
      }
    },
  });
  return {
    loginWithOtpMutation,
    otpVerificationMutation,
    step: { step, setStep },
  };
};
