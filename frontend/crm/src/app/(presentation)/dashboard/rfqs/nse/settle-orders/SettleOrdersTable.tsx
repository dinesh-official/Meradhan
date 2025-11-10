import React from "react";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import {
  SettlementStatusBadge,
  SettlementYieldTypeBadge,
  SourceBadge,
} from "../_components/bages/NseRfqBadges";
import { SettleOrderData } from "@root/apiGateway";
import { formatNumberTS } from "@/global/utils/formate";

// Extended interface to include createdAt and updatedAt fields
interface ExtendedSettleOrderData extends SettleOrderData {
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface SettleOrdersTableProps {
  data?: ExtendedSettleOrderData[];
  isLoading?: boolean;
  onRowClick?: (order: ExtendedSettleOrderData) => void;
}

function SettleOrdersTable({
  data = [],
  isLoading = false,
  onRowClick,
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
                <span className="font-mono text-sm">{row.price || "--"}</span>
              );
            },
          },
          {
            key: "yieldType",
            label: "Yield Type",
            cell(row) {
              return <SettlementYieldTypeBadge type={row.yieldType} />;
            },
          },
          {
            key: "yield",
            label: "Yield (%)",
            sortable: true,
            cell(row) {
              return <span className="font-mono text-sm">{row.yield}%</span>;
            },
          },
          {
            key: "value",
            label: "Value (₹)",
            sortable: true,
            cell(row) {
              return (
                <span className="font-mono text-sm">
                  {formatNumberTS(row.value)}
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
                  ₹{row.modAccrInt?.toLocaleString() || "0"}
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
                    ? `₹${formatNumberTS(row.modConsideration)}`
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
                  ₹{row.stampDutyAmount?.toLocaleString() || "0"}
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
                    ? `₹${formatNumberTS(row.buyerFundPayinObligation)}`
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
                    ? `₹${formatNumberTS(row.sellerFundPayoutObligation)}`
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
                ? dateTimeUtils.formatDateTime(
                    row.secPayinTime,
                    "DD MMM YYYY HH:mm"
                  )
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
                    ? `₹${row.fundsPayinAmount.toLocaleString()}`
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
              return row.fundsPayinTime
                ? dateTimeUtils.formatDateTime(
                    row.fundsPayinTime,
                    "DD MMM YYYY HH:mm"
                  )
                : "--";
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
              return row.payoutTime
                ? dateTimeUtils.formatDateTime(
                    row.payoutTime,
                    "DD MMM YYYY HH:mm"
                  )
                : "--";
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
            label: "Account No",
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
        ]}
      />
    </div>
  );
}

export default SettleOrdersTable;
