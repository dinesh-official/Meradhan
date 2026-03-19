"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type Props = {
  value: string;
};

function getStatusClass(value: string) {
  const normalized = value
    .toLowerCase()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .trim();

  switch (normalized) {
    case "verified":
    case "yes":
    case "enabled":
    case "active":
    case "accepted":
    case "buy":
    case "settled":
      return "bg-green-100 text-green-800";

    case "pending":
    case "waiting":
    case "under process":
    case "underprocess":
    case "on hold":
    case "onhold":
    case "cbrics pending":
    case "re kyc":
      return "bg-orange-100 text-orange-800";

    case "applied":
    case "register":
    case "download kra":
    case "kyc registered":
      return "bg-blue-100 text-blue-800";

    case "suspended":
    case "not started":
    case "not available":
      return "bg-gray-200 text-gray-700";

    case "rejected":
    case "kyc rejected":
    case "error":
    case "not found":
    case "disabled":
      return "bg-red-100 text-red-800";

    case "available":
    case "kyc validated":
      return "bg-green-100 text-green-800";

    case "used existing kra":
      return "bg-purple-100 text-purple-800";

    default:
      return "bg-red-100 text-red-800";
  }
}

// Usage

export default function StatusBadge({ value }: Props) {
  const cls = useMemo(() => getStatusClass(value), [value]);

  return (
    <Badge className={cn(`px-2  rounded text-xs font-medium`, cls)}>
      {value}
    </Badge>
  );
}
