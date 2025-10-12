"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AtSignIcon } from "lucide-react";
import React from "react";

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
        <p className="text-xs text-gray-800 mb-1">Email Address</p>
        <div className="relative">
          <Input
            className="peer ps-9"
            placeholder="Email"
            type="email"
            value={value}
            disabled={isLoading}
            onChange={(e) => onChangeAction?.(e.target.value)}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <AtSignIcon size={16} aria-hidden="true" />
          </div>
        </div>
      </div>
      <Button className="w-full " onClick={onSubmit} disabled={isLoading}>
        Send OTP
      </Button>
    </div>
  );
}

export default EmailInputStep;
