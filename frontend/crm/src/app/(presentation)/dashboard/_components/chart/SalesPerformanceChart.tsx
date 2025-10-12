"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";


const chartData = [
  { date: "2024-04-01", current: 222, prev: 150 },
  { date: "2024-04-02", current: 97, prev: 180 },
  { date: "2024-04-03", current: 167, prev: 120 },
  { date: "2024-04-04", current: 242, prev: 260 },
  { date: "2024-04-05", current: 373, prev: 290 },
  { date: "2024-04-06", current: 301, prev: 340 },
  { date: "2024-04-07", current: 245, prev: 180 },
  { date: "2024-04-08", current: 409, prev: 320 },
  { date: "2024-04-09", current: 59, prev: 110 },
  { date: "2024-04-10", current: 261, prev: 190 },
  { date: "2024-04-11", current: 327, prev: 350 },
  { date: "2024-04-12", current: 292, prev: 210 },
  { date: "2024-04-13", current: 342, prev: 380 },
  { date: "2024-04-14", current: 137, prev: 220 },
  { date: "2024-04-15", current: 120, prev: 170 },
  { date: "2024-04-16", current: 138, prev: 190 },
  { date: "2024-04-17", current: 446, prev: 360 },
  { date: "2024-04-18", current: 364, prev: 410 },
  { date: "2024-04-19", current: 243, prev: 180 },
  { date: "2024-04-20", current: 89, prev: 150 },
  { date: "2024-04-21", current: 137, prev: 200 },
  { date: "2024-04-22", current: 224, prev: 170 },
  { date: "2024-04-23", current: 138, prev: 230 },
  { date: "2024-04-24", current: 387, prev: 290 },
  { date: "2024-04-25", current: 215, prev: 250 },
  { date: "2024-04-26", current: 75, prev: 130 },
  { date: "2024-04-27", current: 383, prev: 420 },
  { date: "2024-04-28", current: 122, prev: 180 },
  { date: "2024-04-29", current: 315, prev: 240 },
  { date: "2024-04-30", current: 454, prev: 380 },
  { date: "2024-05-01", current: 165, prev: 220 },
  { date: "2024-05-02", current: 293, prev: 310 },
  { date: "2024-05-03", current: 247, prev: 190 },
  { date: "2024-05-04", current: 385, prev: 420 },
  { date: "2024-05-05", current: 481, prev: 390 },
  { date: "2024-05-06", current: 498, prev: 520 },
  { date: "2024-05-07", current: 388, prev: 300 },
  { date: "2024-05-08", current: 149, prev: 210 },
  { date: "2024-05-09", current: 227, prev: 180 },
  { date: "2024-05-10", current: 293, prev: 330 },
  { date: "2024-05-11", current: 335, prev: 270 },
  { date: "2024-05-12", current: 197, prev: 240 },
  { date: "2024-05-13", current: 197, prev: 160 },
  { date: "2024-05-14", current: 448, prev: 490 },
  { date: "2024-05-15", current: 473, prev: 380 },
  { date: "2024-05-16", current: 338, prev: 400 },
  { date: "2024-05-17", current: 499, prev: 420 },
  { date: "2024-05-18", current: 315, prev: 350 },
  { date: "2024-05-19", current: 235, prev: 180 },
  { date: "2024-05-20", current: 177, prev: 230 },
  { date: "2024-05-21", current: 82, prev: 140 },
  { date: "2024-05-22", current: 81, prev: 120 },
  { date: "2024-05-23", current: 252, prev: 290 },
  { date: "2024-05-24", current: 294, prev: 220 },
  { date: "2024-05-25", current: 201, prev: 250 },
  { date: "2024-05-26", current: 213, prev: 170 },
  { date: "2024-05-27", current: 420, prev: 460 },
  { date: "2024-05-28", current: 233, prev: 190 },
  { date: "2024-05-29", current: 78, prev: 130 },
  { date: "2024-05-30", current: 340, prev: 280 },
  { date: "2024-05-31", current: 178, prev: 230 },
  { date: "2024-06-01", current: 178, prev: 200 },
  { date: "2024-06-02", current: 470, prev: 410 },
  { date: "2024-06-03", current: 103, prev: 160 },
  { date: "2024-06-04", current: 439, prev: 380 },
  { date: "2024-06-05", current: 88, prev: 140 },
  { date: "2024-06-06", current: 294, prev: 250 },
  { date: "2024-06-07", current: 323, prev: 370 },
  { date: "2024-06-08", current: 385, prev: 320 },
  { date: "2024-06-09", current: 438, prev: 480 },
  { date: "2024-06-10", current: 155, prev: 200 },
  { date: "2024-06-11", current: 92, prev: 150 },
  { date: "2024-06-12", current: 492, prev: 420 },
  { date: "2024-06-13", current: 81, prev: 130 },
  { date: "2024-06-14", current: 426, prev: 380 },
  { date: "2024-06-15", current: 307, prev: 350 },
  { date: "2024-06-16", current: 371, prev: 310 },
  { date: "2024-06-17", current: 475, prev: 520 },
  { date: "2024-06-18", current: 107, prev: 170 },
  { date: "2024-06-19", current: 341, prev: 290 },
  { date: "2024-06-20", current: 408, prev: 450 },
  { date: "2024-06-21", current: 169, prev: 210 },
  { date: "2024-06-22", current: 317, prev: 270 },
  { date: "2024-06-23", current: 10, prev: 530 },
  { date: "2024-06-24", current: 132, prev: 180 },
  { date: "2024-06-25", current: 141, prev: 190 },
  { date: "2024-06-26", current: 434, prev: 380 },
  { date: "2024-06-27", current: 448, prev: 490 },
  { date: "2024-06-28", current: 149, prev: 200 },
  { date: "2024-06-29", current: 103, prev: 160 },
  { date: "2024-06-30", current: 446, prev: 400 },
];

const chartConfig = {
  total: {
    label: "total",
  },
  current: {
    label: "Current Month",
    color: "var(--chart-1)",
  },
  prev: {
    label: "Previous Month",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function SalesPerformanceChart() {
  const [timeRange] = React.useState("90d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[290px] w-full"
    >
      <AreaChart data={filteredData}>||
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
          type="natural"
          fill="url(#fillprev)"
          stroke="var(--color-prev)"
          stackId="a"
          
        />
        <Area
          dataKey="current"
          type="natural"
          fill="url(#fillcurrent)"
          stroke="var(--color-current)"
          stackId="a"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
