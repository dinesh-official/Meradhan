import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import type { PortfolioFilterOptions } from "@root/apiGateway";
import {
  CASHFLOW_PERIOD_OPTIONS,
  DEFAULT_CASHFLOW_PERIOD,
  getCashflowPeriodRange,
  type CashflowPeriodPreset,
} from "./cashflowPeriodPresets";

const ISIN_ALL_VALUE = "__ALL_ISINS__";

export interface ActiveFilters {
  types: string[];
  period: CashflowPeriodPreset;
  fromDate: string;
  toDate: string;
  /** Empty string = all holdings */
  isin: string;
}

interface TimelineFiltersProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timelineData?: any;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
}

const filterLabelClass = "text-[14px] text-black font-medium font-poppins leading-tight";

const inputDateClass =
  "bg-white border border-[#E1E6E8] rounded-md px-3 py-2 text-sm h-10 text-black font-poppins font-normal w-full [color-scheme:light]";

/** Label + control stack; parent row uses items-end so all h-10 fields align. */
const filterFieldClass = "flex flex-col gap-1.5 min-w-0 w-full";

const TimelineFilters = ({ activeFilters, onFilterChange }: TimelineFiltersProps) => {
  const { types: selectedBondTypes, period, fromDate, toDate, isin: selectedIsin } = activeFilters;

  const { data: filtersResponse } = useQuery<{
    responseData: PortfolioFilterOptions;
  }>({
    queryKey: ["portfolioFilterOptions"],
    queryFn: async () => {
      const { data } = await apiClientCaller.get<{
        responseData: PortfolioFilterOptions;
      }>("/customer/portfolio/details/filters");
      return data;
    },
  });

  const bondTypeOptions: string[] = filtersResponse?.responseData?.bondTypes ?? [];
  const isinOptions = filtersResponse?.responseData?.isins ?? [];

  const handlePeriodChange = (next: CashflowPeriodPreset) => {
    if (next === "CUSTOM") {
      onFilterChange({ ...activeFilters, period: "CUSTOM" });
      return;
    }
    const range = getCashflowPeriodRange(next);
    onFilterChange({ ...activeFilters, period: next, fromDate: range.fromDate, toDate: range.toDate });
  };

  const handleFromDateChange = (nextFrom: string) => {
    const nextFromDate = nextFrom;
    const nextToDate =
      nextFromDate && toDate && nextFromDate > toDate ? nextFromDate : toDate;
    onFilterChange({
      ...activeFilters,
      period: "CUSTOM",
      fromDate: nextFromDate,
      toDate: nextToDate,
    });
  };

  const handleToDateChange = (nextTo: string) => {
    const nextToDate = nextTo;
    const nextFromDate =
      fromDate && nextToDate && fromDate > nextToDate ? nextToDate : fromDate;
    onFilterChange({
      ...activeFilters,
      period: "CUSTOM",
      fromDate: nextFromDate,
      toDate: nextToDate,
    });
  };

  const controlTriggerClass =
    "justify-between bg-white border border-[#E1E6E8] rounded-md px-4 py-2 text-sm h-10 w-full text-black font-poppins font-normal";

  return (
    <div className="mb-10 w-full min-w-0">
      <div className="flex flex-col md:flex-row md:flex-wrap md:items-end gap-x-3 gap-y-4">
        <div className={`${filterFieldClass} md:w-[200px] md:shrink-0`}>
          <span className={filterLabelClass} title="Bond type">
            Bond type
          </span>
          <MultiSelect
            values={selectedBondTypes}
            onValuesChange={(vals) => onFilterChange({ ...activeFilters, types: vals })}
          >
            <MultiSelectTrigger className={controlTriggerClass}>
              <MultiSelectValue placeholder="All bond types" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              <MultiSelectGroup>
                {bondTypeOptions.map((option) => (
                  <MultiSelectItem key={option} value={option}>
                    {option}
                  </MultiSelectItem>
                ))}
              </MultiSelectGroup>
            </MultiSelectContent>
          </MultiSelect>
        </div>

        <div className={`${filterFieldClass} md:w-[220px] md:shrink-0`}>
          <span className={filterLabelClass} title="Filter by ISIN from your orders">
            ISIN
          </span>
          <Select
            value={selectedIsin ? selectedIsin : ISIN_ALL_VALUE}
            onValueChange={(value) =>
              onFilterChange({
                ...activeFilters,
                isin: value === ISIN_ALL_VALUE ? "" : value,
              })
            }
          >
            <SelectTrigger className={controlTriggerClass}>
              <SelectValue placeholder="All ISIN" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ISIN_ALL_VALUE}>All ISIN</SelectItem>
              {isinOptions.map((row) => (
                <SelectItem key={row.isin} value={row.isin}>
                  <span className="block truncate" title={`${row.bondName} — ${row.isin}`}>
                    {row.bondName !== row.isin ? `${row.bondName} (${row.isin})` : row.isin}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={`${filterFieldClass} md:w-[200px] md:shrink-0`}>
          <span className={filterLabelClass}>Period</span>
          <Select
            value={period ?? DEFAULT_CASHFLOW_PERIOD}
            onValueChange={(value) => handlePeriodChange(value as CashflowPeriodPreset)}
          >
            <SelectTrigger className={controlTriggerClass}>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {CASHFLOW_PERIOD_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={`${filterFieldClass} md:w-[168px] md:shrink-0`}>
          <span className={filterLabelClass}>From</span>
          <input
            type="date"
            className={inputDateClass}
            value={fromDate}
            max={toDate || undefined}
            onChange={(e) => handleFromDateChange(e.target.value)}
            aria-label="From date"
          />
        </div>

        <div className={`${filterFieldClass} md:w-[168px] md:shrink-0`}>
          <span className={filterLabelClass}>To</span>
          <input
            type="date"
            className={inputDateClass}
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => handleToDateChange(e.target.value)}
            aria-label="To date"
          />
        </div>
      </div>
    </div>
  );
};

export default TimelineFilters;
