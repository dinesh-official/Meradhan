"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCrmOrderStatusDisplay } from "@/global/constants/order";

export default function OrderStatusBadge({
  status,
  paymentStatus,
  paymentProvider,
}: {
  status: string;
  paymentStatus?: string | null;
  paymentProvider?: string | null;
}) {
  const display = getCrmOrderStatusDisplay(
    status,
    paymentStatus,
    paymentProvider,
  );

  return (
    <Badge
      className={cn(
        "rounded px-2 text-xs font-medium",
        display.badgeClass,
      )}
    >
      {display.title}
    </Badge>
  );
}
