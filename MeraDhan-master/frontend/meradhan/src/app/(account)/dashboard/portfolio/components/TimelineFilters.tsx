import { CalendarDays } from "lucide-react";
import { useMemo } from "react";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { PortfolioFilterOptions } from "@root/apiGateway"; // adjust import path as needed

interface ActiveFilters {
  types: string[];
  fromDate: string;
  toDate: string;
}

interface TimelineFiltersProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  timelineData?: any;
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
}

const TimelineFilters = ({
  timelineData,
  activeFilters,
  onFilterChange,
}: TimelineFiltersProps) => {
  const { types: selectedBondTypes, fromDate, toDate } = activeFilters;

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

  const update = (partial: Partial<ActiveFilters>) =>
    onFilterChange({ ...activeFilters, ...partial });

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 w-full gap-6 md:gap-0">
      <MultiSelect
        values={selectedBondTypes}
        onValuesChange={(vals) => update({ types: vals })}
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

      <div className="flex flex-col xl:flex-row items-start xl:items-center gap-4 xl:gap-6 w-full md:w-auto">
        <p className="text-[14px] text-black font-medium font-poppins whitespace-nowrap">
          View Between Date Range
        </p>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative w-1/2 sm:w-auto">
            <input
              type="text"
              placeholder="From Date"
              value={fromDate}
              onChange={(e) => update({ fromDate: e.target.value })}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="bg-white border border-[#E1E6E8] rounded-md px-4 py-2 pr-10 text-sm w-full sm:w-[180px] leading-normal appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
            />
            <CalendarDays
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input) {
                  input.type = "date";
                  input.focus();
                  try { input.showPicker(); } catch (err) { console.error(err); }
                }
              }}
            />
          </div>

          <div className="relative w-1/2 sm:w-auto">
            <input
              type="text"
              placeholder="To Date"
              value={toDate}
              onChange={(e) => update({ toDate: e.target.value })}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              className="bg-white border border-[#E1E6E8] rounded-md px-4 py-2 pr-10 text-sm w-full sm:w-[180px] leading-normal appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-clear-button]:hidden"
            />
            <CalendarDays
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input) {
                  input.type = "date";
                  input.focus();
                  try { input.showPicker(); } catch (err) { console.error(err); }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineFilters;