"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import { cn } from "@/lib/utils";
import useAppCookie from "@/hooks/useAppCookie.hook";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
  Save,
  Upload,
  X,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import type { NseSettlementNoRecord } from "@root/apiGateway";
import {
  parseSettlementCsv,
  type SettlementCsvRow,
  SETTLEMENT_CSV_MAX_ROWS,
} from "./_utils/parseSettlementCsv";
import { useSettlementDatesApiHook } from "./hooks/useSettlementDatesApiHook";

function formatSettlementDisplayDate(isoYyyyMmDd: string): string {
  try {
    return format(parseISO(isoYyyyMmDd), "dd-MMM-yy");
  } catch {
    return isoYyyyMmDd;
  }
}

function formatMonthHeading(yearMonth: string): string {
  try {
    return format(parseISO(`${yearMonth}-01`), "MMMM yyyy");
  } catch {
    return yearMonth;
  }
}

export default function SettlementDatesView() {
  const { cookies } = useAppCookie();
  const canSave =
    cookies.role === "ADMIN" || cookies.role === "SUPER_ADMIN";

  const NSE_SETTLEMENT_CSV_URL =
    "https://bricsonline.nseindia.com/bondsnew/rest/login";

  const [yearMonth, setYearMonth] = React.useState(() =>
    format(new Date(), "yyyy-MM")
  );
  const [listPage, setListPage] = React.useState(1);

  const { settlementNosQuery, saveCsvRowsMutation, pageSize } =
    useSettlementDatesApiHook({
      yearMonth,
      page: listPage,
    });

  React.useEffect(() => {
    setListPage(1);
  }, [yearMonth]);

  const [rows, setRows] = React.useState<SettlementCsvRow[]>([]);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const listPayload = settlementNosQuery.data;
  const savedRows = listPayload?.items ?? [];
  const totalInMonth = listPayload?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalInMonth / pageSize));
  const rangeStart =
    totalInMonth === 0 ? 0 : (listPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(listPage * pageSize, totalInMonth);

  React.useEffect(() => {
    if (listPage > totalPages) {
      setListPage(totalPages);
    }
  }, [listPage, totalPages]);

  const processFile = React.useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setParseError("Please choose a .csv file.");
      setRows([]);
      setFileName(null);
      return;
    }

    setFileName(file.name);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const result = parseSettlementCsv(text);
      if (!result.ok) {
        setRows([]);
        setParseError(result.error);
        return;
      }
      setRows(result.rows);
      if (result.truncated) {
        toast.message("Preview limited", {
          description: `Showing first ${SETTLEMENT_CSV_MAX_ROWS} rows only.`,
        });
      }
    };
    reader.onerror = () => {
      setRows([]);
      setParseError("Could not read the file.");
    };
    reader.readAsText(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setRows([]);
    setFileName(null);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (!canSave || rows.length === 0) return;
    saveCsvRowsMutation.mutate(rows, {
      onSuccess: () => {
        toast.success(`Saved ${rows.length} settlement row(s).`);
        handleClear();
      },
      onError: (err: unknown) => {
        const msg =
          err &&
          typeof err === "object" &&
          "message" in err &&
          typeof (err as { message?: string }).message === "string"
            ? (err as { message: string }).message
            : "Save failed. You need Admin access, or check your connection.";
        toast.error(msg);
      },
    });
  };

  return (
    <div className="flex flex-col gap-5 mt-5">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Saved settlement dates
              </CardTitle>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Choose a month to load rows from the database. Dates are stored as
                yyyy-mm-dd; pagination applies per month.
              </p>
            </div>
            <a
              href={NSE_SETTLEMENT_CSV_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between mb-6">
            <div className="space-y-2">
              <Label htmlFor="settlement-month">Month</Label>
              <Input
                id="settlement-month"
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                className="w-[min(100%,220px)] bg-background"
              />
            </div>
            <p className="text-sm text-muted-foreground pb-2">
              <span className="font-medium text-foreground">
                {formatMonthHeading(yearMonth)}
              </span>
              {totalInMonth > 0
                ? ` · ${totalInMonth} day(s) in this month`
                : settlementNosQuery.isLoading
                  ? ""
                  : " · No rows for this month"}
            </p>
          </div>

          {settlementNosQuery.isError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle />
              <AlertTitle>Could not load settlement dates</AlertTitle>
              <AlertDescription>
                Try refreshing the page. If the problem continues, contact
                support.
              </AlertDescription>
            </Alert>
          )}
          <UniversalTable<NseSettlementNoRecord>
            data={savedRows}
            initialPageSize={pageSize}
            isLoading={settlementNosQuery.isLoading}
            getRowIdAction={(row) => String(row.id)}
            fields={[
              {
                key: "date",
                label: "Settlement Date",
                sortable: true,
                cell(row) {
                  return (
                    <span className="font-mono text-sm">
                      {formatSettlementDisplayDate(row.date)}
                    </span>
                  );
                },
              },
              {
                key: "settlementNo",
                label: "Settlement Number",
                sortable: true,
                cell(row) {
                  return (
                    <span className="font-mono text-sm">{row.settlementNo}</span>
                  );
                },
              },
            ]}
          />

          {totalInMonth > 0 && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {rangeStart}–{rangeEnd}
                </span>{" "}
                of {totalInMonth}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={listPage <= 1 || settlementNosQuery.isLoading}
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums px-2">
                  Page {listPage} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    listPage >= totalPages || settlementNosQuery.isLoading
                  }
                  onClick={() =>
                    setListPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Upload settlement CSV
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Expected columns:{" "}
            <span className="font-mono text-xs">
              Settlement Date, Settlement Number
            </span>{" "}
            (e.g. 02-Apr-26 and 2604002). Dates are normalized to yyyy-mm-dd
            before save.
            {!canSave && (
              <span className="block mt-2 text-amber-700 dark:text-amber-500">
                Only Admin can save to the database.
              </span>
            )}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "rounded-lg border border-dashed px-6 py-10 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 bg-muted/30"
            )}
          >
            <FileSpreadsheet className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop a CSV here, or choose a file from your device.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose CSV
              </Button>
              {(fileName || rows.length > 0 || parseError) && (
                <Button type="button" variant="ghost" onClick={handleClear}>
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
              {rows.length > 0 && canSave && (
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saveCsvRowsMutation.isPending}
                >
                  {saveCsvRowsMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save to database
                </Button>
              )}
            </div>
            {fileName && (
              <p className="mt-4 text-sm text-muted-foreground">
                Selected:{" "}
                <span className="font-medium text-foreground">{fileName}</span>
              </p>
            )}
          </div>

          {parseError && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertTitle>Could not parse CSV</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Preview</CardTitle>
            <p className="text-sm text-muted-foreground font-normal">
              {rows.length} row{rows.length === 1 ? "" : "s"} — ready to save
              {canSave ? "" : " (Admin only)"}
            </p>
          </CardHeader>
          <CardContent>
            <UniversalTable<SettlementCsvRow>
              data={rows}
              initialPageSize={20}
              getRowIdAction={(row) => row.id}
              fields={[
                {
                  key: "date",
                  label: "Settlement Date",
                  sortable: true,
                  cell(row) {
                    return (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-sm">
                          {formatSettlementDisplayDate(row.date)}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {row.date}
                        </span>
                      </div>
                    );
                  },
                },
                {
                  key: "settlementNo",
                  label: "Settlement Number",
                  sortable: true,
                  cell(row) {
                    return (
                      <span className="font-mono text-sm">{row.settlementNo}</span>
                    );
                  },
                },
              ]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
