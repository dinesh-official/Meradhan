"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function OrdersSectionTabs() {
  const pathname = usePathname();
  const isPg = pathname?.includes("/pg-management");
  const isLogs = pathname?.includes("/payment-process-logs");
  const isInv = pathname?.includes("/inventory-stock");
  const isReports = pathname?.includes("/orders/reports");

  return (
    <div className="flex gap-6 border-b border-border mb-5">
      <Link
        href="/dashboard/orders"
        className={cn(
          "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
          !isPg && !isLogs && !isInv && !isReports
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        View Orders
      </Link>
      <Link
        href="/dashboard/orders/pg-management"
        className={cn(
          "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
          isPg
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        PG Management
      </Link>
      <Link
        href="/dashboard/orders/payment-process-logs"
        className={cn(
          "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
          isLogs
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        Payment Process Logs
      </Link>
      <Link
        href="/dashboard/orders/inventory-stock"
        className={cn(
          "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
          isInv
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        Inventory stock
      </Link>
      <Link
        href="/dashboard/orders/reports"
        className={cn(
          "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
          isReports
            ? "border-primary text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground"
        )}
      >
        Reports
      </Link>
    </div>
  );
}
