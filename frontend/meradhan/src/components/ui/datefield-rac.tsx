"use client";

import {
  composeRenderProps,
  DateFieldProps,
  DateField as DateFieldRac,
  DateInputProps as DateInputPropsRac,
  DateInput as DateInputRac,
  DateSegmentProps,
  DateSegment as DateSegmentRac,
  DateValue as DateValueRac,
  TimeFieldProps,
  TimeField as TimeFieldRac,
  TimeValue as TimeValueRac,
} from "react-aria-components";

import { cn } from "@/lib/utils";

function DateField<T extends DateValueRac>({
  className,
  children,
  ...props
}: DateFieldProps<T>) {
  return (
    <DateFieldRac
      className={composeRenderProps(className, (className) => cn(className))}
      {...props}
    >
      {children}
    </DateFieldRac>
  );
}

function TimeField<T extends TimeValueRac>({
  className,
  children,
  ...props
}: TimeFieldProps<T>) {
  return (
    <TimeFieldRac
      className={composeRenderProps(className, (className) => cn(className))}
      {...props}
    >
      {children}
    </TimeFieldRac>
  );
}

function DateSegment({ className, ...props }: DateSegmentProps) {
  return (
    <DateSegmentRac
      className={composeRenderProps(className, (className) =>
        cn(
          "inline data-focused:bg-muted data-invalid:data-focused:bg-destructive data-disabled:opacity-50 p-0.5 data-[type=literal]:px-0 rounded outline-hidden text-gray-700 data-[type=literal]:text-gray-400 data-focused:data-placeholder:text-gray-400 data-focused:text-gray-700 data-invalid:data-focused:data-placeholder:text-white data-invalid:data-focused:text-white data-invalid:data-placeholder:text-destructive data-invalid:text-destructive data-placeholder:text-gray-400 caret-transparent data-disabled:cursor-not-allowed",
          className
        )
      )}
      {...props}
      data-invalid
      
    />
  );
}

const dateInputStyle =
  "relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm transition-[color,box-shadow] outline-none   data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40 data-focus-within:has-aria-invalid:border-destructive";

interface DateInputProps extends DateInputPropsRac {
  className?: string;
  unstyled?: boolean;
}

function DateInput({
  className,
  unstyled = false,
  ...props
}: Omit<DateInputProps, "children">) {
  return (
    <DateInputRac
      className={composeRenderProps(className, (className) =>
        cn(!unstyled && dateInputStyle, className)
      )}
      {...props}
    >
      {(segment) => (
        <DateSegment
          segment={{
            ...segment,
          }}
        />
      )}
    </DateInputRac>
  );
}

export { DateField, DateInput, DateSegment, TimeField, dateInputStyle };
export type { DateInputProps };
