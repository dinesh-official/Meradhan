"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function formatNumberForDisplay(n: number): string {
  if (!Number.isFinite(n)) return "";
  const s = n.toString();
  if (!/e/i.test(s)) return s;
  return n.toFixed(18).replace(/\.?0+$/, "");
}

export type DecimalInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "defaultValue"
> & {
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
  /** When true, empty input on blur commits as `0` (required numeric fields). */
  emptyAsZero?: boolean;
};

/**
 * Decimal text field: avoids `type="number"` + `step` issues and parse-on-each-keystroke bugs
 * (e.g. typing `0.` or `0.00100` with `step="0.01"`). Commits a number on blur.
 */
export const DecimalInput = React.forwardRef<HTMLInputElement, DecimalInputProps>(
  function DecimalInput(
    {
      value,
      onChange,
      emptyAsZero = false,
      className,
      onFocus,
      onBlur,
      disabled,
      ...rest
    },
    ref,
  ) {
  const [typing, setTyping] = React.useState<string | null>(null);

  const display =
    typing !== null
      ? typing
      : value === null || value === undefined || Number.isNaN(value)
        ? ""
        : formatNumberForDisplay(value);

    return (
      <Input
        {...rest}
        ref={ref}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        disabled={disabled}
        className={cn(className)}
        value={display}
        onFocus={(e) => {
          setTyping(
            value === null || value === undefined || Number.isNaN(value)
              ? ""
              : formatNumberForDisplay(value),
          );
          onFocus?.(e);
        }}
        onChange={(e) => {
          setTyping(e.target.value);
        }}
        onBlur={(e) => {
          const raw = typing;
          setTyping(null);
          const trimmed = (raw ?? "").trim().replace(/,/g, "");
          if (trimmed === "" || trimmed === "." || trimmed === "-") {
            onChange(emptyAsZero ? 0 : undefined);
          } else {
            const n = parseFloat(trimmed);
            if (!Number.isFinite(n)) {
              onChange(emptyAsZero ? 0 : undefined);
            } else {
              onChange(n);
            }
          }
          onBlur?.(e);
        }}
      />
    );
  },
);
