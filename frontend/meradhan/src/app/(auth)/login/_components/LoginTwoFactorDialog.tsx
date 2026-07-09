"use client";

import { memo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { FaShieldAlt } from "react-icons/fa";
import { useLoginDataStore } from "../_hooks/useLoginDataStore";
import type { ILoginFormHook } from "../_hooks/useLoginFormHook";

const PASSCODE_SLOT_CLASS =
  "bg-white border border-[#c5d4e8] rounded-lg w-full min-w-0 h-12 sm:h-14 text-base font-semibold text-[#1e3a5f] shadow-sm data-[active=true]:border-primary data-[active=true]:ring-2 data-[active=true]:ring-primary/20";

function PasscodeSeparator() {
  return (
    <div
      aria-hidden
      className="mx-0.5 sm:mx-1 font-medium text-[#7fabd2] text-lg select-none"
    >
      —
    </div>
  );
}

function LoginTwoFactorDialog({
  formManager,
}: {
  formManager: ILoginFormHook;
}) {
  const {
    state,
    setTwoFactorPasscode,
    resetTwoFactorDialog,
    setErrorMessage,
  } = useLoginDataStore();

  const isVerifying = formManager.verifyTwoFactorMutation.isPending;
  const isComplete = state.twoFactorPasscode.length === 6;

  useEffect(() => {
    if (!state.twoFactorDialogOpen) return;
    setErrorMessage("");
  }, [state.twoFactorDialogOpen, setErrorMessage]);

  const handleClose = (open: boolean) => {
    if (open || isVerifying) return;
    const confirm = window.confirm(
      "Are you sure you want to close? You need to enter your passcode to finish signing in.",
    );
    if (confirm) {
      setErrorMessage("");
      resetTwoFactorDialog();
    }
  };

  return (
    <Dialog open={state.twoFactorDialogOpen} onOpenChange={handleClose}>
      <DialogContent
        className="gap-0 overflow-hidden rounded-2xl border-[#c5d4e8] p-0 sm:max-w-[420px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-4 border-[#dce6f2] border-b bg-[#f4f8fc] px-6 pt-6 pb-5 text-center sm:text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FaShieldAlt size={24} aria-hidden />
          </div>
          <div className="space-y-1.5">
            <DialogTitle className="font-semibold text-[#1e3a5f] text-xl">
              Security check
            </DialogTitle>
            <DialogDescription className="mx-auto max-w-[300px] text-[#5a7a9a] text-sm leading-relaxed">
              Enter the 6-digit passcode you set in your account security
              settings.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="rounded-xl border border-[#dce6f2] bg-[#f8fbfe] px-4 py-5">
            <p className="mb-4 text-center font-medium text-[#1e3a5f] text-sm">
              Your passcode
            </p>
            <InputOTP
              maxLength={6}
              disabled={isVerifying}
              pattern={REGEXP_ONLY_DIGITS}
              value={state.twoFactorPasscode}
              onChange={setTwoFactorPasscode}
              onComplete={() => formManager.handleVerifyTwoFactor()}
              containerClassName="w-full justify-center"
            >
              <InputOTPGroup className="flex w-full items-center gap-1.5 sm:gap-2">
                {[0, 1, 2].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={PASSCODE_SLOT_CLASS}
                  />
                ))}
                <PasscodeSeparator />
                {[3, 4, 5].map((index) => (
                  <InputOTPSlot
                    key={index}
                    index={index}
                    className={PASSCODE_SLOT_CLASS}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <p className="mt-3 text-center text-[#7fabd2] text-xs">
              {isVerifying
                ? "Checking your passcode..."
                : isComplete
                  ? "Submitting..."
                  : "Enter all 6 digits to continue"}
            </p>
          </div>

          {state.errorMessage ? (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-center text-red-700 text-sm"
            >
              {state.errorMessage}
            </div>
          ) : null}

          <Button
            className={cn(
              "h-11 w-full font-medium",
              isComplete && !isVerifying && "shadow-sm",
            )}
            disabled={!isComplete || isVerifying}
            onClick={formManager.handleVerifyTwoFactor}
          >
            {isVerifying ? "Verifying passcode..." : "Verify & continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(LoginTwoFactorDialog);
