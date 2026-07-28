"use client";

import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { CrmOrder } from "@root/apiGateway";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import {
  formatInrList,
  formatOrderBusinessDate,
  formatYtmList,
  getBondRating,
} from "../../utils/orderUtils";
import { formatCleanPriceDisplay } from "@/global/utils/pricingDecimalDisplay";
import { FaEye } from "react-icons/fa6";
import OrderStatusBadge from "@/global/elements/wrapper/badges/OrderStatusBadge";
import { useRouter } from "next/navigation";
import { encodeId } from "@/global/utils/url.utils";
import SettlementStageDots from "./SettlementStageDots";

interface OrderTableProps {
  data: CrmOrder[];
  pageSize?: number;
  isLoading?: boolean;
}

function OrderTable({ data, pageSize = 10, isLoading }: OrderTableProps) {
  const router = useRouter();

  return (
    <UniversalTable<CrmOrder>
      initialPageSize={pageSize}
      data={data}
      isLoading={isLoading}
      fields={[
        {
          key: "orderNumber",
          label: "Order ID",
          cell: (row) => {
            const info = row.orderInfo;
            const isin = info?.bond.isin || row.isin || "—";
            const bondName = info?.bond.name || row.bondName || "";
            const rating = getBondRating(row.bondDetails) || "—";
            const paymentId = info?.payment.paymentId || "";
            const rfq = info?.rfqNumber || "";
            return (
              <div className="flex flex-col gap-1">
                <span className="font-medium">{info?.orderId || row.orderNumber}</span>
                <SettlementStageDots stages={row.orderStages} />
                {bondName ? (
                  <span className="text-muted-foreground text-xs line-clamp-1">
                    {bondName}
                  </span>
                ) : null}
                <span className="text-muted-foreground text-xs font-mono">
                  {isin} · {rating}
                </span>
                {(paymentId || rfq) && (
                  <span className="text-muted-foreground text-[11px] font-mono">
                    {paymentId ? `pay: ${paymentId}` : ""}
                    {paymentId && rfq ? " · " : ""}
                    {rfq ? `Settlement ID: ${rfq}` : ""}
                  </span>
                )}
              </div>
            );
          },
        },
        {
          key: "customerProfile",
          label: "Customer",
          cell: (row) => {
            const customer = row.orderInfo?.customer;
            if (!customer?.name) {
              return (
                <span className="text-muted-foreground text-sm">—</span>
              );
            }
            return (
              <div className="flex flex-col">
                <span className="font-medium">{customer.name}</span>
                {customer.userName ? (
                  <span className="text-muted-foreground text-xs font-mono">
                    {customer.userName}
                  </span>
                ) : null}
                {customer.email ? (
                  <span className="text-muted-foreground text-xs">
                    {customer.email}
                  </span>
                ) : null}
              </div>
            );
          },
        },
        {
          key: "pricing",
          label: "Pricing",
          sortable: false,
          cell: (row) => {
            const pricing = row.orderInfo?.pricing;
            return (
              <div className="flex flex-col gap-0.5 text-xs tabular-nums min-w-[140px]">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Clean</span>
                  <span className="font-medium text-foreground">
                    {pricing?.cleanPrice != null
                      ? formatCleanPriceDisplay(pricing.cleanPrice)
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">YTM</span>
                  <span className="font-medium text-foreground">
                    {formatYtmList(pricing?.yieldToMaturity)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Settlement</span>
                  <span className="font-medium text-foreground">
                    {formatInrList(pricing?.settlementAmount)}
                  </span>
                </div>
              </div>
            );
          },
        },
        {
          key: "createdAt",
          label: "Dates",
          sortable: false,
          cell: (row) => {
            const dates = row.orderInfo?.date;
            return (
              <div className="flex flex-col gap-0.5 text-xs min-w-[150px]">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Request</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {dateTimeUtils.formatDateTime(
                      row.createdAt,
                      "DD MMM YYYY hh:mm AA",
                    )}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Trade</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {formatOrderBusinessDate(dates?.dealDate)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Settlement</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {formatOrderBusinessDate(dates?.settlementDate)}
                  </span>
                </div>
                {dates?.settlementNo ? (
                  <div className="flex justify-between gap-3">
                    <span className="text-muted-foreground">Settle #</span>
                    <span className="font-medium text-foreground font-mono tabular-nums">
                      {dates.settlementNo}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          },
        },
        {
          key: "status",
          label: "Status",
          cell: (row) => (
            <OrderStatusBadge
              status={row.orderInfo?.orderStatus || row.status}
            />
          ),
        },
        {
          key: "actions",
          label: "Action",
          stickyRight: true,
          sortable: false,
          cell: (row) => (
            <div
              className="text-center flex justify-center items-center text-primary cursor-pointer hover:text-primary/80 transition-colors"
              onClick={() =>
                router.push(`/dashboard/orders/${encodeId(row.id)}`)
              }
              title="View Order Details"
            >
              <FaEye size={18} />
            </div>
          ),
        },
      ]}
      searchColumnKey="orderNumber"
    />
  );
}

export default OrderTable;
