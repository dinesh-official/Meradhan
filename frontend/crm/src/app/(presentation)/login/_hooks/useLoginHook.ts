import { useState } from "react";
import { useLoginApiHook } from "./useLoginApiHook";
import { appSchema } from "@root/schema";
import { parseError } from "@/core/error/parseError";
import { ZodError } from "zod";
import { toast } from "sonner";


export const useLoginHook = () => {
  // states
  const loginApi = useLoginApiHook()
  const { step, loginWithOtpMutation } = loginApi;
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // actions
  const handelEmailSubmit = () => {
    try {
      const payload = appSchema.auth.loginWithOtpSchema.parse({ email })
      loginWithOtpMutation.mutate({ email: payload.email });
    } catch (error) {
      const err = parseError<ZodError>(error);
      if (err.issues.length) {
        toast.error(err.issues[0].message)
      } else {
        toast.error(err.message)
      }
    }
  };

  const handelOtpSubmit = () => {
    // handle OTP submission
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
    loginWithOtpMutation
  };
};
