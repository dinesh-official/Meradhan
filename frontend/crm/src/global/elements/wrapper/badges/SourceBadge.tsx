"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type Props = {
  value: string;
};

function getSourceClass(value: string) {
  switch (value) {
    case "WEBSITE":
      return "bg-sky-100 text-sky-800"; // Bright blue
    case "REFERRAL":
      return "bg-emerald-100 text-emerald-800"; // Fresh green
    case "SOCIAL":
      return "bg-rose-100 text-rose-800"; // Soft red/pink
    case "ADVERTISEMENT":
      return "bg-amber-100 text-amber-800"; // Orange-yellow
    case "EVENT":
      return "bg-violet-100 text-violet-800"; // Purple
    case "COLD_CALL":
      return "bg-slate-200 text-slate-800"; // Muted gray
    case "EMAIL":
      return "bg-cyan-100 text-cyan-800"; // Aqua blue
    case "OTHER":
    default:
      return "bg-neutral-200 text-neutral-800"; // Neutral gray
  }
}

export default function SourceBadge({ value }: Props) {
  const cls = useMemo(() => getSourceClass(value), [value]);

  return (
    <Badge className={cn("px-2 rounded text-xs font-medium capitalize", cls)}>
      {value.replace("_", " ").toLowerCase()}
    </Badge>
  );
}
