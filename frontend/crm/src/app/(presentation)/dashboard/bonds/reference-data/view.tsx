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
import * as XLSX from "xlsx";

type MetaItem = {
  id: number;
  isin: string;
  issuerName: string | null;
  issueDate: string | null;
  maturityDate: string | null;
  couponRate: number | null;
  yield: number | null;
  isListed: boolean | null;
  issueCurrency: string | null;
  faceValue: number | null;
  updatedAt: string;
};

type ListResponse = {
  data: MetaItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

type SchedulesResponse = {
  isin: string;
  coupon: {
    id: number;
    interestPaymentDates: string | null;
    recordDays: number | null;
    recordDate: string | null;
    dueDate: string | null;
  }[];
  redemption: {
    id: number;
    redemptionType: string | null;
    startDate: string | null;
    endDate: string | null;
    price: number | null;
    amount: number | null;
    optionType: string | null;
    optionFrequency: string | null;
  }[];
};

async function fetchList(params: { search: string; page: number; limit: number }) {
  const res = await apiClientCaller.get<{ responseData: ListResponse }>(
    "/crm/bonds/reference-data",
    { params }
  );
  return res.data.responseData;
}

async function fetchSchedules(isin: string) {
  const res = await apiClientCaller.get<{ responseData: SchedulesResponse }>(
    `/crm/bonds/reference-data/${encodeURIComponent(isin)}/schedules`
  );
  return res.data.responseData;
}

const numberFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 });

function formatMaybePercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "-";
  const v = value > 0 && value <= 1 ? value * 100 : value;
  return `${numberFmt.format(v)}%`;
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

function normalizeSheetName(name: string): string {
  return name.trim().toLowerCase();
}

