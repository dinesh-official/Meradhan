"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatAmount } from "@/global/utils/formate";
import type { Order } from "@root/apiGateway";
import { useState } from "react";
import {
  getBondType,
  getIssuerCode,
  getStatusDisplay,
  formatOrderHistoryDate,
} from "../_utils";
import { OrderPdfDownloads } from "./OrderPdfDownloads";

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
  );
  const issuerCode = getIssuerCode(order.bondDetails);
  const bondType = getBondType(order.bondDetails);
  const tradeDate = formatOrderHistoryDate(order.createdAt);
  const settlementDate = formatOrderHistoryDate(order.settlementDate);
  const faceValue = formatAmount(parseFloat(order.faceValue));
  const totalValue = formatAmount(parseFloat(order.totalAmount));

  return (
    <>
      <div className="bg-white mb-6 p-1 border-b border-gray-200">
        {/* Top Section: Security Name and Issuer */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Security Name</div>
          <h3 className="text-sm text-gray-900 mb-2">{order.bondName}</h3>
          {issuerCode && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Issuer:</span>
              <span className="text-sm text-gray-900">{issuerCode}</span>
            </div>
          )}
        </div>

        {/* Middle Section: Value and Face Value (2-column grid) */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Value</div>
            <div className="text-sm text-gray-900">₹ {totalValue}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Face Value</div>
            <div className="text-sm text-gray-900">₹ {faceValue}</div>
          </div>
        </div>

        {/* Lower Section: Status and Dates (2-column grid) */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className={`text-sm ${statusDisplay.className}`}>
              {statusDisplay.text}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Dates</div>
            <div className="text-sm text-gray-900 leading-relaxed">
              <div>
                <span className="text-gray-500">Trade:</span> {tradeDate}
              </div>
              <div className="mt-0.5">
                <span className="text-gray-500">Settlement:</span>{" "}
                {settlementDate}
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Section: Quantity, Bond Type, Order ID, Payment Ref. */}
        {isExpanded && (
          <>
            {/* Quantity and Bond Type (2-column grid) */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Quantity</div>
                <div className="text-sm text-gray-900">{order.quantity}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Bond Type</div>
                <div className="text-sm text-gray-900">{bondType}</div>
              </div>
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
