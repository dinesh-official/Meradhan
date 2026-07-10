"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { OngoingDealList } from "./OngoingDealList";

function OngoingDealsCard() {
  const apiGate = new apiGateway.bondsApi.BondsApi(apiClientCaller);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ongoing-deals"],
    queryFn: async () => {
      const { responseData } = await apiGate.getOngoingDeals();
      return responseData;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return (
    <Card className="border-gray-200 rounded-lg min-h-96" role="region">
      <CardHeader>
        <CardTitle className="font-medium text-2xl">
          Ongoing <span className="text-secondary">Deals</span>
        </CardTitle>
        <CardDescription className="text-base">
          Discover ongoing bond deals with exclusive offers — available for a
          limited time on MeraDhan!
        </CardDescription>
      </CardHeader>

      <CardContent className="">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoaderCircle className="text-primary animate-spin" size={40} />
          </div>
        ) : isError ? (
          <p className="text-center text-red-500 text-base mt-10">
            Failed to load ongoing deals. Please try again later.
          </p>
        ) : !data || data.length === 0 ? (
          <p className="text-center text-gray-500 text-base mt-10">
            No ongoing deals available at the moment.
          </p>
        ) : (
          <div>
            {data.map((bond) => (
              <OngoingDealList key={bond.isin} bond={bond} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OngoingDealsCard;
