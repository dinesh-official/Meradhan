"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function OrdersSectionTabs() {
  const pathname = usePathname();
  const isPg = pathname?.includes("/pg-management");

  return (
    <div className="flex gap-6 border-b border-border mb-5">
      <Link
        href="/dashboard/orders"
        className={cn(
          "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
          !isPg
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
    </div>
  );
}
