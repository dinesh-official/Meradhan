"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatAmount } from "@/global/utils/formate";
import type { Order } from "@root/apiGateway";
import { useState } from "react";
import {
  getStatusDisplay,
  isOrderSettled,
  formatOrderHistoryDate,
  formatOrderYieldPercent,
  getOrderSettlementDateInput,
  getOrderAccruedInterest,
  getOrderSettlementAmount,
} from "../_utils";
import { OrderPdfDownloads } from "./OrderPdfDownloads";
import { SecurityNameCell } from "./SecurityNameCell";

interface OrderCardProps {
  order: Order;
  showSeparator?: boolean;
}

function OrderCard({ order, showSeparator = false }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusDisplay = getStatusDisplay(
    order.status,
    order.paymentStatus,
    order.settleStatus,
    order.paymentProvider,
  );
  const tradeDate = formatOrderHistoryDate(order.createdAt);
  const settlementDate = formatOrderHistoryDate(getOrderSettlementDateInput(order));
  const faceValue = formatAmount(parseFloat(order.faceValue));
  const accruedInterest = getOrderAccruedInterest(order);
  const settlementAmount = getOrderSettlementAmount(order);
  const accruedDisplay =
    accruedInterest != null ? formatAmount(accruedInterest) : "—";
  const settlementDisplay =
    settlementAmount != null ? formatAmount(settlementAmount) : "—";

  return (
    <>
      <div className="bg-white mb-6 p-1 border-b border-gray-200">
        {/* Security: ISIN, coupon + name, maturity */}
        <div className="mb-4 min-w-0 overflow-hidden">
          <div className="mb-1 text-xs text-gray-500">Security Name</div>
          <SecurityNameCell order={order} />
        </div>

        {/* Middle: Value, Face Value, then Yield + Status */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="mb-1 text-xs text-gray-500">Accrued interest</div>
            <div className="text-sm text-gray-900">₹ {accruedDisplay}</div>
          </div>
          <div>
            <div className="mb-1 text-xs text-gray-500">Settlement amount</div>
            <div className="text-sm text-gray-900">₹ {settlementDisplay}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="mb-1 text-xs text-gray-500">Face value</div>
            <div className="text-sm text-gray-900">₹ {faceValue}</div>
          </div>
          <div>
            <div className="mb-1 text-xs text-gray-500">Yield</div>
            <div className="text-sm text-gray-900">{formatOrderYieldPercent(order)}</div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 text-xs text-gray-500">Status</div>
            <div className={`text-sm ${statusDisplay.className}`}>
              {statusDisplay.text}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-1 text-xs text-gray-500">Dates</div>
          <div className="text-sm leading-relaxed text-gray-900">
            <div>
              <span className="text-gray-500">Trade:</span> {tradeDate}
            </div>
            <div className="mt-0.5">
              <span className="text-gray-500">Settlement:</span> {settlementDate}
            </div>
          </div>
        </div>

        {/* Expanded Section: Quantity, Order ID, Payment Ref. */}
        {isExpanded && (
          <>
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Quantity</div>
              <div className="text-sm text-gray-900">{order.quantity}</div>
            </div>

            {/* Order ID and Payment Ref. (2-column grid) */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Order ID</div>
                <div className="text-sm text-gray-900">
                  {order.orderNumber.slice(-4)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Payment Ref.</div>
                <div className="flex items-center justify-start">
                  <OrderPdfDownloads
                    orderNumber={order.orderNumber}
                    variant="card"
                    showDealSheet={isOrderSettled(
                      order.status,
                      order.paymentStatus,
                      order.settleStatus,
                    )}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Less Details" : "More Details"}
        </Button>
      </div>

      {showSeparator && <Separator className="my-4" />}
    </>
  );
}

export default OrderCard;
