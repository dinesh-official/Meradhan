"use client";
import React from "react";
import OtpInputStep from "./_components/OtpInputStep";
import { useLoginHook } from "./_hooks/useLoginHook";
import EmailInputStep from "./_components/EmailInputStep";

function LoginForm() {
  const { actions, state, loginWithOtpMutation, otpVerificationMutation } =
    useLoginHook();

  return (
    <div>
      {state.step.value == "EMAIL" && (
        <EmailInputStep
          onChangeAction={state.email.setEmail}
          value={state.email.value}
          onSubmit={actions.handelEmailSubmit}
          isLoading={loginWithOtpMutation.isPending}
        />
      )}

      {state.step.value == "OTP" && (
        <OtpInputStep
          email={state.email.value}
          onBack={() => state.step.setStep("EMAIL")}
          onChangeAction={state.otp.setOtp}
          value={state.otp.value}
          onSubmit={actions.handelOtpSubmit}
          isLoading={otpVerificationMutation.isPending}
        />
      )}
    </div>
  );
}

export default LoginForm;
