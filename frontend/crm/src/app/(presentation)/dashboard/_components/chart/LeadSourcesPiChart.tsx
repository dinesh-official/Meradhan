"use client";

import { Pie, PieChart, Cell } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { keyName: "website", count: 275, fill: "var(--chart-1)" },
  { keyName: "referral", count: 200, fill: "var(--chart-2)" },
  { keyName: "socialMedia", count: 187, fill: "var(--chart-3)" },
  { keyName: "email", count: 173, fill: "var(--chart-4)" },
  { keyName: "direct", count: 90, fill: "var(--chart-5)" },
];

const chartConfig = {
  count: {
    label: "Lead Sources",
  },
  website: {
    label: "Website",
    color: "var(--chart-1)",
  },
  referral: {
    label: "Referral",
    color: "var(--chart-2)",
  },
  socialMedia: {
    label: "Social Media",
    color: "var(--chart-3)",
  },
  email: {
    label: "Email Campaigns",
    color: "var(--chart-4)",
  },
  direct: {
    label: "Direct",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function LeadSourcesPiChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="keyName"
          innerRadius={50}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend
          content={<ChartLegendContent nameKey="keyName" />}
          className="-translate-y-2 flex-wrap gap-x-5 *:justify-center w-full"
        />
      </PieChart>
    </ChartContainer>
  );
}
