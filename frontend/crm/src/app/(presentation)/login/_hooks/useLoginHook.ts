import { useState } from "react";


export const useLoginHook = () => {
  // states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");

  // actions
  const handelEmailSubmit = () => {
    setStep("OTP"); // testing..
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
        value: step,
        setStep,
      },
    },
    actions: {
      handelEmailSubmit,
      handelOtpSubmit,
    },
  };
};
