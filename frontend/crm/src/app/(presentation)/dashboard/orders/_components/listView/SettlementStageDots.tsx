"use client";

import type { CrmOrderStage } from "@root/apiGateway";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PIPELINE_STAGES = [
  { stage: "add_isin", label: "Add ISIN" },
  { stage: "quote_accept", label: "Quote Accept" },
  { stage: "deal_propose", label: "Deal Propose" },
  { stage: "deal_accept", label: "Deal Accept" },
  { stage: "pg_routing", label: "PG Routing" },
] as const;

/** 0=not started, 1=success, 2=fail, 3=waiting */
function dotClass(status: number | undefined): string {
  if (status === 1) return "bg-emerald-500";
  if (status === 2) return "bg-rose-500";
  return "bg-gray-300";
}

function statusLabel(status: number | undefined): string {
  if (status === 1) return "Done";
  if (status === 2) return "Failed";
  if (status === 3) return "In progress";
  return "Pending";
}

type SettlementStageDotsProps = {
  stages?: Pick<CrmOrderStage, "stage" | "status" | "seq">[];
};

export default function SettlementStageDots({
  stages,
}: SettlementStageDotsProps) {
  const byStage = new Map(
    (stages ?? []).map((s) => [s.stage, s.status] as const),
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="inline-flex items-center gap-0.5"
          aria-label="Settlement pipeline steps"
        >
          {PIPELINE_STAGES.map(({ stage, label }) => {
            const status = byStage.get(stage);
            return (
              <span
                key={stage}
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass(status)}`}
                title={`${label}: ${statusLabel(status)}`}
              />
            );
          })}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <ul className="space-y-0.5">
          {PIPELINE_STAGES.map(({ stage, label }) => {
            const status = byStage.get(stage);
            return (
              <li key={stage} className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${dotClass(status)}`}
                />
                <span>
                  {label}: {statusLabel(status)}
                </span>
              </li>
            );
          })}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}
