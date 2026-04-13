"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import CardPagination from "@/global/elements/table/CardPagination";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, FileSpreadsheet, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import { cn } from "@/lib/utils";

type ListItem = {
  id: number;
  provider: string | null;
  timestamp: string;
  isin: string;
  issuerName: string | null;
  couponRate: number | null;
  maturityDate: string | null;
  yield: number | null;
  price: number | null;
  dirtyPrice: number | null;
  cleanPrice: number | null;
  rating: string | null;
  ratingAgency: string | null;
  taxFree: boolean | null;
  isListed: string | null;
};

type ListResponse = {
  data: ListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

async function fetchList(params: {
  search: string;
  page: number;
  limit: number;
  /** YYYY-MM-DD — UTC day filter on `timestamp` (default: today in UI) */
  pricingDate: string;
  sortOrder: "asc" | "desc";
}) {
  const res = await apiClientCaller.get<{ responseData: ListResponse }>(
    "/crm/bonds/priced-list",
    {
      params,
    }
  );
  return res.data.responseData;
}

function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysYmd(ymd: string, delta: number): string {
  const base =
    ymd && /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : localYmd(new Date());
  const [y, m, d] = base.split("-").map(Number);
  const next = new Date(y, m - 1, d);
  next.setDate(next.getDate() + delta);
  return localYmd(next);
}

function formatYmdLong(ymd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const numberFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });
const moneyFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

function formatMaybePercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "-";
  const v = value > 0 && value <= 1 ? value * 100 : value;
  return `${numberFmt.format(v)}%`;
}

