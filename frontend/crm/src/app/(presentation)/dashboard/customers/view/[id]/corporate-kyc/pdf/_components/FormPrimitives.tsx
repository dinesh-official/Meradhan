"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type {
  Address,
  AddressType,
  ProofDocument,
} from "../_utils/mapToPdfPayload";
import { ADDRESS_TYPES } from "../_utils/mapToPdfPayload";

/* ------------------------------------------------------------------ */
/* Field primitives                                                    */
/* ------------------------------------------------------------------ */

type Disabled = { disabled?: boolean };

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  className,
  disabled,
  type = "text",
}: Disabled & {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  type?: "text" | "email" | "tel" | "number";
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  disabled,
}: Disabled & {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Textarea
        rows={rows}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}

export function CheckField({
  label,
  checked,
  onChange,
  className,
  disabled,
}: Disabled & {
  label: string;
  checked: boolean | undefined;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted/40",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <Checkbox
        checked={!!checked}
        onCheckedChange={(v) => onChange(v === true)}
        disabled={disabled}
      />
      <span>{label}</span>
    </label>
  );
}

const SELECT_EMPTY_VALUE = "__none__";

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
  clearable = false,
}: Disabled & {
  label: string;
  value: T | undefined;
  onChange: (v: T | undefined) => void;
  options: readonly T[];
  placeholder?: string;
  className?: string;
  clearable?: boolean;
}) {
  const resolvedValue =
    value && options.includes(value)
      ? value
      : clearable
        ? SELECT_EMPTY_VALUE
        : "";

  return (
    <div className={cn("space-y-1", className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <Select
        value={resolvedValue}
        onValueChange={(v) => {
          if (clearable && v === SELECT_EMPTY_VALUE) {
            onChange(undefined);
            return;
          }
          onChange(v as T);
        }}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder ?? "Select..."} />
        </SelectTrigger>
        <SelectContent>
          {clearable ? (
            <SelectItem value={SELECT_EMPTY_VALUE}>—</SelectItem>
          ) : null}
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Composite blocks                                                    */
/* ------------------------------------------------------------------ */

export function AddressFields({
  value,
  onChange,
  showAddressType = true,
  disabled,
}: Disabled & {
  value: Address | undefined;
  onChange: (next: Address) => void;
  showAddressType?: boolean;
}) {
  const v = value ?? {};
  const update = (patch: Partial<Address>) => onChange({ ...v, ...patch });
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {showAddressType ? (
        <SelectField
          label="Address type"
          value={v.addressType}
          onChange={(addressType) =>
            update({ addressType: addressType as AddressType })
          }
          options={ADDRESS_TYPES}
          className="md:col-span-2"
          disabled={disabled}
        />
      ) : null}
      <TextField
        label="Line 1"
        value={v.line1}
        onChange={(line1) => update({ line1 })}
        className="md:col-span-2"
        disabled={disabled}
      />
      <TextField
        label="Line 2"
        value={v.line2}
        onChange={(line2) => update({ line2 })}
        disabled={disabled}
      />
      <TextField
        label="Line 3"
        value={v.line3}
        onChange={(line3) => update({ line3 })}
        disabled={disabled}
      />
      <TextField
        label="City"
        value={v.city}
        onChange={(city) => update({ city })}
        disabled={disabled}
      />
      <TextField
        label="District"
        value={v.district}
        onChange={(district) => update({ district })}
        disabled={disabled}
      />
      <TextField
        label="State"
        value={v.state}
        onChange={(state) => update({ state })}
        disabled={disabled}
      />
      <TextField
        label="Pincode"
        value={v.pincode}
        onChange={(pincode) => update({ pincode })}
        disabled={disabled}
      />
      <TextField
        label="Country"
        value={v.country}
        onChange={(country) => update({ country })}
        className="md:col-span-2"
        disabled={disabled}
      />
    </div>
  );
}

export function ProofFields({
  value,
  onChange,
  disabled,
}: Disabled & {
  value: ProofDocument | undefined;
  onChange: (next: ProofDocument) => void;
}) {
  const v = value ?? {};
  const update = (patch: Partial<ProofDocument>) => onChange({ ...v, ...patch });
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-2">
        <CheckField
          label="Aadhaar"
          checked={v.aadhaarChecked}
          onChange={(b) => update({ aadhaarChecked: b })}
          disabled={disabled}
        />
        <TextField
          label="Aadhaar (last 4 digits)"
          value={v.aadhaarLastDigits}
          onChange={(aadhaarLastDigits) => update({ aadhaarLastDigits })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <CheckField
          label="Driving Licence"
          checked={v.drivingLicenseChecked}
          onChange={(b) => update({ drivingLicenseChecked: b })}
          disabled={disabled}
        />
        <TextField
          label="DL number"
          value={v.drivingLicenseNumber}
          onChange={(drivingLicenseNumber) => update({ drivingLicenseNumber })}
          disabled={disabled}
        />
        <TextField
          label="Expiry (DD / MM / YYYY)"
          value={v.expiryDate1}
          onChange={(expiryDate1) => update({ expiryDate1 })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <CheckField
          label="Voter ID"
          checked={v.voterIdChecked}
          onChange={(b) => update({ voterIdChecked: b })}
          disabled={disabled}
        />
        <TextField
          label="Voter ID number"
          value={v.voterIdNumber}
          onChange={(voterIdNumber) => update({ voterIdNumber })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <CheckField
          label="Passport"
          checked={v.passportChecked}
          onChange={(b) => update({ passportChecked: b })}
          disabled={disabled}
        />
        <TextField
          label="Passport number"
          value={v.passportNumber}
          onChange={(passportNumber) => update({ passportNumber })}
          disabled={disabled}
        />
        <TextField
          label="Expiry (DD / MM / YYYY)"
          value={v.expiryDate2}
          onChange={(expiryDate2) => update({ expiryDate2 })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <CheckField
          label="NREGA"
          checked={v.nregaChecked}
          onChange={(b) => update({ nregaChecked: b })}
          disabled={disabled}
        />
        <TextField
          label="NREGA number"
          value={v.nregaNumber}
          onChange={(nregaNumber) => update({ nregaNumber })}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <CheckField
          label="NPR"
          checked={v.nprChecked}
          onChange={(b) => update({ nprChecked: b })}
          disabled={disabled}
        />
        <TextField
          label="NPR number"
          value={v.nprNumber}
          onChange={(nprNumber) => update({ nprNumber })}
          disabled={disabled}
        />
      </div>
      <div className="rounded-md border p-3 space-y-2 md:col-span-2">
        <div className="grid gap-3 md:grid-cols-2">
          <CheckField
            label="Other"
            checked={v.otherChecked}
            onChange={(b) => update({ otherChecked: b })}
            disabled={disabled}
          />
          <TextField
            label="Other number"
            value={v.otherNumber}
            onChange={(otherNumber) => update({ otherNumber })}
            disabled={disabled}
          />
        </div>
        <TextField
          label="Identification number (catch-all)"
          value={v.identificationNumber}
          onChange={(identificationNumber) => update({ identificationNumber })}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-0.5 border-b pb-1.5", className)}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
