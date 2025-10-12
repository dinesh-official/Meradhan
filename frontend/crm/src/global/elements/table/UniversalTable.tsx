"use client";

import * as React from "react";
import type {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "./DataTable";

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

function toTitle(key: string) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase())
        .trim();
}

function formatByType(val: unknown, type?: ColumnType, currency = "INR") {
    if (type === "currency") {
        const n = Number(val ?? 0);
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(n);
    }
    if (type === "number")
        return typeof val === "number" ? val : Number(val ?? 0);
    if (type === "date" || type === "datetime") {
        if (!val) return "-";
        const d = new Date(String(val));
        return isNaN(d.getTime())
            ? String(val)
            : type === "date"
                ? d.toLocaleDateString()
                : d.toLocaleString();
    }
    return (val ?? "-") as React.ReactNode;
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
    const stickyRightKey = React.useMemo(
        () => fields.find((f) => f.stickyRight)?.key,
        [fields]
    );

    const columns = React.useMemo<ColumnDef<T>[]>(() => {
        return fields
            .filter((f) => !f.hidden)
            .map((f) => {
                const accessorKey = String(f.key);
                const header = f.label ?? toTitle(accessorKey);
                const stickyClass = f.stickyRight
                    ? "sticky right-0 z-10 bg-white"
                    : undefined;

                // Custom column (like "actions") with only a cell
                if (!(accessorKey in (data?.[0] ?? {})) && f.cell) {
                    return {
                        id: accessorKey,
                        header,
                        enableHiding: false,
                        enableSorting: false,
                        cell: ({row}) => (
                            <div className={stickyClass}>{f.cell!(row.original)}</div>
                        ),
                    } satisfies ColumnDef<T>;
                }

                // Normal data-backed column
                return {
                    accessorKey,
                    header,
                    enableSorting: f.sortable ?? true,
                    cell: ({getValue, row}) => {
                        if (f.cell)
                            return <div className={stickyClass}>{f.cell(row.original)}</div>;
                        const val = getValue();
                        return (
                            <div className={stickyClass}>
                                {formatByType(val, f.type, f.currency)}
                            </div>
                        );
                    },
                } satisfies ColumnDef<T>;
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
