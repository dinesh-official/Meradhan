"use client";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import {
  SettlementYieldTypeBadge,
  SourceBadge,
} from "../_components/bages/NseRfqBadges";
import { SettleOrderData } from "@root/apiGateway";
import { formatNumberTS } from "@/global/utils/formate";

// source 5 = NSE RFQ (manual); 1 = NSE CBRICS, 4 = FTRAC (DIR/automated)
const isManualOrder = (source?: 1 | 4 | 5) => source === 5;

// Extended interface to include createdAt and updatedAt fields
interface ExtendedSettleOrderData extends SettleOrderData {
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

const settlementStatusLabel: Record<number, string> = {
  0: "Settlement Pending",
  1: "Securities Payin Done",
  2: "Funds Payin Done",
  3: "Payin Completed",
  4: "Payout Done Successfully",
  5: "Payin Reversed",
  6: "Settle Order Expired",
  7: "Order Not Settleable",
  8: "Settlement Cancelled",
  9: "Document Not Received for Unregistered Participant",
};

function settlementStatusTextClass(statusCode?: number) {
  switch (statusCode) {
    case 6:
      return "text-red-700 dark:text-red-300";
    case 5:
      return "text-emerald-700 dark:text-emerald-300";
    case 0:
      return "text-amber-700 dark:text-amber-300";
    case 1:
      return "text-blue-700 dark:text-blue-300";
    case 2:
      return "text-red-700 dark:text-red-300";
    default:
      return "text-muted-foreground";
  }
}

interface SettleOrdersTableProps {
  data?: ExtendedSettleOrderData[];
  isLoading?: boolean;
  onRowClick?: (order: ExtendedSettleOrderData) => void;
  selectedForPdf?: Set<string>;
  onTogglePdfOrder?: (orderNumber: string, checked: boolean) => void;
}

function SettleOrdersTable({
  data = [],
  isLoading = false,
  onRowClick,
  selectedForPdf,
  onTogglePdfOrder,
}: SettleOrdersTableProps) {
  return (
    <div>
      <UniversalTable<ExtendedSettleOrderData>
        initialPageSize={10}
        isLoading={isLoading}
        data={data}
        onRowClickAction={onRowClick}
        fields={[
          {
            key: "id",
            label: "ID",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono font-medium text-sm">{row.id}</span>
              );
            },
          },
          {
            key: "generatePdf",
            label: "Gen PDF",
            cell(row) {
              if (!isManualOrder(row.source)) return <span className="text-muted-foreground">—</span>;
              const orderNum = String(row.orderNumber);
              return (
                <Checkbox
                  checked={selectedForPdf?.has(orderNum) ?? false}
                  onCheckedChange={(checked) =>
                    onTogglePdfOrder?.(orderNum, checked === true)
                  }
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select order ${orderNum} for PDF`}
                />
              );
            },
          },
          {
            key: "orderNumber",
            label: "Order Number · Settlement Status",
            sortable: true,
            cell(row) {
              const code = row.settleStatus;
              const label = settlementStatusLabel[code] ?? "Unknown";
              return (
                <div className="flex flex-col">
                  <span className="font-mono text-sm">{row.orderNumber}</span>
                  <span className={`text-xs font-medium ${settlementStatusTextClass(code)}`}>
                    {label}
                  </span>
                </div>
              );
            },
          },
          {
            key: "symbol",
            label: "Symbol · Yield · Qty",
            sortable: true,
            cell(row) {
              const symbol = String(row.symbol ?? "--");
              const y = Number(row.yield);
              const yieldStr = Number.isFinite(y) ? `${y.toFixed(4)}%` : "--";
              const qtyStr = row.modQuantity != null ? row.modQuantity.toLocaleString() : "--";
              return (
                <div className="flex flex-col">
                  <span className="font-mono text-sm">{symbol}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Yield: {yieldStr} · Qty: {qtyStr}
                  </span>
                </div>
              );
            },
          },
          {
            key: "modSettleDate",
            label: "Settlement No · Date",
            sortable: true,
            cell(row) {
              const dateStr = row.modSettleDate
                ? dateTimeUtils.formatDateTime(row.modSettleDate, "DD MMM YYYY")
                : "--";
              const noStr = row.settlementNo || "--";
              return (
                <div className="flex flex-col">
                  <span className="font-mono text-sm">{noStr}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Date: {dateStr}
                  </span>
                </div>
              );
            },
          },
          {
            key: "buyParticipantLoginId",
            label: "Buyer Client",
            sortable: true,
            cell(row) {
              return (
                <span className="text-sm">{row.buyParticipantLoginId}</span>
              );
            },
          },
          {
            key: "sellParticipantLoginId",
            label: "Seller Client",
            sortable: true,
            cell(row) {
              return (
                <span className="text-sm">{row.sellParticipantLoginId}</span>
              );
            },
          },
          {
            key: "price",
            label: "Price",
            sortable: true,
            cell(row) {
              return (
                <div className="text-right">
                  <span className="font-mono text-sm">{Number(row.price).toFixed(4) || "--"}</span>
                </div>
              );
            },
          },
          {
            key: "value",
            label: "Value",
            sortable: true,
            cell(row) {
              return (
                <div className="text-right">
                  <span className="font-mono text-sm">₹ {formatNumberTS(row.value)}</span>
                </div>
              );
            },
          },
          {
            key: "modAccrInt",
            label: "Accrued Interest",
            sortable: true,
            cell(row) {
              return (
                <div className="text-right">
                  <span className="font-mono text-sm">₹ {formatNumberTS(row.modAccrInt || 0)}</span>
                </div>
              );
            },
          },
          {
            key: "stampDutyAmount",
            label: "Stamp Duty",
            sortable: true,
            cell(row) {
              return (
                <div className="text-right">
                  <span className="font-mono text-sm">₹ {(row.stampDutyAmount || 0)}</span>
                </div>
              );
            },
          },
          {
            key: "modConsideration",
            label: "Consideration",
            sortable: true,
            cell(row) {
              return (
                <div className="text-right">
                  <span className="font-mono text-sm">
                    {row.modConsideration
                      ? `₹ ${formatNumberTS(row.modConsideration)}`
                      : "--"}
                  </span>
                </div>
              );
            },
          },
          {
            key: "yieldType",
            label: "Yield Type · Source",
            cell(row) {
              return (
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <SettlementYieldTypeBadge type={row.yieldType} />
                  <SourceBadge source={row.source} />
                </div>
              );
            },
          },
          {
            key: "payoutTime",
            label: "Payout Time",
            sortable: true,
            cell(row) {
              return row.payoutTime || "--";
            },
          },
          {
            key: "ifscCode",
            label: "Bank (IFSC · A/C)",
            cell(row) {
              const ifsc = row.ifscCode || "--";
              const acct = row.accountNo || "--";
              return (
                <div className="flex flex-col">
                  <span className="font-mono text-sm">{ifsc}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    A/C: {acct}
                  </span>
                </div>
              );
            },
          },
          {
            key: "accountNo",
            label: "Account Number",
            hidden: true,
          },
          {
            key: "utrNumber",
            label: "UTR Number",
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {row.utrNumber || "--"}
                </span>
              );
            },
          },
          {
            key: "dpId",
            label: "DP (DP ID · Ben ID)",
            cell(row) {
              const dp = row.dpId || "--";
              const ben = row.benId || "--";
              return (
                <div className="flex flex-col">
                  <span className="font-mono text-sm">{dp}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Ben: {ben}
                  </span>
                </div>
              );
            },
          },
          {
            key: "benId",
            label: "Ben ID",
            hidden: true,
          },
          {
            key: "yield",
            label: "Yield (%)",
            hidden: true,
          },
          {
            key: "modQuantity",
            label: "Quantity",
            hidden: true,
          },
          {
            key: "source",
            label: "Source",
            hidden: true,
          },
          {
            key: "settleStatus",
            label: "Settlement Status",
            hidden: true,
          },
          {
            key: "settlementNo",
            label: "Settlement No",
            hidden: true,
          },
          {
            key: "buyerRefNo",
            label: "Buyer Ref",
            cell(row) {
              return <span className="text-sm">{row.buyerRefNo || "--"}</span>;
            },
          },
          {
            key: "sellerRefNo",
            label: "Seller Ref",
            cell(row) {
              return <span className="text-sm">{row.sellerRefNo || "--"}</span>;
            },
          },
          {
            key: "buyBackofficeLoginId",
            label: "Buy Back Office",
            cell(row) {
              return (
                <span className="text-sm">
                  {row.buyBackofficeLoginId || "--"}
                </span>
              );
            },
          },
          {
            key: "sellBackofficeLoginId",
            label: "Sell Back Office",
            cell(row) {
              return (
                <span className="text-sm">
                  {row.sellBackofficeLoginId || "--"}
                </span>
              );
            },
          },
          {
            key: "buyBrokerLoginId",
            label: "Buy Broker",
            hidden: true,
          },
          {
            key: "sellBrokerLoginId",
            label: "Sell Broker",
            hidden: true,
          },
          {
            key: "stampDutyBearer",
            label: "Stamp Duty Bearer",
            hidden: true,
          },
          {
            key: "buyerFundPayinObligation",
            label: "Buyer Fund Obligation",
            sortable: true,
            hidden: true,
          },
          {
            key: "sellerFundPayoutObligation",
            label: "Seller Fund Obligation",
            sortable: true,
            hidden: true,
          },
          {
            key: "fundPayinRefId",
            label: "Fund Payin Ref ID",
            hidden: true,
          },
          {
            key: "secPayinQuantity",
            label: "Sec Payin Qty",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {row.secPayinQuantity?.toLocaleString() || "--"}
                </span>
              );
            },
          },
          {
            key: "secPayinRemarks",
            label: "Sec Payin Remarks",
            cell(row) {
              return (
                <span className="text-sm">{row.secPayinRemarks || "--"}</span>
              );
            },
          },
          {
            key: "secPayinTime",
            label: "Sec Payin Time",
            sortable: true,
            cell(row) {
              return row.secPayinTime
                ?
                row.secPayinTime
                : "--";
            },
          },
          {
            key: "fundsPayinAmount",
            label: "Funds Payin Amount",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {row.fundsPayinAmount
                    ? `₹ ${row.fundsPayinAmount.toLocaleString()}`
                    : "--"}
                </span>
              );
            },
          },
          {
            key: "fundsPayinRemarks",
            label: "Funds Payin Remarks",
            cell(row) {
              return (
                <span className="text-sm">{row.fundsPayinRemarks || "--"}</span>
              );
            },
          },
          {
            key: "fundsPayinTime",
            label: "Funds Payin Time",
            sortable: true,
            cell(row) {
              return row.fundsPayinTime || "--";
            },
          },
          {
            key: "payoutRemarks",
            label: "Payout Remarks",
            cell(row) {
              return (
                <span className="text-sm">{row.payoutRemarks || "--"}</span>
              );
            },
          },
          {
            key: "payoutTime",
            label: "Payout Time",
            hidden: true,
          },
          {
            key: "createdAt",
            label: "Created · Updated",
            sortable: true,
            cell(row) {
              const c = row.createdAt
                ? dateTimeUtils.formatDateTime(row.createdAt, "DD MMM YYYY hh:mm AA")
                : "--";
              const u = row.updatedAt
                ? dateTimeUtils.formatDateTime(row.updatedAt, "DD MMM YYYY hh:mm AA")
                : "--";
              return (
                <div className="flex flex-col">
                  <span className="font-mono text-xs">{c}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Updated: {u}
                  </span>
                </div>
              );
            },
          },
          {
            key: "updatedAt",
            label: "Updated At",
            hidden: true,
          },
        ]}
      />
    </div>
  );
}

export default SettleOrdersTable;
