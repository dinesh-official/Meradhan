"use client";

import ChartCard from "./ChartCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ShimmerBlock } from "@/components/ui/shimmer";

export function PortfolioSummaryCardsShimmer() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 md:gap-6 gap-3 four-card-wrapper">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <ShimmerBlock className="h-4 w-36 rounded" />
          </CardHeader>
          <CardContent>
            <ShimmerBlock className="h-9 w-32 max-w-[90%] rounded mt-0.5" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Use inside existing `ChartCard` (avoids duplicated card chrome during load). */
export function PortfolioCashflowChartShimmerBody({
  showPeriodStrip = true,
}: {
  showPeriodStrip?: boolean;
} = {}) {
  return (
    <>
      {showPeriodStrip ? (
        <div className="flex justify-end mb-4">
          <ShimmerBlock className="h-9 w-[200px] rounded-md ml-auto shrink-0" />
        </div>
      ) : null}
      <div className="flex gap-2">
        <ShimmerBlock className="h-[320px] w-[70px] shrink-0 rounded-md" />
        <ShimmerBlock className="h-[320px] flex-1 rounded-md min-w-[240px]" />
      </div>
      <div className="flex justify-center gap-6 mt-6">
        <ShimmerBlock className="h-4 w-28 rounded" />
        <ShimmerBlock className="h-4 w-28 rounded" />
      </div>
    </>
  );
}

export function PortfolioCashflowChartShimmer() {
  return (
    <ChartCard title="Cashflow to Maturity / Call">
      <PortfolioCashflowChartShimmerBody />
    </ChartCard>
  );
}

export function PortfolioPieChartCardShimmer({ title }: { title: string }) {
  return (
    <ChartCard title={title}>
      <div className="flex gap-6 md:min-h-[350px] flex-col md:flex-row">
        <div className="flex-1 min-h-[260px] flex items-center justify-center py-6">
          <ShimmerBlock className="h-[200px] w-[200px] rounded-full shrink-0" />
        </div>
        <div className="w-full md:w-56 space-y-5 px-2 py-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <ShimmerBlock className="w-3 h-3 rounded-full mt-1 shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <ShimmerBlock className="h-4 w-[85%] max-w-[140px] rounded" />
                <ShimmerBlock className="h-3 w-16 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

export function ActivePortfolioSummaryTabShimmer() {
  return (
    <>
      <PortfolioSummaryCardsShimmer />
      <PortfolioCashflowChartShimmer />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioPieChartCardShimmer title="Investment by Issuer Type" />
        <PortfolioPieChartCardShimmer title="Investment by Bond Rating" />
        <PortfolioPieChartCardShimmer title="Investment Allocation (%)" />
        <PortfolioPieChartCardShimmer title="Investment by Maturity (Duration)" />
      </div>
    </>
  );
}

export function PortfolioDetailsTabShimmer() {
  return (
    <div className="rounded-xl bg-white px-1 py-2 space-y-4">
      <div className="overflow-hidden rounded-lg border border-gray-100">
        <div className="flex gap-2 border-b border-gray-100 px-4 py-3 bg-gray-50/80">
          {Array.from({ length: 7 }).map((_, i) => (
            <ShimmerBlock key={i} className="h-3 flex-1 min-w-[48px] max-w-[72px] rounded" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div
            key={row}
            className="flex flex-wrap items-center gap-4 md:gap-6 border-b border-gray-50 px-4 py-4 last:border-0"
          >
            <div className="min-w-[160px] max-w-[220px] flex-1 space-y-2">
              <ShimmerBlock className="h-4 w-full rounded" />
              <ShimmerBlock className="h-3 w-28 rounded sm:hidden" />
            </div>
            {Array.from({ length: 6 }).map((_, c) => (
              <ShimmerBlock key={c} className="h-4 w-14 sm:w-16 rounded shrink-0" />
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <ShimmerBlock className="h-4 w-40 rounded hidden sm:block" />
        <div className="flex gap-3 ml-auto">
          <ShimmerBlock className="h-9 w-24 rounded-lg" />
          <ShimmerBlock className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function CashflowTimelineTabShimmer() {
  return (
    <div className="min-h-[560px] flex flex-col bg-white text-sm">
      <div className="flex flex-wrap gap-3 px-4 py-6 md:justify-center border-b border-gray-100 bg-gray-50/50">
        {Array.from({ length: 3 }).map((_, i) => (
          <ShimmerBlock key={i} className="h-11 w-[200px] max-w-[40vw] rounded-lg" />
        ))}
      </div>
      <div className="flex-1 max-w-[900px] mx-auto w-full px-4 py-10">
        <div className="flex justify-center mb-12">
          <ShimmerBlock className="h-12 w-[220px] rounded-full" />
        </div>
        <div className="relative pb-24">
          <div className="absolute left-1/2 top-3 bottom-[22%] w-0.5 -translate-x-1/2 bg-gray-100" aria-hidden />
          {Array.from({ length: 4 }).map((_, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div key={i} className="relative flex items-start mb-14 min-h-[100px]">
                <div className="flex-1 flex justify-end pr-[12px] sm:pr-8">
                  {isLeft ? (
                    <div className="w-full max-w-[320px] space-y-3">
                      <ShimmerBlock className="h-5 w-[120px] rounded ml-auto md:mr-4" />
                      <ShimmerBlock className="h-[88px] w-full rounded-xl" />
                    </div>
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}
                </div>
                <div className="relative z-10 flex flex-col items-center px-2 pt-8 shrink-0">
                  <ShimmerBlock className="size-9 rounded-full" />
                </div>
                <div className="flex-1 flex justify-start pl-[12px] sm:pl-8">
                  {!isLeft ? (
                    <div className="w-full max-w-[320px] space-y-3">
                      <ShimmerBlock className="h-5 w-[110px] rounded md:ml-4" />
                      <ShimmerBlock className="h-[88px] w-full rounded-xl" />
                    </div>
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center pb-12">
          <ShimmerBlock className="h-14 w-[180px] rounded-full" />
        </div>
      </div>
    </div>
  );
}
