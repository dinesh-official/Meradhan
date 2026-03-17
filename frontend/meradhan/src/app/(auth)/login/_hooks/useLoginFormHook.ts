import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useTimer } from "@/hooks/useTimer";
import apiGateway, { ApiError } from "@root/apiGateway";
import { useLoginDataStore } from "./useLoginDataStore";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { useRouter } from "nextjs-toploader/app";
import { COOKIE_OPTIONS } from "@/core/config/cookies.config";
import { getSessionId } from "@/analytics/analytics";
import { useUserTracking } from "@/analytics/UserTrackingProvider";

/**
 * Utility function to validate input as either email or phone number
 */
const validateIfEmailOrPhoneNo = (emailOrPhoneNo: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;

  if (!emailOrPhoneNo || emailOrPhoneNo.trim() === "") {
    return {
      valid: false,
      type: null,
      message: "Please provide a valid Email or Phone.",
    };
  }

  if (emailRegex.test(emailOrPhoneNo)) {
    return { valid: true, type: "email", message: "" };
  }

  if (phoneRegex.test(emailOrPhoneNo)) {
    return { valid: true, type: "phone", message: "" };
  }

  return {
    valid: false,
    type: null,
    message: "Please provide a valid Email or Phone.",
  };
};

/**
 * Custom Hook: useLoginFormHook
 * Handles all login form actions, including:
 * - Email/Phone validation
 * - Login request, OTP send/verify
 * - Password-based sign-in
 * - Timer management for OTP resend
 */
