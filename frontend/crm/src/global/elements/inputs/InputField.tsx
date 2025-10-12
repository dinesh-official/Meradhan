"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import * as React from "react";

interface InputFieldProps {
  id: string;
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
  containerClass?: string;
  error?: string;
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
  containerClass,
  error,
}: InputFieldProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const isControlled = value !== undefined;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) setInternalValue(newValue);
    if (onChangeAction) onChangeAction(newValue);
  };

  return (
    <div className={containerClass}>
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={isControlled ? value : internalValue}
        onChange={handleChange}
        className="mt-2"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
