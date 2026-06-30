"use client";

import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { CrmOrder } from "@root/apiGateway";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { getBondRating, getBondType } from "../../utils/orderUtils";
import { FaEye } from "react-icons/fa6";
import OrderStatusBadge from "@/global/elements/wrapper/badges/OrderStatusBadge";
import { useRouter } from "next/navigation";
import { encodeId } from "@/global/utils/url.utils";

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
            const isin = row.isin || "-";
            const rating = getBondRating(row.bondDetails) || "-";
            const paymentId = row.paymentId || row.paymentOrderId || "";
            const rfq = row.reqOrderNumber || "";
            return (
              <div className="flex flex-col">
                <span className="font-medium">{row.orderNumber}</span>
                <span className="text-muted-foreground text-xs font-mono">
                  {isin} · {rating}
                </span>
                {(paymentId || rfq) && (
                  <span className="text-muted-foreground text-[11px] font-mono">
                    {paymentId ? `pay: ${paymentId}` : ""}
                    {paymentId && rfq ? " · " : ""}
                    {rfq ? `rfq: ${rfq}` : ""}
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
            // Participant-counterparty orders carry an external NSE RFQ
            // participant instead of a Meradhan customer profile.
            if (!row.customerProfile) {
              const info = row.rfqParticipantInfo;
              const code = row.linkedRfqParticipantCode ?? "—";
              const name = info?.nameOverride?.trim() || code;
              const secondary =
                info?.contactPerson?.trim() ||
                info?.emailList?.[0] ||
                code;
              return (
                <div className="flex flex-col">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground text-xs">
                    NSE participant · {secondary}
                  </span>
                </div>
              );
            }
            return (
              <div className="flex flex-col">
                <span className="font-medium">
                  {row.customerProfile.firstName} {row.customerProfile.lastName}
                </span>
                <span className="text-muted-foreground text-xs">
                  {row.customerProfile.emailAddress}
                </span>
              </div>
            );
          },
        },
        {
          key: "bondDetails",
          label: "Bond Type",
          cell: (row) => getBondType(row.bondDetails),
        },
        {
          key: "quantity",
          label: "Quantity",
          type: "number",
        },
        {
          key: "totalAmount",
          label: "Value",
          type: "currency",
          currency: "INR",
          currencyFractionDigits: 4,
        },
        {
          key: "createdAt",
          label: "Request Date",
          cell: (row) => (
            <div>
              {dateTimeUtils.formatDateTime(
                row.createdAt,
                "DD MMM YYYY hh:mm AA"
              )}
            </div>
          ),
        },
        {
          key: "status",
          label: "Status",
          cell: (row) => <OrderStatusBadge status={row.status} />,
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
