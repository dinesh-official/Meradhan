"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLoginDataStore } from "../_hooks/useLoginDataStore";
import type { ILoginFormHook } from "../_hooks/useLoginFormHook";

const LOGIN_INPUT_CLASS =
  "bg-muted py-4.5 border-none placeholder:text-[#7fabd2]";

function LoginAccountActivationPopUp({
  formManager,
}: {
  formManager: ILoginFormHook;
}) {
  const {
    state,
    setOtp,
    setMode,
    setActivationChannel,
    setActivationToken,
    setActivationStep,
    setErrorMessage,
    setSuccessMessage,
  } = useLoginDataStore();

  const isOpen = state.mode === "account_activation";
  const channel = state.activationChannel;
  const isPromptStep = state.activationStep === "prompt";
  const otpLength = channel === "email" ? 6 : 4;

  const promptTitle = "Verification required";

  const unverifiedMessage =
    channel === "email"
      ? "Your email address is not verified yet."
      : "Your mobile number is not verified yet.";

  const otpStepTitle =
    channel === "email"
      ? "Verify your email address"
      : "Verify your mobile number";

  const otpLabel =
    channel === "email"
      ? "Enter 6-digit OTP sent to your email"
      : "Enter 4-digit OTP sent to your mobile";

  const resetActivation = () => {
    setOtp("");
    setActivationChannel(null);
    setActivationToken("");
    setActivationStep("prompt");
    setErrorMessage("");
    setSuccessMessage("");
    setMode("pending");
  };

  const handleClose = (open: boolean) => {
    if (open) return;
    const confirm = window.confirm(
      "Are you sure you want to close? You need to verify your account to sign in.",
    );
    if (confirm) {
      resetActivation();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-[#c5d4e8] p-0 sm:max-w-md">
        <DialogHeader className="space-y-0 border-[#dce6f2] border-b px-6 py-5 text-left">
          <DialogTitle className="font-semibold text-[#1e3a5f] text-lg">
            {isPromptStep ? promptTitle : otpStepTitle}
          </DialogTitle>
        </DialogHeader>

        {isPromptStep ? (
          <div className="flex flex-col gap-5 px-6 py-6">
            <p className="text-[#1e3a5f] text-sm leading-relaxed">
              {unverifiedMessage}
              {state.activationMaskedTarget ? (
                <>
                  {" "}
                  We have{" "}
                  <span className="font-medium">
                    {channel === "email" ? "your email" : "your number"}{" "}
                    {state.activationMaskedTarget}
                  </span>{" "}
                  on file.
                </>
              ) : null}{" "}
              To sign in, please verify this{" "}
              {channel === "email" ? "email address" : "mobile number"}.
            </p>

            <p className="text-[#1e3a5f] text-sm">
              <button
                type="button"
                className="font-medium text-primary underline"
                disabled={formManager.sendActivationOtpMutation.isPending}
                onClick={formManager.handleStartAccountActivation}
              >
                Click here to verify
              </button>{" "}
              and we will send you an OTP.
            </p>

            {state.errorMessage ? (
              <p className="text-red-600 text-sm">{state.errorMessage}</p>
            ) : null}

            <Button
              className="w-full"
              disabled={formManager.sendActivationOtpMutation.isPending}
              onClick={formManager.handleStartAccountActivation}
            >
              {formManager.sendActivationOtpMutation.isPending
                ? "Sending OTP..."
                : "Verify"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-6 py-6">
            {state.activationMaskedTarget ? (
              <p className="text-[#1e3a5f] text-sm">
                OTP sent to{" "}
                <span className="font-medium">
                  {state.activationMaskedTarget}
                </span>
              </p>
            ) : null}

            <div className="flex flex-col gap-2">
              <label className="font-medium text-[#1e3a5f] text-sm">
                {otpLabel}
              </label>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={otpLength}
                placeholder={
                  channel === "email" ? "6-digit OTP" : "4-digit OTP"
                }
                value={state.otp}
                disabled={
                  formManager.verifyAccountActivationMutation.isPending
                }
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "").slice(0, otpLength),
                  )
                }
                className={LOGIN_INPUT_CLASS}
              />
            </div>

            {state.errorMessage ? (
              <p className="text-red-600 text-sm">{state.errorMessage}</p>
            ) : null}
            {state.successMessage ? (
              <p className="text-green-600 text-sm">{state.successMessage}</p>
            ) : null}

            <Button
              className="w-full"
              disabled={
                state.otp.length !== otpLength ||
                formManager.verifyAccountActivationMutation.isPending
              }
              onClick={formManager.handleVerifyAccountActivation}
            >
              Verify OTP
            </Button>

            <p className="text-center text-sm">
              <span
                className={`cursor-pointer text-primary ${
                  !state.allowedResend && "pointer-events-none opacity-60"
                }`}
                onClick={
                  state.allowedResend
                    ? formManager.handleResendActivationOtp
                    : undefined
                }
              >
                {state.allowedResend
                  ? "Resend OTP"
                  : `Resend OTP in ${formManager.timer.time}`}
              </span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default memo(LoginAccountActivationPopUp);
