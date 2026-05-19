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
import { formatAmount } from "@/global/utils/formate";
import type { Order } from "@root/apiGateway";
import {
  getStatusDisplay,
  isOrderSettled,
  formatOrderHistoryDate,
  formatOrderYieldPercent,
  getOrderSettlementDateInput,
} from "../_utils";
import { OrderPdfDownloads } from "./OrderPdfDownloads";
import { SecurityNameCell } from "./SecurityNameCell";
import { OrdersEmptyState } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
}

function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  if (isLoading) {
    return (
      <div
        className="hidden min-h-[min(320px,calc(100dvh-14rem))] w-full max-w-[90vw] min-w-0 items-center justify-center rounded-lg border border-gray-200 bg-white md:flex"
        aria-busy="true"
        aria-label="Loading orders"
      >
        <Spinner className="size-8" />
      </div>
    );
  }

  // When not loading and no orders, show empty state
  if (orders.length === 0) {
    return (
      <div className="hidden md:block">
        <OrdersEmptyState
          message="No Orders found"
          ctaText="Browse All Bonds"
          onCtaClick={() => {
            // Navigate to bonds page or marketplace
            window.location.href = "/bonds";
          }}
        />
      </div>
    );
  }

  return (
    <div className="hidden w-full min-w-0 md:block">
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="max-h-[min(70vh,calc(100dvh-13rem))] overflow-x-auto overflow-y-auto overscroll-y-contain [scrollbar-gutter:stable]">
          <Table>
            <TableHeader className="sticky top-0 z-2 shadow-[0_1px_0_0_rgba(0,0,0,0.06)] [&_th]:bg-[#F5F5F5]">
              <TableRow className="rounded-xl overflow-hidden border-white">
                <TableHead className="w-[100px] rounded-md bg-[#F5F5F5] rounded-r-none py-4 px-6">
                  Order ID
                </TableHead>
                <TableHead className="min-w-48 max-w-md bg-[#F5F5F5] py-4 px-6 lg:max-w-lg">
                  Security Name
                </TableHead>
                <TableHead className="bg-[#F5F5F5] py-4 px-6">Face Value</TableHead>
                <TableHead className="bg-[#F5F5F5] py-4 px-6">Quantity</TableHead>
                <TableHead className="bg-[#F5F5F5] py-4 px-6">Value</TableHead>
                <TableHead className="whitespace-nowrap bg-[#F5F5F5] py-4 px-6">
                  Yield
                </TableHead>
                <TableHead className="bg-[#F5F5F5] py-4 px-6 min-w-[148px]">
                  Dates
                </TableHead>
                <TableHead className="bg-[#F5F5F5] py-4 px-6">Status</TableHead>
                <TableHead className="bg-[#F5F5F5] rounded-r-md text-center py-4 px-6">
                  Payment Ref.
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-b border-gray-100">
              {orders.map((order) => {
                const statusDisplay = getStatusDisplay(
                  order.status,
                  order.paymentStatus,
                  order.settleStatus,
                );
                const tradeDate = formatOrderHistoryDate(order.createdAt);
                const settlementDate = formatOrderHistoryDate(
                  getOrderSettlementDateInput(order),
                );
                const faceValue = formatAmount(parseFloat(order.faceValue));
                const totalValue = formatAmount(parseFloat(order.totalAmount));

                return (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="py-4 px-6">{order.orderNumber}</TableCell>
                    <TableCell className="min-w-48 max-w-md overflow-hidden py-4 px-6 align-top lg:max-w-lg">
                      <SecurityNameCell order={order} />
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
                    <TableCell className="whitespace-nowrap py-4 px-6 text-sm text-gray-900">
                      {formatOrderYieldPercent(order)}
                    </TableCell>
                    <TableCell className="py-4 px-6 align-top">
                      <div className="text-sm leading-relaxed text-gray-900">
                        <div>
                          <span className="text-gray-500">Trade:</span>{" "}
                          {tradeDate}
                        </div>
                        <div className="mt-0.5">
                          <span className="text-gray-500">Settlement:</span>{" "}
                          {settlementDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={`py-4 px-6 ${statusDisplay.className}`}>
                      {statusDisplay.text}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center text-center">
                        <OrderPdfDownloads
                          orderNumber={order.orderNumber}
                          variant="table"
                          showDealSheet={isOrderSettled(
                            order.status,
                            order.paymentStatus,
                            order.settleStatus,
                          )}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default OrdersTable;
