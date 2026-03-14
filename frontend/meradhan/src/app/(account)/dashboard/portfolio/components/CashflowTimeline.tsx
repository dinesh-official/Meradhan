"use client";

import YearSection from "./YearSection";
import BottomButton from "./BottomButton";
import { useQuery } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Loader2 } from "lucide-react";
import TimelineFilters from "./TimelineFilters";
import { useState, useEffect } from "react";

const DEBOUNCE_MS = 500;

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function CashflowTimelinePage() {
  const portfolioApi = new apiGateway.meradhan.customerPortfolioApi(
    apiClientCaller
  );

  const [activeFilters, setActiveFilters] = useState<{
    types: string[];
    fromDate: string;
    toDate: string;
  }>({
    types: [],
    fromDate: "",
    toDate: "",
  });

  const debouncedFromDate = useDebounced(activeFilters.fromDate, DEBOUNCE_MS);
  const debouncedToDate = useDebounced(activeFilters.toDate, DEBOUNCE_MS);
  const debouncedTypes = useDebounced(activeFilters.types, DEBOUNCE_MS);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "portfolioCashflowTimeline",
      debouncedFromDate,
      debouncedToDate,
      debouncedTypes,
    ],
    queryFn: async () => {
      return portfolioApi.getCashflowTimeline(
        debouncedFromDate || undefined,
        debouncedToDate || undefined,
        debouncedTypes.length > 0 ? debouncedTypes : undefined
      );
    },
  });

  const timeline = data?.responseData;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#0C4580]" />
      </div>
    );
  }

  if (isError || !timeline || !timeline.years || timeline.years.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        {isError && error instanceof Error
          ? error.message
          : "No cashflow data available."}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-sm">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[100%] px-0">
          <TimelineFilters
            timelineData={timeline}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
          <div className="min-w-[1350px] md:min-w-auto md:max-w-[900px] mx-auto">
            {timeline.years.length > 0 ? (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              timeline.years.map((year: any, idx: number) => (
                <YearSection key={idx} yearData={year} />
              ))
            ) : (
              <div className="py-20 text-center text-gray-500">
                No timeline events found matching your selected filters.
              </div>
            )}
            <BottomButton />
          </div>
        </div>
      </div>
    </div>
  );
}