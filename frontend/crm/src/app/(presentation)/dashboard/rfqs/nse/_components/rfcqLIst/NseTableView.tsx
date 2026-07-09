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
            label: "RFQ / ISIN / Participant",
            cell(row) {
              const rfq = String(row.number ?? "--");
              const isin = String(row.isin ?? "--");
              const p = String(row.participantCode ?? "--");
              return (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{rfq}</span>
                    <span
                      className={[
                        "rounded px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                        row.buySell === "S"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-emerald-100 text-emerald-800",
                      ].join(" ")}
                    >
                      {row.buySell === "S" ? "SELL" : "BUY"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    ISIN: {isin} · P: {p}
                  </span>
                </div>
              );
            },
          },
          {
            key: "isin",
            label: "ISIN",
            hidden: true,
          },
          {
            key: "participantCode",
            label: "Participant",
            hidden: true,
          },
          {
            key: "segment",
            label: "Info",
            cell(row) {
              const statusTone =
                row.status === "T"
                  ? "text-emerald-700"
                  : row.status === "W"
                    ? "text-zinc-500"
                    : "text-amber-700";

              const segLabel = row.segment === "C" ? "CDMDF" : "Normal";
              const dealLabel = row.dealType === "B" ? "Brokered" : "Direct";
              const sideLabel = row.buySell === "S" ? "Sell" : "Buy";
              const quoteLabel = row.quoteType === "B" ? "Price+Yield" : "Yield";
              const settleLabel = row.settlementType === 0 ? "T+0" : "T+1";
              const accessLabel = row.access === 1 ? "OTM" : row.access === 2 ? "OTO" : "IST";
              const anonLabel = row.anonymous === "Y" ? "Yes" : "No";

              const KV = ({ k, v }: { k: string; v: string }) => (
                <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="text-[11px] text-muted-foreground">{k}</span>
                  <span className={`text-[11px] font-medium ${statusTone}`}>{v}</span>
                </span>
              );

              return (
                <div className="flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <KV k="Seg" v={segLabel} />
                    <KV k="Deal" v={dealLabel} />
                    <KV k="Quote" v={quoteLabel} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <KV k="Settle" v={settleLabel} />
                    <KV k="Yield" v={String(row.yieldType)} />
                    <KV k="Access" v={accessLabel} />
                    <KV k="Anon" v={anonLabel} />
                  </div>
                </div>
              );
            },
          },
          {
            key: "dealType",
            label: "Deal Type",
            hidden: true,
          },
          {
            key: "buySell",
            label: "Buy/Sell",
            hidden: true,
          },
          {
            key: "quoteType",
            label: "Quote Type",
            hidden: true,
          },
          {
            key: "settlementType",
            label: "Settlement",
            hidden: true,
          },
          {
            key: "yieldType",
            label: "Yield Type",
            hidden: true,
          },
          {
            key: "access",
            label: "Access Type",
            hidden: true,
          },
          {
            key: "anonymous",
            label: "Anonymous",
            hidden: true,
          },
          {
            key: "yield",
            label: "Yield / Value / Qty",
            cell(row) {
              const y = row.yield != null ? String(row.yield) : "--";
              const v = row.value != null ? String(row.value) : "--";
              const q = row.quantity != null ? String(row.quantity) : "--";
              return (
                <div className="flex flex-col text-left">
                  <span className="font-mono text-sm">Yield: {y}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    Value: {v} · Qty: {q}
                  </span>
                </div>
              );
            },
          },
          {
            key: "value",
            label: "Value",
            hidden: true,
          },
          {
            key: "quantity",
            label: "Quantity",
            hidden: true,
          },
          {
            key: "status",
            label: "Status · Date",
            cell(row) {
              const statusLabel =
                row.status === "T" ? "TRADED" : row.status === "W" ? "WITHDRAWN" : "PENDING";
              const statusClass =
                row.status === "T"
                  ? "bg-emerald-100 text-emerald-800"
                  : row.status === "W"
                    ? "bg-zinc-100 text-zinc-700"
                    : "bg-amber-100 text-amber-800";

              return (
                <div className="flex flex-col gap-1">
                  <div>
                    <span
                      className={[
                        "inline-flex rounded px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                        statusClass,
                      ].join(" ")}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {row?.date ? row.date : "--"}
                  </span>
                </div>
              );
            },
          },
          {
            key: "date",
            label: "Date",
            hidden: true,
          },
          {
            key: "quoteTime",
            label: "Times",
            cell(row) {
              const quote = row?.quoteTime ? row.quoteTime : "--";
              const settle = row?.settlementDate ? row.settlementDate : "--";
              const created = row?.createdAt
                ? dateTimeUtils.formatDateTime(row.createdAt, "DD MMM YYYY hh:mm AA")
                : "--";
              const updated = row?.updatedAt
                ? dateTimeUtils.formatDateTime(row.updatedAt, "DD MMM YYYY hh:mm AA")
                : "--";
              return (
                <div className="flex flex-col">
                  <span className="font-mono text-xs">
                    Quote: {quote} · Settle: {settle}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    C: {created}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    U: {updated}
                  </span>
                </div>
              );
            },
          },
          {
            key: "settlementDate",
            label: "Settlement Date",
            hidden: true,
          },
          {
            key: "createdAt",
            label: "Created At",
            hidden: true,
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

export default NseTableView;
