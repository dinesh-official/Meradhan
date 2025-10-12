"use client"
import { useReactTable } from "@tanstack/react-table";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DataTableToolbarProps<TData> = {
  table: ReturnType<typeof useReactTable<TData>>;
  searchColumnId?: string; // which column the quick search binds to
  searchPlaceholder?: string;
};


export function TableToolbar<TData>({
  table,
  searchColumnId,
  searchPlaceholder = "Search...",
}: DataTableToolbarProps<TData>) {
  const searchCol = searchColumnId
    ? table.getColumn(searchColumnId)
    : undefined;

  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <div className="flex items-center gap-2">
        {searchCol ? (
          <Input
            className="h-9 w-[260px]"
            placeholder={searchPlaceholder}
            value={(searchCol.getFilterValue() as string) ?? ""}
            onChange={(e) => searchCol.setFilterValue(e.target.value)}
          />
        ) : null}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            {/* <MixerHorizontalIcon className="mr-2 h-4 w-4" /> */}
            View
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {table
            .getAllLeafColumns()
            .filter((c) => c.getCanHide())
            .map((c) => (
              <DropdownMenuCheckboxItem
                key={c.id}
                className="capitalize"
                checked={c.getIsVisible()}
                onCheckedChange={(v) => c.toggleVisibility(v)}
              >
                {(c.columnDef.header as React.ReactNode) ?? c.id}
              </DropdownMenuCheckboxItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
