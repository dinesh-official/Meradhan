import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { memo } from "react";

function SignUpOtpInput({
  otp,
  setOtp,
}: {
  otp: string;
  setOtp: (otp: string) => void;
}) {
  return (
    <InputOTP
      maxLength={4}
      className="w-full"
      pattern={REGEXP_ONLY_DIGITS}
      value={otp}
      onChange={setOtp}
    >
      <InputOTPGroup className="flex justify-between items-center gap-5 w-full font-medium">
        <InputOTPSlot index={0} className="py-5 border rounded-md w-full" />
        <InputOTPSlot index={1} className="py-5 border rounded-md w-full" />
        <InputOTPSlot index={2} className="py-5 border rounded-md w-full" />
        <InputOTPSlot index={3} className="py-5 border rounded-md w-full" />
      </InputOTPGroup>
    </InputOTP>
  );
}

export default memo(SignUpOtpInput);
