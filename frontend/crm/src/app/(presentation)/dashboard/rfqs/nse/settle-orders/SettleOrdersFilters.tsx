import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RefreshCw, X } from "lucide-react";
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
          {/* Order ID Filter */}
          <div className="flex flex-col">
            <label className="mb-1 text-muted-foreground text-xs">
              Order ID
            </label>
            <Input
              className="bg-secondary border-0 w-32"
              placeholder="Order ID"
              type="number"
              value={state.id}
              onChange={(e) => state.setId(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Order Number Filter */}
          <div className="flex flex-col">
            <label className="mb-1 text-muted-foreground text-xs">
              Order Number
            </label>
            <Input
              className="bg-secondary border-0 w-40"
              placeholder="Order Number"
              value={state.orderNumber}
              onChange={(e) => state.setOrderNumber(e.target.value)}
              disabled={isLoading}
            />
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
