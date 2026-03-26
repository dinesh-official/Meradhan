import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React from "react";

function LabelInput({
  children,
  error,
  label,
  required,
  className,
}: {
  label?: string;
  required?: boolean;
  error?: string | undefined;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Label className="text-[#666666] text-xs">
        {label} {required && <span className="text-red-600">*</span>}
      </Label>
      {children}
      {error && <small className="text-[10px] text-red-600">{error}</small>}
    </div>
  );
}

export default LabelInput;
