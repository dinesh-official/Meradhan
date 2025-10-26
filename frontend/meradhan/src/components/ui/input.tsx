import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:inline-flex bg-transparent selection:bg-primary dark:bg-input/30 file:bg-transparent disabled:opacity-50 px-3 py-1 border border-gray-200 file:border-0 rounded-md outline-none w-full min-w-0 h-9 file:h-7 file:font-medium selection:text-primary-foreground placeholder:text-gray-400 file:text-foreground md:text-sm file:text-sm text-base transition-[color,box-shadow] disabled:cursor-not-allowed disabled:pointer-events-none",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Input };
