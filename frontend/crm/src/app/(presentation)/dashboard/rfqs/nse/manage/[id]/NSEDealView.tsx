"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, RefreshCw } from "lucide-react";
import NseAdditionalInformation from "./_components/NseAdditionalInformation";
import NseRecordInformation from "./_components/NseRecordInformation";
import NseRfqInformation from "./_components/NseRfqInformation";
import NseTradingOptions from "./_components/NseTradingOptions";
import { mapRfqToComponents } from "./_utils/mapRfqData";
import AcceptQuate from "./_components/actions/AcceptQuate";

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <Skeleton className="w-48 h-6" />
        </CardHeader>
        <CardContent>
          <div className="gap-5 grid md:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-20 h-4" />
                <Skeleton className="w-32 h-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-row gap-5 w-full">
        <Card className="flex-1">
          <CardHeader>
            <Skeleton className="w-36 h-6" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-24 h-4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <Skeleton className="w-40 h-6" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="w-16 h-4" />
                    <Skeleton className="w-28 h-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="w-32 h-6" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="w-20 h-4" />
                    <Skeleton className="w-36 h-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="flex justify-center items-center p-6 w-full h-full">
      <Alert variant="destructive" className="">
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Failed to load RFQ details</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || "An error occurred while fetching RFQ information."}
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-1 w-4 h-4" />
              Try Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

function NSEDealView({ id, date }: { id: string; date?: string }) {
  const rfqApi = new apiGateway.crm.rfq.RfqIsinApi(apiClientCaller);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["nseRfqDetails", id, date],
    queryFn: async () => {
      const response = await rfqApi.getRfqByNumber({
        number: id,
        date: date,
      });
      return response.responseData?.[0];
    },
    enabled: !!id,
    retry: 2,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState error={error as Error} onRetry={() => refetch()} />;
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center p-6 w-full h-full">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertTitle>No RFQ Found</AlertTitle>
          <AlertDescription>
            The RFQ with ID {id} was not found or may have been removed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Map API data to component props
  const componentData = mapRfqToComponents(data);

  return (
    <div className="flex flex-col gap-5">
      {/* Header with RFQ Status and Refresh */}
      <div className="flex justify-between items-center">
        <div></div>
        <div className="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <AcceptQuate data={data} />
          {/* <RejectQuate data={data} /> */}
        </div>
      </div>

      {/* RFQ Information Card */}
      <div>
        <NseRfqInformation {...componentData.rfqInformation} />
      </div>

      {/* Trading Options and Additional Info */}
      <div className="flex flex-row gap-5 w-full">
        <div className="flex-1">
          <NseTradingOptions {...componentData.tradingOptions} />
        </div>
        <div className="flex flex-col gap-5 min-w-[300px]">
          <NseAdditionalInformation {...componentData.additionalInformation} />
          <NseRecordInformation {...componentData.recordInformation} />
        </div>
      </div>
    </div>
  );
}

export default NSEDealView;
