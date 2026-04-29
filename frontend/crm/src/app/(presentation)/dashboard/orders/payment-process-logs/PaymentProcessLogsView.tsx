"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiGateway from "@root/apiGateway";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, ChevronDown, Clock, Search, XCircle } from "lucide-react";
import OrdersSectionTabs from "../_components/OrdersSectionTabs";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";

export default function PaymentProcessLogsView() {
  const api = useMemo(() => new apiGateway.crm.crmOrdersApi(apiClientCaller), []);
  const [search, setSearch] = useState("");

  const logsQuery = useQuery({
    queryKey: ["crm-payment-process-logs", search],
    queryFn: async () => api.getPaymentProcessLogs(search || undefined),
  });

  const groups = logsQuery.data?.responseData.groups ?? [];

  const formatStep = (s: string) => s.replace(/_/g, " ");

  return (
    <div>
      <OrdersSectionTabs />
      <PageInfoBar
        title="Payment Process Logs"
        description="Track settlement automation execution grouped by payment id."
      />

      <Card className="mt-3">
        <CardHeader>
          <CardTitle>Search Logs</CardTitle>
          <CardDescription>
            Search by payment id, batch id, step, or message.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payment id, batch id, step..."
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-3 space-y-2">
        {logsQuery.isLoading ? (
          <Card>
            <CardContent className="py-4 text-sm text-muted-foreground">
              Loading payment process logs...
            </CardContent>
          </Card>
        ) : groups.length === 0 ? (
          <Card>
            <CardContent className="py-4 text-sm text-muted-foreground">
              No payment process logs found.
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => {
            const batches = group.logs.reduce<Record<string, typeof group.logs>>((acc, log) => {
              if (!acc[log.batchId]) acc[log.batchId] = [];
              acc[log.batchId]!.push(log);
              return acc;
            }, {});

            const paymentCompleted = group.latestStatus === "SUCCESS";

            return (
              <Collapsible key={group.paymentId} defaultOpen={false}>
                <Card className={paymentCompleted ? "border-green-200" : undefined}>
                  <CardHeader className="py-2 px-4">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="text-sm font-mono truncate">
                            {group.paymentId}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Latest: {group.latestCreatedAt ?? "—"}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {Object.keys(batches).length} runs
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {group.totalLogs} logs
                          </Badge>
                          <Badge
                            variant={
                              group.latestStatus === "SUCCESS"
                                ? "secondary"
                                : group.latestStatus === "FAILED"
                                  ? "destructive"
                                  : "outline"
                            }
                            className="text-xs"
                          >
                            {group.latestStatus === "SUCCESS" ? "COMPLETED" : group.latestStatus}
                          </Badge>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-2 pt-0 px-4 pb-3">
                      {Object.entries(batches).map(([batchId, logs]) => {
                        const hasFailed = logs.some((l) => l.status === "FAILED");
                        const hasInProgress = logs.some(
                          (l) => l.status === "IN_PROGRESS" || l.status === "STARTED"
                        );
                        const batchStatus = hasFailed
                          ? "FAILED"
                          : hasInProgress
                            ? "IN_PROGRESS"
                            : "SUCCESS";

                        return (
                          <Collapsible key={batchId} defaultOpen={false}>
                            <div className="rounded-lg border border-border">
                              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 px-3 py-2">
                                <div className="min-w-0">
                                  <div className="text-xs font-mono truncate">{batchId}</div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {logs.length} steps
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      batchStatus === "SUCCESS"
                                        ? "secondary"
                                        : batchStatus === "FAILED"
                                          ? "destructive"
                                          : "outline"
                                    }
                                    className="text-xs"
                                  >
                                    {batchStatus === "SUCCESS" ? "COMPLETED" : batchStatus}
                                  </Badge>
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="border-t border-border">
                                <div className="divide-y">
                                  {logs.map((log) => (
                                    <div key={log.id} className="px-3 py-2">
                                      <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                          <div className="text-sm font-medium">
                                            {formatStep(log.step)}
                                          </div>
                                          {log.message ? (
                                            <div className="text-xs text-muted-foreground line-clamp-1">
                                              {log.message}
                                            </div>
                                          ) : null}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant={
                                              log.status === "SUCCESS"
                                                ? "secondary"
                                                : log.status === "FAILED"
                                                  ? "destructive"
                                                  : "outline"
                                            }
                                            className="text-xs"
                                          >
                                            {log.status}
                                          </Badge>
                                          {log.status === "SUCCESS" ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                          ) : log.status === "FAILED" ? (
                                            <XCircle className="h-4 w-4 text-red-600" />
                                          ) : (
                                            <Clock className="h-4 w-4 text-yellow-600" />
                                          )}
                                        </div>
                                      </div>

                                      {(log.inputData || log.outputData || log.errorData) ? (
                                        <Collapsible className="mt-2">
                                          <CollapsibleTrigger className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
                                            <span>Payload</span>
                                            <ChevronDown className="h-3 w-3" />
                                          </CollapsibleTrigger>
                                          <CollapsibleContent className="mt-2 space-y-2">
                                            {log.inputData ? (
                                              <pre className="overflow-auto rounded-md bg-muted p-2 text-[11px]">
                                                {JSON.stringify(log.inputData, null, 2)}
                                              </pre>
                                            ) : null}
                                            {log.outputData ? (
                                              <pre className="overflow-auto rounded-md bg-muted p-2 text-[11px]">
                                                {JSON.stringify(log.outputData, null, 2)}
                                              </pre>
                                            ) : null}
                                            {log.errorData ? (
                                              <pre className="overflow-auto rounded-md bg-muted p-2 text-[11px]">
                                                {JSON.stringify(log.errorData, null, 2)}
                                              </pre>
                                            ) : null}
                                          </CollapsibleContent>
                                        </Collapsible>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                        );
                      })}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}
