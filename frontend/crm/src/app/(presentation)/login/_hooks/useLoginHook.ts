import { useState } from "react";
import { useLoginApiHook } from "./useLoginApiHook";
import { appSchema } from "@root/schema";
import { parseError } from "@/core/error/parseError";
import { ZodError } from "zod";
import { toast } from "sonner";

export const useLoginHook = () => {
  // states
  const loginApi = useLoginApiHook();
  const { step, loginWithOtpMutation, otpVerificationMutation } = loginApi;
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // actions
  const handelEmailSubmit = () => {
    try {
      const payload = appSchema.auth.loginWithOtpSchema.parse({ email });
      loginWithOtpMutation.mutate({ email: payload.email });
    } catch (error) {
      const err = parseError<ZodError>(error);
      if (err.issues.length) {
        toast.error(err.issues[0].message);
      } else {
        toast.error(err.message);
      }
    }
  };

  const handelOtpSubmit = () => {
    try {
      const payload = appSchema.auth.verifyOtpSchema.parse({
        email,
        token: loginWithOtpMutation.data?.responseData.token,
        otp,
      });

      otpVerificationMutation.mutate(payload);
    } catch (error) {
      const err = parseError<ZodError>(error);
      if (err.issues.length) {
        toast.error(err.issues[0].message);
      } else {
        toast.error(err.message);
      }
    }
  };

  // providers
  return {
    state: {
      email: { value: email, setEmail },
      otp: { value: otp, setOtp },
      step: {
        value: step.step,
        setStep: step.setStep,
      },
    },
    actions: {
      handelEmailSubmit,
      handelOtpSubmit,
    },
    loginWithOtpMutation,
    otpVerificationMutation,
  };
};
