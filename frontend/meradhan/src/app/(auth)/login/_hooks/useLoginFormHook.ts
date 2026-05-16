import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useTimer } from "@/hooks/useTimer";
import apiGateway, { ApiError } from "@root/apiGateway";
import { useLoginDataStore } from "./useLoginDataStore";
import useAppCookie from "@/hooks/useAppCookie.hook";
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

/** Same-origin path only — avoids open redirects via `//evil.com` or `\` tricks */
const getSafeInternalRedirectPath = (raw: string | null): string | null => {
  if (!raw?.trim()) return null;
  try {
    const decoded = decodeURIComponent(raw.trim());
    if (
      decoded.startsWith("/") &&
      !decoded.startsWith("//") &&
      !decoded.includes("\\")
    ) {
      return decoded;
    }
  } catch {
    /* malformed query */
  }
  return null;
};

/**
 * After login: prefer `?redirect=` (e.g. from /logout?redirect=…), then localStorage.
 */
const resolvePostLoginRedirect = (): string | null => {
  if (typeof window === "undefined") return null;
  const fromSearch = getSafeInternalRedirectPath(
    new URLSearchParams(window.location.search).get("redirect"),
  );
  if (fromSearch) return fromSearch;
  return getSafeInternalRedirectPath(localStorage.getItem("redirect"));
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
    onSuccess: (data) => {
      const response = data.responseData;
      if (response.requiresAccountActivation && response.channel) {
        dataStore.setMode("account_activation");
        dataStore.setActivationChannel(response.channel);
        dataStore.setActivationMaskedTarget(response.maskedTarget ?? "");
        dataStore.setOtp("");
        dataStore.setErrorMessage("");
        dataStore.setSuccessMessage("");

        if (response.token && response.activationOtpSent !== false) {
          dataStore.setActivationToken(response.token);
          dataStore.setActivationStep("otp");
          dataStore.setSuccessMessage("OTP sent successfully");
          timer.reset();
          timer.start();
          dataStore.setAllowedResend(false);
          trackActivity("login", { reason: "Account activation OTP sent" });
        } else {
          dataStore.setActivationToken("");
          dataStore.setActivationStep("prompt");
          trackActivity("login", { reason: "Account activation prompt shown" });
        }
        return;
      }

      dataStore.setMode("verify");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isNaN(state.emailOrPhoneNo as any)) {
        dataStore.setType("password");
      } else {
        dataStore.setType("otp");
      }
      trackActivity("login", { reason: "Create login request" });
    },
    onError: (error) => {
      dataStore.setMode("pending");
      dataStore.setActivationStep("prompt");
      dataStore.setActivationChannel(null);
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
    onSuccess: async (data) => {
      trackActivity("login", { reason: "Sign in with password" });
      await completeLoginAndRedirect({
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
    onSuccess: async (data) => {
      await completeLoginAndRedirect({
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
  // 🔹 5. Verify account activation OTP at login
  // -------------------------------
  const verifyAccountActivationMutation = useMutation({
    mutationKey: ["verifyAccountActivationLogin"],
    retry: false,
    mutationFn: () =>
      signinApi.verifyAccountActivationAtLogin({
        identity,
        value: state.emailOrPhoneNo,
        otp: state.otp,
        token: state.activationToken,
      }),
    onSuccess: async (data) => {
      trackActivity("login", { reason: "Account activation verified" });
      try {
        await completeLoginAndRedirect({
          token: data.responseData.token,
          id: data.responseData.id.toString(),
        });
      } catch {
        dataStore.setErrorMessage(
          "Verification succeeded but sign-in failed. Please try logging in again.",
        );
        toast.error("Could not complete sign-in. Please try again.");
      }
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

  const sendActivationOtpMutation = useMutation({
    mutationKey: ["sendActivationOtpLogin"],
    mutationFn: () =>
      signinApi.signInRequest({
        identity,
        value: state.emailOrPhoneNo,
        sendActivationOtp: true,
      }),
    onSuccess: (data) => {
      const response = data.responseData;
      if (!response.requiresAccountActivation || !response.token) {
        dataStore.setErrorMessage("Could not send OTP. Please try again.");
        return;
      }
      dataStore.setActivationToken(response.token);
      dataStore.setActivationStep("otp");
      if (response.maskedTarget) {
        dataStore.setActivationMaskedTarget(response.maskedTarget);
      }
      dataStore.setOtp("");
      dataStore.setSuccessMessage("OTP sent successfully");
      dataStore.setErrorMessage("");
      timer.reset();
      timer.start();
      dataStore.setAllowedResend(false);
      trackActivity("login", { reason: "Account activation OTP sent" });
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

  const resendActivationOtpMutation = useMutation({
    mutationKey: ["resendActivationOtpLogin"],
    mutationFn: () =>
      signinApi.signInRequest({
        identity,
        value: state.emailOrPhoneNo,
        sendActivationOtp: true,
      }),
    onSuccess: (data) => {
      const response = data.responseData;
      if (!response.requiresAccountActivation || !response.token) {
        dataStore.setErrorMessage("Could not resend OTP. Please try again.");
        return;
      }
      dataStore.setActivationToken(response.token);
      dataStore.setActivationStep("otp");
      if (response.maskedTarget) {
        dataStore.setActivationMaskedTarget(response.maskedTarget);
      }
      dataStore.setOtp("");
      dataStore.setSuccessMessage("OTP sent successfully");
      dataStore.setErrorMessage("");
      timer.reset();
      timer.start();
      dataStore.setAllowedResend(false);
      dataStore.setCurrentOtpTry(state.currentOtpTry + 1);
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
  // 🔹 6. Resend Email Verification for Unverified Users
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

  const persistAppSessionCookies = async (token: string, userId: string) => {
    const res = await fetch("/api/auth/set-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, userId }),
    });
    if (!res.ok) {
      throw new Error("Failed to persist session cookies");
    }
  };

  const completeLoginAndRedirect = async ({
    id,
    token,
  }: {
    token: string;
    id: string;
  }) => {
    if (!token) {
      throw new Error("Missing auth token");
    }

    await persistAppSessionCookies(token, id);

    const sessionId = getSessionId();
    const auditApi = new apiGateway.auditlog.AuditLogsApiV2(apiClientCaller);
    setCookie("userId", id);
    try {
      await auditApi.createNewTrackingSessionMeradhan({
        sessionId,
        userId: parseInt(id, 10),
      });
    } catch (error) {
      console.log(error);
    }

    dataStore.reset();

    const redirectPath = resolvePostLoginRedirect();
    if (redirectPath) {
      localStorage.removeItem("redirect");
    }
    window.location.assign(redirectPath ?? "/dashboard");
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

  const handleVerifyAccountActivation = () => {
    const otpLength = state.activationChannel === "email" ? 6 : 4;
    if (state.otp.length !== otpLength) {
      dataStore.setErrorMessage(`Please enter a valid ${otpLength}-digit OTP`);
      return;
    }
    if (!state.activationToken) {
      dataStore.setErrorMessage("Session expired. Please continue again.");
      return;
    }
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    verifyAccountActivationMutation.mutate();
  };

  const handleStartAccountActivation = () => {
    if (sendActivationOtpMutation.isPending) return;
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    sendActivationOtpMutation.mutate();
  };

  const handleResendActivationOtp = () => {
    if (resendActivationOtpMutation.isPending || !state.allowedResend) return;
    if (state.currentOtpTry >= state.maxOtpTry) {
      dataStore.setErrorMessage(
        "You have reached the maximum number of attempts. Please try again later.",
      );
      return;
    }
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    resendActivationOtpMutation.mutate();
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
    verifyAccountActivationMutation,
    sendActivationOtpMutation,
    resendActivationOtpMutation,
    resendEmailVerificationMutation,

    // Handlers
    handleSignInRequest,
    handleSendOtp,
    handleVerifyOtp,
    handleSignInWithPassword,
    handleResendEmailVerification,
    handleStartAccountActivation,
    handleVerifyAccountActivation,
    handleResendActivationOtp,
  };
};

export type ILoginFormHook = ReturnType<typeof useLoginFormHook>;
