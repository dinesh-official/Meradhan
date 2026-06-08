"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { canAccessNotifications } from "@/global/utils/role.utils";
import apiGateway from "@root/apiGateway";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/* ─── types ─────────────────────────────────────────────────── */

type Medium = "SMS" | "WHATSAPP" | "RCS";
type BatchStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "PARTIAL_FAILURE" | "FAILED";
type RecipientStatus = "PENDING" | "SENT" | "FAILED" | "INVALID_NUMBER";

type BatchLog = {
  id: number;
  medium: Medium;
  dltTemplateId: string;
  messagePreview: string | null;
  deliveryStatus: BatchStatus;
  sentAt: string;
  meta: { total?: number; sent?: number; failed?: number; invalid?: number } | null;
  sentBy: { id: number; name: string; email: string };
  savedList: { id: number; name: string } | null;
};

type Recipient = {
  id: number;
  phone: string;
  deliveryStatus: RecipientStatus;
  providerMessageId: string | null;
  errorMessage: string | null;
  customerProfile: {
    id: number;
    firstName: string;
    lastName: string;
    userName: string;
    emailAddress: string;
  } | null;
};

type ApiResponse<T> = { responseData?: T };
type PaginatedResponse<T> = ApiResponse<{ items: T[]; meta: PaginationMeta }>;
type PaginationMeta = { page: number; pageSize: number; total: number; totalPages: number };

/* ─── helpers ────────────────────────────────────────────────── */

const MEDIUM_LABELS: Record<Medium, { label: string; cls: string }> = {
  SMS:      { label: "SMS",       cls: "bg-blue-100 text-blue-800 border-blue-300" },
  WHATSAPP: { label: "WhatsApp",  cls: "bg-green-100 text-green-800 border-green-300" },
  RCS:      { label: "RCS",       cls: "bg-purple-100 text-purple-800 border-purple-300" },
};

const BATCH_STATUS_CONFIG: Record<BatchStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  PENDING:         { label: "Pending",        icon: <Clock className="w-3 h-3" />,        cls: "bg-gray-100 text-gray-700" },
  PROCESSING:      { label: "Processing",     icon: <Loader2 className="w-3 h-3 animate-spin" />, cls: "bg-blue-100 text-blue-700" },
  COMPLETED:       { label: "Completed",      icon: <CheckCircle2 className="w-3 h-3" />, cls: "bg-green-100 text-green-700" },
  PARTIAL_FAILURE: { label: "Partial",        icon: <AlertCircle className="w-3 h-3" />,  cls: "bg-amber-100 text-amber-700" },
  FAILED:          { label: "Failed",         icon: <XCircle className="w-3 h-3" />,      cls: "bg-red-100 text-red-700" },
};

const RECIPIENT_STATUS_CONFIG: Record<RecipientStatus, { label: string; cls: string }> = {
  PENDING:        { label: "Pending",        cls: "bg-gray-100 text-gray-700" },
  SENT:           { label: "Sent",           cls: "bg-green-100 text-green-700" },
  FAILED:         { label: "Failed",         cls: "bg-red-100 text-red-700" },
  INVALID_NUMBER: { label: "Invalid No.",    cls: "bg-amber-100 text-amber-700" },
};

/* ─── sub-components ─────────────────────────────────────────── */

