"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import { MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";

type LogRow = {
  id: number;
  phone: string;
  deliveryStatus: string;
  notificationLog: {
    medium: string;
    dltTemplateId: string;
    templateVariables: unknown;
    messagePreview: string | null;
    deliveryStatus: string;
    sentAt: string;
  };
};

export default function CustomerNotificationLogsDialog({
  customerProfileId,
  open,
  onOpenChange,
}: {
  customerProfileId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = new apiGateway.crm.notifications.CrmNotificationsApi(apiClientCaller);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await api.customerNotificationLogs(customerProfileId);
        const data = res.data as { responseData?: LogRow[] };
        if (!cancelled) {
          setRows(data.responseData ?? []);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load notification logs.");
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, customerProfileId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[95vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Notification logs</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : error ? (
            <p className="py-8 text-center text-sm text-destructive">{error}</p>
          ) : rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No notification sends recorded for this customer yet.
            </p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-muted z-10">
                <tr>
                  <th className="border-b p-3 text-left font-medium whitespace-nowrap">Sent at</th>
                  <th className="border-b p-3 text-left font-medium">Medium</th>
                  <th className="border-b p-3 text-left font-medium">Template ID</th>
                  <th className="border-b p-3 text-left font-medium">Campaign status</th>
                  <th className="border-b p-3 text-left font-medium">Your status</th>
                  <th className="border-b p-3 text-left font-medium">Phone</th>
                  <th className="border-b p-3 text-center font-medium w-12">Msg</th>
                </tr>
              </thead>
              <tbody>
                <TooltipProvider delayDuration={100}>
                  {rows.map((r) => {
                    const msgText = r.notificationLog.messagePreview
                      ?? (r.notificationLog.templateVariables
                        ? `Variables: ${JSON.stringify(r.notificationLog.templateVariables)}`
                        : null);

                    return (
                      <tr key={r.id} className="odd:bg-background even:bg-muted/30 hover:bg-muted/60 transition-colors">
                        <td className="p-3 align-top whitespace-nowrap">
                          {formatDate(r.notificationLog.sentAt)}
                        </td>
                        <td className="p-3 align-top">{r.notificationLog.medium}</td>
                        <td className="p-3 align-top font-mono text-xs">
                          {r.notificationLog.dltTemplateId}
                        </td>
                        <td className="p-3 align-top">
                          {r.notificationLog.deliveryStatus}
                        </td>
                        <td className="p-3 align-top">{r.deliveryStatus}</td>
                        <td className="p-3 align-top font-mono text-xs">{r.phone}</td>
                        <td className="p-3 align-top text-center">
                          {msgText ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-flex items-center justify-center cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                  <MessageSquareText className="w-4 h-4" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent
                                side="left"
                                className="max-w-xs text-xs leading-relaxed whitespace-pre-wrap break-words"
                              >
                                {msgText}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground/40 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </TooltipProvider>
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
