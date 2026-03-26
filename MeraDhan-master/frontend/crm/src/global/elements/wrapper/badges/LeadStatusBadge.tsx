"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type Props = {
  value: string;
};

function getLeadStatusClass(value: string) {
  switch (value) {
    case "NEW":
      return "bg-blue-100 text-blue-800";
    case "CONTACTED":
      return "bg-yellow-100 text-yellow-800";
    case "QUALIFIED":
      return "bg-green-100 text-green-800";
    case "UNQUALIFIED":
      return "bg-red-100 text-red-800";
    case "CONVERTED":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function LeadStatusBadge({ value }: Props) {
  const cls = useMemo(() => getLeadStatusClass(value), [value]);

  return (
    <Badge className={cn("px-2 rounded text-xs font-medium capitalize", cls)}>
      {value.toLowerCase()}
    </Badge>
  );
}
