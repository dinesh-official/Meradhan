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
    | "grayGradient"
    | "blueGradient"
    | "purpleGradient"
    | "orangeGradient"
    | "indigoGradient";
};

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
  const o = data?.overview;

  const cards: CardStat[] = [
    {
      label: "Total Customers",
      value: loading ? "…" : (o?.totalCustomers ?? 0),
      changeText: "",
      arrowType: "none",
      variant: "blueGradient",
    },
    {
      label: "KYC Completed",
      value: loading ? "…" : (o?.kycCompleted ?? 0),
      changeText: "",
      arrowType: "none",
      variant: "greenGradient",
    },
    {
      label: "KYC Pending",
      value: loading ? "…" : (o?.kycPending ?? 0),
      changeText: "",
      arrowType: "none",
      variant: "orangeGradient",
    },
    {
      label: "Total RFQ",
      value: loading ? "…" : (o?.totalRfq ?? 0),
      changeText: "",
      arrowType: "none",
      variant: "purpleGradient",
    },
    {
      label: "Total Leads",
      value: loading ? "…" : (o?.totalLeads ?? 0),
      changeText: "",
      arrowType: "none",
      variant: "pinkGradient",
    },
    {
      label: "Bonds (Allow for Purchase)",
      value: loading ? "…" : (o?.bondsAllowForPurchase ?? 0),
      changeText: "",
      arrowType: "none",
      variant: "indigoGradient",
    },
  ];

  return (
    <div className="gap-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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

