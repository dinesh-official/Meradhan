"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ReportTabMeta } from "./reportTabMeta";

export function ReportComingSoonPanel({ meta }: { meta: ReportTabMeta }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{meta.title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{meta.purpose}</p>
      </div>
      <Card className="border-border/80 border-dashed shadow-sm">
        <CardContent className="py-16 text-center">
          <p className="text-sm font-medium text-foreground">Coming soon</p>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
            {meta.whenToUse}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
