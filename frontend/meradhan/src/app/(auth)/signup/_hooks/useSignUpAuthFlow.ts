import { useUserTracking } from "@/analytics/UserTrackingProvider";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useTimer } from "@/hooks/useTimer";
import apiGateway, { ApiError } from "@root/apiGateway";
import { appSchema } from "@root/schema";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";
import toast from "react-hot-toast";
import z from "zod";
import { useTrackUserVerifyFlowStore } from "./useTrackUserVerifyFlowStore";

export const useSignUpAuthFlow = () => {
  const router = useRouter();

  const {
    email,
    mobile,
    setErrorMessage,
    setMode,
    setSuccessMessage,
    incrementTry,
    setChannelCaptcha,
    setEmailOtp,
    setMobileOtp,
    setEmailToken,
    setMobileToken,
    emailOtp,
    mobileOtp,
    emailToken,
    mobileToken,
    openOtpPopup,
    setOpenOtpPopup,
  } = useTrackUserVerifyFlowStore();

  const { trackActivity } = useUserTracking();

  const timer = useTimer({
    duration: 180,
    isCountdown: true,
    onFinish: () => {
      setEmailOtp("");
      setMobileOtp("");
      if (email.try >= email.max && mobile.try >= mobile.max) {
        setMode("support");
      } else {
        if (email.try < email.max) setChannelCaptcha("email", true);
        if (mobile.try < mobile.max) setChannelCaptcha("mobile", true);
      }
    },
  });

  useEffect(() => {
    const t = setTimeout(() => {
      (["email", "mobile"] as const).forEach((type) => {
        setErrorMessage(type, "");
        setSuccessMessage(type, "");
      });
    }, 5000);
    return () => clearTimeout(t);
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
    mutationFn: (data: { mobile: string }) =>
      signupApi.sendSignupMobileVerify({ mobile: data.mobile }),
    onSuccess(data) {
      setSuccessMessage("mobile", "OTP sent successfully");
      setMobileToken(data.responseData?.token ?? "");
      trackActivity("session", {
        method: "Send mobile OTP : Attempt " + (mobile.try + 1),
      });
      incrementTry("mobile");
      setChannelCaptcha("mobile", false);
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
    onSuccess(data) {
      if (!openOtpPopup) {
        setOpenOtpPopup(true);
      }
      setSuccessMessage("email", "OTP sent successfully");
      setEmailToken(data.responseData?.token ?? "");
      trackActivity("session", {
        method: "Send email OTP : Attempt " + (email.try + 1),
      });
      incrementTry("email");
      setChannelCaptcha("email", false);
    },
    onError(error) {
      if (error instanceof ApiError) {
        const msg =
          error.response?.data.message ||
          error.response?.data?.error ||
          error.message;
        setErrorMessage("email", msg);
        toast.error(msg);
        return;
      }
      if (error instanceof AxiosError) {
        const msg = error.response?.data?.error || error.message;
        setErrorMessage("email", msg);
        toast.error(msg);
        return;
      }
      toast.error(error.message);
    },
  });

  const updateSignupEmailMutation = useMutation({
    mutationKey: ["updateSignupEmail"],
    mutationFn: (payload: z.infer<schema["signupUpdateEmailSchema"]>) =>
      signupApi.updateSignupEmail(payload),
    onError(error) {
      if (error instanceof ApiError) {
        setErrorMessage("email", error.response?.data.message || error.message);
      }
    },
  });

  const updateSignupPhoneMutation = useMutation({
    mutationKey: ["updateSignupPhone"],
    mutationFn: (payload: z.infer<schema["signupUpdatePhoneSchema"]>) =>
      signupApi.updateSignupPhone(payload),
    onError(error) {
      if (error instanceof ApiError) {
        setErrorMessage("mobile", error.response?.data.message || error.message);
      }
    },
  });

  const verifyBothMutation = useMutation({
    mutationKey: ["verifySignupOtpBoth"],
    mutationFn: (payload: z.infer<schema["signUpVerifyBothSchema"]>) =>
      signupApi.verifySignupOtpBoth(payload),
    onSuccess() {
      toast.success("Account verified successfully. Please sign in.");
      trackActivity("session", { method: "Sign up verified (email + mobile)" });
      router.replace("/login");
    },
    onError(error) {
      if (error instanceof ApiError) {
        const msg = error.response?.data.message || error.message;
        const code = error.response?.data?.code as string | undefined;
        toast.error(msg);

        if (code === "OTP_EXPIRED" || code === "INVALID_BOTH_OTP") {
          setErrorMessage("email", msg);
          setErrorMessage("mobile", msg);
          setChannelCaptcha("email", true);
          setChannelCaptcha("mobile", true);
          return;
        }
        if (code === "INVALID_EMAIL_OTP" || msg.toLowerCase().includes("email")) {
          setErrorMessage("email", msg);
          return;
        }
        if (code === "INVALID_MOBILE_OTP" || msg.toLowerCase().includes("mobile")) {
          setErrorMessage("mobile", msg);
          return;
        }
        setErrorMessage("email", msg);
        setErrorMessage("mobile", msg);
      } else {
        toast.error(error.message);
      }
    },
  });

  const sendEmailOtp = (emailId: string, name: string) => {
    if (email.try >= email.max) return;
    sendAuthEmailOtpMutation.mutate({ email: emailId, name });
  };

  const sendMobileOtp = (mobileNo: string) => {
    if (mobile.try >= mobile.max) return;
    sendAuthMobileOtpMutation.mutate({ mobile: mobileNo });
  };

  const sendBothSignupOtps = (data: {
    emailId: string;
    mobile: string;
    name: string;
  }) => {
    setOpenOtpPopup(true);
    setMode("verify");
    timer.reset();
    timer.start();

    const tasks: Promise<void>[] = [];

    if (email.try < email.max) {
      tasks.push(
        signupApi
          .sendSignupEmailVerify({ email: data.emailId, name: data.name })
          .then((res) => {
            setEmailToken(res.responseData?.token ?? "");
            setSuccessMessage("email", "OTP sent successfully");
            incrementTry("email");
            setChannelCaptcha("email", false);
          })
          .catch((error) => {
            const msg =
              error instanceof ApiError
                ? error.response?.data.message || error.message
                : error?.message ?? "Failed to send email OTP";
            setErrorMessage("email", msg);
            throw error;
          }),
      );
    }

    if (mobile.try < mobile.max) {
      tasks.push(
        signupApi
          .sendSignupMobileVerify({ mobile: data.mobile })
          .then((res) => {
            setMobileToken(res.responseData?.token ?? "");
            setSuccessMessage("mobile", "OTP sent successfully");
            incrementTry("mobile");
            setChannelCaptcha("mobile", false);
          })
          .catch((error) => {
            const msg =
              error instanceof ApiError
                ? error.response?.data.message || error.message
                : error?.message ?? "Failed to send mobile OTP";
            setErrorMessage("mobile", msg);
            throw error;
          }),
      );
    }

    if (tasks.length === 0) {
      setMode("support");
      return;
    }

    Promise.all(tasks).catch(() => {
      toast.error("Could not send one or more OTPs. Use Resend to try again.");
    });
  };

  const resendEmailOtp = (emailId: string, name: string) => {
    sendEmailOtp(emailId, name);
    timer.reset();
    timer.start();
  };

  const resendMobileOtp = (mobileNo: string) => {
    sendMobileOtp(mobileNo);
    timer.reset();
    timer.start();
  };

  const sendEmailOtpToAddress = async (emailId: string, name: string) => {
    const res = await signupApi.sendSignupEmailVerify({ email: emailId, name });
    setEmailToken(res.responseData?.token ?? "");
    setSuccessMessage("email", "OTP sent to your email address");
    setErrorMessage("email", "");
    setChannelCaptcha("email", false);
    return res;
  };

  const sendMobileOtpToNumber = async (mobile: string) => {
    const res = await signupApi.sendSignupMobileVerify({ mobile });
    setMobileToken(res.responseData?.token ?? "");
    setSuccessMessage("mobile", "OTP sent to your mobile number");
    setErrorMessage("mobile", "");
    setChannelCaptcha("mobile", false);
    return res;
  };

  const updateSignupEmail = async (params: {
    customerId: number;
    newEmail: string;
    name: string;
  }) => {
    const result = await updateSignupEmailMutation.mutateAsync({
      customerId: params.customerId,
      newEmail: params.newEmail,
    });
    const updatedEmail = result.responseData?.email ?? params.newEmail;
    setEmailOtp("");
    setEmailToken("");
    await sendEmailOtpToAddress(updatedEmail, params.name);
    toast.success("Email updated. A new OTP has been sent.");
    return updatedEmail;
  };

  const updateSignupPhone = async (params: {
    customerId: number;
    newPhone: string;
  }) => {
    const result = await updateSignupPhoneMutation.mutateAsync({
      customerId: params.customerId,
      newPhone: params.newPhone,
    });
    const updatedPhone = result.responseData?.phone ?? params.newPhone;
    setMobileOtp("");
    setMobileToken("");
    await sendMobileOtpToNumber(updatedPhone);
    toast.success("Phone number updated. A new OTP has been sent.");
    return updatedPhone;
  };

  const verifyBothSignupOtps = (customerId: number) => {
    if (!emailToken || !mobileToken) {
      toast.error("Please request OTPs before verifying.");
      return;
    }
    verifyBothMutation.mutate({
      id: customerId,
      emailOtp,
      emailToken,
      mobileOtp,
      mobileToken,
    });
  };

  return {
    sendBothSignupOtps,
    sendEmailOtp,
    sendMobileOtp,
    resendEmailOtp,
    resendMobileOtp,
    updateSignupEmail,
    updateSignupPhone,
    verifyBothSignupOtps,
    isPending:
      sendAuthMobileOtpMutation.isPending ||
      sendAuthEmailOtpMutation.isPending ||
      updateSignupEmailMutation.isPending ||
      updateSignupPhoneMutation.isPending ||
      verifyBothMutation.isPending,
    timer,
  };
};

export type ISignUpAuthFlow = ReturnType<typeof useSignUpAuthFlow>;