export default function BondReferenceDataView() {
  const [file, setFile] = useState<File | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedIsin, setExpandedIsin] = useState<string | null>(null);
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

  const listQueryKey = useMemo(
    () => ["bond-reference-data", { search, page, limit }],
    [search, page, limit]
  );

  const listQuery = useQuery({
    queryKey: listQueryKey,
    queryFn: () => fetchList({ search, page, limit }),
  });

  const schedulesQuery = useQuery({
    queryKey: ["bond-reference-data-schedules", expandedIsin],
    queryFn: () => fetchSchedules(expandedIsin!),
    enabled: !!expandedIsin,
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Please select an XLSX file");

      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true, raw: false });

      const sheetByName = (target: string) => {
        const found = wb.SheetNames.find(
          (n) => normalizeSheetName(n) === normalizeSheetName(target)
        );
        if (!found) return null;
        return wb.Sheets[found] ?? null;
      };

      const adWs = sheetByName("AD");
      const couponWs = sheetByName("Coupon Payment Dates");
      const redemptionWs = sheetByName("Redemption Schedule");

      if (!adWs) throw new Error("Sheet 'AD' not found in file");
      if (!couponWs) throw new Error("Sheet 'Coupon Payment Dates' not found in file");
      if (!redemptionWs) throw new Error("Sheet 'Redemption Schedule' not found in file");

      const adRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(adWs, {
        defval: "",
      });
      const couponRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(couponWs, {
        defval: "",
      });
      const redemptionRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        redemptionWs,
        { defval: "" }
      );

      const adRowsClean = (adRows || []).filter((r) => r && Object.keys(r).length > 0);
      if (adRowsClean.length === 0) return { responseData: { processed: 0 } };

      const couponByIsin = new Map<string, Record<string, unknown>[]>();
      for (const r of couponRows || []) {
        const isin = String((r as any)?.ISIN ?? "").trim();
        if (!isin) continue;
        const arr = couponByIsin.get(isin) ?? [];
        arr.push(r);
        couponByIsin.set(isin, arr);
      }

      const redemptionByIsin = new Map<string, Record<string, unknown>[]>();
      for (const r of redemptionRows || []) {
        const isin = String((r as any)?.ISIN ?? "").trim();
        if (!isin) continue;
        const arr = redemptionByIsin.get(isin) ?? [];
        arr.push(r);
        redemptionByIsin.set(isin, arr);
      }

      const concurrency = 4;
      let processed = 0;
      let failed = 0;

      setUploadProgress({ percent: 0, loaded: 0, total: adRowsClean.length });

      const inFlight: Promise<void>[] = [];
      const send = async (payload: {
        adRow: Record<string, unknown>;
        couponPaymentRows: Record<string, unknown>[];
        redemptionScheduleRows: Record<string, unknown>[];
      }) => {
        await apiClientCaller.post("/crm/bonds/reference-data/upsert-isin", payload, {
          headers: { "Content-Type": "application/json" },
        });
      };

      for (const adRow of adRowsClean) {
        const isin = String((adRow as any)?.ISIN ?? "").trim();
        if (!isin) continue;

        inFlight.push(
          send({
            adRow,
            couponPaymentRows: couponByIsin.get(isin) ?? [],
            redemptionScheduleRows: redemptionByIsin.get(isin) ?? [],
          })
            .then(() => {
              processed += 1;
            })
            .catch(() => {
              processed += 1;
              failed += 1;
            })
            .finally(() => {
              const percent = Math.min(
                100,
                Math.round((processed / adRowsClean.length) * 100)
              );
              setUploadProgress({ percent, loaded: processed, total: adRowsClean.length });
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
        throw new Error(`Uploaded with ${failed} ISIN(s) failed`);
      }

      return { responseData: { processed: adRowsClean.length } };
    },
    onSuccess: (data) => {
      const processed = data.responseData?.processed ?? 0;
      toast.success(`Upload complete. Processed ${processed} ISIN(s).`);
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
          <span>Bond Reference Data (XLSX)</span>
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
              Upload the Excel (3 sheets: AD, Coupon Payment Dates, Redemption Schedule).
            </p>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="md:w-[360px]"
            />
            <div className="flex flex-col gap-2 md:w-[260px]">
              <Button
                onClick={() => uploadMutation.mutate()}
                disabled={!file || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload XLSX"}
              </Button>
              {uploadMutation.isPending && (
                <div className="space-y-1">
                  <Progress value={uploadProgress?.percent ?? 0} />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{uploadProgress?.percent ?? 0}%</span>
                    <span>
                      {(uploadProgress?.loaded ?? 0).toLocaleString("en-IN")}
                      {uploadProgress?.total
                        ? ` / ${uploadProgress.total.toLocaleString("en-IN")} ISINs`
                        : " ISINs"}
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
                <th className="px-3 py-2 font-medium text-muted-foreground">ISIN</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Issuer</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Issue</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Maturity</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">
                  Coupon
                </th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">
                  Yield
                </th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Currency</th>
                <th className="px-3 py-2 font-medium text-muted-foreground text-right">
                  Face
                </th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Listed</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Schedules</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isLoading && (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={10}>
                    Loading reference data…
                  </td>
                </tr>
              )}
              {!listQuery.isLoading && items.length === 0 && (
                <tr>
                  <td className="px-3 py-10" colSpan={10}>
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">No records found</div>
                      <div className="text-sm text-muted-foreground">
                        {search
                          ? "Try clearing the search, or upload a newer XLSX."
                          : "Upload the XLSX to start exploring the reference data."}
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
                  <td className="px-3 py-2 font-medium whitespace-nowrap">{r.isin}</td>
                  <td className="px-3 py-2 max-w-[520px] truncate" title={r.issuerName ?? ""}>
                    {r.issuerName ?? "-"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(r.issueDate)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(r.maturityDate)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    {formatMaybePercent(r.couponRate)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    {formatMaybePercent(r.yield)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.issueCurrency ?? "-"}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-right">
                    {r.faceValue == null ? "-" : numberFmt.format(r.faceValue)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.isListed == null ? "-" : r.isListed ? "Yes" : "No"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setExpandedIsin((prev) => (prev === r.isin ? null : r.isin))
                      }
                    >
                      {expandedIsin === r.isin ? "Hide" : "View"}
                    </Button>
                  </td>
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

        {expandedIsin && (
          <div className="rounded-md border bg-muted/10 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">Schedules for {expandedIsin}</div>
              <Button size="sm" variant="ghost" onClick={() => setExpandedIsin(null)}>
                Close
              </Button>
            </div>

            {schedulesQuery.isLoading && (
              <div className="py-3 text-sm text-muted-foreground">Loading schedules…</div>
            )}

            {schedulesQuery.data && (
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border bg-background p-3">
                  <div className="font-medium">Coupon Payment Dates</div>
                  <div className="mt-2 w-full overflow-auto">
                    <table className="min-w-[560px] w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr className="text-left">
                          <th className="px-2 py-1 text-muted-foreground">Interest Date</th>
                          <th className="px-2 py-1 text-muted-foreground text-right">
                            Record Days
                          </th>
                          <th className="px-2 py-1 text-muted-foreground">Record Date</th>
                          <th className="px-2 py-1 text-muted-foreground">Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedulesQuery.data.coupon.length === 0 && (
                          <tr>
                            <td className="px-2 py-2 text-muted-foreground" colSpan={4}>
                              No coupon schedule rows.
                            </td>
                          </tr>
                        )}
                        {schedulesQuery.data.coupon.map((c) => (
                          <tr key={c.id} className="border-t">
                            <td className="px-2 py-1">{c.interestPaymentDates ?? "-"}</td>
                            <td className="px-2 py-1 text-right">
                              {c.recordDays == null ? "-" : numberFmt.format(c.recordDays)}
                            </td>
                            <td className="px-2 py-1">{formatDate(c.recordDate)}</td>
                            <td className="px-2 py-1">{formatDate(c.dueDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-md border bg-background p-3">
                  <div className="font-medium">Redemption Schedule</div>
                  <div className="mt-2 w-full overflow-auto">
                    <table className="min-w-[560px] w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr className="text-left">
                          <th className="px-2 py-1 text-muted-foreground">Type</th>
                          <th className="px-2 py-1 text-muted-foreground">Start</th>
                          <th className="px-2 py-1 text-muted-foreground">End</th>
                          <th className="px-2 py-1 text-muted-foreground text-right">Price</th>
                          <th className="px-2 py-1 text-muted-foreground text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedulesQuery.data.redemption.length === 0 && (
                          <tr>
                            <td className="px-2 py-2 text-muted-foreground" colSpan={5}>
                              No redemption schedule rows.
                            </td>
                          </tr>
                        )}
                        {schedulesQuery.data.redemption.map((r) => (
                          <tr key={r.id} className="border-t">
                            <td className="px-2 py-1">{r.redemptionType ?? "-"}</td>
                            <td className="px-2 py-1">{formatDate(r.startDate)}</td>
                            <td className="px-2 py-1">{formatDate(r.endDate)}</td>
                            <td className="px-2 py-1 text-right">
                              {r.price == null ? "-" : numberFmt.format(r.price)}
                            </td>
                            <td className="px-2 py-1 text-right">
                              {r.amount == null ? "-" : numberFmt.format(r.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

