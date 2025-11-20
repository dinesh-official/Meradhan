import { getSessionId } from "@/analytics/analytics";
import { useUserTracking } from "@/analytics/UserTrackingProvider";
import {
  COOKIE_EXPIRY_TIME,
  COOKIE_OPTIONS,
} from "@/core/config/cookies.config";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useCurrentUserData } from "@/global/stores/useCurrentUserData.store";
import useAppCookie from "@/hooks/useAppCookie.hook";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

export const useLoginApiHook = () => {
  const { trackActivity } = useUserTracking();
  const authApi = new apiGateway.auth.AuthApi(apiClientCaller);
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const usersStore = useCurrentUserData();
  const loginWithOtpMutation = useMutation({
    mutationKey: ["loginWithOtpMutate"],
    mutationFn: async (payload: { email: string }) => {
      const response = await authApi.loginWithOtp(payload);
      return response.data;
    },
    onSuccess() {
      trackActivity("otp_request", {
        method: "otp",
        reason: "User logged in otp request",
      });
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
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess(data) {
      toast.success("Login Successful");

      usersStore.setUserData({
        name: data.name,
        role: data.role,
        email: data.email,
        avatar: data.avatar,
        id: data.id,
        phoneNo: data.phoneNo,
      });

      window.location.href = "/dashboard";
    },
    onError(error) {
      console.log(error);

      if (error instanceof ApiError) {
        toast.error(error?.message);
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
