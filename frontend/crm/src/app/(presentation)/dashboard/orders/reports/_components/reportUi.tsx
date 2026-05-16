"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ReportPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function ReportKpiCard({
  label,
  value,
  sub,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  valueClassName?: string;
}) {
  return (
    <Card className="min-w-[140px] flex-1 border-border/80 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p
          className={cn(
            "mt-1 text-xl font-semibold tabular-nums tracking-tight text-foreground",
            valueClassName,
          )}
        >
          {value}
        </p>
        {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}

export function ReportKpiGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

export type ReportTableColumn = {
  key: string;
  label: string;
  align?: "left" | "right";
  className?: string;
};

export function ReportDataTable({
  title,
  description,
  columns,
  rows,
  toolbar,
  recordCount,
  footer,
  isLoading,
  emptyMessage = "No data for this period.",
}: {
  title?: string;
  description?: string;
  columns: ReportTableColumn[];
  rows: { key: string | number; cells: ReactNode[] }[];
  toolbar?: ReactNode;
  recordCount?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
}) {
  return (
    <Card className="border-border/80 shadow-sm">
      {(title || toolbar || recordCount != null) && (
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0 pb-3">
          <div>
            {title ? <CardTitle className="text-base font-semibold">{title}</CardTitle> : null}
            {description ? (
              <CardDescription className="mt-1 text-xs">{description}</CardDescription>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {toolbar}
            {recordCount != null ? (
              <span className="text-xs tabular-nums text-muted-foreground">{recordCount}</span>
            ) : null}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(title || toolbar ? "pt-0" : "pt-4")}>
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border/80">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground",
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
          </div>
        )}
        {footer}
      </CardContent>
    </Card>
  );
}

export function ReportPagination({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/80 pt-4 text-sm">
      <p className="text-muted-foreground">
        Page {page} of {Math.max(1, totalPages)} · {total.toLocaleString("en-IN")} results
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}

export function WorkflowStatusBadge({ label }: { label: string }) {
  const u = label.toLowerCase();
  const className =
    u.includes("settled")
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      : u.includes("settlement") || u.includes("confirmed") || u.includes("approved")
        ? "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
        : u.includes("expired") || u.includes("cancel")
          ? "border-border bg-muted/60 text-muted-foreground"
          : u.includes("rfq") || u.includes("proposed") || u.includes("created")
            ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
            : "border-border bg-background text-foreground";
  return (
    <Badge variant="outline" className={cn("font-normal", className)}>
      {label}
    </Badge>
  );
}

export function KycStatusBadge({ status }: { status: string }) {
  const u = status.toLowerCase();
  const className =
    u === "verified"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
      : u === "pending"
        ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300";
  return (
    <Badge variant="outline" className={cn("font-normal", className)}>
      {status}
    </Badge>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const u = severity.toLowerCase();
  const className =
    u === "critical"
      ? "border-red-300 bg-red-100 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      : u === "high"
        ? "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200"
        : u === "medium"
          ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
          : "border-border bg-muted/60 text-muted-foreground";
  return (
    <Badge variant="outline" className={cn("font-normal", className)}>
      {severity}
    </Badge>
  );
}

export function ReportFilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("h-9 w-[160px]", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
