"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { memo } from "react";

/**
 * Compact 4-/6-digit OTP entry box used inside CRM dialogs (mobile + email
 * verify). Mirrors the meradhan `SignInOtpInput` styling so the visual is
 * identical between the customer-facing flow and the CRM-admin flow.
 */
function OtpInput({
  otp,
  setOtp,
  length = 6,
  disabled,
  onComplete,
}: {
  otp: string;
  setOtp: (otp: string) => void;
  length?: number;
  disabled?: boolean;
  onComplete?: () => void;
}) {
  return (
    <InputOTP
      maxLength={length}
      pattern={REGEXP_ONLY_DIGITS}
      value={otp}
      onChange={setOtp}
      onComplete={onComplete}
      disabled={disabled}
    >
      <InputOTPGroup className="flex justify-between items-center gap-2 sm:gap-3 w-full font-medium">
        {Array.from({ length }).map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className="bg-muted py-5 border-none rounded-md w-full text-base"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

export default memo(OtpInput);
