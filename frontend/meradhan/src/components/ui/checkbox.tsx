"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as React from "react";

import { cn } from "@/lib/utils";
import { FaCheck } from "react-icons/fa";

function Checkbox({
  className,
  checkClass,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  checkClass?: string;
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer data-[state=checked]:bg-primary dark:bg-input/30 dark:data-[state=checked]:bg-primary disabled:opacity-50 shadow-none border border-gray-400 data-[state=checked]:border-primary aria-invalid:border-destructive focus-visible:border-ring rounded-[4px] outline-none aria-invalid:ring-destructive/20 focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:aria-invalid:ring-destructive/40 size-4 data-[state=checked]:text-white transition-shadow cursor-pointer disabled:cursor-not-allowed shrink-0",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="place-content-center grid text-current transition-none"
      >
        <FaCheck className={cn("size-2.5", checkClass)} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
