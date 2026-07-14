"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import CardPagination from "@/global/elements/table/CardPagination";
import { hasOneOfPermission } from "@/global/utils/role.utils";
import useAppCookie from "@/hooks/useAppCookie.hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { AlertTriangle, Calendar, FileSpreadsheet, FileText, Minus, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type DayRow = {
  dayKey: string;
  batchCount: number;
  lastUploadedAt: string | null;
};

type BatchRow = {
  id: number;
  dayKey: string;
  uploadedAt: string;
  sourceFileName: string | null;
  lineCount: number;
  uploadedByEmail: string | null;
};

type LineRow = { id: number; isin: string; quantity: number };

type ReconciledLine = {
  isin: string;
  companyName?: string;
  pdfBalance: number;
  inFlight: number;
  correctedQty: number;
};

type DematPreview = {
  lines: ReconciledLine[];
  anomalies: { isin: string; pdfBalance: number; inFlight: number }[];
  disappearedIsins: string[];
  parseWarnings: string[];
  summary: {
    pdfRowCount: number;
    adjustedCount: number;
    anomalyCount: number;
    disappearedCount: number;
  };
};

function errMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const m = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (m) return m;
  }
  return err instanceof Error ? err.message : fallback;
}

function formatYmdLong(ymd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const qtyFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

export default function InventoryStockView() {
  const queryClient = useQueryClient();
  const { cookies } = useAppCookie();
  const canEditStock = hasOneOfPermission(cookies.role, ["edit:orders"]);
  const canDeleteBatch = hasOneOfPermission(cookies.role, ["edit:orders", "delete:orders"]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [lineSearchInput, setLineSearchInput] = useState("");
  const [lineSearch, setLineSearch] = useState("");
  const [linePage, setLinePage] = useState(1);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editLine, setEditLine] = useState<LineRow | null>(null);
  const [editQtyInput, setEditQtyInput] = useState("");
  const [batchToDelete, setBatchToDelete] = useState<BatchRow | null>(null);
  const lineLimit = 50;

  useEffect(() => {
    const t = setTimeout(() => {
      setLineSearch(lineSearchInput.trim());
      setLinePage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [lineSearchInput]);

  const daysQuery = useQuery({
    queryKey: ["crm-inventory-stock-days"],
    queryFn: async () => {
      const res = await apiClientCaller.get<{ responseData: { days: DayRow[] } }>(
        "/crm/orders/inventory-stock/days"
      );
      return res.data.responseData.days;
    },
  });

  useEffect(() => {
    if (!selectedDay && daysQuery.data?.length) {
      setSelectedDay(daysQuery.data[0]!.dayKey);
    }
  }, [daysQuery.data, selectedDay]);

  const batchesQuery = useQuery({
    queryKey: ["crm-inventory-stock-batches", selectedDay],
    queryFn: async () => {
      if (!selectedDay) return [];
      const res = await apiClientCaller.get<{ responseData: { batches: BatchRow[] } }>(
        "/crm/orders/inventory-stock/batches",
        { params: { dayKey: selectedDay } }
      );
      return res.data.responseData.batches;
    },
    enabled: Boolean(selectedDay),
  });

  useEffect(() => {
    const batches = batchesQuery.data;
    if (!batches?.length) {
      setSelectedBatchId(null);
      return;
    }
    setSelectedBatchId((prev) => {
      if (prev != null && batches.some((b) => b.id === prev)) return prev;
      return batches[0]!.id;
    });
  }, [batchesQuery.data]);

  const linesQuery = useQuery({
    queryKey: ["crm-inventory-stock-lines", selectedBatchId, linePage, lineSearch, lineLimit],
    queryFn: async () => {
      if (selectedBatchId == null) {
        return { data: [] as LineRow[], meta: { page: 1, limit: lineLimit, total: 0, totalPages: 1 } };
      }
      const res = await apiClientCaller.get<{
        responseData: {
          data: LineRow[];
          meta: { page: number; limit: number; total: number; totalPages: number };
        };
      }>(`/crm/orders/inventory-stock/batch/${selectedBatchId}/lines`, {
        params: { page: linePage, limit: lineLimit, search: lineSearch || undefined },
      });
      return res.data.responseData;
    },
    enabled: selectedBatchId != null,
  });

  const adjustQtyMutation = useMutation({
    mutationFn: async (vars: { lineId: number; quantity?: number; delta?: number }) => {
      const res = await apiClientCaller.patch<{
        responseData: { line: LineRow };
      }>(`/crm/orders/inventory-stock/line/${vars.lineId}`, {
        quantity: vars.quantity,
        delta: vars.delta,
      });
      return res.data.responseData.line;
    },
    onSuccess: () => {
      toast.success("Quantity updated");
      void queryClient.invalidateQueries({ queryKey: ["crm-inventory-stock-lines"] });
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : "Update failed";
      toast.error(msg || "Update failed");
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: async (batchId: number) => {
      await apiClientCaller.delete(`/crm/orders/inventory-stock/batch/${batchId}`);
    },
    onSuccess: (_void, deletedId) => {
      toast.success(`Batch #${deletedId} deleted`);
      setBatchToDelete(null);
      if (selectedBatchId === deletedId) {
        setSelectedBatchId(null);
        setLinePage(1);
      }
      void queryClient.invalidateQueries({ queryKey: ["crm-inventory-stock-days"] });
      void queryClient.invalidateQueries({ queryKey: ["crm-inventory-stock-batches"] });
      void queryClient.invalidateQueries({ queryKey: ["crm-inventory-stock-lines"] });
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : "Delete failed";
      toast.error(msg || "Delete failed");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (f: File) => {
      const fd = new FormData();
      fd.append("file", f);
      return apiClientCaller.post<{
        responseData: {
          batchId: number;
          dayKey: string;
          lineCount: number;
          parseWarnings?: string[];
        };
      }>("/crm/orders/inventory-stock/upload", fd);
    },
    onSuccess: (res) => {
      const d = res.data.responseData;
      const warns = d.parseWarnings?.length;
      toast.success(`Saved batch #${d.batchId} — ${d.lineCount} line(s).`);
      if (warns) {
        toast.warning(`${warns} parse warning(s)`, {
          description: d.parseWarnings!.slice(0, 5).join("\n"),
        });
      }
      setFile(null);
      setUploadOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["crm-inventory-stock-days"] });
      void queryClient.invalidateQueries({ queryKey: ["crm-inventory-stock-batches"] });
      void queryClient.invalidateQueries({ queryKey: ["crm-inventory-stock-lines"] });
      setSelectedDay(d.dayKey);
      setSelectedBatchId(d.batchId);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : "Upload failed";
      toast.error(msg || "Upload failed");
    },
  });

  // --- Demat statement PDF → inventory reconciliation (preview then commit) ---
  const [dematOpen, setDematOpen] = useState(false);
  const [dematFile, setDematFile] = useState<File | null>(null);
  const [dematPreview, setDematPreview] = useState<DematPreview | null>(null);
  const dematFileRef = useRef<HTMLInputElement>(null);

  const previewDematMutation = useMutation({
    mutationFn: async (f: File) => {
      const fd = new FormData();
      fd.append("file", f);
      const res = await apiClientCaller.post<{ responseData: DematPreview }>(
        "/crm/orders/inventory-stock/demat-pdf/preview",
        fd
      );
      return res.data.responseData;
    },
    onSuccess: (data) => setDematPreview(data),
    onError: (err: unknown) => toast.error(errMessage(err, "Could not read PDF")),
  });

  const commitDematMutation = useMutation({
    mutationFn: async (f: File) => {
      const fd = new FormData();
      fd.append("file", f);
      const res = await apiClientCaller.post<{
        responseData: {
          batchId: number;
          dayKey: string;
          lineCount: number;
          anomalies?: { isin: string }[];
          parseWarnings?: string[];
        };
      }>("/crm/orders/inventory-stock/demat-pdf/commit", fd);
      return res.data.responseData;
    },
    onSuccess: (d) => {
      toast.success(`Inventory updated — batch #${d.batchId}, ${d.lineCount} line(s).`);
      if (d.anomalies?.length) {
        toast.warning(`${d.anomalies.length} ISIN(s) had in-flight exceeding the PDF balance (set to 0).`);
      }
      setDematFile(null);
      setDematPreview(null);
      setDematOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["crm-inventory-stock-days"] });
      void queryClient.invalidateQueries({ queryKey: ["crm-inventory-stock-batches"] });
      void queryClient.invalidateQueries({ queryKey: ["crm-inventory-stock-lines"] });
      setSelectedDay(d.dayKey);
      setSelectedBatchId(d.batchId);
    },
    onError: (err: unknown) => toast.error(errMessage(err, "Update failed")),
  });

  const onPickDematFile = useCallback(
    (f: File | null) => {
      if (!f) return;
      if (!f.name.toLowerCase().endsWith(".pdf")) {
        toast.error("Please choose a .pdf Demat statement");
        return;
      }
      setDematFile(f);
      setDematPreview(null);
      previewDematMutation.mutate(f);
    },
    [previewDematMutation]
  );

  const onPickFile = useCallback((f: File | null) => {
    if (!f) return;
    const n = f.name.toLowerCase();
    if (!n.endsWith(".csv") && !n.endsWith(".xlsx") && !n.endsWith(".xls")) {
      toast.error("Please choose a .csv, .xls, or .xlsx file");
      return;
    }
    setFile(f);
  }, []);

  const days = daysQuery.data ?? [];
  const batches = batchesQuery.data ?? [];
  const linesPayload = linesQuery.data;
  const selectedBatch = useMemo(
    () => batches.find((b) => b.id === selectedBatchId) ?? null,
    [batches, selectedBatchId]
  );

  return (
    <div>
      <PageInfoBar
        title="ISIN inventory (available stock)"
        description='Upload a spreadsheet daily with columns "ISIN" and "Quantity". Each upload is stored as a batch, grouped by calendar day (IST). Users with edit access can adjust line quantities or delete an entire batch (all lines) permanently.'
      />

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload CSV / Excel
        </Button>
        {canEditStock ? (
          <Button type="button" variant="secondary" onClick={() => setDematOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Upload Demat PDF
          </Button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[240px_1fr]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Days
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 max-h-[480px] overflow-y-auto space-y-1">
            {daysQuery.isLoading && (
              <p className="text-sm text-muted-foreground">Loading…</p>
            )}
            {!daysQuery.isLoading && days.length === 0 && (
              <p className="text-sm text-muted-foreground">No uploads yet.</p>
            )}
            {days.map((d) => (
              <button
                key={d.dayKey}
                type="button"
                onClick={() => {
                  setSelectedDay(d.dayKey);
                  setLinePage(1);
                }}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2 text-sm transition-colors",
                  selectedDay === d.dayKey
                    ? "bg-primary/10 text-foreground font-medium"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <div>{formatYmdLong(d.dayKey)}</div>
                <div className="text-xs opacity-80">
                  {d.batchCount} batch{d.batchCount === 1 ? "" : "es"}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Batches {selectedDay ? `· ${formatYmdLong(selectedDay)}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {batchesQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading batches…</p>
              )}
              {!batchesQuery.isLoading && selectedDay && batches.length === 0 && (
                <p className="text-sm text-muted-foreground">No batches for this day.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {batches.map((b) => (
                  <div key={b.id} className="relative inline-flex">
                    <Button
                      type="button"
                      variant={selectedBatchId === b.id ? "default" : "outline"}
                      size="sm"
                      className="h-auto py-2 pr-9 flex flex-col items-start gap-0.5"
                      onClick={() => {
                        setSelectedBatchId(b.id);
                        setLinePage(1);
                      }}
                    >
                      <span className="font-mono text-xs">#{b.id}</span>
                      <span className="text-xs font-normal opacity-90">
                        {formatDateTime(b.uploadedAt)}
                      </span>
                      <span className="text-xs font-normal text-left">
                        {b.lineCount} lines
                        {b.sourceFileName ? ` · ${b.sourceFileName}` : ""}
                      </span>
                    </Button>
                    {canDeleteBatch ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="Delete batch"
                        disabled={deleteBatchMutation.isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          setBatchToDelete(b);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">
                Lines
                {selectedBatch ? (
                  <span className="text-muted-foreground font-normal text-sm ml-2">
                    batch #{selectedBatch.id}
                  </span>
                ) : null}
              </CardTitle>
              <Input
                placeholder="Filter ISIN…"
                className="max-w-xs"
                value={lineSearchInput}
                onChange={(e) => setLineSearchInput(e.target.value)}
                disabled={selectedBatchId == null}
              />
            </CardHeader>
            <CardContent>
              {!selectedBatchId && (
                <p className="text-sm text-muted-foreground">Select a batch to view lines.</p>
              )}
              {selectedBatchId != null && linesQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading lines…</p>
              )}
              {selectedBatchId != null && !linesQuery.isLoading && (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ISIN</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        {canEditStock ? (
                          <TableHead className="w-[200px] text-right">Adjust</TableHead>
                        ) : null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(linesPayload?.data ?? []).map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-mono text-sm">{row.isin}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {qtyFmt.format(row.quantity)}
                          </TableCell>
                          {canEditStock ? (
                            <TableCell className="text-right">
                              <div className="inline-flex items-center justify-end gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  disabled={adjustQtyMutation.isPending || row.quantity <= 0}
                                  aria-label="Decrease quantity by 1"
                                  onClick={() =>
                                    adjustQtyMutation.mutate({ lineId: row.id, delta: -1 })
                                  }
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  disabled={adjustQtyMutation.isPending}
                                  aria-label="Increase quantity by 1"
                                  onClick={() =>
                                    adjustQtyMutation.mutate({ lineId: row.id, delta: 1 })
                                  }
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  disabled={adjustQtyMutation.isPending}
                                  aria-label="Set quantity"
                                  onClick={() => {
                                    setEditLine(row);
                                    setEditQtyInput(String(row.quantity));
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {(linesPayload?.data.length ?? 0) === 0 && (
                    <p className="text-sm text-muted-foreground mt-2">No lines match this filter.</p>
                  )}
                  {(linesPayload?.meta.totalPages ?? 1) > 1 && (
                    <div className="mt-4">
                      <CardPagination
                        page={linePage}
                        totalPages={linesPayload?.meta.totalPages ?? 1}
                        onClick={setLinePage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={editLine != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditLine(null);
            setEditQtyInput("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set quantity</DialogTitle>
            <DialogDescription>
              {editLine ? (
                <>
                  <span className="font-mono">{editLine.isin}</span> — enter the new quantity for
                  this batch line (cannot be negative).
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {editLine ? (
            <Input
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              value={editQtyInput}
              onChange={(e) => setEditQtyInput(e.target.value)}
              className="font-mono"
            />
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditLine(null);
                setEditQtyInput("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!editLine || adjustQtyMutation.isPending}
              onClick={() => {
                if (!editLine) return;
                const n = Number(editQtyInput);
                if (!Number.isFinite(n) || n < 0) {
                  toast.error("Enter a valid non-negative number");
                  return;
                }
                adjustQtyMutation.mutate(
                  { lineId: editLine.id, quantity: n },
                  {
                    onSuccess: () => {
                      setEditLine(null);
                      setEditQtyInput("");
                    },
                  }
                );
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload inventory file</DialogTitle>
            <DialogDescription>
              First row must include <span className="font-mono">ISIN</span> and{" "}
              <span className="font-mono">Quantity</span> (or Qty). Same ISIN twice in one file —
              last row wins.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
              Choose file
            </Button>
            {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!file || uploadMutation.isPending}
              onClick={() => file && uploadMutation.mutate(file)}
            >
              {uploadMutation.isPending ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dematOpen}
        onOpenChange={(open) => {
          setDematOpen(open);
          if (!open) {
            setDematFile(null);
            setDematPreview(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Update inventory from Demat statement</DialogTitle>
            <DialogDescription>
              Available quantity = PDF balance − customer orders paid but not yet settled. Review the
              adjustments below, then confirm to write a new batch.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                ref={dematFileRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => onPickDematFile(e.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => dematFileRef.current?.click()}
                disabled={previewDematMutation.isPending || commitDematMutation.isPending}
              >
                {dematFile ? "Choose a different PDF" : "Choose PDF"}
              </Button>
              {dematFile && (
                <p className="text-sm text-muted-foreground truncate max-w-[260px]" title={dematFile.name}>
                  {dematFile.name}
                </p>
              )}
            </div>

            {previewDematMutation.isPending && (
              <p className="text-sm text-muted-foreground">Reading PDF and computing adjustments…</p>
            )}

            {dematPreview && (
              <>
                <div className="text-sm text-muted-foreground">
                  {dematPreview.summary.pdfRowCount} holding(s) parsed ·{" "}
                  {dematPreview.summary.adjustedCount} adjusted for in-flight orders
                </div>

                {dematPreview.anomalies.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-sm text-destructive">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      {dematPreview.anomalies.length} ISIN(s) have in-flight orders exceeding the PDF
                      balance — these will be set to 0:{" "}
                      <span className="font-mono break-all">
                        {dematPreview.anomalies.map((a) => a.isin).join(", ")}
                      </span>
                    </span>
                  </div>
                )}

                {dematPreview.disappearedIsins.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-400/40 bg-amber-50 p-2 text-sm text-amber-700">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      {dematPreview.disappearedIsins.length} ISIN(s) in the latest batch are absent
                      from this PDF and will no longer be available:{" "}
                      <span className="font-mono break-all">
                        {dematPreview.disappearedIsins.join(", ")}
                      </span>
                    </span>
                  </div>
                )}

                {dematPreview.parseWarnings.length > 0 && (
                  <div className="rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground max-h-24 overflow-y-auto">
                    {dematPreview.parseWarnings.map((w, i) => (
                      <div key={i}>{w}</div>
                    ))}
                  </div>
                )}

                <div className="overflow-x-auto rounded-md border">
                  <Table className="w-full table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[44%]">ISIN</TableHead>
                        <TableHead className="text-right">PDF bal.</TableHead>
                        <TableHead className="text-right">In-flight</TableHead>
                        <TableHead className="text-right">Corrected</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dematPreview.lines.map((l) => (
                        <TableRow key={l.isin}>
                          <TableCell className="align-top">
                            <span className="font-mono text-sm">{l.isin}</span>
                            {l.companyName ? (
                              <span
                                className="block truncate text-xs text-muted-foreground"
                                title={l.companyName}
                              >
                                {l.companyName}
                              </span>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {qtyFmt.format(l.pdfBalance)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right tabular-nums",
                              l.inFlight > 0 ? "text-amber-600" : "text-muted-foreground"
                            )}
                          >
                            {l.inFlight > 0 ? `−${qtyFmt.format(l.inFlight)}` : "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {qtyFmt.format(l.correctedQty)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDematOpen(false)}
              disabled={commitDematMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!dematFile || !dematPreview || commitDematMutation.isPending}
              onClick={() => dematFile && commitDematMutation.mutate(dematFile)}
            >
              {commitDematMutation.isPending ? "Updating…" : "Confirm & update inventory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={batchToDelete != null}
        onOpenChange={(open) => {
          if (!open) setBatchToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this batch?</AlertDialogTitle>
            <AlertDialogDescription>
              {batchToDelete ? (
                <>
                  Batch <span className="font-mono">#{batchToDelete.id}</span> from{" "}
                  {formatDateTime(batchToDelete.uploadedAt)} with{" "}
                  <strong>{batchToDelete.lineCount}</strong> line
                  {batchToDelete.lineCount === 1 ? "" : "s"} will be removed permanently. This cannot
                  be undone.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBatchMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBatchMutation.isPending || !batchToDelete}
              onClick={() => {
                if (batchToDelete) deleteBatchMutation.mutate(batchToDelete.id);
              }}
            >
              {deleteBatchMutation.isPending ? "Deleting…" : "Delete batch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
