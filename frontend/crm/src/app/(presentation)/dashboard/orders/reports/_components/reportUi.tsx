"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-lg border border-border border-l-[3px] border-l-blue-500 bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-2 text-2xl font-bold tabular-nums tracking-tight text-foreground", valueClassName)}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p> : null}
    </div>
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
  const hasHeader = title || toolbar || recordCount != null;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      {hasHeader && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-white px-4 py-3">
          <div>
            {title ? <p className="text-sm font-semibold text-foreground">{title}</p> : null}
            {description ? (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            {recordCount != null ? (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                {recordCount}
              </span>
            ) : null}
          </div>
        </div>
      )}
      {isLoading ? (
        <p className="py-14 text-center text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="py-14 text-center text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-slate-50 hover:bg-slate-50">
                {columns.map((col) => (
                  <TableHead
                    key={col.key}
                    className={cn(
                      "h-10 whitespace-nowrap text-xs font-semibold text-slate-500",
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
                <TableRow
                  key={row.key}
                  className="border-b border-slate-100 bg-white transition-colors last:border-0 hover:bg-slate-50/70"
                >
                  {row.cells.map((cell, i) => (
                    <TableCell
                      key={`${row.key}-${columns[i]?.key ?? i}`}
                      className={cn(
                        "py-3 text-sm text-slate-700",
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
      {footer ? <div className="border-t border-border/60 bg-white px-4 pb-3 pt-2">{footer}</div> : null}
    </div>
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
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
      <p className="text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{Math.max(1, totalPages)}</span>
        <span className="mx-1.5 text-border">·</span>
        <span className="font-medium tabular-nums text-foreground">
          {total.toLocaleString("en-IN")}
        </span>{" "}
        results
      </p>
      <div className="flex gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-3 text-xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 px-3 text-xs"
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
      ? "bg-emerald-100 text-emerald-700"
      : u.includes("settlement") || u.includes("confirmed") || u.includes("approved") || u.includes("applied")
        ? "bg-blue-100 text-blue-700"
        : u.includes("expired") || u.includes("cancel")
          ? "bg-slate-100 text-slate-500"
          : u.includes("pending")
            ? "bg-amber-100 text-amber-700"
            : u.includes("rfq") || u.includes("proposed") || u.includes("created")
              ? "bg-violet-100 text-violet-700"
              : u.includes("reject")
                ? "bg-red-100 text-red-600"
                : "bg-slate-100 text-slate-600";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", className)}>
      {label}
    </span>
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
    <Badge variant="outline" className={cn("text-[11px] font-medium", className)}>
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
    <Badge variant="outline" className={cn("text-[11px] font-medium", className)}>
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
      <SelectTrigger className={cn("h-8 w-auto min-w-[130px] bg-white text-xs dark:bg-background", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
