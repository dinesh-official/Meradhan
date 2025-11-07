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
import StatusCountCard from "@/global/elements/cards/StatusCountCard";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DealProposerSection from "./_tabs/Deal_Proposer/DealProposerSection";

function NSEDealsView() {
  const [tabs, setTabs] = useState("deal_proposer");

  const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);

  const { data, isLoading } = useQuery({
    queryKey: ["nseDealProposers"],
    queryFn: async () => {
      const response = await rfqApi.getAllNegotiations({});
      return response.responseData;
    },
    retry: 2,
  });

  return (
    <div className="flex flex-col gap-5 mt-5">
      <div className="gap-5 grid 2xl:grid-cols-4 xl:grid-cols-3">
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deals Management</CardTitle>
          <CardDescription>
            View and manage deals across different stages
          </CardDescription>
          <div className="flex justify-between items-center gap-5 mt-2">
            <Tabs defaultValue="deal_proposer" onValueChange={setTabs}>
              <TabsList>
                <TabsTrigger value="deal_proposer">Deal Proposer</TabsTrigger>
                <TabsTrigger value="deal_counterparty">
                  Deal Counterparty
                </TabsTrigger>
                <TabsTrigger value="deal_confirmed">Deal Confirmed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent>
          {tabs === "deal_proposer" && (
            <DealProposerSection
              data={data?.filter((e) => !e.confirmStatus) || []}
              loading={isLoading}
            />
          )}
          {tabs === "deal_counterparty" && (
            <DealProposerSection
              data={data?.filter((e) => e.confirmStatus == "PC") || []}
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
