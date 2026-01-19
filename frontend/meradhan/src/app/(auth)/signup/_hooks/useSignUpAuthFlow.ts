import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import z from "zod";
import { useTrackUserVerifyFlowStore } from "./useTrackUserVerifyFlowStore";
import { useTimer } from "@/hooks/useTimer";
import { AxiosError } from "axios";
import { useRouter } from "nextjs-toploader/app";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { COOKIE_OPTIONS } from "@/core/config/cookies.config";
import { useUserTracking } from "@/analytics/UserTrackingProvider";

export const useSignUpAuthFlow = () => {
  const router = useRouter();
  const { setCookie } = useAppCookie();
  const {
    email,
    mobile,
    setErrorMessage,
    setStep,
    setSuccessMessage,
    incrementTry,
    setShowCaptcha,
    setOtp,
    currentStep,
    otp,
    openOtpPopup,
    setOpenOtpPopup,
  } = useTrackUserVerifyFlowStore();

  const { trackActivity } = useUserTracking();

  const timer = useTimer({
    duration: 180,
    isCountdown: true,

    onFinish: () => {
      setOtp("");
      if (email.try >= email.max && mobile.try >= mobile.max) {
        setStep("support");
      } else {
        setShowCaptcha(true);
      }
    },
  });
  // Reset messages after 5s
  useEffect(() => {
    const timer = setTimeout(() => {
      ["email", "mobile"].forEach((type) => {
        setErrorMessage(type as "email" | "mobile", "");
        setSuccessMessage(type as "email" | "mobile", "");
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, [
    setErrorMessage,
    setSuccessMessage,
    email.successMessage,
    mobile.successMessage,
    email.errorMessage,
    mobile.errorMessage,
  ]);

  const signupApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller,
  );
  type schema = typeof appSchema.customer;

  const sendAuthMobileOtpMutation = useMutation({
    mutationKey: ["sendAuthMobileOtp"],
    mutationFn: (data: { mobile: string; id: number }) =>
      signupApi.sendSignupMobileVerify({
        mobile: data.mobile,
      }),
    onSuccess() {
      setSuccessMessage("mobile", "OTP sent successfully");
      trackActivity("session", {
        method: "Send email OTP : Attempt " + mobile.try,
      });
      incrementTry("mobile");
      timer.reset();
      setShowCaptcha(false);
    },
    onError(error) {
      if (error instanceof ApiError) {
        setErrorMessage(
          "mobile",
          error.response?.data.message || error.message,
        );
        return;
      }
      toast.error(error.message);
    },
  });

  const sendAuthEmailOtpMutation = useMutation({
    mutationKey: ["sendAuthEmailOtp"],
    mutationFn: (payload: z.infer<schema["sendEmailOtpSchema"]>) =>
      signupApi.sendSignupEmailVerify(payload),
    onSuccess() {
      if (!openOtpPopup) {
        setOpenOtpPopup(true);
      }
      setSuccessMessage("email", "OTP sent successfully");
      trackActivity("session", {
        method: "Send email OTP : Attempt " + email.try,
      });
      incrementTry("email");
      timer.reset();
      setShowCaptcha(false);
    },
    onError(error) {
      if (error instanceof ApiError) {
        setErrorMessage(
          "email",
          error.response?.data.message ||
            error.response?.data?.error ||
            error.message,
        );
        toast.error(
          error.response?.data.message ||
            error.response?.data?.error ||
            error.message,
        );
        return;
      }
      if (error instanceof AxiosError) {
        setErrorMessage("email", error.response?.data?.error || error.message);
        toast.error(error.response?.data?.error || error.message);
      }
      toast.error(error.message);
    },
  });

  const singUpWithCredentialsMutation = useMutation({
    mutationKey: ["singUpWithCredentials"],
    mutationFn: (data: {
      params: z.infer<schema["signUpWithCredentialsQuerySchema"]>;
      payload: z.infer<schema["createNewCustomerSchema"]>;
    }) => signupApi.verifySignupOtp(data.params),
    onError(error) {
      if (error instanceof ApiError) {
        setErrorMessage(
          currentStep == "email" ? "email" : "mobile",
          error.response?.data.message || error.message,
        );
        toast.error(error.response?.data.message || error.message);
        return;
      }
      toast.error(error.message);
    },
    onSuccess(data) {
      // setAuthCookiesAndRedirect({
      //   token: data.responseData.token,
      //   id: data.responseData.id.toString(),
      // });

      router.replace("/login");

      trackActivity("session", { method: "Sign up with credentials" });
    },
  });

  const sendVerifyOtp = (data: {
    emailId: string;
    mobile: string;
    name: string;
    id: number;
  }) => {
    if (email.try < email.max) {
      sendAuthEmailOtpMutation.mutate({
        email: data.emailId,
        name: data.name,
      });
      setStep("email");
    } else if (mobile.try < mobile.max) {
      sendAuthMobileOtpMutation.mutate({
        mobile: data.mobile,
        id: data.id,
      });
      setStep("mobile");
    } else {
      setStep("support");
    }
  };

  const verifySignupOtp = (
    payload: z.infer<schema["createNewCustomerSchema"]> & { id: number },
  ) => {
    const token =
      currentStep == "email"
        ? sendAuthEmailOtpMutation.data?.responseData?.token
        : sendAuthMobileOtpMutation.data?.responseData?.token;

    singUpWithCredentialsMutation.mutate({
      params: {
        otp,
        token,
        verifyBy: currentStep == "email" ? "email" : "mobile",
        id: payload.id.toString(),
      },
      payload,
    });
  };

  const setAuthCookiesAndRedirect = ({
    id,
    token,
  }: {
    token: string;
    id: string;
  }) => {
    // setCookie("token", token, COOKIE_OPTIONS);
    // setCookie("userId", id, COOKIE_OPTIONS);

    // redirect to dashboard
    // if (localStorage.getItem("redirect")) {
    //   trackActivity("session", {
    //     method:
    //       "Sign Up  success | Redirect to " + localStorage.getItem("redirect"),
    //   });
    //   router.replace(localStorage.getItem("redirect") as string);
    //   localStorage.removeItem("redirect");
    // } else {
    //   trackActivity("session", {
    //     method: "Sign Up  success | Redirect to dashboard",
    //   });
    // }
    router.replace("/login");
  };

  return {
    sendVerifyOtp,
    isPending:
      sendAuthMobileOtpMutation.isPending ||
      sendAuthEmailOtpMutation.isPending ||
      singUpWithCredentialsMutation.isPending,
    timer,
    verifySignupOtp,
  };
};

export type ISignUpAuthFlow = ReturnType<typeof useSignUpAuthFlow>;
