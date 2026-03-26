"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";

interface InputFieldProps {
  id?: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  /** Controlled value (for form state) */
  value?: string;
  /** Uncontrolled default value */
  defaultValue?: string;
  /** Callback when input value changes */
  onChangeAction?: (value: string) => void;
  /** Optional container class */
  className?: string;
  error?: string;
  readonly?: boolean;
  max?: number;
}

export function InputField({
  id,
  label,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  value,
  defaultValue,
  onChangeAction,
  className,
  error,
  readonly,
  max,
}: InputFieldProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const isControlled = value !== undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) setInternalValue(newValue);
    if (onChangeAction) onChangeAction(newValue);
  };

  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        max={max}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={isControlled ? value : internalValue}
        onChange={handleChange}
        readOnly={readonly}
        className="disabled:bg-gray-200 disabled:opacity-100 mt-2 disabled:border-0 disabled:text-black"
      />

      {error && (
        <p className="mt-1 text-destructive text-xs text-left">{error}</p>
      )}
    </div>
  );
}
