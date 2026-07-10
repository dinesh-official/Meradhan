import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, RefreshCw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { TSettleOrdersFilterHook } from "./hooks/useSettleOrdersFilterHook";

interface SettleOrdersFiltersProps {
  filterManager: TSettleOrdersFilterHook;
  onRefresh?: () => void;
  isLoading?: boolean;
}

function SettleOrdersFilters({
  filterManager,
  onRefresh,
  isLoading = false,
}: SettleOrdersFiltersProps) {
  const { state } = filterManager;
  const [searchBy, setSearchBy] = useState<"id" | "orderNumber">(
    state.id ? "id" : "orderNumber"
  );

  const searchValue = useMemo(() => {
    return searchBy === "id" ? state.id : state.orderNumber;
  }, [searchBy, state.id, state.orderNumber]);

  const hasActiveFilters = () => {
    return (
      state.id ||
      state.orderNumber ||
      state.filtFromModSettleDate ||
      state.filtToModSettleDate ||
      state.filtCounterParty
    );
  };

  return (
    <CardHeader>
      <div className="flex flex-wrap justify-between items-center gap-4">
        {/* All Filters in Single Row */}
        <div className={`flex flex-wrap items-center gap-3 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Order search (single input + select) */}
          <div className="flex flex-col">
            <label className="mb-1 text-muted-foreground text-xs">Search</label>
            <div className="flex items-center gap-2">
              <Select
                value={searchBy}
                onValueChange={(v) => {
                  const next = v === "id" ? "id" : "orderNumber";
                  setSearchBy(next);
                }}
              >
                <SelectTrigger className="bg-secondary border-0 h-9 w-[140px]">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Order ID</SelectItem>
                  <SelectItem value="orderNumber">Order Number</SelectItem>
                </SelectContent>
              </Select>

              <Input
                className="bg-secondary border-0 w-44"
                placeholder={searchBy === "id" ? "Enter Order ID" : "Enter Order Number"}
                type={searchBy === "id" ? "number" : "text"}
                value={searchValue}
                onChange={(e) => {
                  const v = e.target.value;
                  if (searchBy === "id") {
                    state.setId(v);
                    if (state.orderNumber) state.setOrderNumber("");
                  } else {
                    state.setOrderNumber(v);
                    if (state.id) state.setId("");
                  }
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Counter Party Filter */}
          <div className="flex flex-col">
            <label className="mb-1 text-muted-foreground text-xs">
              Counter Party
            </label>
            <Input
              className="bg-secondary border-0 w-40"
              placeholder="Counter Party"
              value={state.filtCounterParty}
              onChange={(e) => state.setFiltCounterParty(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* From Date Filter */}
          <div className="flex flex-col">
            <label className="mb-1 text-muted-foreground text-xs">
              From Date
            </label>
            <Input
              className="bg-secondary border-0 w-36"
              type="date"
              value={state.filtFromModSettleDate}
              onChange={(e) => state.setFiltFromModSettleDate(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* To Date Filter */}
          <div className="flex flex-col">
            <label className="mb-1 text-muted-foreground text-xs">
              To Date
            </label>
            <Input
              className="bg-secondary border-0 w-36"
              type="date"
              value={state.filtToModSettleDate}
              onChange={(e) => state.setFiltToModSettleDate(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => state.applyFilters()}
            disabled={isLoading}
            title={
              state.hasPendingFilterChanges
                ? "You have edited filters — click to load matching results"
                : "Reload the table with the current filter values"
            }
            className={`flex items-center gap-2 h-8 ${state.hasPendingFilterChanges ? "ring-2 ring-amber-500/60" : ""}`}
          >
            <Filter className="w-3 h-3" />
            Apply all filters
          </Button>

          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={state.resetAll}
              disabled={isLoading}
              className="flex items-center gap-2 h-8"
            >
              <X className="w-3 h-3" />
              Clear
            </Button>
          )}

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 h-8"
            >
              <RefreshCw
                className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Loading..." : "Refresh"}
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  );
}

export default SettleOrdersFilters;
