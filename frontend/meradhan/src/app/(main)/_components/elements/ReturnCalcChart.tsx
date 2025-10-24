"use client";

import { Pie, PieChart } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A pie chart with no separator";

const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ReturnCalcChart() {
  return (
    <div>
      <ChartContainer config={chartConfig} className="mx-auto aspect-square  w-60">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel  />}
          />
          <Pie
            data={chartData}
            dataKey="visitors"
            nameKey="browser"
            stroke="0"
          />
        </PieChart>
      </ChartContainer>
      <div className="flex md:flex-col flex-row  gap-3 md:px-10">
        <div className="flex  items-center gap-3">
          <div className="bg-[var(--chart-1)] p-2 rounded"></div>
          <p className="text-sm text-gray-500">Total Investment</p>
        </div>
        <div className="flex  items-center gap-2">
          <div className="bg-[var(--chart-2)] p-2 rounded"></div>
          <p className="text-sm text-gray-500">Total Interest</p>
        </div>
      </div>
    </div>
  );
}
