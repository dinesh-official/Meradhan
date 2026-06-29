"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCrmOrderStatusDisplay } from "@/global/constants/order";

export default function OrderStatusBadge({
  status,
  paymentStatus,
}: {
  status: string;
  paymentStatus?: string | null;
}) {
  const display = getCrmOrderStatusDisplay(status, paymentStatus);

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
