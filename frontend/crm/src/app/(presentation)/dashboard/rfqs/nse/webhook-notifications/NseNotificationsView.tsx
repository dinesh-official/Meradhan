"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CardPagination from "@/global/elements/table/CardPagination";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { dateTimeUtils } from "@/global/utils/datetime.utils";
import { useQuery } from "@tanstack/react-query";
import { Copy, Eye, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  return dateTimeUtils.formatDateTime(iso, "DD/MM/YYYY HH:mm:ss");
}

function safeJsonStringify(v: unknown, space?: number) {
  try {
    return JSON.stringify(v, null, space);
  } catch {
    return String(v);
  }
}

function oneLinePreview(v: unknown, max = 140) {
  const raw = safeJsonStringify(v);
  const s = raw.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}

function extractEvent(payload: unknown): { label: string; variant: "secondary" | "outline" } | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (Array.isArray(p.unregList)) return { label: "UNREG", variant: "secondary" };
  if (Array.isArray(p.orderList)) return { label: "ORDER", variant: "secondary" };
  if (Array.isArray(p.settleOrderList)) return { label: "SETTLE", variant: "secondary" };
  if (Array.isArray(p.rfqList)) return { label: "RFQ", variant: "secondary" };
  return null;
}

function extractKeyRef(payload: unknown): { label: string; value: string } | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const first = (k: string) => (Array.isArray(p[k]) ? (p[k] as unknown[])[0] : undefined);
  const order = first("orderList") as Record<string, unknown> | undefined;
  if (order?.orderNumber) return { label: "Order#", value: String(order.orderNumber) };
  const settle = first("settleOrderList") as Record<string, unknown> | undefined;
  if (settle?.orderNumber) return { label: "Order#", value: String(settle.orderNumber) };
  const unreg = first("unregList") as Record<string, unknown> | undefined;
  if (unreg?.loginId) return { label: "LoginId", value: String(unreg.loginId) };
  const rfq = first("rfqList") as Record<string, unknown> | undefined;
  if (rfq?.number) return { label: "RFQ#", value: String(rfq.number) };
  return null;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-8"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 900);
        } catch {
          // ignore
        }
      }}
    >
      <Copy className="size-4" />
      {copied ? "Copied" : "Copy JSON"}
    </Button>
  );
}

function summarizeValue(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "string") return v.length > 160 ? v.slice(0, 159) + "…" : v;
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint") return String(v);
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (typeof v === "object") {
    const keys = Object.keys(v as Record<string, unknown>);
    return `Object(${keys.length})`;
  }
  return String(v);
}

