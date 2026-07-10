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
import { ActivePortfolioSummaryTabShimmer } from "./components/PortfolioTabShimmers";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";

function formatInrAmount(currency: string, amount: unknown): string {
  const n =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount.replace(/,/g, ""))
        : NaN;
  if (!Number.isFinite(n)) {
    return `${currency} —`;
  }
  return `${currency} ${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PortfolioPageClient() {
  const [activeTab, setActiveTab] = useState("Active Portfolio Summary");

  const portfolioApi = new apiGateway.meradhan.customerPortfolioApi(
    apiClientCaller
  );

  const {
    data,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErrorDetail,
  } = useQuery({
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
        value: formatInrAmount(summary.currency, summary.investedAmount),
      },
      {
        title: "Average Portfolio Maturity",
        value: summary.averageMaturity?.formatted ?? "—",
      },
      {
        title: "Number of Bonds",
        value: String(summary.numberOfBonds ?? "—"),
      },
      {
        title: "Average Portfolio Yield",
        value: `${Number(summary.averageYield?.value ?? 0).toFixed(4)}%`,
      },
    ]
    : [
      { title: "Invested Amount", value: "-" },
      { title: "Average Portfolio Maturity", value: "-" },
      { title: "Number of Bonds Held", value: "-" },
      { title: "Average Portfolio Yield", value: "-" },
    ];

  const summaryFailed = summaryError && !summaryLoading;

  return (
    <div className="space-y-8 w-full min-w-0 max-w-full">
      <h1 className="text-2xl mb-4 wrap-break-word">
        My <span className="font-bold">Portfolio</span>
      </h1>

      {summaryFailed && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          <p className="font-medium">Could not load portfolio summary</p>
          <p className="mt-1 text-red-700">
            {summaryErrorDetail instanceof Error
              ? summaryErrorDetail.message
              : "Please refresh the page or sign in again."}
          </p>
        </div>
      )}

      <ProfileTabs
        tabs={["Active Portfolio Summary", "Portfolio Details", "Cashflow Timeline"]}
        active={activeTab}
        onChange={(tab: string) => setActiveTab(tab)}
      />

      {activeTab === "Active Portfolio Summary" && (
        <>
          {summaryLoading ? (
            <ActivePortfolioSummaryTabShimmer />
          ) : (
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
        </>
      )}

      {activeTab === "Portfolio Details" && <PortfolioDetails />}
      {activeTab === "Cashflow Timeline" && <CashflowTimeline />}
    </div>
  );
}

