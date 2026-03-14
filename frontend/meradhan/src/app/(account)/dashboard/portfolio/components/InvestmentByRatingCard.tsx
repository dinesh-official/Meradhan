"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import ChartCard from "./ChartCard";
import { useQuery } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Loader2 } from "lucide-react";

const DEFAULT_DATA = [
  { rating: "AAA", bonds: 12, amount: 50000, color: "#008C3B" },
  { rating: "AA+", bonds: 8, amount: 25000, color: "#139D4D" },
  { rating: "AA", bonds: 10, amount: 60000, color: "#02A647" },
  { rating: "AA–", bonds: 5, amount: 45000, color: "#00B34C" },
  { rating: "A+", bonds: 4, amount: 30000, color: "#07C557" },
  { rating: "A", bonds: 15, amount: 40000, color: "#43C379" },
  { rating: "A–", bonds: 8, amount: 35000, color: "#27CE6D" },
  { rating: "BBB+", bonds: 6, amount: 20000, color: "#FFA900" },
  { rating: "BBB", bonds: 10, amount: 25000, color: "#F99D1C" },
  { rating: "BBB–", bonds: 4, amount: 15000, color: "#F68B1F" },
  { rating: "BB+", bonds: 6, amount: 18000, color: "#FF4D4D" },
  { rating: "BB", bonds: 5, amount: 22000, color: "#FF4D4D" },
  { rating: "BB–", bonds: 2, amount: 10000, color: "#F44844" },
  { rating: "B+", bonds: 3, amount: 12000, color: "#F33533" },
  { rating: "B", bonds: 2, amount: 8000, color: "#F12222" },
];

export default function InvestmentByRatingCard() {
  const portfolioApi = new apiGateway.meradhan.customerPortfolioApi(
    apiClientCaller
  );

  const { data, isLoading } = useQuery({
    queryKey: ["portfolioInvestmentByRating"],
    queryFn: async () => {
      return portfolioApi.getInvestmentByRating();
    },
  });

  const responseItems = data?.responseData;

  const hasData = !!responseItems && responseItems.length > 0;

  const chartData = hasData
    ? responseItems!.map((item, index) => ({
        rating: item.rating,
        bonds: item.bondCount,
        amount: item.totalInvestment,
        color: DEFAULT_DATA[index % DEFAULT_DATA.length].color,
      }))
    : [];

  if (isLoading) {
    return (
      <ChartCard title="Investment by Bond Rating">
        <div className="flex min-h-[260px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0C4580]" />
        </div>
      </ChartCard>
    );
  }

  if (!hasData) {
    return (
      <ChartCard title="Investment by Bond Rating">
        <div className="flex min-h-[260px] items-center justify-center text-sm text-gray-500">
          No data available.
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Investment by Bond Rating">
      <div className="flex gap-6 md:h-[350px] h-auto flex-col md:flex-row">
        <div className="flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={chartData}
              barCategoryGap="35%"
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#D1D5DB"
                strokeWidth={1.2}
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="rating"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 20]}
                ticks={[0, 4, 8, 12, 16, 20]}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                label={{
                  value: "NOS OF BONDS",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
              />

              <Tooltip />

              <Bar
                dataKey="bonds"
                radius={[6, 6, 0, 0]}
                barSize={15}   
              >
                <LabelList
                  dataKey="bonds"
                  position="top"
                  style={{ fontSize: 12, fontWeight: 600 }}
                />
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full md:w-56 md:overflow-y-auto overflow-x-auto md:overflow-x-hidden pr-2 space-y-5 flex flex-row md:flex-col md:gap-0 gap-5 max-h-[350px]">
          {chartData.map((item) => (
            <div key={item.rating} className="flex items-start gap-2 px-2">
              <div
                className="w-[10px] h-[10px] min-w-[10px] min-h-[10px] rounded-full mt-1"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-[80px]">
                <p className="text-sm font-medium whitespace-nowrap">{item.rating}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap">
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

