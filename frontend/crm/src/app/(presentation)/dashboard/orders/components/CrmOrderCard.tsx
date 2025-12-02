"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FaEye } from "react-icons/fa6";
import { PiCurrencyInrBold } from "react-icons/pi";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { formatAmount } from "@/global/utils/formate";
import type { CrmOrder } from "@root/apiGateway";
import { getBondType, getIssuerCode, getStatusDisplay } from "../utils/orderUtils";

interface CrmOrderCardProps {
  order: CrmOrder;
  showSeparator?: boolean;
}

function CrmOrderCard({ order, showSeparator = false }: CrmOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusDisplay = getStatusDisplay(order.status);
  const issuerCode = getIssuerCode(order.bondDetails);
  const bondType = getBondType(order.bondDetails);
  const formattedDate = dateTimeUtils.formatDateTime(
    order.createdAt,
    "DD MMM YYYY"
  );
  const faceValue = formatAmount(parseFloat(order.faceValue));
  const totalValue = formatAmount(parseFloat(order.totalAmount));

  return (
    <>
      <div className="bg-white p-4 border rounded-lg shadow-sm">
        {/* Customer Info */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Customer</div>
          <h4 className="text-sm font-medium text-gray-900">
            {order.customerProfile.firstName} {order.customerProfile.lastName}
          </h4>
          <p className="text-xs text-gray-500">{order.customerProfile.emailAddress}</p>
        </div>

        {/* Security Name and Issuer */}
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

        {/* Value and Face Value */}
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

        {/* Status and Date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Status</div>
            <div className={`text-sm ${statusDisplay.className}`}>
              {statusDisplay.text}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Date</div>
            <div className="text-sm text-gray-900">{formattedDate}</div>
          </div>
        </div>

        {/* Expanded Section */}
        {isExpanded && (
          <>
            {/* Quantity and Bond Type */}
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

            {/* Order ID */}
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Order ID</div>
              <div className="text-sm text-gray-900">{order.orderNumber}</div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Less Details" : "More Details"}
          </Button>
          <Button variant="outline" size="sm">
            <FaEye size={14} />
          </Button>
        </div>
      </div>

      {showSeparator && <div className="h-4" />}
    </>
  );
}

export default CrmOrderCard;
