"use client";

import YearSection from "./YearSection";
import BottomButton from "./BottomButton";
import { useQuery } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { CashflowTimelineTabShimmer } from "./PortfolioTabShimmers";
import TimelineFilters from "./TimelineFilters";
import PortfolioCashflowDisclaimer from "./PortfolioCashflowDisclaimer";
import { useState, useEffect } from "react";
import {
  DEFAULT_CASHFLOW_PERIOD,
  getCashflowPeriodRange,
  type CashflowPeriodPreset,
} from "./cashflowPeriodPresets";

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
    period: CashflowPeriodPreset;
    fromDate: string;
    toDate: string;
    isin: string;
  }>(() => {
    const { fromDate, toDate } = getCashflowPeriodRange(DEFAULT_CASHFLOW_PERIOD);
    return {
      types: [],
      period: DEFAULT_CASHFLOW_PERIOD,
      fromDate,
      toDate,
      isin: "",
    };
  });

  const debouncedFromDate = useDebounced(activeFilters.fromDate, DEBOUNCE_MS);
  const debouncedToDate = useDebounced(activeFilters.toDate, DEBOUNCE_MS);
  const debouncedTypes = useDebounced(activeFilters.types, DEBOUNCE_MS);
  const debouncedIsin = useDebounced(activeFilters.isin, DEBOUNCE_MS);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "portfolioCashflowTimeline",
      debouncedFromDate,
      debouncedToDate,
      debouncedTypes,
      debouncedIsin,
    ],
    queryFn: async () => {
      return portfolioApi.getCashflowTimeline(
        debouncedFromDate || undefined,
        debouncedToDate || undefined,
        debouncedTypes.length > 0 ? debouncedTypes : undefined,
        debouncedIsin ? [debouncedIsin] : undefined
      );
    },
  });

  const timeline = data?.responseData;
  const years = timeline?.years ?? [];
  const hasEvents = years.length > 0;

  return (
    <div className="flex flex-col bg-[#ffffff] text-sm w-full min-w-0">
      <div className="w-full min-w-0">
        <TimelineFilters
          timelineData={timeline}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      </div>

      {isLoading ? (
        <CashflowTimelineTabShimmer />
      ) : (
        <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
          <div className="min-w-[920px] w-full max-w-[1200px] mx-auto pb-8">
            {isError ? (
              <div className="py-20 text-center text-gray-500">
                {error instanceof Error
                  ? error.message
                  : "Could not load cashflow timeline."}
              </div>
            ) : hasEvents ? (
              <>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {years.map((year: any, idx: number) => (
                  <YearSection key={idx} yearData={year} />
                ))}
                <BottomButton />
              </>
            ) : (
              <div className="py-20 text-center text-gray-500">
                No data available
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full min-w-0 px-1 pb-6">
        <div className="mx-auto w-full max-w-[1200px]">
          <PortfolioCashflowDisclaimer />
        </div>
      </div>
    </div>
  );
}