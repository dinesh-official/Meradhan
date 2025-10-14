"use client";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

function OtpInputStep({
  isLoading,
  onChangeAction,
  onSubmit,
  value,
  email,
  onBack,
}: {
  value?: string;
  onChangeAction?: (val: string) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  onBack?: () => void;
  email: string;
}) {
  return (
    <div className="flex flex-col gap-4 mt-5 px-3 relative">
      <div>
        <p className="text-xs text-gray-800 mb-1">Enter OTP</p>
        <InputOTP
          pattern={REGEXP_ONLY_DIGITS}
          maxLength={6}
          value={value}
          className="w-full overflow-hidden"
          onChange={(e) => {
            onChangeAction?.(e);
          }}
        >
          <InputOTPGroup className="w-full">
            <InputOTPSlot index={0} className="w-full" />
            <InputOTPSlot index={1} className="w-full" />
            <InputOTPSlot index={2} className="w-full" />
            <InputOTPSlot index={3} className="w-full" />
            <InputOTPSlot index={4} className="w-full" />
            <InputOTPSlot index={5} className="w-full" />
          </InputOTPGroup>
        </InputOTP>
        <p className="text-[10px] text-gray-400 mt-1">
          OTP sent to <span className="text-gray-700">{email}</span>
        </p>
      </div>
      <div className="grid grid-cols-5 gap-3">
        <Button
          className="w-full col-span-2"
          disabled={isLoading}
          variant={"secondary"}
          onClick={onBack}
        >
          Go Back
        </Button>
        <Button
          className="w-full col-span-3"
          disabled={isLoading}
          onClick={onSubmit}
        >
          Verify & Login
        </Button>
      </div>
    </div>
  );
}

export default OtpInputStep;
