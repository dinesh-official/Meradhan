import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { memo } from "react";

function SignInOtpInput({
  otp,
  setOtp,
  length = 4,
  onComplete,
}: {
  otp: string;
  setOtp: (otp: string) => void;
  length?: number;
  onComplete?: () => void;
}) {
  return (
    <InputOTP
      maxLength={length}
      className="w-full"
      pattern={REGEXP_ONLY_DIGITS}
      value={otp}
      onChange={setOtp}
      onComplete={onComplete}
    >
      <InputOTPGroup className="flex justify-between items-center gap-3 sm:gap-5 w-full font-medium">
        {Array.from({ length }).map((_, index) => (
          <InputOTPSlot
            key={index}
            index={index}
            className="bg-muted py-5 border-none rounded-md w-full"
          />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

export default memo(SignInOtpInput);