function KeyValueView({ payload }: { payload: unknown }) {
  if (!payload || typeof payload !== "object") {
    return (
      <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
        {payload === null || payload === undefined ? "—" : String(payload)}
      </div>
    );
  }

  const entries = Object.entries(payload as Record<string, unknown>);
  if (entries.length === 0) {
    return (
      <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
        Empty object
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-muted/50 sticky top-0 z-10">
          <tr className="text-left">
            <th className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap w-[220px]">
              Key
            </th>
            <th className="px-3 py-2 font-medium text-muted-foreground">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([k, v]) => {
            const isComplex = typeof v === "object" && v !== null;
            const raw = safeJsonStringify(v, 2);
            return (
              <tr key={k} className="border-t align-top odd:bg-muted/20">
                <td className="px-3 py-2 font-mono text-xs whitespace-nowrap">
                  {k}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-muted-foreground leading-snug wrap-break-word">
                      {summarizeValue(v)}
                    </span>
                    {isComplex ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm" className="h-8 shrink-0">
                            <Eye className="size-4" />
                            Expand
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl">
                          <DialogHeader>
                            <DialogTitle className="font-mono text-sm">{k}</DialogTitle>
                          </DialogHeader>
                          <div className="flex items-center justify-end gap-2">
                            <CopyButton text={raw} />
                          </div>
                          <pre className="max-h-[70vh] overflow-auto rounded-md border bg-muted/40 p-3 text-left font-mono text-[11px] leading-relaxed">
                            {raw}
                          </pre>
                        </DialogContent>
                      </Dialog>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PayloadCell({ payload }: { payload: unknown }) {
  const pretty = payload === null || payload === undefined ? "—" : safeJsonStringify(payload, 2);
  const preview = payload === null || payload === undefined ? "—" : oneLinePreview(payload);
  const evt = extractEvent(payload);
  const ref = extractKeyRef(payload);

  return (
    <div className="flex min-w-[280px] max-w-[min(760px,85vw)] flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {evt ? <Badge variant={evt.variant}>{evt.label}</Badge> : null}
        {ref ? (
          <Badge variant="outline">
            <span className="text-muted-foreground">{ref.label}</span>
            <span className="ml-1 font-mono">{ref.value}</span>
          </Badge>
        ) : null}
      </div>

      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground leading-snug wrap-break-word">{preview}</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="h-8 shrink-0">
              <Eye className="size-4" />
              View
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Webhook payload</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="kv" className="gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <TabsList>
                  <TabsTrigger value="kv">Key / Value</TabsTrigger>
                  <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                </TabsList>
                <CopyButton text={pretty} />
              </div>

              <TabsContent value="kv" className="mt-3">
                <KeyValueView payload={payload} />
              </TabsContent>
              <TabsContent value="raw" className="mt-3">
                <pre className="max-h-[70vh] overflow-auto rounded-md border bg-muted/40 p-3 text-left font-mono text-[11px] leading-relaxed">
                  {pretty}
                </pre>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function NotificationTable({
  rows,
  isLoading,
  query,
}: {
  rows: NotificationRow[];
  isLoading: boolean;
  query: string;
}) {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-6">Loading…</p>;
  }
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-6">No rows yet.</p>;
  }

  const q = query.trim().toLowerCase();
  const filtered = !q
    ? rows
    : rows.filter((r) => {
      const hay = [
        String(r.id),
        String(r.type ?? ""),
        safeJsonStringify(r.payload),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

  if (filtered.length === 0) {
    return <p className="text-sm text-muted-foreground py-6">No matches.</p>;
  }

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="bg-muted/50 sticky top-0 z-10">
          <tr className="text-left">
            <th className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
              ID
            </th>
            <th className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
              Type
            </th>
            <th className="px-3 py-2 font-medium text-muted-foreground">Payload (preview)</th>
            <th className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
              Created
            </th>
            <th className="px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <tr key={r.id} className="border-t align-top odd:bg-muted/20">
              <td className="px-3 py-2 whitespace-nowrap tabular-nums">{r.id}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                {r.type ? <Badge variant="outline">{r.type}</Badge> : "—"}
              </td>
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
  const [q, setQ] = useState("");

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

  const totalRows = useMemo(() => {
    if (tab === "webhook") return webhookMeta?.total ?? 0;
    return cbricsMeta?.total ?? 0;
  }, [tab, webhookMeta?.total, cbricsMeta?.total]);

  return (
    <div className="space-y-4">
      <PageInfoBar
        showBack
        title="NSE webhook notifications"
        description="Inbound payloads stored in nse_webhook_notification and nse_cbrics_notification (read-only)."
      />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base">Notification log</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2 top-2.5 size-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search id, type, order number, loginId…"
                  className="h-9 w-[min(420px,85vw)] pl-8"
                />
              </div>
              {q ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setQ("")}
                >
                  <X className="size-4" />
                  Clear
                </Button>
              ) : null}
              <Badge variant="secondary">{totalRows.toLocaleString("en-IN")} total</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <TabsList>
              <TabsTrigger value="webhook">nse_webhook_notification</TabsTrigger>
              <TabsTrigger value="cbrics">nse_cbrics_notification</TabsTrigger>
            </TabsList>
            <TabsContent value="webhook" className="mt-4">
              <NotificationTable rows={webhookRows} isLoading={webhookQuery.isLoading} query={q} />
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
              <NotificationTable rows={cbricsRows} isLoading={cbricsQuery.isLoading} query={q} />
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
