"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { dateTimeUtils } from "@/global/utils/datetime.utils";

type ColumnType = "text" | "number" | "currency" | "date" | "datetime";

export type FieldSpec<T> = {
  key: keyof T | string;
  label?: string;
  type?: ColumnType;
  currency?: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  hidden?: boolean;
  stickyRight?: boolean;
};

export type UniversalTableProps<T> = {
  data: T[];
  fields: FieldSpec<T>[];
  searchColumnKey?: FieldSpec<T>["key"];
  visibilityStorageKey?: string;
  initialPageSize?: number;
  enableRowSelection?: boolean;
  isLoading?: boolean;
  onRowClickAction?: (row: T) => void;
  getRowIdAction?: (row: T, index: number) => string;
};

// Convert key (camelCase or snake_case) to Title Case
function toTitle(key: string): string {
  const spaced = key.replace(/([A-Z])/g, " $1").replace(/[_-]+/g, " ");
  return spaced.replace(/\b\w/g, (m) => m.toUpperCase()).trim();
}

// Format value based on column type
function formatByType(value: unknown, type?: ColumnType, currency = "INR") {
  if (type === "currency") {
    const numberValue = Number(value ?? 0);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numberValue);
  }

  if (type === "number") {
    if (typeof value === "number") {
      return value;
    }
    return Number(value ?? 0);
  }

  if (type === "date" || type === "datetime") {
    if (!value) {
      return "-";
    }

    const date = new Date(String(value));
    const isInvalid = isNaN(date.getTime());

    if (isInvalid) {
      return String(value);
    }

    if (type === "date") {
      return dateTimeUtils.formatDateTime(date, "DD MMM YYYY hh:mm:ss AA");
    }

    return dateTimeUtils.formatDateTime(date, "DD MMM YYYY hh:mm:ss AA");
  }

  if (value === null || value === undefined) {
    return "-";
  }

  return value as React.ReactNode;
}

export function UniversalTable<T>({
  data,
  fields,
  visibilityStorageKey,
  initialPageSize = 10,
  enableRowSelection,
  isLoading,
  onRowClickAction,
  getRowIdAction,
}: UniversalTableProps<T>) {
  const stickyRightKey = React.useMemo(() => {
    const stickyField = fields.find((f) => f.stickyRight);
    if (stickyField) {
      return stickyField.key;
    }
    return undefined;
  }, [fields]);

  const columns = React.useMemo<ColumnDef<T>[]>(() => {
    return fields
      .filter((f) => !f.hidden)
      .map((field) => {
        const accessorKey = String(field.key);
        const headerTitle = field.label || toTitle(accessorKey);

        let stickyClass: string | undefined;
        if (field.stickyRight) {
          stickyClass = "sticky right-0 z-10 bg-white";
        }

        const firstRow = data?.[0] ?? {};
        const hasAccessor = accessorKey in firstRow;

        // If column is a custom cell (like actions)
        if (!hasAccessor && field.cell) {
          const customColumn: ColumnDef<T> = {
            id: accessorKey,
            header: headerTitle,
            enableHiding: false,
            enableSorting: false,
            cell: ({ row }) => {
              const cellContent = field.cell ? field.cell(row.original) : null;
              return <div className={stickyClass}>{cellContent}</div>;
            },
          };
          return customColumn;
        }

        // Regular data-backed column
        const column: ColumnDef<T> = {
          accessorKey,
          header: headerTitle,
          enableSorting: field.sortable ?? true,
          cell: ({ getValue, row }) => {
            if (field.cell) {
              const customContent = field.cell(row.original);
              return <div className={stickyClass}>{customContent}</div>;
            }

            const value = getValue();
            const formatted = formatByType(value, field.type, field.currency);
            return <div className={stickyClass}>{formatted}</div>;
          },
        };
        return column;
      });
  }, [fields, data]);

  return (
    <DataTable<T, unknown>
      data={data}
      columns={columns}
      stickyRightColumnId={stickyRightKey ? String(stickyRightKey) : undefined}
      visibilityStorageKey={visibilityStorageKey}
      initialPageSize={initialPageSize}
      enableRowSelection={enableRowSelection}
      isLoading={isLoading}
      onRowClickAction={onRowClickAction}
      getRowIdAction={getRowIdAction}
    />
  );
}
