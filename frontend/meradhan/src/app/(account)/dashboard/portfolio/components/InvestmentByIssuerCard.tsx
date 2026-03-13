"use client";

import ChartCard from "./ChartCard";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Loader2 } from "lucide-react";

const DEFAULT_DATA = [
  { name: "Government", value: 5000000, count: 4 },
  { name: "Sovereign", value: 2500000, count: 2 },
  { name: "PSU", value: 6000000, count: 5 },
  { name: "Corporate", value: 4500000, count: 3 },
  { name: "Tax Free", value: 3000000, count: 3 },
  { name: "Perpetual", value: 2000000, count: 2 },
];

const COLORS = [
  "#16C784", // Government (green)
  "#F59E0B", // Sovereign (yellow)
  "#F43F5E", // PSU (pink/red)
  "#7C5AC2", // Corporate (purple)
  "#3B5CCC", // Tax Free (blue)
  "#5F7A86", // Perpetual (slate grey)
];

const formatINR = (value: number) => {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
export default function InvestmentByIssuerCard() {
  const portfolioApi = new apiGateway.meradhan.customerPortfolioApi(
    apiClientCaller
  );

  const { data, isLoading } = useQuery({
    queryKey: ["portfolioInvestmentByIssuer"],
    queryFn: async () => {
      return portfolioApi.getInvestmentByIssuerType();
    },
  });

  const response = data?.responseData;

  const hasData = !!response && response.issuerAllocation.length > 0;

  const chartData = hasData
    ? response!.issuerAllocation.map((item) => ({
      name: item.issuerType,
      value: item.investedAmount,
      count: item.bondCount,
    }))
    : [];

  const total =
    response?.totalInvestment ??
    chartData.reduce((sum, d) => sum + d.value, 0);

  const CenterLabel = () => (
    <g>
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        fill="#666666E5"
        fontSize={14}
      >
        Total Investment
      </text>
      <text
        x="50%"
        y="56%"
        textAnchor="middle"
        fontSize={20}
        fontWeight={700}
      >
        {formatINR(total)}
      </text>
    </g>
  );

  const renderSliceLabel = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { cx, cy, midAngle, outerRadius, index }: any
  ) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const anchor = x > cx ? "start" : "end";
    const entry = chartData[index];

    return (
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        fontSize={12}
        fontWeight={600}
        fill="#6b7280"
      >
        {entry.count} Bonds
      </text>
    );
  };

  const renderLabelLine = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { cx, cy, midAngle, outerRadius, index }: any
  ) => {
    const RADIAN = Math.PI / 180;

    const startX = cx + outerRadius * Math.cos(-midAngle * RADIAN);
    const startY = cy + outerRadius * Math.sin(-midAngle * RADIAN);

    const endX =
      cx + (outerRadius + 15) * Math.cos(-midAngle * RADIAN);
    const endY =
      cy + (outerRadius + 15) * Math.sin(-midAngle * RADIAN);

    return (
      <path
        d={`M${startX},${startY} L${endX},${endY}`}
        stroke={COLORS[index % COLORS.length]}
        strokeWidth={1}
        fill="none"
      />
    );
  };

  if (isLoading) {
    return (
      <ChartCard title="Investment by Issuer Type">
        <div className="flex min-h-[260px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0C4580]" />
        </div>
      </ChartCard>
    );
  }

  if (!hasData) {
    return (
      <ChartCard title="Investment by Issuer Type">
        <div className="flex min-h-[260px] items-center justify-center text-sm text-gray-500">
          No data available.
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Investment by Issuer Type">
      <div className="flex gap-6 md:min-h-[350px] h-auto flex-col md:flex-row">
        <div className="flex-1 min-h-[260px]">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={0.5}
                label={renderSliceLabel}
                labelLine={renderLabelLine}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
                <Label position="center" content={<CenterLabel />} />
              </Pie>

              <Tooltip
                formatter={(v: number) => formatINR(v)}
                contentStyle={{ borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full md:w-56 md:overflow-y-auto overflow-x-auto md:overflow-x-hidden pr-2 space-y-5 flex flex-row md:flex-col md:gap-0 gap-5 max-h-[350px]">
          {chartData.map((d, i) => (
            <div key={d.name} className="flex gap-2 px-2">
              <span
                className="w-[10px] h-[10px] min-w-[10px] min-h-[10px] rounded-full mt-1"
                style={{
                  background: COLORS[i % COLORS.length],
                }}
              />
              <div className="min-w-[80px]">
                <div className="text-sm font-medium whitespace-nowrap">
                  {d.name.toUpperCase()}
                </div>
                <div className="text-xs text-neutral-500 whitespace-nowrap">
                  {formatINR(d.value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
}

