"use client";

import React, { forwardRef, useId } from "react";
import { ChevronDownIcon, PhoneIcon } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// If you want the package default styles for accessibility focus rings etc.
// import "react-phone-number-input/style.css";

type PhoneFieldProps = {
  label?: string;
  name?: string;
  value?: string;
  onChangeAction?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  defaultCountry?: RPNInput.Country; // e.g. "IN"
  international?: boolean; // show country selector by default
  error?: string;
  className?: string;
};

const PhoneInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      data-slot="phone-input"
      className={cn(
        "-ms-px rounded-s-none shadow-none focus-visible:z-10",
        className
      )}
      {...props}
    />
  )
);
PhoneInput.displayName = "PhoneInput";

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: { label: string; value: RPNInput.Country | undefined }[];
}) => {
  return (
    <div className="relative inline-flex items-center self-stretch rounded-s-md border border-gray-200 bg-background py-2 ps-3 pe-2 text-muted-foreground transition-[color,box-shadow] outline-none focus-within:z-10   hover:bg-accent hover:text-foreground has-disabled:pointer-events-none has-disabled:opacity-50 has-aria-invalid:border-destructive/60 has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40">
      <div className="inline-flex items-center gap-1" aria-hidden="true">
        <FlagComponent country={value} countryName={value} aria-hidden="true" />
        <span className="text-muted-foreground/80">
          <ChevronDownIcon size={16} aria-hidden="true" />
        </span>
      </div>
      <select
        disabled={disabled}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value as RPNInput.Country)}
        className="absolute inset-0 text-sm opacity-0"
        aria-label="Select country"
      >
        <option key="default" value="">
          Select a country
        </option>
        {options
          .filter((x) => x.value)
          .map((option, i) => (
            <option key={option.value ?? `empty-${i}`} value={option.value}>
              {option.label} {option.value &&
                `+${RPNInput.getCountryCallingCode(option.value)}`}
            </option>
          ))}
      </select>
    </div>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = country ? flags[country] : undefined;
  return (
    <span className="w-5 overflow-hidden rounded-sm">
      {Flag ? (
        <Flag title={countryName} />
      ) : (
        <PhoneIcon size={16} aria-hidden="true" />
      )}
    </span>
  );
};

export const PhoneField = ({
  label,
  name,
  value,
  onChangeAction,
  placeholder = "Enter phone number",
  disabled,
  required,
  defaultCountry = "IN",
  international = true,
  error,
  className,
}: PhoneFieldProps) => {
  const id = useId();

  return (
    <div className={cn("w-full", className)} dir="ltr">
      {label && (
        <Label htmlFor={id} >
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="mt-2">
        <RPNInput.default
          id={id}
          name={name}
          className="flex rounded-md shadow-none "
          // behavior
          international={international}
          defaultCountry={defaultCountry}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect as React.ElementType}
          inputComponent={PhoneInput as React.ElementType}
          // value
          value={value}
          onChange={(v) => onChangeAction?.(v ?? "")}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
};
