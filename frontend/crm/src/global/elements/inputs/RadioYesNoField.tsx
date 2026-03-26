"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

type YesNo = "yes" | "no";

interface RadioYesNoFieldProps {
  id: string;
  label: string;
  required?: boolean;
  defaultValue?: YesNo;
  value?: YesNo;
  onChangeAction?: (v: YesNo) => void;
  className?: string;
}

export function RadioYesNoField({
  id,
  label,
  required,
  defaultValue = "no",
  value,
  onChangeAction,
  className,
}: RadioYesNoFieldProps) {
  const yesId = `${id}-yes`;
  const noId = `${id}-no`;

  const [internalValue, setInternalValue] = React.useState<YesNo>(defaultValue);
  const isControlled = value !== undefined;

  const handleChange = (v: string) => {
    const val = v as YesNo;
    if (!isControlled) setInternalValue(val);
    if (onChangeAction) onChangeAction(val);
  };

  return (
    <div className={cn(className)}>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>

      <RadioGroup
        className="mt-2 flex gap-6"
        value={isControlled ? value : internalValue}
        onValueChange={handleChange}
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem id={yesId} value="yes" />
          <Label htmlFor={yesId} className="font-normal">
            Yes
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem id={noId} value="no" />
          <Label htmlFor={noId} className="font-normal">
            No
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
