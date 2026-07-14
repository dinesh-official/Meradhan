"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import apiGateway from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";

const dashboardApi = new apiGateway.crm.dashboard.CrmDashboardApi(apiClientCaller);

function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateTimeUtils.formatDateTime(iso, "DD MMM YYYY hh:mm:ss AA");
}

export function SettlementJobPanel() {
  const statusQuery = useQuery({
    queryKey: ["dashboard-settlement-job-status"],
    queryFn: async () => {
      const response = await dashboardApi.getSettlementJobStatus();
      return response.data.responseData;
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const lastRunAt = statusQuery.data?.lastUpdate?.at ?? null;

  return (
    <Card className="rounded-lg shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Settlement Jobs</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          <span className="text-muted-foreground">Last run: </span>
          {statusQuery.isLoading ? (
            <span className="text-muted-foreground">Loading…</span>
          ) : statusQuery.isError ? (
            <span className="text-red-600">Unavailable</span>
          ) : (
            <span className="font-medium tabular-nums">
              {formatTimestamp(lastRunAt)}
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
