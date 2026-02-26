import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ✅ NSE RFQ Segment Badge
interface NseRfqSegmentBadgeProps {
  type?: string | undefined;
}

export function NseRfqSegmentBadge({ type }: NseRfqSegmentBadgeProps) {
  const types: Record<string, string> = {
    R: "Normal RFQ",
    C: "CDMDF RFQ",
  };

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        type === "R" && "bg-blue-100 text-blue-800 border-blue-300",
        type === "C" && "bg-purple-100 text-purple-800 border-purple-300"
      )}
    >
      {types[type ?? ""] ?? "Unknown"}
    </Badge>
  );
}

// ✅ Deal Type Badge
interface DealTypeBadgeProps {
  type?: string | undefined;
}

export function DealTypeBadge({ type }: DealTypeBadgeProps) {
  const types: Record<string, string> = {
    D: "Direct Deal",
    B: "Brokered Deal",
  };

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        type === "D" && "bg-green-100 text-green-800 border-green-300",
        type === "B" && "bg-amber-100 text-amber-800 border-amber-300"
      )}
    >
      {types[type ?? ""] ?? "Unknown"}
    </Badge>
  );
}

// ✅ Trade Type Badge
interface TradeTypeBadgeProps {
  type?: string | undefined;
}

export function TradeTypeBadge({ type }: TradeTypeBadgeProps) {
  const types: Record<string, string> = {
    B: "Buy",
    S: "Sell",
    X: "Both",
  };

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        type === "B" && "bg-green-100 text-green-800 border-green-300",
        type === "S" && "bg-red-100 text-red-800 border-red-300",
        type === "X" && "bg-sky-100 text-sky-800 border-sky-300"
      )}
    >
      {types[type ?? ""] ?? "Unknown"}
    </Badge>
  );
}

// ✅ Price / Yield Type Badge
interface PriceYieldTypeBadgeProps {
  type?: string | undefined;
}

export function PriceYieldTypeBadge({ type }: PriceYieldTypeBadgeProps) {
  const types: Record<string, string> = {
    Y: "Only Yield",
    B: "Both Price & Yield",
  };

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        type === "Y" && "bg-indigo-100 text-indigo-800 border-indigo-300",
        type === "B" && "bg-teal-100 text-teal-800 border-teal-300"
      )}
    >
      {types[type ?? ""] ?? "Unknown"}
    </Badge>
  );
}

// ✅ Yield Type Badge
interface YieldTypeBadgeProps {
  type?: string | undefined;
  buySell?: string | undefined; // "B" | "S" | "X"
}

export function YieldTypeBadge({ type, buySell }: YieldTypeBadgeProps) {
  const labels: Record<string, string> = {
    YTM: "YTM",
    YTP: "YTP",
    YTC: "YTC",
  };

  const displayLabel =
    buySell === "X"
      ? `${labels[type ?? ""] ?? type} (Buy RFQ)`
      : labels[type ?? ""] ?? type ?? "Unknown";

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        type === "YTM" && "bg-blue-100 text-blue-800 border-blue-300",
        type === "YTP" && "bg-violet-100 text-violet-800 border-violet-300",
        type === "YTC" && "bg-pink-100 text-pink-800 border-pink-300"
      )}
    >
      {displayLabel}
    </Badge>
  );
}

// ✅ RFQ Access Badge
interface RfqAccessBadgeProps {
  type?: string | number | undefined;
}

export function RfqAccessBadge({ type }: RfqAccessBadgeProps) {
  const labels: Record<string, string> = {
    "1": "OTM (One to Many)",
    "2": "OTO (One to One)",
    "3": "IST (Inter Scheme Transfer)",
  };

  const strType = String(type ?? "");

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        strType === "1" && "bg-cyan-100 text-cyan-800 border-cyan-300",
        strType === "2" && "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
        strType === "3" && "bg-lime-100 text-lime-800 border-lime-300"
      )}
    >
      {labels[strType] ?? "Unknown"}
    </Badge>
  );
}

// ✅ Anonymous RFQ Badge
interface AnonymousRfqBadgeProps {
  flag?: string | number | null | undefined;
}

export function AnonymousRfqBadge({ flag }: AnonymousRfqBadgeProps) {
  const isAnonymous = flag === "Y";

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        isAnonymous
          ? "bg-gray-800 text-white border-gray-700"
          : "bg-gray-100 text-gray-800 border-gray-300"
      )}
    >
      {isAnonymous ? "Anonymous" : "Not Anonymous"}
    </Badge>
  );
}

