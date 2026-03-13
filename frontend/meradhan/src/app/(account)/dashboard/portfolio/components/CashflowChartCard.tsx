"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import ChartCard from "./ChartCard";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";

const FALLBACK_DATA = {
  "1yr": [
    { month: "Nov 2024", Principal: 48.03, Interest: 52.67 },
    { month: "Dec 2024", Principal: 70.25, Interest: 76.46 },
    { month: "Jan 2025", Principal: 63.39, Interest: 75.77 },
    { month: "Feb 2025", Principal: 74.25, Interest: 80.36 },
    { month: "Mar 2025", Principal: 53.41, Interest: 67.85 },
    { month: "Apr 2025", Principal: 70.11, Interest: 88.29 },
    { month: "May 2025", Principal: 63.58, Interest: 81.73 },
    { month: "Jun 2025", Principal: 73.54, Interest: 80.37 },
    { month: "Jul 2025", Principal: 54.13, Interest: 61.96 },
    { month: "Aug 2025", Principal: 58.25, Interest: 77.88 },
    { month: "Sep 2025", Principal: 33.22, Interest: 45.73 },
    { month: "Oct 2025", Principal: 52.91, Interest: 61.48 },
  ],
  "2yrs": [
    { month: "Nov 2024", Principal: 48.03, Interest: 52.67 },
    { month: "Dec 2024", Principal: 70.25, Interest: 76.46 },
    { month: "Jan 2025", Principal: 63.39, Interest: 75.77 },
    { month: "Feb 2025", Principal: 74.25, Interest: 80.36 },
    { month: "Mar 2025", Principal: 53.41, Interest: 67.85 },
    { month: "Apr 2025", Principal: 70.11, Interest: 88.29 },
  ],
  "5yrs": [
    { month: "Nov 2024", Principal: 48.03, Interest: 52.67 },
    { month: "Dec 2024", Principal: 70.25, Interest: 76.46 },
    { month: "Jan 2025", Principal: 63.39, Interest: 75.77 },
  ],
};

export default function CashflowChartCard() {
  const [timePeriod, setTimePeriod] =
    useState<"1yr" | "2yrs" | "5yrs">("1yr");

  const portfolioApi = useMemo(
    () => new apiGateway.meradhan.customerPortfolioApi(apiClientCaller),
    []
  );

  const { data: response, isLoading } = useQuery({
    queryKey: ["cashflow-to-maturity"],
    queryFn: async () => portfolioApi.getCashflowToMaturity(),
  });

  const chartData =
    response?.responseData?.[timePeriod] || FALLBACK_DATA[timePeriod];

  const chartWidth = Math.max(chartData.length * 140, 800);
const maxValue = Math.max(
  ...chartData.map((d: { Principal: number; Interest: number }) => Math.max(d.Principal, d.Interest))
);

const roundedMax = Math.ceil(maxValue / 50) * 50;

const ticks = Array.from({ length: 5 }, (_, i) =>
  Math.round((roundedMax / 4) * i)
);
  return (
    <ChartCard title="Cashflow to Maturity / Call">

      <div className="flex justify-end mb-4">
        <div className="flex bg-gray-100 rounded-md p-1">
          {(["1yr", "2yrs", "5yrs"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${timePeriod === period
                ? "bg-gray-700 text-white"
                : "text-gray-600 hover:bg-gray-200"
                }`}
            >
              {period === "1yr"
                ? "1 yr"
                : period === "2yrs"
                  ? "2 yrs"
                  : "5 yrs"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-[320px] flex items-center justify-center">
          Loading chart...
        </div>
      ) : (
        <>
          <div className="flex">

            <div className="w-[70px] min-h-[340px] cashflow-chart-container-left">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <YAxis
                   domain={[0, roundedMax]}
                    ticks={ticks}
                    width={60}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    label={{
                      value: "Amount",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 12 },
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 overflow-x-auto w-full max-w-[1200px] cashflow-chart-container">
              <div style={{ width: chartWidth, height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="28%">
                    <CartesianGrid
                      vertical={false}
                      stroke="#e5e7eb"
                      strokeDasharray="4 4"
                    />

                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      hide
                      domain={[0, 600]}
                      ticks={[0, 150, 300, 450, 600]}
                    />

                    <Tooltip
                      formatter={(value: number) =>
                        `₹ ${value.toFixed(2)}`
                      }
                    />

                    <Bar
                      dataKey="Principal"
                      fill="#ff4560"
                      barSize={26}
                      radius={[6, 6, 0, 0]}
                    >
                      <LabelList dataKey="Principal" position="top" />
                    </Bar>

                    <Bar
                      dataKey="Interest"
                      fill="#00E396"
                      barSize={26}
                      radius={[6, 6, 0, 0]}
                    >
                      <LabelList dataKey="Interest" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-4 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff4560]"></span>
              Principal
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#00E396]"></span>
              Interest
            </div>
          </div>
        </>
      )}
    </ChartCard>
  );
}

