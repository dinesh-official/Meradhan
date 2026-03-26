"use client";

import { Pie, PieChart, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const leadsApi = new apiGateway.crm.crmLeads.CrmLeadApi(apiClientCaller);

const sourceLabels: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  SOCIAL: "Social",
  ADVERTISEMENT: "Ads",
  EVENT: "Event",
  COLD_CALL: "Cold Call",
  EMAIL: "Email",
  OTHER: "Other",
};

const palette = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
];

type Props = { rangeDays: number };

export function LeadSourcesPiChart({ rangeDays }: Props) {
  const summaryQuery = useQuery({
    queryKey: ["lead-source-summary", rangeDays],
    queryFn: async () => {
      const response = await leadsApi.getLeadSourceSummary({
        params: { rangeDays },
      });
      return response.data.responseData;
    },
    staleTime: 60_000,
  });

  const chartData =
    summaryQuery.data?.map((item, idx) => ({
      keyName: item.source,
      count: item.count,
      fill: palette[idx % palette.length],
    })) || [];

  const chartConfig: ChartConfig = {
    count: { label: "Lead Sources" },
    ...(chartData.reduce<Record<string, { label: string; color: string }>>(
      (acc, item) => {
        acc[item.keyName] = {
          label: sourceLabels[item.keyName] ?? item.keyName,
          color: item.fill,
        };
        return acc;
      },
      {}
    ) as ChartConfig),
  };

  const isEmpty = chartData.length === 0;

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[300px]"
    >
      {isEmpty ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No lead sources found for this range.
        </div>
      ) : (
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
      )}
    </ChartContainer>
  );
}
