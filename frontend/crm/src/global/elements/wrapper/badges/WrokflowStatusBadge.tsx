import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CBRICS_APPROVAL_STATUS_LABEL,
  CBRICS_PARTICIPANT_ENTITY_STATUS_LABEL,
} from "@/app/(presentation)/dashboard/rfqs/nse/_constants/cbricsApprovalStatus";
import React from "react";

type StatusCode = 100 | 16 | 15 | 0 | 10 | 1 | 5 | 6;

const statusConfig: Record<
  StatusCode,
  { label: string; color: string }
> = {
  100: { label: "Pending With Checker", color: "bg-yellow-500" },
  16: { label: "Returned by Checker", color: "bg-orange-500" },
  15: { label: "Rejected by Checker", color: "bg-red-600" },
  0: { label: "Pending With Exchange", color: "bg-yellow-400" },
  10: { label: "Pending With Exchange", color: "bg-yellow-400" },
  1: { label: "Approved", color: "bg-green-600" },
  5: { label: "Rejected", color: "bg-red-500" },
  6: { label: "Returned", color: "bg-blue-500" },
};

const entityStatusColor: Record<number, string> = {
  1: "bg-green-600",
  2: "bg-gray-500",
  3: "bg-orange-500",
  4: "bg-blue-500",
};

const WorkflowStatusBadge = ({
  statusCode,
  variant = "approval",
}: {
  statusCode?: number;
  /** `approval` = workflow codes; `entity` = registered participant 1–4 */
  variant?: "approval" | "entity";
}) => {
  if (statusCode == null || Number.isNaN(statusCode)) {
    return (
      <Badge
        className={cn(
          "px-2 rounded text-xs font-medium",
          "bg-gray-100 text-gray-900",
        )}
      >
        Unknown
      </Badge>
    );
  }

  if (variant === "entity") {
    const label =
      CBRICS_PARTICIPANT_ENTITY_STATUS_LABEL[statusCode] ??
      `Status ${statusCode}`;
    const color = entityStatusColor[statusCode] ?? "bg-gray-500";
    return (
      <Badge className={cn("px-2 rounded text-xs font-medium text-white", color)}>
        {label} ({statusCode})
      </Badge>
    );
  }

  const config = statusConfig[statusCode as StatusCode];
  const label =
    config?.label ??
    CBRICS_APPROVAL_STATUS_LABEL[statusCode] ??
    `Status ${statusCode}`;
  const color = config?.color ?? "bg-gray-500";

  return (
    <Badge className={cn("px-2 rounded text-xs font-medium text-white", color)}>
      {label} ({statusCode})
    </Badge>
  );
};

export default WorkflowStatusBadge;
