"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import * as React from "react";

type Option = { label: string; value: string; disabled?: boolean };

type Props = {
  label: string;
  placeholder?: string;
  /** The value controlled by parent */
  value?: string;
  /** The default value if uncontrolled */
  defaultValue?: string;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  options: Option[];
  required?: boolean;
  containerClass?: string;
  error?: string;
};

export function SelectField({
  label,
  placeholder,
  value,
  defaultValue,
  onChange,
  options,
  required,
  containerClass,
  error,
}: Props) {
  // Determine if controlled or uncontrolled
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");

  const isControlled = value !== undefined;

  const handleChange = (val: string) => {
    if (!isControlled) setInternalValue(val);
    if (onChange) onChange(val);
  };

  return (
    <div className={cn(containerClass)}>
      <Label>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="mt-2 w-full">
        <Select
          value={isControlled ? value : internalValue}
          onValueChange={handleChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="w-[var(--radix-select-trigger-width)]">
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