function BatchStatusBadge({ status }: { status: BatchStatus }) {
  const cfg = BATCH_STATUS_CONFIG[status] ?? BATCH_STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function MediumBadge({ medium }: { medium: Medium }) {
  const cfg = MEDIUM_LABELS[medium] ?? MEDIUM_LABELS.SMS;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.cls}`}>
      <MessageSquare className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function RecipientRow({ r }: { r: Recipient }) {
  const cfg = RECIPIENT_STATUS_CONFIG[r.deliveryStatus] ?? RECIPIENT_STATUS_CONFIG.PENDING;
  return (
    <tr className="odd:bg-white even:bg-muted/20 text-xs">
      <td className="px-3 py-2 font-medium">
        {r.customerProfile
          ? `${r.customerProfile.firstName} ${r.customerProfile.lastName}`
          : "—"}
      </td>
      <td className="px-3 py-2 font-mono text-muted-foreground">
        {r.customerProfile ? `@${r.customerProfile.userName}` : "—"}
      </td>
      <td className="px-3 py-2 font-mono">{r.phone || "—"}</td>
      <td className="px-3 py-2">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
          {cfg.label}
        </span>
      </td>
      <td className="px-3 py-2 text-muted-foreground truncate max-w-xs">
        {r.errorMessage ?? (r.providerMessageId ? `Ref: ${r.providerMessageId}` : "—")}
      </td>
    </tr>
  );
}

function ExpandedRecipients({ logId }: { logId: number }) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = new apiGateway.crm.notifications.CrmNotificationsApi(apiClientCaller);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getLogRecipients(logId);
        const data = res.data as ApiResponse<Recipient[]>;
        if (!cancelled) setRecipients(data.responseData ?? []);
      } catch {
        if (!cancelled) setError("Could not load recipients.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [logId]);

  if (loading) {
    return (
      <div className="py-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading recipients…
      </div>
    );
  }
  if (error) {
    return <div className="py-4 text-center text-xs text-destructive">{error}</div>;
  }
  if (recipients.length === 0) {
    return <div className="py-4 text-center text-xs text-muted-foreground">No recipients found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-muted/60">
            <th className="text-left px-3 py-2 font-medium">Name</th>
            <th className="text-left px-3 py-2 font-medium">Username</th>
            <th className="text-left px-3 py-2 font-medium">Phone</th>
            <th className="text-left px-3 py-2 font-medium">Status</th>
            <th className="text-left px-3 py-2 font-medium">Details</th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((r) => <RecipientRow key={r.id} r={r} />)}
        </tbody>
      </table>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────── */

const PAGE_SIZE = 20;

export default function NotificationLogsView() {
  const { cookies } = useAppCookie();
  const [mounted, setMounted] = useState(false);

  const [logs, setLogs] = useState<BatchLog[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // filters — "ALL" is the sentinel for "no filter" (Radix forbids empty-string SelectItem values)
  const [medium, setMedium] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const api = new apiGateway.crm.notifications.CrmNotificationsApi(apiClientCaller);

  useEffect(() => { setMounted(true); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listLogs({
        page,
        pageSize: PAGE_SIZE,
        ...(medium !== "ALL" ? { medium: medium as Medium } : {}),
        ...(status !== "ALL" ? { deliveryStatus: status as BatchStatus } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      });
      const data = res.data as PaginatedResponse<BatchLog>;
      setLogs(data.responseData?.items ?? []);
      if (data.responseData?.meta) setMeta(data.responseData.meta);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, medium, status, from, to]);

  useEffect(() => { if (mounted) load(); }, [mounted, load]);

  const applyFilters = () => { setPage(1); setExpandedId(null); };
  const clearFilters = () => { setMedium("ALL"); setStatus("ALL"); setFrom(""); setTo(""); setPage(1); setExpandedId(null); };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!mounted) return null;
  if (!canAccessNotifications(cookies.role)) {
    return (
      <div className="p-8 text-center text-destructive">
        You do not have access to notifications.
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-4 space-y-4">
        <PageInfoBar
          title="Notification Logs"
          description="Consolidated history of all notification batches sent."
        />

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 bg-muted/30 border rounded-xl p-4">
          <div className="space-y-1">
            <Label className="text-xs">Medium</Label>
            <Select value={medium} onValueChange={setMedium}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                <SelectItem value="RCS">RCS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PARTIAL_FAILURE">Partial</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">From date</Label>
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-8 text-xs w-36"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">To date</Label>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-8 text-xs w-36"
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="h-8" onClick={applyFilters}>Apply</Button>
            <Button size="sm" variant="outline" className="h-8" onClick={clearFilters}>Clear</Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="border rounded-xl py-20 text-center">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No notification logs found.</p>
          </div>
        ) : (
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="w-8 p-3" />
                  <th className="text-left p-3 font-medium">List name</th>
                  <th className="text-left p-3 font-medium">Medium</th>
                  <th className="text-left p-3 font-medium">Final message</th>
                  <th className="text-left p-3 font-medium">Sent by</th>
                  <th className="text-left p-3 font-medium">Sent at</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Recipients</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const sent = log.meta?.sent ?? 0;
                  const total = log.meta?.total ?? 0;

                  return (
                    <>
                      <tr
                        key={log.id}
                        className={`border-t cursor-pointer transition-colors ${
                          isExpanded ? "bg-muted/40" : "odd:bg-background even:bg-muted/10 hover:bg-muted/30"
                        }`}
                        onClick={() => toggleExpand(log.id)}
                      >
                        {/* Expand chevron */}
                        <td className="p-3 text-muted-foreground">
                          {isExpanded
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />}
                        </td>

                        {/* List name */}
                        <td className="p-3 font-medium max-w-[160px] truncate">
                          {log.savedList?.name ?? <span className="text-muted-foreground italic">—</span>}
                        </td>

                        {/* Medium */}
                        <td className="p-3">
                          <MediumBadge medium={log.medium} />
                        </td>

                        {/* Final message */}
                        <td className="p-3 max-w-[220px]">
                          {log.messagePreview ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate block text-muted-foreground text-xs cursor-help">
                                  {log.messagePreview.length > 60
                                    ? `${log.messagePreview.slice(0, 60)}…`
                                    : log.messagePreview}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="bottom"
                                className="max-w-sm text-xs whitespace-pre-wrap"
                              >
                                {log.messagePreview}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">—</span>
                          )}
                        </td>

                        {/* Sent by */}
                        <td className="p-3 text-sm">{log.sentBy?.name ?? "—"}</td>

                        {/* Sent at */}
                        <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(log.sentAt), "dd MMM yyyy, hh:mm a")}
                        </td>

                        {/* Status */}
                        <td className="p-3">
                          <BatchStatusBadge status={log.deliveryStatus} />
                        </td>

                        {/* Recipients */}
                        <td className="p-3 text-sm font-mono">
                          <span className={sent === total && total > 0 ? "text-green-700 font-semibold" : "text-amber-700"}>
                            {sent}
                          </span>
                          <span className="text-muted-foreground">/{total}</span>
                        </td>
                      </tr>

                      {/* Expanded recipient breakdown */}
                      {isExpanded && (
                        <tr key={`${log.id}-expanded`} className="border-t bg-muted/20">
                          <td colSpan={8} className="p-0">
                            <div className="px-6 py-3 border-l-4 border-primary/30">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                Recipient breakdown — {total} total
                              </p>
                              <ExpandedRecipients logId={log.id} />
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground text-xs">
              Showing {(meta.page - 1) * meta.pageSize + 1}–{Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-3 py-1.5 text-xs border rounded-md bg-muted">
                {meta.page} / {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
