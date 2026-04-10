"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type NotificationRow = {
  id: number;
  payload: unknown;
  type: string | null;
  createdAt: string;
  updatedAt: string;
};

type ListResponse = {
  data: NotificationRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
};

async function fetchWebhookPage(page: number, limit: number) {
  const res = await apiClientCaller.get<{ responseData: ListResponse }>(
    "/crm/rfq/nse/notifications/webhook",
    { params: { page, limit } },
  );
  return res.data.responseData;
}

async function fetchCbricsPage(page: number, limit: number) {
  const res = await apiClientCaller.get<{ responseData: ListResponse }>(
    "/crm/rfq/nse/notifications/cbrics",
    { params: { page, limit } },
  );
  return res.data.responseData;
}

function formatDt(iso: string | undefined) {
  if (!iso) return "—";
  return dateTimeUtils.formatDateTime(iso, "DD MMM YYYY HH:mm:ss");
}

function PayloadCell({ payload }: { payload: unknown }) {
  const text =
    payload === null || payload === undefined
      ? "—"
      : JSON.stringify(payload, null, 2);
  return (
    <pre className="max-h-52 min-w-[200px] max-w-[min(720px,85vw)] overflow-auto rounded-md border bg-muted/40 p-2 text-left font-mono text-[11px] leading-relaxed">
      {text}
    </pre>
  );
}

function NotificationTable({
  rows,
  isLoading,
}: {
  rows: NotificationRow[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-6">Loading…</p>;
  }
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-6">No rows yet.</p>;
  }
  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-muted/50">
          <tr className="text-left">
            <th className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
              ID
            </th>
            <th className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
              Type
            </th>
            <th className="px-3 py-2 font-medium text-muted-foreground">Payload</th>
            <th className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
              Created
            </th>
            <th className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t align-top odd:bg-muted/20">
              <td className="px-3 py-2 whitespace-nowrap tabular-nums">{r.id}</td>
              <td className="px-3 py-2 whitespace-nowrap">{r.type ?? "—"}</td>
              <td className="px-3 py-2">
                <PayloadCell payload={r.payload} />
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                {formatDt(r.createdAt)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                {formatDt(r.updatedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function NseNotificationsView() {
  const [tab, setTab] = useState("webhook");
  const [page, setPage] = useState(1);
  const limit = 25;

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const webhookQuery = useQuery({
    queryKey: ["nse-notifications-webhook", page, limit],
    queryFn: () => fetchWebhookPage(page, limit),
    enabled: tab === "webhook",
  });

  const cbricsQuery = useQuery({
    queryKey: ["nse-notifications-cbrics", page, limit],
    queryFn: () => fetchCbricsPage(page, limit),
    enabled: tab === "cbrics",
  });

  const webhookRows = webhookQuery.data?.data ?? [];
  const webhookMeta = webhookQuery.data?.meta;
  const cbricsRows = cbricsQuery.data?.data ?? [];
  const cbricsMeta = cbricsQuery.data?.meta;

  return (
    <div className="space-y-4">
      <PageInfoBar
        showBack
        title="NSE webhook notifications"
        description="Inbound payloads stored in nse_webhook_notification and nse_cbrics_notification (read-only)."
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Notification log</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <TabsList>
              <TabsTrigger value="webhook">nse_webhook_notification</TabsTrigger>
              <TabsTrigger value="cbrics">nse_cbrics_notification</TabsTrigger>
            </TabsList>
            <TabsContent value="webhook" className="mt-4">
              <NotificationTable rows={webhookRows} isLoading={webhookQuery.isLoading} />
              {webhookMeta && webhookMeta.totalPages > 1 && (
                <div className="mt-4 flex justify-end">
                  <CardPagination
                    page={webhookMeta.page}
                    totalPages={webhookMeta.totalPages}
                    onClick={(p) => setPage(p)}
                  />
                </div>
              )}
              {webhookMeta && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {webhookMeta.total.toLocaleString("en-IN")} row
                  {webhookMeta.total === 1 ? "" : "s"} total
                </p>
              )}
            </TabsContent>
            <TabsContent value="cbrics" className="mt-4">
              <NotificationTable rows={cbricsRows} isLoading={cbricsQuery.isLoading} />
              {cbricsMeta && cbricsMeta.totalPages > 1 && (
                <div className="mt-4 flex justify-end">
                  <CardPagination
                    page={cbricsMeta.page}
                    totalPages={cbricsMeta.totalPages}
                    onClick={(p) => setPage(p)}
                  />
                </div>
              )}
              {cbricsMeta && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {cbricsMeta.total.toLocaleString("en-IN")} row
                  {cbricsMeta.total === 1 ? "" : "s"} total
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
