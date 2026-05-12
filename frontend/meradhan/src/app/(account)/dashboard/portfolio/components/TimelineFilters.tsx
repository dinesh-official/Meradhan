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
import { PortfolioFilterOptions } from "@root/apiGateway";
import {
  CASHFLOW_PERIOD_OPTIONS,
  DEFAULT_CASHFLOW_PERIOD,
  getCashflowPeriodRange,
  type CashflowPeriodPreset,
} from "./cashflowPeriodPresets";

interface ActiveFilters {
  types: string[];
  period: CashflowPeriodPreset;
  fromDate: string;
  toDate: string;
}

interface TimelineFiltersProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timelineData?: any;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
}

const TimelineFilters = ({ activeFilters, onFilterChange }: TimelineFiltersProps) => {
  const { types: selectedBondTypes, period } = activeFilters;

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

  const handlePeriodChange = (next: CashflowPeriodPreset) => {
    const { fromDate, toDate } = getCashflowPeriodRange(next);
    onFilterChange({ ...activeFilters, period: next, fromDate, toDate });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 w-full gap-6 md:gap-0">
      <MultiSelect
        values={selectedBondTypes}
        onValuesChange={(vals) => onFilterChange({ ...activeFilters, types: vals })}
      >
        <MultiSelectTrigger className="justify-between bg-white border border-[#E1E6E8] rounded-md px-4 py-2 text-sm h-10 w-full md:w-[200px] text-black font-poppins font-normal">
          <MultiSelectValue placeholder="All Bond Types" />
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

      <div className="flex items-center gap-3 w-full md:w-auto">
        <p className="text-[14px] text-black font-medium font-poppins whitespace-nowrap">
          Period
        </p>
        <Select
          value={period ?? DEFAULT_CASHFLOW_PERIOD}
          onValueChange={(value) => handlePeriodChange(value as CashflowPeriodPreset)}
        >
          <SelectTrigger className="justify-between bg-white border border-[#E1E6E8] rounded-md px-4 py-2 text-sm h-10 w-full md:w-[200px] text-black font-poppins font-normal">
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
    </div>
  );
};

export default TimelineFilters;
