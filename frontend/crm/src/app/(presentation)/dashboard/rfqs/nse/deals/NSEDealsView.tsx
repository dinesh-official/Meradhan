"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import DealProposerSection from "./_tabs/Deal_Proposer/DealProposerSection";

function NSEDealsView() {
  const [tabs, setTabs] = useState("deal_proposer");
  const [date, setdate] = useState(new Date().toISOString().split("T")[0]);
  const [confirmStatus, setConfirmStatus] = useState("");
  const [rfqNumber, setRfqNumber] = useState("");
  const [buySell, setBuySell] = useState("");

  const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);

  const { data, isLoading } = useQuery({
    queryKey: [
      "nseDealProposers",
      date,
      // lastActivityTimestamp removed
      confirmStatus,
      rfqNumber,
      buySell,
    ],
    queryFn: async () => {
      const response = await rfqApi.getAllNegotiations({
        confirmStatus:
          confirmStatus === ""
            ? undefined
            : (confirmStatus as "PP" | "PC" | "PR" | "CA" | "CC" | "CR"),
        rfqNumber,
        buySell: buySell === "" ? undefined : (buySell as "B" | "S"),
        date: date,
      });
      return response.responseData;
    },
    retry: 2,
  });

  return (
    <div className="flex flex-col gap-5 mt-5">
      {/* <div className="gap-5 grid 2xl:grid-cols-4 xl:grid-cols-3">
        <StatusCountCard
          title="Deal Submit (Proposer)"
          value={10}
          changeText=""
          variant="purpleGradient"
        />
        <StatusCountCard
          title="Deal Submit (Counterparty)"
          value={10}
          changeText=""
          variant="orangeGradient"
        />
        <StatusCountCard
          title="Deal (Confirmed)"
          value={10}
          changeText=""
          variant="greenGradient"
        />
      </div> */}

      {/* Filters Section */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filter Deals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                From Timestamp
              </label>
              <div className="flex">
                <div
                  onClick={() => {
                    const prevDate = new Date(date || new Date());
                    prevDate.setDate(prevDate.getDate() - 1);
                    const formatted = prevDate.toISOString().split("T")[0];
                    setdate?.(formatted);
                  }}
                  className="w-12 border rounded-l px-2 py-1 flex justify-center items-center cursor-pointer"
                >
                  <ArrowLeft size={18} />
                </div>
                <input
                  type="date"
                  className="w-full border-t border-b  px-2 py-1"
                  value={date}
                  onChange={(e) => setdate(e.target.value)}
                />
                <div
                  className="w-12 border rounded-r px-2 py-1 flex justify-center items-center cursor-pointer"
                  onClick={() => {
                    const disabled =
                      date === new Date().toISOString().split("T")[0];
                    if (disabled) {
                      return;
                    }
                    const prevDate = new Date(date || new Date());
                    prevDate.setDate(prevDate.getDate() + 1);
                    const formatted = prevDate.toISOString().split("T")[0];
                    setdate?.(formatted);
                  }}
                >
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                RFQ Number
              </label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                maxLength={15}
                value={rfqNumber}
                onChange={(e) => setRfqNumber(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirmation Status
              </label>
              <select
                className="w-full border rounded px-2 py-1"
                value={confirmStatus}
                onChange={(e) => setConfirmStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="PP">PP - Proposer Checker Pending*</option>
                <option value="PC">PC - Submitted to Counter</option>
                <option value="PR">PR - Proposer Checker Rejected*</option>
                <option value="CA">CA - Counter Checker Pending*</option>
                <option value="CC">CC - Confirmed</option>
                <option value="CR">CR - Counter Rejected</option>
              </select>
              <div className="text-xs mt-1 text-gray-500">
                * Relevant only if Maker checker is enabled in the deal
                confirmation leg of proposer or counter
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Buy/Sell</label>
              <select
                className="w-full border rounded px-2 py-1"
                value={buySell}
                onChange={(e) => setBuySell(e.target.value)}
              >
                <option value="">All</option>
                <option value="B">B - Buy</option>
                <option value="S">S - Sell</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deals Management</CardTitle>
          <CardDescription>
            View and manage deals across different stages
          </CardDescription>
          <div className="flex justify-between items-center gap-5 mt-2">
            <Tabs defaultValue="deal_proposer" onValueChange={setTabs}>
              <TabsList>
                <TabsTrigger value="all">All Deals</TabsTrigger>
                <TabsTrigger value="deal_proposer">Deal Proposer (PP/PR)</TabsTrigger>
                <TabsTrigger value="deal_counterparty">
                  Deal Counterparty (PC/CA/CR)
                </TabsTrigger>
                <TabsTrigger value="deal_confirmed">Deal Confirmed (CC)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          {tabs === "all" && (
            <DealProposerSection data={data || []} loading={isLoading} />
          )}
          {tabs === "deal_proposer" && (
            <DealProposerSection
              data={data?.filter((e) => e.confirmStatus == "PP" || e.confirmStatus == "PR") || []}
              loading={isLoading}
            />
          )}
          {tabs === "deal_counterparty" && (
            <DealProposerSection
              data={data?.filter((e) => e.confirmStatus == "PC" || e.confirmStatus == "CA" || e.confirmStatus == "CR") || []}
              loading={isLoading}
            />
          )}
          {tabs === "deal_confirmed" && (
            <DealProposerSection
              data={data?.filter((e) => e.confirmStatus == "CC") || []}
              loading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default NSEDealsView;
