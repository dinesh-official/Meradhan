"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import ChartCard from "./ChartCard";
import { useQuery } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Loader2 } from "lucide-react";

const DEFAULT_DATA = [
  {
    name: "Below 1 year",
    value: 13.31,
    amount: 405000,
    color: "#F59E0B",
  },
  {
    name: "1 – 3 years",
    value: 39.95,
    amount: 1215000,
    color: "#F43F5E",
  },
  {
    name: "3 – 5 years",
    value: 20.12,
    amount: 612000,
    color: "#16C784",
  },
  {
    name: "5 – 8 years",
    value: 10.69,
    amount: 325000,
    color: "#3B5CCC",
  },
  {
    name: "8 – 15 years",
    value: 15.96,
    amount: 484000,
    color: "#7C5AC2",
  },
];

export default function InvestmentByMaturityCard() {
  const portfolioApi = new apiGateway.meradhan.customerPortfolioApi(
    apiClientCaller
  );

  const { data, isLoading } = useQuery({
    queryKey: ["portfolioInvestmentByMaturity"],
    queryFn: async () => {
      return portfolioApi.getInvestmentByMaturity();
    },
  });

  const responseItems = data?.responseData;

  const hasData = !!responseItems && responseItems.length > 0;

  const chartData = hasData
    ? responseItems!.map((item, index) => ({
      name: item.bucket,
      value: item.percentage,
      amount: item.investedAmount,
      color: DEFAULT_DATA[index % DEFAULT_DATA.length].color,
    }))
    : [];

  if (isLoading) {
    return (
      <ChartCard title="Investment by Maturity (Duration)">
        <div className="flex min-h-[260px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0C4580]" />
        </div>
      </ChartCard>
    );
  }

  if (!hasData) {
    return (
      <ChartCard title="Investment by Maturity (Duration)">
        <div className="flex min-h-[260px] items-center justify-center text-sm text-gray-500">
          No data available.
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Investment by Maturity (Duration)">
      <div className="flex gap-6 md:min-h-[350px] h-auto flex-col md:flex-row">
        <div className="flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={0.5}
                label={({ percent }) =>
                  `${(percent * 100).toFixed(2)}%`
                }
                labelLine={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value: number) => `${value}%`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full md:w-56 md:overflow-y-auto overflow-x-auto md:overflow-x-hidden pr-2 space-y-5 flex flex-row md:flex-col md:gap-0 gap-5 max-h-[350px]">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-start gap-2 px-2">
              <div
                className="w-[10px] h-[10px] min-w-[10px] min-h-[10px] rounded-full mt-1"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-[90px]">
                <p className="text-sm font-medium whitespace-nowrap">{item.name}</p>

                <p className="text-xs text-muted-foreground wh">
                  ₹{" "}
                  {Number(item.amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}