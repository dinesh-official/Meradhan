"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PortfolioSummaryCards from "./components/PortfolioSummaryCards";
import CashflowChartCard from "./components/CashflowChartCard";
import InvestmentByIssuerCard from "./components/InvestmentByIssuerCard";
import InvestmentByRatingCard from "./components/InvestmentByRatingCard";
import InvestmentAllocationCard from "./components/InvestmentAllocationCard";
import InvestmentByMaturityCard from "./components/InvestmentByMaturityCard";
import PortfolioDetails from "./components/PortfolioDetails";
import { ProfileTabs } from "../profile/_components/ProfileTab";
import CashflowTimeline from "./components/CashflowTimeline";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";

export default function PortfolioPageClient() {
  const [activeTab, setActiveTab] = useState("Active Portfolio Summary");

  const portfolioApi = new apiGateway.meradhan.customerPortfolioApi(
    apiClientCaller
  );

  const { data } = useQuery({
    queryKey: ["portfolioSummary"],
    queryFn: async () => {
      return portfolioApi.getPortfolioSummary();
    },
  });

  const summary = data?.responseData;

  const summaryData = summary
    ? [
      {
        title: "Invested Amount",
        value: `${summary.currency} ${summary.investedAmount.toLocaleString(
          "en-IN"
        )}`
      },
      {
        title: "Average Portfolio Maturity",
        value: summary.averageMaturity.formatted,
      },
      {
        title: "Number of Bonds",
        value: summary.numberOfBonds.toString(),
      },
      {
        title: "Average Portfolio Yield",
        value: `${summary.averageYield.value.toFixed(4)}%`,
      },
    ]
    : [
      { title: "Invested Amount", value: "-" },
      { title: "Average Portfolio Maturity", value: "-" },
      { title: "Number of Bonds Held", value: "-" },
      { title: "Average Portfolio Yield", value: "-" },
    ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl mb-4">My <span className="font-bold">Portfolio</span></h1>

      <ProfileTabs
        tabs={["Active Portfolio Summary", "Portfolio Details", "Cashflow Timeline"]}
        active={activeTab}
        onChange={(tab: string) => setActiveTab(tab)}
      />

      {activeTab === "Active Portfolio Summary" && (
        <>
          <PortfolioSummaryCards data={summaryData} />
          <CashflowChartCard />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InvestmentByIssuerCard />
            <InvestmentByRatingCard />
            <InvestmentAllocationCard />
            <InvestmentByMaturityCard />
          </div>
        </>
      )}

      {activeTab === "Portfolio Details" && <PortfolioDetails />}
      {activeTab === "Cashflow Timeline" && <CashflowTimeline />}
    </div>
  );
}

