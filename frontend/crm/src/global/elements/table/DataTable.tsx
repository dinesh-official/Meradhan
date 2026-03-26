"use client";

import { cn } from "@/lib/utils"; // optional; replace with your own cn util or remove
import type {
  ColumnDef,
  ColumnFiltersState,
  Row,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";

// import { MixerHorizontalIcon } from "@radix-ui/react-icons";

export type DataTableProps<TData, TValue> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  getRowIdAction?:
  | ((
    originalRow: TData,
    index: number,
    parent?: Row<TData> | undefined
  ) => string)
  | undefined;
  stickyRightColumnId?: string; // e.g. "actions"
  enableRowSelection?: boolean;
  initialPageSize?: number;
  visibilityStorageKey?: string; // persist column visibility in localStorage
  isLoading?: boolean;
  renderEmpty?: React.ReactNode; // custom empty state
  className?: string;
  onRowClickAction?: (row: TData) => void;
};

export function DataTable<TData, TValue>({
  data,
  columns,
  getRowIdAction,
  stickyRightColumnId,
  enableRowSelection,
  initialPageSize = 10,
  visibilityStorageKey,
  isLoading,
  renderEmpty,
  className,
  onRowClickAction,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() => {
      if (!visibilityStorageKey) return {};
      try {
        const raw = localStorage.getItem(visibilityStorageKey);
        return raw ? (JSON.parse(raw) as VisibilityState) : {};
      } catch {
        return {};
      }
    });

  React.useEffect(() => {
    if (!visibilityStorageKey) return;
    try {
      localStorage.setItem(
        visibilityStorageKey,
        JSON.stringify(columnVisibility)
      );
    } catch { }
  }, [columnVisibility, visibilityStorageKey]);

  const table = useReactTable<TData>({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: !!enableRowSelection,
    getRowId: getRowIdAction,

    initialState: {
      pagination: { pageIndex: 0, pageSize: initialPageSize },
    },
  });

  const noRows = table.getRowModel().rows.length === 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="border rounded-xl overflow-hidden relative">
        <Table className="relative overflow-y-auto overflow-hidden" >
          <TableHeader >
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} >
                {hg.headers.map((header) => {
                  const stickyRight = stickyRightColumnId && header.column.id === stickyRightColumnId;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-4 py-3 last:border-0 border-r font-normal align-top text-xs text-black",
                        stickyRight
                          ? "sticky right-0 z-20  text-center  bg-gray-50"
                          : undefined
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  className="h-40 text-center"
                >
                  <div className="flex justify-center items-center h-96">
                    <Spinner />
                  </div>
                </TableCell>
              </TableRow>
            ) : noRows ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  className="px-10 h-24 text-left"
                >
                  {renderEmpty ?? "No results."}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "last:border-0",
                    onRowClickAction ? "cursor-pointer " : undefined
                  )}
                  onClick={
                    onRowClickAction
                      ? () => onRowClickAction(row.original)
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => {
                    const stickyRight =
                      stickyRightColumnId &&
                      cell.column.id === stickyRightColumnId;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "px-4 py-3 last:border-0 border-r align-top leading-relaxed",
                          stickyRight
                            ? "sticky right-0 z-10 bg-white text-center "
                            : undefined
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
