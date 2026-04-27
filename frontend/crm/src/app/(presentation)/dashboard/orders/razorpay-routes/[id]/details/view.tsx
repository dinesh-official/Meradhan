"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import OrdersSectionTabs from "../../../_components/OrdersSectionTabs";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function RazorpayRouteAccountDetailsView() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const routesApi = useMemo(
    () => new apiGateway.crm.crmRazorpayRoutesApi(apiClientCaller),
    []
  );
  const stakeholdersApi = useMemo(
    () => new apiGateway.crm.crmRazorpayStakeholdersApi(apiClientCaller),
    []
  );

  const recordQuery = useQuery({
    enabled: !!id,
    queryKey: ["crmRazorpayRouteAccountById", id],
    queryFn: async () => routesApi.getRouteAccountById(id!),
  });

  const record = recordQuery.data?.responseData.account;

  const stakeholdersQuery = useQuery({
    enabled: !!id,
    queryKey: ["crmRazorpayRouteStakeholders", id],
    queryFn: async () => stakeholdersApi.listByAccount(id!),
  });

  const stakeholders = stakeholdersQuery.data?.responseData.stakeholders ?? [];

  return (
    <div>
      <OrdersSectionTabs />
      <PageInfoBar
        title="Account details"
        description="Full account payload stored from Razorpay."
      />

      <div className="mt-5 max-w-4xl space-y-4">
        {recordQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : recordQuery.isError ? (
          <div className="text-sm text-destructive">Could not load account.</div>
        ) : !record ? (
          <div className="text-sm text-muted-foreground">Account not found.</div>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base">{record.razorpayAccountId}</CardTitle>
                  <CardDescription>
                    Created: {new Date(record.createdAt).toLocaleString()}
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={`/dashboard/orders/razorpay-routes/${record.razorpayAccountId}/update`}>
                    Update
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-sm font-medium">Raw JSON</div>
                <pre className="max-h-[60vh] overflow-auto rounded-lg border bg-muted p-4 text-xs">
                  {JSON.stringify(record.data, null, 2)}
                </pre>
              </CardContent>
            </Card>

            <Card id="stakeholders">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-base">Stakeholders</CardTitle>
                  <CardDescription>
                    Create and view stakeholders for this account.
                  </CardDescription>
                </div>
                <Button variant="secondary" asChild>
                  <Link
                    href={`/dashboard/orders/razorpay-routes/${record.razorpayAccountId}/stakeholders/create`}
                  >
                    Create stakeholder
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {stakeholdersQuery.isLoading ? (
                  <div className="text-sm text-muted-foreground">Loading stakeholders…</div>
                ) : stakeholdersQuery.isError ? (
                  <div className="text-sm text-destructive">Could not load stakeholders.</div>
                ) : stakeholders.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No stakeholders yet.</div>
                ) : (
                  <div className="space-y-2">
                    {stakeholders.map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-sm font-medium">{s.name}</div>
                            <Badge variant="outline">{s.razorpayStakeholderId}</Badge>
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {s.email ?? "—"}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button variant="secondary" asChild>
                            <Link
                              href={`/dashboard/orders/razorpay-routes/${record.razorpayAccountId}/stakeholders/${s.razorpayStakeholderId}`}
                            >
                              Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