// ✅ Settlement Type Badge
interface SettlementTypeBadgeProps {
  type?: string | number | undefined;
}

export function SettlementTypeBadge({ type }: SettlementTypeBadgeProps) {
  const labels: Record<string, string> = {
    "0": "T+0",
    "1": "T+1",
  };

  const strType = String(type ?? "");

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        strType === "0" && "bg-emerald-100 text-emerald-800 border-emerald-300",
        strType === "1" && "bg-orange-100 text-orange-800 border-orange-300"
      )}
    >
      {labels[strType] ?? "Unknown"}
    </Badge>
  );
}

// ✅ RFQ Status Badge
interface RfqStatusBadgeProps {
  status?: string | undefined;
}

export function RfqStatusBadge({ status }: RfqStatusBadgeProps) {
  const labels: Record<string, string> = {
    P: "Pending",
    W: "Withdrawn",
    T: "Fully Traded",
  };

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        status === "P" && "bg-yellow-100 text-yellow-800 border-yellow-300",
        status === "W" && "bg-gray-100 text-gray-800 border-gray-300",
        status === "T" && "bg-green-100 text-green-800 border-green-300"
      )}
    >
      {labels[status ?? ""] ?? "Unknown"}
    </Badge>
  );
}

// ✅ Settlement Status Badge
interface SettlementStatusBadgeProps {
  status?: number | undefined;
}
// Settlement status
// 0 = Settlement Pending
// 1 = Securities Payin Done
// 2 = Funds Payin Done
// 3 = Payin Completed
// 4 = Payout Done Successfully
// 5 = Payin reversed
// 6 = Settle order expired
// 7 = Order not settleable
// 8 = Settlement of order cancelled
// 9 = Document not received for unregistered
// participant
export function SettlementStatusBadge({ status }: SettlementStatusBadgeProps) {
  const labels: Record<number, string> = {
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



  const getStatusColor = (statusCode?: number) => {
    switch (statusCode) {
      case 6: return "bg-red-100 text-red-800 border-red-300";
      case 5: return "bg-green-100 text-green-800 border-green-300";
      case 0: return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 1: return "bg-blue-100 text-blue-800 border-blue-300";
      case 2: return "bg-red-100 text-red-800 border-red-300";
      case 3: return "bg-gray-100 text-gray-800 border-gray-300";
      case 4: return "bg-gray-100 text-gray-800 border-gray-300";
      case 7: return "bg-gray-100 text-gray-800 border-gray-300";
      case 8: return "bg-gray-100 text-gray-800 border-gray-300";
      case 9: return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        getStatusColor(status)
      )}
    >
      {labels[status ?? -1] ?? "Unknown"}
    </Badge>
  );
}

// ✅ Yield Type Badge for Settlement
interface SettlementYieldTypeBadgeProps {
  type?: "P" | "C" | "M" | undefined;
}

export function SettlementYieldTypeBadge({ type }: SettlementYieldTypeBadgeProps) {
  const labels: Record<string, string> = {
    P: "YTP",
    C: "YTC",
    M: "YTM",
  };

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        type === "P" && "bg-blue-100 text-blue-800 border-blue-300",
        type === "C" && "bg-green-100 text-green-800 border-green-300",
        type === "M" && "bg-purple-100 text-purple-800 border-purple-300"
      )}
    >
      {labels[type ?? ""] ?? "Unknown"}
    </Badge>
  );
}

// ✅ Source Badge
interface SourceBadgeProps {
  source?: 1 | 4 | 5 | undefined;
}

export function SourceBadge({ source }: SourceBadgeProps) {
  const labels: Record<number, string> = {
    1: "NSE CBRICS",
    4: "FTRAC",
    5: "NSE RFQ",
  };

  return (
    <Badge
      className={cn(
        "px-2 py-1 border rounded-full font-medium text-xs",
        source === 1 && "bg-blue-100 text-blue-800 border-blue-300",
        source === 4 && "bg-orange-100 text-orange-800 border-orange-300",
        source === 5 && "bg-green-100 text-green-800 border-green-300"
      )}
    >
      {labels[source ?? 0] ?? "Unknown"}
    </Badge>
  );
}
