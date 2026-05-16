"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
import type { ReportTabMeta } from "./reportTabMeta";

export function ReportTabIntro({ meta }: { meta: ReportTabMeta }) {
  return (
    <Card className="border-border/80 bg-muted/20 shadow-sm">
      <CardContent className="flex gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Info className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1 text-sm">
          <p className="font-semibold text-foreground">{meta.title}</p>
          <p className="text-muted-foreground leading-relaxed">{meta.purpose}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">When to use: </span>
            {meta.whenToUse}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
