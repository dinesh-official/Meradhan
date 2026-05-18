"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { REPORT_TAB_META, REPORT_TAB_ORDER } from "./reportTabMeta";

export function ReportGuidePanel() {
  return (
    <Card className="mb-6 border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Why these reports?</CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          OBPP order monitoring: start on <strong>Overview</strong>, then use Orders, Settlement,
          Revenue, Customers, and operations tabs. All sections share the date and status filters
          above.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {REPORT_TAB_ORDER.map((id) => {
            const meta = REPORT_TAB_META[id];
            return (
              <li
                key={id}
                className="rounded-lg border border-border/80 bg-background p-3 text-sm"
              >
                <p className="font-medium text-foreground">{meta.title}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {meta.purpose}
                </p>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
