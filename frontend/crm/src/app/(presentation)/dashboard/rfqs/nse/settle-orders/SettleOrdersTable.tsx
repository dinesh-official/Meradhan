"use client";
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import {
  SettlementStatusBadge,
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
        initialPageSize={20}
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
            label: "Order Number",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">{row.orderNumber}</span>
              );
            },
          },
          {
            key: "symbol",
            label: "Symbol",
            sortable: true,
          },
          {
            key: "buyParticipantLoginId",
            label: "Buy Participant",
            sortable: true,
            cell(row) {
              return (
                <span className="text-sm">{row.buyParticipantLoginId}</span>
              );
            },
          },
          {
            key: "sellParticipantLoginId",
            label: "Sell Participant",
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
                <span className="font-mono text-sm">{Number(row.price).toFixed(4) || "--"}</span>
              );
            },
          },
          {
            key: "yieldType",
            label: "Yield Type",
            cell(row) {
              return <SettlementYieldTypeBadge type={row.yieldType} />;
              // return <span className="font-mono text-sm">{row.yieldType || "--"}</span>;
            },
          },
          {
            key: "yield",
            label: "Yield (%)",
            sortable: true,
            cell(row) {
              return <span className="font-mono text-sm">{Number(row.yield).toFixed(4)}%</span>;
            },
          },
          {
            key: "value",
            label: "Value",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  ₹ {formatNumberTS(row.value)}
                </span>
              );
            },
          },
          {
            key: "modQuantity",
            label: "Quantity",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {row.modQuantity?.toLocaleString() || "--"}
                </span>
              );
            },
          },
          {
            key: "source",
            label: "Source",
            cell(row) {
              return <SourceBadge source={row.source} />;
            },
          },
          {
            key: "modSettleDate",
            label: "Settlement Date",
            sortable: true,
            cell(row) {
              return row.modSettleDate
                ? dateTimeUtils.formatDateTime(row.modSettleDate, "DD MMM YYYY")
                : "--";
            },
          },
          {
            key: "settleStatus",
            label: "Settlement Status",
            cell(row) {
              return <SettlementStatusBadge status={row.settleStatus} />;
            },
          },
          {
            key: "modAccrInt",
            label: "Accrued Interest",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  ₹ {formatNumberTS(row.modAccrInt || 0)}
                </span>
              );
            },
          },
          {
            key: "modConsideration",
            label: "Consideration",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {row.modConsideration
                    ? `₹ ${formatNumberTS(row.modConsideration)}`
                    : "--"}
                </span>
              );
            },
          },
          {
            key: "settlementNo",
            label: "Settlement No",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {row.settlementNo || "--"}
                </span>
              );
            },
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
            cell(row) {
              return (
                <span className="text-sm">{row.buyBrokerLoginId || "--"}</span>
              );
            },
          },
          {
            key: "sellBrokerLoginId",
            label: "Sell Broker",
            cell(row) {
              return (
                <span className="text-sm">{row.sellBrokerLoginId || "--"}</span>
              );
            },
          },
          {
            key: "stampDutyAmount",
            label: "Stamp Duty",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  ₹ {(row.stampDutyAmount || 0)}
                </span>
              );
            },
          },
          {
            key: "stampDutyBearer",
            label: "Stamp Duty Bearer",
            cell(row) {
              return (
                <span className="text-sm">{row.stampDutyBearer || "--"}</span>
              );
            },
          },
          {
            key: "buyerFundPayinObligation",
            label: "Buyer Fund Obligation",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {row.buyerFundPayinObligation
                    ? `₹ ${formatNumberTS(row.buyerFundPayinObligation)}`
                    : "--"}
                </span>
              );
            },
          },
          {
            key: "sellerFundPayoutObligation",
            label: "Seller Fund Obligation",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {row.sellerFundPayoutObligation
                    ? `₹ ${formatNumberTS(row.sellerFundPayoutObligation)}`
                    : "--"}
                </span>
              );
            },
          },
          {
            key: "fundPayinRefId",
            label: "Fund Payin Ref ID",
            cell(row) {
              return (
                <span className="font-mono text-xs">
                  {row.fundPayinRefId || "--"}
                </span>
              );
            },
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
            sortable: true,
            cell(row) {
              return row.payoutTime || "--";
            },
          },
          {
            key: "ifscCode",
            label: "IFSC Code",
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {row.ifscCode || "--"}
                </span>
              );
            },
          },
          {
            key: "accountNo",
            label: "Account Number",
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {row.accountNo || "--"}
                </span>
              );
            },
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
            label: "DP ID",
            cell(row) {
              return (
                <span className="font-mono text-sm">{row.dpId || "--"}</span>
              );
            },
          },
          {
            key: "benId",
            label: "Ben ID",
            cell(row) {
              return (
                <span className="font-mono text-sm">{row.benId || "--"}</span>
              );
            },
          },
          {
            key: "createdAt",
            label: "Created At",
            sortable: true,
            cell(row) {
              return row.createdAt
                ? dateTimeUtils.formatDateTime(row.createdAt, "DD MMM YYYY hh:mm AA")
                : "--";
            },
          },
          {
            key: "updatedAt",
            label: "Updated At",
            sortable: true,
            cell(row) {
              return row.updatedAt
                ? dateTimeUtils.formatDateTime(row.updatedAt, "DD MMM YYYY hh:mm AA")
                : "--";
            },
          },
        ]}
      />
    </div>
  );
}

export default SettleOrdersTable;
