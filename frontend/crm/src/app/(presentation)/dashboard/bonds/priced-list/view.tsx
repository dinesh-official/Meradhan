"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import CardPagination from "@/global/elements/table/CardPagination";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";

type ListItem = {
  id: number;
  provider: string | null;
  timestamp: string | null;
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

async function fetchList(params: { search: string; page: number; limit: number }) {
  const res = await apiClientCaller.get<{ responseData: ListResponse }>(
    "/crm/bonds/priced-list",
    {
      params,
    }
  );
  return res.data.responseData;
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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
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

  const queryKey = useMemo(() => ["bond-priced-list", { search, page, limit }], [
    search,
    page,
    limit,
  ]);

  const listQuery = useQuery({
    queryKey,
    queryFn: () => fetchList({ search, page, limit }),
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
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by ISIN or Issuer"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full md:w-[420px]"
              />
              <Button
                variant="outline"
                onClick={() => setSearchInput("")}
                disabled={!searchInput}
              >
                Clear
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: paste an ISIN for an exact-ish match, or type issuer name.
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="md:w-[360px]"
            />
            <div className="flex flex-col gap-2 md:w-[260px]">
              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={!file || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload CSV"}
              </Button>
              {uploadMutation.isPending && (
                <div className="space-y-1">
                  <Progress value={uploadProgress?.percent ?? 0} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{uploadProgress?.percent ?? 0}%</span>
                    <span>
                      {(uploadProgress?.loaded ?? 0).toLocaleString("en-IN")}
                      {uploadProgress?.total
                        ? ` / ${uploadProgress.total.toLocaleString("en-IN")} bytes`
                        : " bytes"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full overflow-auto rounded-md border bg-background">
          <table className="min-w-[1200px] w-full text-sm">
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
                          ? "Try clearing the search, or upload a newer CSV."
                          : "Upload a CSV to start exploring the priced list."}
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

