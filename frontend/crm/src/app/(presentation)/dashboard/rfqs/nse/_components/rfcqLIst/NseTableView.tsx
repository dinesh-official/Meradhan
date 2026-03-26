"use client";

import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { CreateRfqResponseItem } from "@root/apiGateway";
import {
  AnonymousRfqBadge,
  DealTypeBadge,
  NseRfqSegmentBadge,
  PriceYieldTypeBadge,
  RfqAccessBadge,
  RfqStatusBadge,
  SettlementTypeBadge,
  TradeTypeBadge,
  YieldTypeBadge,
} from "../bages/NseRfqBadges";

function NseTableView({
  data,
  loading,
  onClick,
}: {
  data: CreateRfqResponseItem[];
  loading?: boolean;
  onClick?: (data: CreateRfqResponseItem) => void;
}) {
  return (
    <div>
      <UniversalTable<CreateRfqResponseItem>
        initialPageSize={10}
        isLoading={loading}
        data={data}
        onRowClickAction={onClick}
        fields={[
          {
            key: "number",
            label: "RFQ Number",
          },
          {
            key: "isin",
            label: "ISIN",
          },
          {
            key: "participantCode",
            label: "Participant",
          },
          {
            key: "segment",
            label: "Segment",
            cell(row) {
              return <NseRfqSegmentBadge type={row.segment} />;
            },
          },
          {
            key: "dealType",
            label: "Deal Type",
            cell(row) {
              return <DealTypeBadge type={row.dealType} />;
            },
          },
          {
            key: "buySell",
            label: "Buy/Sell",
            cell(row) {
              return <TradeTypeBadge type={row.buySell} />;
            },
          },
          {
            key: "quoteType",
            label: "Quote Type",
            cell(row) {
              return <PriceYieldTypeBadge type={row.quoteType} />;
            },
          },
          {
            key: "settlementType",
            label: "Settlement",
            cell(row) {
              return <SettlementTypeBadge type={row.settlementType} />;
            },
          },
          {
            key: "yieldType",
            label: "Yield Type",
            cell(row) {
              return <YieldTypeBadge type={row.yieldType} />;
            },
          },
          {
            key: "access",
            label: "Access Type",
            cell(row) {
              return <RfqAccessBadge type={row.access} />;
            },
          },
          {
            key: "anonymous",
            label: "Anonymous",
            cell(row) {
              return <AnonymousRfqBadge flag={row.anonymous} />;
            },
          },
          {
            key: "yield",
            label: "Yield",
          },
          {
            key: "value",
            label: "Value",
          },
          {
            key: "quantity",
            label: "Quantity",
          },
          {
            key: "status",
            label: "Status",
            cell(row) {
              return <RfqStatusBadge status={row.status} />;
            },
          },
          {
            key: "createdAt",
            label: "Created At",
            cell(row) {
              return row?.createdAt
                ? dateTimeUtils.formatDateTime(row.createdAt, "DD MMM YYYY hh:mm AA")
                : "--";
            },
          },
          {
            key: "updatedAt",
            label: "Updated At",
            cell(row) {
              return row?.updatedAt
                ? dateTimeUtils.formatDateTime(row.updatedAt, "DD MMM YYYY hh:mm AA")
                : "--";
            },
          },
        ]}
      />
    </div>
  );
}

export default NseTableView;
