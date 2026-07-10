"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import OrdersSectionTabs from "../../../../_components/OrdersSectionTabs";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function StakeholderDetailsView() {
  const params = useParams<{ id: string; stakeholderId: string }>();
  const accountId = params?.id;
  const stakeholderId = params?.stakeholderId;

  const stakeholdersApi = useMemo(
    () => new apiGateway.crm.crmRazorpayStakeholdersApi(apiClientCaller),
    []
  );

  const listQuery = useQuery({
    enabled: !!accountId,
    queryKey: ["crmRazorpayRouteStakeholders", accountId],
    queryFn: async () => stakeholdersApi.listByAccount(accountId!),
  });

  const stakeholder =
    listQuery.data?.responseData.stakeholders.find(
      (s) => s.razorpayStakeholderId === stakeholderId
    ) ?? null;

  return (
    <div>
      <OrdersSectionTabs />
      <PageInfoBar title="Stakeholder details" description={`Account: ${accountId}`} />

      <div className="mt-5 max-w-4xl space-y-4">
        {listQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : listQuery.isError ? (
          <div className="text-sm text-destructive">Could not load stakeholders.</div>
        ) : !stakeholder ? (
          <div className="text-sm text-muted-foreground">Stakeholder not found.</div>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base">{stakeholder.name}</CardTitle>
                <CardDescription>{stakeholder.razorpayStakeholderId}</CardDescription>
              </div>
              <Button asChild>
                <Link
                  href={`/dashboard/orders/razorpay-routes/${encodeURIComponent(accountId!)}/stakeholders/${encodeURIComponent(stakeholder.razorpayStakeholderId)}/update`}
                >
                  Update
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-sm font-medium">Raw JSON</div>
              <pre className="max-h-[60vh] overflow-auto rounded-lg border bg-muted p-4 text-xs">
                {JSON.stringify(stakeholder.data ?? stakeholder, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

