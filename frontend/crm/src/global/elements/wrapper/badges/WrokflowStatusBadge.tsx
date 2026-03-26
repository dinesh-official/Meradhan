import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";
type StatusCode = 100 | 16 | 15 | 0 | 10 | 1 | 5 | 6;
const statusConfig = {
  100: { label: "Pending With Checker", color: "bg-yellow-500" },
  16: { label: "Returned by Checker", color: "bg-orange-500" },
  15: { label: "Rejected by Checker", color: "bg-red-600" },
  0: { label: "Pending With Exchange", color: "bg-yellow-400" },
  10: { label: "Pending With Exchange", color: "bg-yellow-400" },
  1: { label: "Approved", color: "bg-green-600" },
  5: { label: "Rejected", color: "bg-red-500" },
  6: { label: "Returned", color: "bg-blue-500" },
};

const WorkflowStatusBadge = ({ statusCode }: { statusCode?: number }) => {
  if (!statusCode) {
    return (
      <Badge
        className={cn(
          `px-2 rounded text-xs font-medium`,
          "bg-gray-100 text-gray-900"
        )}
      >
        Unknown
      </Badge>
    );
  }

  const { color, label } = statusConfig?.[statusCode as StatusCode];

  if (!label) {
    return (
      <Badge className={cn(`px-2 rounded text-xs font-medium`, "bg-gray-100")}>
        Unknown
      </Badge>
    );
  }

  return (
    <Badge className={cn(`px-2 rounded text-xs font-medium`, color)}>
      {label}
    </Badge>
  );
};

export default WorkflowStatusBadge;
