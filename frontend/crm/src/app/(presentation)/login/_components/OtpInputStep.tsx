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
    <div className="relative flex flex-col gap-4 mt-5 px-3">
      <div>
        <p className="mb-1 text-gray-800 text-xs">Enter OTP</p>
        <InputOTP
          pattern={REGEXP_ONLY_DIGITS}
          maxLength={6}
          value={value}
          className="w-full overflow-hidden"
          enterKeyHint="done"
          disabled={isLoading}
          onChange={(e) => {
            onChangeAction?.(e);
          }}
          onComplete={() => {
            onSubmit?.();
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
        <p className="mt-1 text-[10px] text-gray-400">
          OTP sent to <span className="text-gray-700">{email}</span>
        </p>
      </div>
      <div className="gap-3 grid grid-cols-5">
        <Button
          className="col-span-2 w-full"
          disabled={isLoading}
          variant={"secondary"}
          onClick={onBack}
        >
          Go Back
        </Button>
        <Button
          className="col-span-3 w-full"
          disabled={isLoading || value?.length !== 6}
          onClick={onSubmit}
        >
          Verify & Login
        </Button>
      </div>
    </div>
  );
}

export default OtpInputStep;
