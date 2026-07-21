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

type LoginApiErrorPayload = { code?: string; message?: string };

const getLoginErrorMessage = (error: ApiError<LoginApiErrorPayload, unknown>) => {
  const data = error.response?.data;
  if (data?.code === "ACCOUNT_CLOSED" && data.message) {
    return data.message;
  }
  return data?.message || error.message || "Something went wrong";
};

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
  });

  // Timer setup for OTP resend coolDown
  const timer = useTimer({
    duration: 180,
    isCountdown: true,
    onFinish: () => dataStore.setAllowedResend(true),
  });

  // Reset all errors and messages when inputs change
  useEffect(() => {
    setErrors({ emailOrPhone: "", otp: "" });
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.otp, state.emailOrPhoneNo, state.twoFactorPasscode]);

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
      dataStore.setOtp("");
      if (response.token) {
        dataStore.setSuccessMessage("OTP sent successfully");
        timer.reset();
        timer.start();
        dataStore.setAllowedResend(false);
      }
      trackActivity("login", { reason: "Login OTP sent" });
    },
    onError: (error) => {
      dataStore.setMode("pending");
      dataStore.setActivationStep("prompt");
      dataStore.setActivationChannel(null);
      if (error instanceof ApiError) {
        dataStore.setErrorMessage(getLoginErrorMessage(error));
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
        dataStore.setErrorMessage(getLoginErrorMessage(error));
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
  // 🔹 3. Post-auth success handler
  // -------------------------------
  const handlePostAuthSuccess = async (responseData: {
    id: number;
    token?: string;
    requiresTwoFactor?: boolean;
    challengeToken?: string;
  }) => {
    if (responseData.requiresTwoFactor && responseData.challengeToken) {
      dataStore.setTwoFactorChallengeToken(responseData.challengeToken);
      dataStore.setTwoFactorPasscode("");
      dataStore.setTwoFactorDialogOpen(true);
      dataStore.setErrorMessage("");
      dataStore.setSuccessMessage("");
      return;
    }
    if (!responseData.token) {
      dataStore.setErrorMessage(
        "Sign-in succeeded but no session token was returned. Please try again.",
      );
      toast.error("Could not complete sign-in. Please try again.");
      return;
    }
    await completeLoginAndRedirect({
      token: responseData.token,
      id: responseData.id.toString(),
    });
  };

  const verifyOtpMutation = useMutation({
    mutationKey: ["verifyOtpLogin"],
    retry: false,
    mutationFn: () =>
      signinApi.signInVerifyOtp({
        identity,
        otp: state.otp,
        token:
          sendOtpMutation.data?.responseData?.token ||
          requestLoginMutation.data?.responseData?.token ||
          "",
        value: state.emailOrPhoneNo,
      }),
    onSuccess: async (data) => {
      await handlePostAuthSuccess(data.responseData);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        dataStore.setErrorMessage(getLoginErrorMessage(error));
      } else {
        toast.error(error.message);
      }
    },
  });

  // -------------------------------
  // 🔹 4b. Verify 2FA passcode after login
  // -------------------------------
  const verifyTwoFactorMutation = useMutation({
    mutationKey: ["verifyTwoFactorLogin"],
    retry: false,
    mutationFn: () =>
      signinApi.verifySignInTwoFactor({
        challengeToken: state.twoFactorChallengeToken,
        passcode: state.twoFactorPasscode,
      }),
    onSuccess: async (data) => {
      trackActivity("login", { reason: "Sign in with 2FA passcode" });
      dataStore.resetTwoFactorDialog();
      await handlePostAuthSuccess(data.responseData);
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        dataStore.setErrorMessage(getLoginErrorMessage(error));
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
        await handlePostAuthSuccess(data.responseData);
      } catch {
        dataStore.setErrorMessage(
          "Verification succeeded but sign-in failed. Please try logging in again.",
        );
        toast.error("Could not complete sign-in. Please try again.");
      }
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        dataStore.setErrorMessage(getLoginErrorMessage(error));
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
        dataStore.setErrorMessage(getLoginErrorMessage(error));
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
        dataStore.setErrorMessage(getLoginErrorMessage(error));
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
        const errorMessage = getLoginErrorMessage(error);
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
   * Handle OTP resend
   */
  const handleResendOtp = () => {
    if (sendOtpMutation.isPending) return;
    if (state.currentOtpTry >= state.maxOtpTry) {
      dataStore.setErrorMessage(
        "You have reached the maximum number of attempts. Please try again later.",
      );
      return;
    }
    const { valid, message } = validateIfEmailOrPhoneNo(state.emailOrPhoneNo);
    if (!valid) return setErrors({ ...errors, emailOrPhone: message });
    dataStore.setErrorMessage("");
    dataStore.setSuccessMessage("");
    sendOtpMutation.mutate();
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
    window.location.assign(redirectPath ?? "/");
  };

  /**
   * Handle Resend Email Verification
   */
  const handleVerifyTwoFactor = () => {
    if (state.twoFactorPasscode.length !== 6) {
      dataStore.setErrorMessage("Please enter a valid 6-digit passcode");
      return;
    }
    if (!state.twoFactorChallengeToken) {
      dataStore.setErrorMessage("Session expired. Please login again.");
      dataStore.resetTwoFactorDialog();
      return;
    }
    dataStore.setErrorMessage("");
    verifyTwoFactorMutation.mutate();
  };

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
    verifyOtpMutation,
    verifyTwoFactorMutation,
    verifyAccountActivationMutation,
    sendActivationOtpMutation,
    resendActivationOtpMutation,
    resendEmailVerificationMutation,

    // Handlers
    handleSignInRequest,
    handleSendOtp,
    handleResendOtp,
    handleVerifyOtp,
    handleVerifyTwoFactor,
    handleResendEmailVerification,
    handleStartAccountActivation,
    handleVerifyAccountActivation,
    handleResendActivationOtp,
  };
};

export type ILoginFormHook = ReturnType<typeof useLoginFormHook>;