function formatMoney(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "-";
  return moneyFmt.format(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isCsvFile(file: File): boolean {
  const n = file.name.toLowerCase();
  return (
    n.endsWith(".csv") ||
    file.type === "text/csv" ||
    file.type === "application/csv" ||
    file.type === "application/vnd.ms-excel"
  );
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function BondPricedListView() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [listDate, setListDate] = useState(() => localYmd(new Date()));
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<{
    percent: number;
    loaded: number;
    total?: number;
  } | null>(null);
  const limit = 25;

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [listDate, sortOrder]);

  const queryKey = useMemo(
    () => ["bond-priced-list", { search, page, limit, listDate, sortOrder }],
    [search, page, limit, listDate, sortOrder],
  );

  const listQuery = useQuery({
    queryKey,
    queryFn: () =>
      fetchList({ search, page, limit, pricingDate: listDate, sortOrder }),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select a CSV file");
      const text = await file.text();
      const parsed = Papa.parse<Record<string, unknown>>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      if (parsed.errors?.length) {
        throw new Error(parsed.errors[0]?.message || "Failed to parse CSV");
      }

      const rows = (parsed.data || []).filter((r) => r && Object.keys(r).length > 0);
      if (rows.length === 0) {
        return { responseData: { inserted: 0 } };
      }

      // Send row-by-row as requested (small concurrency for speed + safety).
      const concurrency = 4;
      let processed = 0;
      let failed = 0;

      setUploadProgress({ percent: 0, loaded: 0, total: rows.length });

      const inFlight: Promise<void>[] = [];
      const sendRow = async (row: Record<string, unknown>) => {
        await apiClientCaller.post(
          "/crm/bonds/priced-list/upsert-row",
          row,
          { headers: { "Content-Type": "application/json" } }
        );
      };

      for (const row of rows) {
        inFlight.push(
          sendRow(row)
            .then(() => {
              processed += 1;
            })
            .catch(() => {
              processed += 1;
              failed += 1;
            })
            .finally(() => {
              const percent = Math.min(100, Math.round((processed / rows.length) * 100));
              setUploadProgress({ percent, loaded: processed, total: rows.length });
            })
        );

        if (inFlight.length >= concurrency) {
          await Promise.all(inFlight);
          inFlight.length = 0;
        }
      }

      if (inFlight.length) {
        await Promise.all(inFlight);
      }

      if (failed > 0) {
        throw new Error(`Uploaded with ${failed} row(s) failed`);
      }

      return { responseData: { inserted: rows.length } };
    },
    onSuccess: (data) => {
      const inserted = data.responseData?.inserted ?? 0;
      toast.success(`Upload complete. Inserted ${inserted} rows.`);
      setFile(null);
      setUploadProgress(null);
      setUploadOpen(false);
      listQuery.refetch();
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Upload failed";
      toast.error(message);
      setUploadProgress(null);
    },
  });

  const items = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;

  const assignCsvFile = useCallback((f: File | null | undefined) => {
    if (!f) return;
    if (!isCsvFile(f)) {
      toast.error("Please choose a .csv file.");
      return;
    }
    setFile(f);
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    assignCsvFile(e.target.files?.[0]);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    assignCsvFile(dropped);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const resetUploadDialog = () => {
    setFile(null);
    setUploadProgress(null);
    setDragActive(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>Bond Priced List (Consolidated CSV)</span>
          <span className="text-sm font-normal text-muted-foreground">
            {meta ? `${meta.total.toLocaleString("en-IN")} records` : ""}
            {listQuery.isFetching ? " · Refreshing…" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs text-muted-foreground">Filter by quote date</span>
              <div className="flex flex-wrap items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label="Previous day"
                  onClick={() => setListDate((prev) => addDaysYmd(prev, -1))}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </Button>
                <Input
                  type="date"
                  value={listDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v) setListDate(v);
                  }}
                  className="h-9 w-[158px] shrink-0 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  aria-label="Next day"
                  onClick={() => setListDate((prev) => addDaysYmd(prev, 1))}
                >
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{formatYmdLong(listDate)}</p>
            </div>
            <div className="flex flex-col gap-1 sm:min-w-[200px]">
              <span className="text-xs text-muted-foreground">Sort by date</span>
              <Select
                value={sortOrder}
                onValueChange={(v) => setSortOrder(v === "asc" ? "asc" : "desc")}
              >
                <SelectTrigger className="h-9 w-full sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest first</SelectItem>
                  <SelectItem value="asc">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <Input
              placeholder="Search by ISIN or Issuer"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="min-h-9 w-full sm:min-w-0 sm:flex-1 md:max-w-md"
            />
            <div className="flex shrink-0 items-center gap-2 sm:justify-end">
              <Button
                variant="outline"
                type="button"
                className="min-h-9"
                onClick={() => setSearchInput("")}
                disabled={!searchInput}
              >
                Clear
              </Button>
              <Button
                type="button"
                className="min-h-9 whitespace-nowrap"
                onClick={() => setUploadOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4 shrink-0" />
                Upload CSV
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Rows match the stored quote calendar day (same ISIN can appear on different days). Tip: paste
            an ISIN or type issuer name to narrow further.
          </p>
        </div>

        <Dialog
          open={uploadOpen}
          onOpenChange={(open) => {
            if (!open && uploadMutation.isPending) return;
            setUploadOpen(open);
            if (!open) resetUploadDialog();
          }}
        >
          <DialogContent
            className="sm:max-w-lg"
            showCloseButton={!uploadMutation.isPending}
            onPointerDownOutside={(e) => {
              if (uploadMutation.isPending) e.preventDefault();
            }}
            onEscapeKeyDown={(e) => {
              if (uploadMutation.isPending) e.preventDefault();
            }}
          >
            <DialogHeader>
              <DialogTitle>Upload consolidated CSV</DialogTitle>
              <DialogDescription>
                Drag and drop your file here, or click to browse. Rows are sent
                one-by-one; large files may take a minute.
              </DialogDescription>
            </DialogHeader>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={onFileInputChange}
            />

            <div
              role="presentation"
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragActive(false);
                }
              }}
              className={cn(
                "flex w-full flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 bg-muted/20",
                uploadMutation.isPending && "pointer-events-none opacity-70"
              )}
            >
              <FileSpreadsheet
                className={cn(
                  "h-10 w-10",
                  dragActive ? "text-primary" : "text-muted-foreground"
                )}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium">Drop CSV here</p>
                <p className="text-xs text-muted-foreground">
                  Only .csv — parsed in your browser, then uploaded row by row
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                Browse files
              </Button>
              {file && (
                <p className="text-xs font-medium text-foreground truncate max-w-full px-2">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {uploadMutation.isPending && (
              <div className="space-y-2">
                <Progress value={uploadProgress?.percent ?? 0} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{uploadProgress?.percent ?? 0}%</span>
                  <span>
                    {(uploadProgress?.loaded ?? 0).toLocaleString("en-IN")}
                    {uploadProgress?.total != null
                      ? ` / ${uploadProgress.total.toLocaleString("en-IN")} rows`
                      : " rows"}
                  </span>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={uploadMutation.isPending}
                onClick={() => setUploadOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => uploadMutation.mutate()}
                disabled={!file || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading…" : "Start upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="w-full overflow-auto rounded-md border bg-background">
          <table className="min-w-[1280px] w-full text-sm">
            <thead className="bg-muted/40 sticky top-0 z-10">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">Timestamp</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">ISIN</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Issuer</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">Coupon</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Maturity</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">Yield</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">Price</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Rating</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Agency</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Tax Free</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Listed</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isLoading && (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={11}>
                    Loading priced list…
                  </td>
                </tr>
              )}
              {!listQuery.isLoading && items.length === 0 && (
                <tr>
                  <td className="px-3 py-10" colSpan={11}>
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">No records found</div>
                      <div className="text-sm text-muted-foreground">
                        {search
                          ? "Try clearing the search or pick another day."
                          : `No rows for ${formatYmdLong(listDate)}. Try previous/next day or upload a CSV for this date.`}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
              {items.map((r) => (
                <tr
                  key={r.id}
                  className="border-t odd:bg-muted/10 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {formatDateTime(r.timestamp)}
                  </td>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{r.isin}</td>
                  <td className="px-3 py-2 max-w-[520px] truncate" title={r.issuerName ?? ""}>
                    {r.issuerName ?? "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    {formatMaybePercent(r.couponRate)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(r.maturityDate)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    {formatMaybePercent(r.yield)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    {formatMoney(r.price)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.rating ?? "-"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.ratingAgency ?? "-"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.taxFree == null ? "-" : r.taxFree ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.isListed ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPages} · Showing{" "}
              {items.length.toLocaleString("en-IN")} of{" "}
              {meta.total.toLocaleString("en-IN")}
            </div>
            {meta.totalPages > 1 && (
              <CardPagination
                page={meta.page}
                totalPages={meta.totalPages}
                onClick={(p) => setPage(p)}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

