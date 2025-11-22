"use client";

import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CashFlowData } from "../_helpers/xirr";

export const description = "A line chart with a label";

// const chartData = [
//   { date: "2025-01-01", desktop: 186 },
//   { date: "2025-02-01", desktop: 305 },
//   { date: "2025-03-01", desktop: 237 },
//   { date: "2025-04-01", desktop: 73 },
//   { date: "2025-05-01", desktop: 209 },
//   { date: "2025-06-01", desktop: 214 },
//   { date: "2065-05-01", desktop: 214 },
//   { date: "2055-05-01", desktop: 214 },
//   { date: "2075-06-01", desktop: 214 },
//   { date: "2085-06-01", desktop: 214 },
// ];

const chartConfig = {
  desktop: {
    label: "Cash Flow	",
    color: "#4f81bd",
  },
} satisfies ChartConfig;

export function XirrLineChart({
  cashflowData,
}: {
  cashflowData?: CashFlowData["cashflow"];
}) {
  const chartData = cashflowData
    ? cashflowData.map((item, index) => ({
        index: index + 1,
        date: item.paymentDate,
        desktop: item.amount,
      }))
    : [];
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", { month: "short", day: "2-digit" }); // "Aug 25"
  };

  // Format numbers as 200.00
  const formatNumber = (num: number) => num.toFixed(2);

  return (
    <ChartContainer
      config={chartConfig}
      style={{ height: "100%", width: "100%" }}
    >
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 30, bottom: 10, left: 30 }} // left spacing for numbers
      >
        <CartesianGrid vertical={false} />

        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={16} // space between numbers and chart
          tickFormatter={formatNumber} // format numbers like 200.00
          className="text-black"
        />

        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          tickFormatter={formatDate}
        />

        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />

        <Line
          dataKey="desktop"
          type="linear"
          stroke={chartConfig.desktop.color}
          strokeWidth={2}
          dot={{ fill: chartConfig.desktop.color }}
          activeDot={{ r: 5 }}
        >
          <LabelList
            position="top"
            offset={10}
            className="fill-foreground"
            fontSize={10}
            formatter={formatNumber} // format label values like 200.00
          />
        </Line>
      </LineChart>
    </ChartContainer>
  );
}
