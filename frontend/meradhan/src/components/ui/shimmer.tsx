import * as React from "react";

import { cn } from "@/lib/utils";

/** Skeleton block with diagonal shimmer sweep (moving highlight). */
export function ShimmerBlock({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      role="presentation"
      className={cn("portfolio-shimmer", className)}
      {...props}
    />
  );
}
