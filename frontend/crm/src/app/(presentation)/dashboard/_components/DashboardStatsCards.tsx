"use client";

import StatusCountCard from "@/global/elements/cards/StatusCountCard";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import type { FC } from "react";

type CardStat = {
  label: string;
  value: string | number;
  changeText: string;
  arrowType: "up" | "down" | "none";
  variant:
    | "pinkGradient"
    | "greenGradient"
    | "redGradient"
    | "grayGradient";
};

const formatChange = (value: number, rangeDays: number) => {
  const fixed = Number.isFinite(value) ? value.toFixed(1) : "0.0";
  const sign = value > 0 ? "+" : "";
  return `${sign}${fixed}% vs prev ${rangeDays}d`;
};

const asPercent = (value: number) => `${value.toFixed(1)}%`;

type Props = { rangeDays: number };

const dashboardApi = new apiGateway.crm.dashboard.CrmDashboardApi(apiClientCaller);

export const DashboardStatsCards: FC<Props> = ({ rangeDays }) => {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", rangeDays],
    queryFn: async () => {
      const response = await dashboardApi.getSummary({
        params: { rangeDays },
      });
      return response.data.responseData;
    },
    staleTime: 60_000,
  });

  const data = summaryQuery.data;
  const loading = summaryQuery.isLoading;

  const cards: CardStat[] = [
    {
      label: "Active Leads",
      value: loading ? "…" : data?.activeLeads.total ?? 0,
      changeText: loading
        ? "Loading…"
        : formatChange(data?.activeLeads.trendPct ?? 0, rangeDays),
      arrowType: (data?.activeLeads.trendPct ?? 0) >= 0 ? "up" : "down",
      variant: "pinkGradient",
    },
    {
      label: "Completed Projects",
      value: loading ? "…" : data?.completedProjects.total ?? 0,
      changeText: loading
        ? "Loading…"
        : formatChange(data?.completedProjects.trendPct ?? 0, rangeDays),
      arrowType: (data?.completedProjects.trendPct ?? 0) >= 0 ? "up" : "down",
      variant: "greenGradient",
    },
    {
      label: "User Drop Rate",
      value: loading ? "…" : asPercent(data?.userDropRate.ratePct ?? 0),
      changeText: loading
        ? "Loading…"
        : formatChange(data?.userDropRate.trendPct ?? 0, rangeDays),
      arrowType: (data?.userDropRate.trendPct ?? 0) >= 0 ? "up" : "down",
      variant: "redGradient",
    },
    {
      label: "User Gain Rate",
      value: loading ? "…" : asPercent(data?.userGainRate.ratePct ?? 0),
      changeText: loading
        ? "Loading…"
        : formatChange(data?.userGainRate.trendPct ?? 0, rangeDays),
      arrowType: (data?.userGainRate.trendPct ?? 0) >= 0 ? "up" : "down",
      variant: "grayGradient",
    },
  ];

  return (
    <div className="gap-5 grid md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatusCountCard
          key={card.label}
          title={card.label}
          value={card.value}
          changeText={card.changeText}
          arrowType={card.arrowType}
          variant={card.variant}
        />
      ))}
    </div>
  );
};

