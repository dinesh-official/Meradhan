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
    // Initialize API instance
    const signinApi = new apiGateway.meradhan.customerAuthApi.CustomerAuthApi(apiClientCaller);
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
            dataStore.setType("password");
        },
        onError: (error) => {
            if (error instanceof ApiError) {
                dataStore.setErrorMessage(
                    error.response?.data?.message || error.message || "Something went wrong"
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
            dataStore.setCurrentOtpTry(state.currentOtpTry + 1);
            dataStore.setAllowedResend(false);
        },
        onError: (error) => {
            if (error instanceof ApiError) {
                dataStore.setErrorMessage(
                    error.response?.data?.message || error.message || "Something went wrong"
                );
            }
        },
    });

    // -------------------------------
    // 🔹 3. Sign in with Password
    // -------------------------------
    const signInWithPasswordMutation = useMutation({
        mutationKey: ["signInWithPassword"],
        mutationFn: () =>
            signinApi.signInWithPassword({
                identity,
                value: state.emailOrPhoneNo,
                password: state.password,
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
                    error.response?.data?.message || error.message || "Something went wrong"
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
        mutationFn: () =>
            signinApi.signInVerifyOtp({
                identity,
                otp: state.otp,
                token: sendOtpMutation.data?.responseData?.token || "",
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
                    error.response?.data?.message || error.message || "Something went wrong"
                );
            } else {
                toast.error(error.message);
            }
        },
    });

    // ---------------------------------
    // ✅ FORM SUBMIT HANDLERS
    // ---------------------------------

    /**
     * Handle Login Request (Check user)
     */
    const handleSignInRequest = () => {
        const { valid, message } = validateIfEmailOrPhoneNo(state.emailOrPhoneNo);
        if (!valid) return setErrors({ ...errors, emailOrPhone: message });
        requestLoginMutation.mutate();
    };

    /**
     * Handle OTP Send
     */
    const handleSendOtp = () => {
        const { valid, message } = validateIfEmailOrPhoneNo(state.emailOrPhoneNo);
        if (!valid) return setErrors({ ...errors, emailOrPhone: message });

        sendOtpMutation.mutate();
    };

    /**
     * Handle OTP Verify
     */
    const handleVerifyOtp = () => {
        const { valid, message } = validateIfEmailOrPhoneNo(state.emailOrPhoneNo);
        if (!valid) return setErrors({ ...errors, emailOrPhone: message });

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

        if (state.otp.length !== 0) {
            dataStore.setErrorMessage("Please enter valid OTP");
            return;
        }
        signInWithPasswordMutation.mutate();
    };


    // set user access tokens in cookieStore
    const setAuthCookiesAndRedirect = ({ id, token }: { token: string, id: string }) => {
        setCookie("token", token, COOKIE_OPTIONS);
        setCookie("userId", id, COOKIE_OPTIONS);

        // redirect to dashboard
        if (localStorage.getItem("redirect")) {
            router.replace(localStorage.getItem("redirect") as string);
            localStorage.removeItem("redirect");
        } else {
            router.replace("/dashboard");
        }

    }

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

        // Handlers
        handleSignInRequest,
        handleSendOtp,
        handleVerifyOtp,
        handleSignInWithPassword,
    };
};

export type ILoginFormHook = ReturnType<typeof useLoginFormHook>;
