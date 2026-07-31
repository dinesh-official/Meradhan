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

/**
 * Fixed decimal string for display (avoids binary float tails like 106.81640000000000156888).
 * Rounds half-away-from-zero like `Number.prototype.toFixed`.
 */
export function formatDecimalWithMinFractionDigits(n: number, minDigits: number): string {
  if (!Number.isFinite(n) || minDigits < 0) return "";
  return n.toFixed(minDigits);
}

/** Stable numeric rounding for `places` fractional digits (uses `toFixed`, not `Math.round`×scale). */
export function roundToDecimalPlaces(n: number, places: number): number {
  if (!Number.isFinite(n) || places < 0) return n;
  return Number(n.toFixed(places));
}

/** After the first `.`, keep at most `maxFrac` digits (strip other chars). */
function limitTypedFractionDigits(raw: string, maxFrac: number): string {
  if (maxFrac < 0) return raw;
  const dot = raw.indexOf(".");
  if (dot === -1) return raw;
  const head = raw.slice(0, dot + 1);
  const frac = raw.slice(dot + 1).replace(/\D/g, "");
  return head + frac.slice(0, maxFrac);
}

export type DecimalInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "defaultValue"
> & {
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
  /** When true, empty input on blur commits as `0` (required numeric fields). */
  emptyAsZero?: boolean;
  /** When set, value is shown (and focused) with at least this many fractional digits, e.g. `4` → `99.3400`. */
  minFractionDigits?: number;
  /** When set, value is rounded on blur and typing cannot add more than this many fractional digits. */
  maxFractionDigits?: number;
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
      minFractionDigits,
      maxFractionDigits,
      className,
      onFocus,
      onBlur,
      disabled,
      ...rest
    },
    ref,
  ) {
    const [typing, setTyping] = React.useState<string | null>(null);

    const formatCommitted = React.useCallback(
      (n: number) => {
        const fracDigits =
          maxFractionDigits != null && maxFractionDigits >= 0
            ? maxFractionDigits
            : minFractionDigits != null && minFractionDigits > 0
              ? minFractionDigits
              : undefined;
        if (fracDigits != null) return n.toFixed(fracDigits);
        return formatNumberForDisplay(n);
      },
      [minFractionDigits, maxFractionDigits],
    );

    const display =
      typing !== null
        ? typing
        : value === null || value === undefined || Number.isNaN(value)
          ? ""
          : formatCommitted(value);

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
              : formatCommitted(value),
          );
          onFocus?.(e);
        }}
        onChange={(e) => {
          let v = e.target.value.replace(/,/g, "");
          const negative = v.startsWith("-");
          const unsigned = negative ? v.slice(1) : v;
          if (maxFractionDigits != null && maxFractionDigits >= 0) {
            v = (negative ? "-" : "") + limitTypedFractionDigits(unsigned, maxFractionDigits);
          } else {
            v = (negative ? "-" : "") + unsigned.replace(/[^\d.]/g, "");
          }
          setTyping(v);
        }}
        onBlur={(e) => {
          const raw = typing;
          setTyping(null);
          const trimmed = (raw ?? "").trim().replace(/,/g, "");
          if (trimmed === "" || trimmed === "." || trimmed === "-") {
            onChange(emptyAsZero ? 0 : undefined);
          } else {
            let n = parseFloat(trimmed);
            if (!Number.isFinite(n)) {
              onChange(emptyAsZero ? 0 : undefined);
            } else {
              if (maxFractionDigits != null && maxFractionDigits >= 0) {
                n = roundToDecimalPlaces(n, maxFractionDigits);
              }
              onChange(n);
            }
          }
          onBlur?.(e);
        }}
      />
    );
  },
);
