"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCrmOrderStatusDisplay } from "@/global/constants/order";

export default function OrderStatusBadge({
  status,
  paymentStatus,
  paymentProvider,
  prefix,
}: {
  status: string;
  paymentStatus?: string | null;
  paymentProvider?: string | null;
  /** e.g. "Settlement" — shown before the status label */
  prefix?: string;
}) {
  const display = getCrmOrderStatusDisplay(
    status,
    paymentStatus,
    paymentProvider,
  );

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded px-2 text-xs font-medium shadow-none",
        display.badgeClass,
      )}
    >
      {prefix ? (
        <>
          <span className="font-normal opacity-70">{prefix}</span>
          <span className="mx-1 opacity-40">·</span>
        </>
      ) : null}
      {display.title}
    </Badge>
  );
}
