"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function ReportSectionTable({
  title,
  description,
  headerAction,
  columns,
  rows,
  emptyMessage = "No data for this period.",
  className,
}: {
  title: string;
  description?: string;
  headerAction?: ReactNode;
  columns: { key: string; label: string; align?: "left" | "right"; className?: string }[];
  rows: { key: string | number; cells: ReactNode[] }[];
  emptyMessage?: string;
  className?: string;
}) {
  return (
    <Card className={cn("border-border/80 shadow-sm", className)}>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-2 space-y-0 pb-3">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? (
            <CardDescription className="mt-1 text-xs">{description}</CardDescription>
          ) : null}
        </div>
        {headerAction}
      </CardHeader>
      <CardContent className="pt-0">
        {rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                      col.align === "right" && "text-right",
                      col.className,
                    )}
                  >
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key} className="hover:bg-muted/30">
                  {row.cells.map((cell, i) => (
                    <TableCell
                      key={`${row.key}-${columns[i]?.key ?? i}`}
                      className={cn(
                        columns[i]?.align === "right" && "text-right tabular-nums",
                        columns[i]?.className,
                      )}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
