"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PiCurrencyInrBold } from "react-icons/pi";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { formatAmount } from "@/global/utils/formate";
import type { CrmOrder } from "@root/apiGateway";
import { FaEye } from "react-icons/fa6";
import {
  getStatusDisplay,
  getBondType,
  getIssuerCode,
} from "../utils/orderUtils";
import { OrdersEmptyState } from "@/components/ui/empty";

interface CrmOrdersTableProps {
  orders: CrmOrder[];
  onClearFilters?: () => void;
  isLoading?: boolean;
}

function CrmOrdersTable({
  orders,
  onClearFilters,
  isLoading,
}: CrmOrdersTableProps) {
  // During loading, show nothing
  if (isLoading) {
    return null;
  }

  // When not loading and no orders, show empty state
  if (orders.length === 0) {
    return (
      <div className="hidden md:block mt-6">
        <OrdersEmptyState
          message="No orders found"
          ctaText="Clear Filters"
          onCtaClick={onClearFilters}
        />
      </div>
    );
  }

  // When not loading and has orders, show table
  return (
    <div className="hidden md:block mt-6">
      <Table>
        <TableHeader>
          <TableRow className="rounded-xl overflow-hidden border-white">
            <TableHead className="w-[120px] rounded-md bg-[#F5F5F5] rounded-r-none py-4 px-6">
              Order ID
            </TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Customer</TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Bond Type</TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">
              Security Name
            </TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Face Value</TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Quantity</TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Value</TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">
              Request Date
            </TableHead>
            <TableHead className="bg-[#F5F5F5] py-4 px-6">Status</TableHead>
            <TableHead className="bg-[#F5F5F5] rounded-r-md text-center py-4 px-6">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="border-b border-gray-100">
          {orders.map((order) => {
            const statusDisplay = getStatusDisplay(order.status);
            const bondType = getBondType(order.bondDetails);
            const issuerCode = getIssuerCode(order.bondDetails);
            const formattedDate = dateTimeUtils.formatDateTime(
              order.createdAt,
              "DD MMM YYYY"
            );
            const faceValue = formatAmount(parseFloat(order.faceValue));
            const totalValue = formatAmount(parseFloat(order.totalAmount));

            return (
              <TableRow key={order.id} className="hover:bg-gray-50">
                <TableCell className="py-4 px-6">
                  <div className="font-medium">{order.orderNumber}</div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="leading-relaxed">
                    <div className="font-medium">
                      {order.customerProfile.firstName}{" "}
                      {order.customerProfile.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customerProfile.emailAddress}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">{bondType}</TableCell>
                <TableCell className="py-4 px-6">
                  <div className="leading-relaxed">
                    {order.bondName}
                    {issuerCode && (
                      <>
                        <br />
                        <span className="text-sm text-gray-500">
                          Issuer: {issuerCode}
                        </span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center">
                    <PiCurrencyInrBold /> {faceValue}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">{order.quantity}</TableCell>
                <TableCell className="py-4 px-6">
                  <div className="flex items-center">
                    <PiCurrencyInrBold /> {totalValue}
                  </div>
                </TableCell>
                <TableCell className="py-4 px-6">{formattedDate}</TableCell>
                <TableCell className={`py-4 px-6 ${statusDisplay.className}`}>
                  {statusDisplay.text}
                </TableCell>
                <TableCell className="py-4 px-6">
                  <div className="text-center flex justify-center items-center text-primary cursor-pointer">
                    <FaEye size={18} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default CrmOrdersTable;
