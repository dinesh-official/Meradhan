"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";

function EmailInputStep({
  isLoading,
  onChangeAction,
  onSubmit,
  value,
}: {
  value?: string;
  onChangeAction?: (val: string) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 mt-5 px-3">
      <div>
        <p className="mb-1 text-gray-800 text-xs">Email Address</p>
        <div className="relative">
          <Input
            className="peer ps-9"
            placeholder="Enter your email address"
            type="email"
            value={value}
            disabled={isLoading}
            onChange={(e) => onChangeAction?.(e.target.value.toLowerCase())}
          />
          <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 text-muted-foreground/80 pointer-events-none start-0">
            <Mail size={16} aria-hidden="true" />
          </div>
        </div>
      </div>
      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={isLoading || !value?.includes("@meradhan.co")}
      >
        Send OTP
      </Button>
    </div>
  );
}

export default EmailInputStep;