export const useLoginFormHook = () => {
  const { trackActivity } = useUserTracking();
  // Initialize API instance
  const signinApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(
    apiClientCaller,
  );
  const router = useRouter();
  const { setCookie } = useAppCookie();

  // Access store state and actions
  const { state, ...dataStore } = useLoginDataStore();

  // Error state for validation feedback
  const [errors, setErrors] = useState({
    emailOrPhone: "",
    otp: "",
    password: "",
  });

  // Timer setup for OTP resend coolDown
  const timer = useTimer({
    duration: 180,
    isCountdown: true,
    onFinish: () => dataStore.setAllowedResend(true),
  });

  // Reset all errors and messages when inputs change
  useEffect(() => {
    setErrors({ emailOrPhone: "", otp: "", password: "" });
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.password, state.otp, state.emailOrPhoneNo, state.type]);

  // Determine identity type (email or phone)
  const identity = state.emailOrPhoneNo.includes("@") ? "email" : "phoneNo";

  // -------------------------------
  // 🔹 1. Request Login (Check user exists)
  // -------------------------------
  const requestLoginMutation = useMutation({
    mutationKey: ["loginRequest"],
    mutationFn: () =>
      signinApi.signInRequest({
        identity,
        value: state.emailOrPhoneNo,
      }),
    onSuccess: () => {
      dataStore.setMode("verify");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isNaN(state.emailOrPhoneNo as any)) {
        dataStore.setType("password");
      } else {
        dataStore.setType("otp");
        // handleSendOtp();
      }
      trackActivity("login", { reason: "Create login request" });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        dataStore.setErrorMessage(
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        );
      }
    },
  });

  // -------------------------------
  // 🔹 2. Send OTP for Login
  // -------------------------------
  const sendOtpMutation = useMutation({
    mutationKey: ["sendLoginOtp"],
    mutationFn: () =>
      signinApi.signInSendOtp({
        identity,
        value: state.emailOrPhoneNo,
      }),
    onSuccess: () => {
      timer.reset();
      timer.start();

      dataStore.setSuccessMessage("OTP sent successfully");
      dataStore.setOtp("");
      trackActivity("login", { reason: "Send OTP to " + state.emailOrPhoneNo });
      dataStore.setCurrentOtpTry(state.currentOtpTry + 1);
      dataStore.setAllowedResend(false);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        dataStore.setErrorMessage(
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        );
      }
    },
  });

  const auditAPi = new apiGateway.crm.auditlogs.AuditLogsApi(apiClientCaller);

  const revalidateTracking = async (payload?: {
    trackId: string;
    token: string;
    userId: number;
  }) => {
    try {
      await auditAPi.revalidateWebAuditLogs(payload);
    } catch (error) {
      console.log(error);
    }
  };

  // -------------------------------
  // 🔹 3. Sign in with Password
  // -------------------------------
  const signInWithPasswordMutation = useMutation({
    mutationKey: ["signInWithPassword"],
    retry: false,
    mutationFn: () =>
      signinApi.signInWithPassword({
        identity,
        value: state.emailOrPhoneNo,
        password: state.password,
      }),
    onSuccess: (data) => {
      trackActivity("login", { reason: "Sign in with password" });
      setAuthCookiesAndRedirect({
        token: data.responseData.token,
        id: data.responseData.id.toString(),
      });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        dataStore.setErrorMessage(
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        );
      } else {
        toast.error(error.message);
      }
    },
  });

  // -------------------------------
  // 🔹 4. Verify OTP and Login
  // -------------------------------
  const verifyOtpMutation = useMutation({
    mutationKey: ["verifyOtpLogin"],
    retry: false,
    mutationFn: () =>
      signinApi.signInVerifyOtp({
        identity,
        otp: state.otp,
        token: sendOtpMutation.data?.responseData?.token || requestLoginMutation.data?.responseData.token || "",
        value: state.emailOrPhoneNo,
      }),
    onSuccess: (data) => {
      setAuthCookiesAndRedirect({
        token: data.responseData.token,
        id: data.responseData.id.toString(),
      });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        dataStore.setErrorMessage(
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        );
      } else {
        toast.error(error.message);
      }
    },
  });

  // -------------------------------
  // 🔹 5. Resend Email Verification for Unverified Users
  // -------------------------------
  const resendEmailVerificationMutation = useMutation({
    mutationKey: ["resendEmailVerification"],
    retry: false,
    mutationFn: () =>
      signinApi.resendEmailVerificationForUnverifiedUser({
        identity,
        value: state.emailOrPhoneNo,
      }),
    onSuccess: () => {
      // Clear error message and set success message
      dataStore.setErrorMessage("");
      dataStore.setSuccessMessage("");
      dataStore.setSuccessMessage(
        "Verification email sent successfully. Please check your inbox.",
      );
      toast.success("Verification email sent successfully");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Something went wrong";
        dataStore.setSuccessMessage("");
        dataStore.setErrorMessage(errorMessage);
        toast.error(errorMessage);
      } else {
        dataStore.setSuccessMessage("");
        dataStore.setErrorMessage("Something went wrong");
        toast.error(error.message);
      }
    },
  });

  // ---------------------------------
  // ✅ FORM SUBMIT HANDLERS
  // ---------------------------------

  /**
   * Handle Login Request (Check user) — guarded to prevent double submit
   */
  const handleSignInRequest = () => {
    if (requestLoginMutation.isPending) return;
    const { valid, message } = validateIfEmailOrPhoneNo(state.emailOrPhoneNo);
    if (!valid) return setErrors({ ...errors, emailOrPhone: message });
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    requestLoginMutation.mutate();
  };

  /**
   * Handle OTP Send (guarded to prevent double send)
   */
  const handleSendOtp = () => {
    if (sendOtpMutation.isPending) return;
    const { valid, message } = validateIfEmailOrPhoneNo(state.emailOrPhoneNo);
    if (!valid) return setErrors({ ...errors, emailOrPhone: message });
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    sendOtpMutation.mutate();
  };

  /**
   * Handle OTP Verify
   */
  const handleVerifyOtp = () => {
    const { valid, message } = validateIfEmailOrPhoneNo(state.emailOrPhoneNo);
    if (!valid) return setErrors({ ...errors, emailOrPhone: message });
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    if (state.otp.length !== 4) {
      dataStore.setErrorMessage("Please enter valid OTP");
      return;
    }

    verifyOtpMutation.mutate();
  };

  /**
   * Handle Sign-In with Password
   */
  const handleSignInWithPassword = () => {
    const { valid, message } = validateIfEmailOrPhoneNo(state.emailOrPhoneNo);
    if (!valid) return setErrors({ ...errors, emailOrPhone: message });
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    if (state.otp.length !== 0) {
      dataStore.setErrorMessage("Please enter valid OTP");
      return;
    }
    signInWithPasswordMutation.mutate();
  };

  // set user access tokens in cookieStore
  const setAuthCookiesAndRedirect = ({
    id,
    token,
  }: {
    token: string;
    id: string;
  }) => {

    // // Use longer expiry (30 days) if remember me is checked, otherwise use default (1 day)
    // const cookieOptions = state.rememberMe
    //   ? {
    //       ...COOKIE_OPTIONS,
    //       expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    //     }
    //   : COOKIE_OPTIONS;
    const sessionId = getSessionId();
    const auditApi = new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller);
    setCookie("userId", id);
    auditApi.createNewTrackingSessionMeradhan({
      sessionId: sessionId,
      userId: parseInt(id),
    });
    // redirect to dashboard
    if (localStorage.getItem("redirect")) {
      router.replace(localStorage.getItem("redirect") as string);
      localStorage.removeItem("redirect");
    } else {
      router.replace("/dashboard");
    }
  };

  /**
   * Handle Resend Email Verification
   */
  const handleResendEmailVerification = () => {
    const { valid, message } = validateIfEmailOrPhoneNo(state.emailOrPhoneNo);
    if (!valid) return setErrors({ ...errors, emailOrPhone: message });
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    resendEmailVerificationMutation.mutate();
  };

  // ---------------------------------
  // 🔚 RETURN HOOK OUTPUT
  // ---------------------------------
  return {
    errors,
    timer,

    // Mutations
    requestLoginMutation,
    sendOtpMutation,
    signInWithPasswordMutation,
    verifyOtpMutation,
    resendEmailVerificationMutation,

    // Handlers
    handleSignInRequest,
    handleSendOtp,
    handleVerifyOtp,
    handleSignInWithPassword,
    handleResendEmailVerification,
  };
};

export type ILoginFormHook = ReturnType<typeof useLoginFormHook>;
