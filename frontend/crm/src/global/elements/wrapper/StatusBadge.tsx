"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

type Props = {
  value: string;
};

function getStatusClass(value: string) {
  switch (value.toLowerCase()) {
    case "verified":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "active":
      return "bg-green-100 text-green-800";
    case "suspended":
      return "bg-gray-200 text-gray-700";
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
