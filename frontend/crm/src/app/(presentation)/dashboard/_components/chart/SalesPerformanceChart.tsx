"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";

type Props = { rangeDays: number };

const chartConfig = {
  total: {
    label: "total",
  },
  current: {
    label: "Current Period",
    color: "var(--chart-1)",
  },
  prev: {
    label: "Previous Period",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const dashboardApi = new apiGateway.crm.dashboard.CrmDashboardApi(
  apiClientCaller
);

export function SalesPerformanceChart({ rangeDays }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["sales-performance", rangeDays],
    queryFn: async () => {
      const response = await dashboardApi.getSalesPerformance({
        params: { rangeDays },
      });
      return response.data.responseData.data;
    },
    staleTime: 60_000,
  });

  const chartData = data ?? [];

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[290px] w-full overflow-hidden"
    >
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 12, bottom: 16, left: 0 }}
      >
        <defs>
          <linearGradient id="fillcurrent" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-current)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-current)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient id="fillprev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-prev)" stopOpacity={0.8} />
            <stop
              offset="95%"
              stopColor="var(--color-prev)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="prev"
          type="monotone"
          fill="url(#fillprev)"
          stroke="var(--color-prev)"
          stackId="a"
          isAnimationActive={!isLoading}
        />
        <Area
          dataKey="current"
          type="monotone"
          fill="url(#fillcurrent)"
          stroke="var(--color-current)"
          stackId="a"
          isAnimationActive={!isLoading}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
