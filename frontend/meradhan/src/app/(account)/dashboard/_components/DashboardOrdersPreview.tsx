"use client";

import type { Order } from "@root/apiGateway";
import {
  getStatusDisplay,
  formatOrderHistoryDate,
  formatOrderYieldPercent,
  getOrderSettlementDateInput,
} from "../orders/_utils";
import { SecurityNameCell } from "../orders/components/SecurityNameCell";

/** Compact list for the dashboard card (half-width); full table lives on `/dashboard/orders`. */
export function DashboardOrdersPreview({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return null;

  return (
    <div
      className="min-h-0 max-h-[min(22rem,42dvh)] overflow-y-auto overscroll-y-contain pr-0.5 [scrollbar-gutter:stable]"
      aria-label="Recent orders list"
    >
      <ul className="flex min-w-0 flex-col divide-y divide-gray-100">
      {orders.map((order) => {
        const statusDisplay = getStatusDisplay(
          order.status,
          order.paymentStatus,
          order.settleStatus,
          order.paymentProvider,
        );
        const tradeDate = formatOrderHistoryDate(order.createdAt);
        const settlementDate = formatOrderHistoryDate(
          getOrderSettlementDateInput(order),
        );

        return (
          <li key={order.id} className="space-y-2 py-4 first:pt-0">
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              {order.orderNumber}
            </p>
            <div className="min-w-0 max-w-full overflow-hidden">
              <SecurityNameCell order={order} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs leading-snug">
              <span className="text-muted-foreground">
                Yield:{" "}
                <span className="font-medium text-gray-900 tabular-nums">
                  {formatOrderYieldPercent(order)}
                </span>
              </span>
              <span className="text-muted-foreground">
                Trade: <span className="text-gray-900">{tradeDate}</span>
              </span>
              <span className="text-muted-foreground">
                Settlement:{" "}
                <span className="text-gray-900">{settlementDate}</span>
              </span>
              <span className={`font-medium ${statusDisplay.className}`}>
                {statusDisplay.text}
              </span>
            </div>
          </li>
        );
      })}
      </ul>
    </div>
  );
}
