"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  ChevronRight,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DecimalInput,
  formatDecimalWithMinFractionDigits,
} from "@/components/ui/decimal-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import AllowOnlyView from "@/global/elements/permissions/AllowOnlyView";
import { cn } from "@/lib/utils";
import apiGateway from "@root/apiGateway";
import type {
  BondDealAutofillResponse,
  BondDetailsResponse,
} from "@root/apiGateway";

import { formatDateForDateInput } from "../_utils/bondCalendarDates";
import {
  bondDetailsResponseToFormData,
  type BondFormData,
} from "../_utils/bondDetailsToFormData";
import {
  AUTOFILL_MERGE_KEYS,
  defaultIncludeMap,
  mergeAutofillIntoForm,
  type AutofillMergeKey,
} from "./mergeAutofillIntoForm";
import { formatCouponDatesDisplay } from "./couponDatesText";

/** Fields whose calculator values depend on which yield feed was used (non-consolidated vs consolidated). */
const YIELD_SOURCE_AFFECTED_KEYS: readonly AutofillMergeKey[] = [
  "buyYield",
  "yield",
  "sellPrice",
];

/** Slugs must match the MeraDhan public site listing filters (same list as BondForm). */
const BOND_LISTING_CATEGORY_OPTIONS = [
  { value: "corporate", label: "Corporate" },
  { value: "banks", label: "Bank bonds" },
  { value: "nbfc", label: "NBFC" },
  { value: "psu", label: "PSU" },
  { value: "tax-free", label: "Tax free" },
  { value: "zero-coupon", label: "Zero coupon" },
  { value: "perpetual", label: "Perpetual" },
  { value: "latest-release", label: "Latest release" },
] as const;

const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);
const autoUpdateAutofillApi =
  new apiGateway.crmBondAutoUpdateApi.CrmBondAutoUpdateApi(apiClientCaller);

/** Empty draft → default autofill; non-empty → must parse as % or fail. */
function autofillParamsFromCustomYieldDraft(draft: string | undefined):
  | { ok: true; params: { quantity: number; pricingYield?: number } }
  | { ok: false; message: string } {
  const raw = (draft ?? "").trim().replace(/,/g, "");
  if (raw === "") return { ok: true, params: { quantity: 1 } };
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) {
    return {
      ok: false,
      message: "Enter a valid custom yield (%), or leave the field empty for default pricing.",
    };
  }
  return { ok: true, params: { quantity: 1, pricingYield: n } };
}

function formatDisplayValue(v: unknown): string {
  if (v == null || v === "") return "—";
  if (v instanceof Date) return formatDateForDateInput(v);
  if (Array.isArray(v)) {
    if (v.length === 0) return "—";
    if (v[0] instanceof Date || typeof v[0] === "string") {
      return formatCouponDatesDisplay(v as Date[]);
    }
    return v.map(String).join(", ");
  }
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "—";
  return String(v);
}

function parseCalcAmount(s: string | null | undefined): number | null {
  if (s == null || !String(s).trim()) return null;
  const n = Number(String(s).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function formatInr(n: number | null | undefined): string {
  return n != null && Number.isFinite(n)
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";
}

function autofillWarnings(res: BondDealAutofillResponse): string[] {
  const w: string[] = [];
  const { sources } = res;
  if (!sources.usedReferenceMetadata) {
    w.push(
      "Reference metadata was not used — dates and some fields may come only from the bond row or calculator.",
    );
  }
  if (!sources.usedCouponSchedule) {
    w.push(
      "Coupon payment schedule was not applied — last/next coupon may be synthetic or from the bond row.",
    );
  }
  return w;
}

type DraftSuggestions = BondDealAutofillResponse["suggested"];

type BondRowModel = {
  bond: BondDetailsResponse;
  formBase: BondFormData;
  open: boolean;
  autofill: BondDealAutofillResponse | null;
  draft: DraftSuggestions | null;
  include: Record<AutofillMergeKey, boolean>;
  error: string | null;
  /** Row highlight only after Accept (save), Reject, or failed save — not after Load autofill. */
  outcome: "idle" | "success" | "error" | "rejected";
};

function createInitialRow(b: BondDetailsResponse): BondRowModel {
  return {
    bond: b,
    formBase: bondDetailsResponseToFormData(b),
    open: false,
    autofill: null,
    draft: null,
    include: defaultIncludeMap(),
    error: null,
    outcome: "idle",
  };
}

export default function BondAutoUpdateView() {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<Record<string, BondRowModel>>({});
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  /** Sequential bulk load / save progress (one bond at a time). */
  const [bulkProgress, setBulkProgress] = useState<{
    kind: "load" | "save";
    current: number;
    total: number;
  } | null>(null);

  const listQuery = useQuery({
    queryKey: ["bonds", "auto-update", "sale-ready"],
    queryFn: async () => {
      const { responseData } = await bondsApi.getListedBonds({
        filters: { allowForPurchase: true },
        params: { page: 1, limit: 200, category: "all", all: "YES" },
      });
      return responseData;
    },
  });

  const ensureRow = useCallback(
    (b: BondDetailsResponse) => {
      setRows((prev) => {
        if (prev[b.isin]) return prev;
        return {
          ...prev,
          [b.isin]: {
            bond: b,
            formBase: bondDetailsResponseToFormData(b),
            open: false,
            autofill: null,
            draft: null,
            include: defaultIncludeMap(),
            error: null,
            outcome: "idle",
          },
        };
      });
    },
    [],
  );

  useEffect(() => {
    const list = listQuery.data?.data;
    if (!list?.length) return;
    for (const b of list) ensureRow(b);
  }, [listQuery.data, ensureRow]);

  /** Per-ISIN draft for “custom yield” row; sent in POST body, not query params. */
  const [customYieldByIsin, setCustomYieldByIsin] = useState<Record<string, string>>(
    {},
  );

  const autofillMutation = useMutation({
    mutationFn: async (args: { isin: string; pricingYield?: number }) => {
      const { isin, pricingYield } = args;
      const res = await autoUpdateAutofillApi.postBondAutoUpdateAutofill(isin, {
        quantity: 1,
        ...(pricingYield != null && Number.isFinite(pricingYield)
          ? { pricingYield }
          : {}),
      });
      return { isin, data: res.responseData };
    },
    onSuccess: ({ isin, data }) => {
      if (!data) {
        setRows((prev) => {
          const cur = prev[isin];
          if (!cur) return prev;
          return {
            ...prev,
            [isin]: {
              ...cur,
              error: "No autofill payload returned",
              autofill: null,
              draft: null,
            },
          };
        });
        toast.error("No autofill payload returned");
        return;
      }
      setRows((prev) => {
        const cur = prev[isin];
        if (!cur) return prev;
        return {
          ...prev,
          [isin]: {
            ...cur,
            autofill: data,
            draft: { ...data.suggested },
            include: defaultIncludeMap(),
            error: null,
            open: true,
          },
        };
      });
      toast.success(`Autofill loaded for ${isin}`);
    },
    onError: (err: AxiosError, variables: { isin: string; pricingYield?: number }) => {
      const { isin } = variables;
      const msg =
        (err?.response?.data as { message?: string })?.message ||
        err?.message ||
        "Autofill failed";
      setRows((prev) => {
        const cur = prev[isin];
        if (!cur) return prev;
        return {
          ...prev,
          [isin]: { ...cur, error: msg, autofill: null, draft: null },
        };
      });
      toast.error(msg);
    },
  });

  const saveMutation = useMutation<
    { isin: string; bond: BondDetailsResponse },
    AxiosError,
    { isin: string; payload: BondFormData }
  >({
    mutationFn: async ({ isin, payload }) => {
      // Pass autofillSave: true so the backend stamps autofillSavedAt on this bond.
      await bondsApi.updateBond(isin, payload, { autofillSave: true });
      const detail = await bondsApi.getBondDetailsByIsin(isin);
      if (!detail.responseData) {
        throw new Error("Bond details missing after update");
      }
      return { isin, bond: detail.responseData };
    },
    onSuccess: ({ isin, bond }) => {
      toast.success(`Bond ${isin} updated`);
      queryClient.invalidateQueries({ queryKey: ["bonds"] });
      queryClient.invalidateQueries({ queryKey: ["bond", isin] });
      listQuery.refetch();
      setRows((prev) => {
        const cur = prev[isin];
        if (!cur) return prev;
        const nextBond = bond;
        return {
          ...prev,
          [isin]: {
            ...cur,
            bond: nextBond,
            formBase: bondDetailsResponseToFormData(nextBond),
            autofill: null,
            draft: null,
            error: null,
            include: defaultIncludeMap(),
            outcome: "success",
          },
        };
      });
    },
    onError: (
      err: AxiosError,
      variables: { isin: string; payload: BondFormData } | undefined,
    ) => {
      const isin = variables?.isin;
      if (isin) {
        setRows((prev) => {
          const cur = prev[isin];
          if (!cur) return prev;
          return { ...prev, [isin]: { ...cur, outcome: "error" } };
        });
      }
      toast.error(
        (err?.response?.data as { message?: string })?.message ||
        err?.message ||
        "Update failed",
      );
    },
  });

  const loadAllAutofill = useCallback(async () => {
    const list = listQuery.data?.data;
    if (!list?.length) return;
    setBulkProgress({ kind: "load", current: 0, total: list.length });
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < list.length; i++) {
      const b = list[i]!;
      setBulkProgress({ kind: "load", current: i + 1, total: list.length });
      try {
        const parsed = autofillParamsFromCustomYieldDraft(customYieldByIsin[b.isin]);
        if (!parsed.ok) {
          fail++;
          setRows((prev) => {
            const cur = prev[b.isin] ?? createInitialRow(b);
            return {
              ...prev,
              [b.isin]: {
                ...cur,
                error: parsed.message,
                autofill: null,
                draft: null,
              },
            };
          });
          continue;
        }
        const res = await autoUpdateAutofillApi.postBondAutoUpdateAutofill(
          b.isin,
          parsed.params,
        );
        if (!res.responseData) {
          fail++;
          setRows((prev) => {
            const cur = prev[b.isin] ?? createInitialRow(b);
            return {
              ...prev,
              [b.isin]: {
                ...cur,
                error: "No autofill payload",
                autofill: null,
                draft: null,
              },
            };
          });
          continue;
        }
        ok++;
        const data = res.responseData;
        setRows((prev) => {
          const cur = prev[b.isin] ?? createInitialRow(b);
          return {
            ...prev,
            [b.isin]: {
              ...cur,
              autofill: data,
              draft: { ...data.suggested },
              include: defaultIncludeMap(),
              error: null,
              open: true,
            },
          };
        });
      } catch (e) {
        fail++;
        const err = e as AxiosError;
        const msg =
          (err?.response?.data as { message?: string })?.message ||
          err?.message ||
          "Autofill failed";
        setRows((prev) => {
          const cur = prev[b.isin] ?? createInitialRow(b);
          return {
            ...prev,
            [b.isin]: {
              ...cur,
              error: msg,
              autofill: null,
              draft: null,
            },
          };
        });
      }
    }
    setBulkProgress(null);
    toast.success(`Load all finished: ${ok} succeeded, ${fail} failed.`);
  }, [listQuery, customYieldByIsin]);

  const saveAllWithAutofill = useCallback(async () => {
    const list = listQuery.data?.data ?? [];
    const isins = list
      .map((b) => b.isin)
      .filter((isin) => {
        const r = rowsRef.current[isin];
        return r?.draft != null && r?.autofill != null;
      });
    if (isins.length === 0) {
      toast.info(
        "No bonds with loaded autofill to save. Use “Load all” or per-bond “Load autofill” first.",
      );
      return;
    }
    setBulkProgress({ kind: "save", current: 0, total: isins.length });
    let ok = 0;
    let fail = 0;
    for (let i = 0; i < isins.length; i++) {
      const isin = isins[i]!;
      setBulkProgress({ kind: "save", current: i + 1, total: isins.length });
      const row = rowsRef.current[isin];
      if (!row?.draft) {
        fail++;
        continue;
      }
      try {
        const payload = mergeAutofillIntoForm(row.formBase, row.draft, row.include);
        // Pass autofillSave: true so the backend stamps autofillSavedAt on this bond.
        await bondsApi.updateBond(isin, payload, { autofillSave: true });
        const detail = await bondsApi.getBondDetailsByIsin(isin);
        if (!detail.responseData) throw new Error("Bond details missing after update");
        const fresh = detail.responseData;
        setRows((prev) => ({
          ...prev,
          [isin]: {
            ...(prev[isin] ?? row),
            bond: fresh,
            formBase: bondDetailsResponseToFormData(fresh),
            autofill: null,
            draft: null,
            error: null,
            include: defaultIncludeMap(),
            outcome: "success",
          },
        }));
        queryClient.invalidateQueries({ queryKey: ["bonds"] });
        queryClient.invalidateQueries({ queryKey: ["bond", isin] });
        ok++;
      } catch {
        fail++;
        setRows((prev) => {
          const cur = prev[isin];
          if (!cur) return prev;
          return { ...prev, [isin]: { ...cur, outcome: "error" } };
        });
      }
    }
    await listQuery.refetch();
    setBulkProgress(null);
    toast.success(`Save all finished: ${ok} saved, ${fail} failed.`);
  }, [listQuery, queryClient]);

  const updateDraft = (
    isin: string,
    patch: Partial<DraftSuggestions>,
  ) => {
    setRows((prev) => {
      const cur = prev[isin];
      if (!cur?.draft) return prev;
      return {
        ...prev,
        [isin]: { ...cur, draft: { ...cur.draft, ...patch } },
      };
    });
  };

  const toggleInclude = (isin: string, key: AutofillMergeKey, checked: boolean) => {
    setRows((prev) => {
      const cur = prev[isin];
      if (!cur) return prev;
      return {
        ...prev,
        [isin]: { ...cur, include: { ...cur.include, [key]: checked } },
      };
    });
  };

  const rejectRow = (isin: string) => {
    setRows((prev) => {
      const cur = prev[isin];
      if (!cur) return prev;
      return {
        ...prev,
        [isin]: {
          ...cur,
          autofill: null,
          draft: null,
          error: null,
          include: defaultIncludeMap(),
          outcome: "rejected",
        },
      };
    });
  };

  const acceptRow = (isin: string) => {
    const cur = rows[isin];
    if (!cur?.draft) return;
    const payload = mergeAutofillIntoForm(cur.formBase, cur.draft, cur.include);
    saveMutation.mutate({ isin, payload });
  };

  const setOpen = (isin: string, open: boolean) => {
    setRows((prev) => {
      const cur = prev[isin];
      if (!cur) return prev;
      return { ...prev, [isin]: { ...cur, open } };
    });
  };

  /** Empty field → default autofill; non-empty → must be a valid % (sent as pricingYield in POST body). */
  const loadBondAutofill = (b: BondDetailsResponse) => {
    ensureRow(b);
    const parsed = autofillParamsFromCustomYieldDraft(customYieldByIsin[b.isin]);
    if (!parsed.ok) {
      toast.error(parsed.message);
      return;
    }
    const { params } = parsed;
    autofillMutation.mutate({
      isin: b.isin,
      ...(params.pricingYield != null ? { pricingYield: params.pricingYield } : {}),
    });
  };

  const bonds = useMemo(
    () => listQuery.data?.data ?? [],
    [listQuery.data?.data],
  );
  const readyToSaveCount = useMemo(
    () =>
      bonds.filter(
        (b) => rows[b.isin]?.draft != null && rows[b.isin]?.autofill != null,
      ).length,
    [bonds, rows],
  );
  const bulkBusy = bulkProgress != null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm max-w-3xl">
          Bonds with <span className="font-medium text-foreground">Allow for purchase</span> (sale-ready).
          Load autofill from calc.meradhan.co, review each field, uncheck what you do not want
          to overwrite, edit values, then accept to save or reject to discard.{" "}
          <span className="font-medium text-foreground">Load all</span> uses each row&apos;s optional custom yield
          when filled.
        </p>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:flex-wrap sm:justify-end">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="shrink-0 gap-2"
            onClick={() => void loadAllAutofill()}
            disabled={
              bulkBusy ||
              listQuery.isFetching ||
              listQuery.isLoading ||
              bonds.length === 0
            }
          >
            {bulkProgress?.kind === "load" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Load all
          </Button>
          <AllowOnlyView permissions={["edit:bonds"]}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 gap-2"
              onClick={() => void saveAllWithAutofill()}
              disabled={
                bulkBusy ||
                listQuery.isFetching ||
                readyToSaveCount === 0
              }
            >
              {bulkProgress?.kind === "save" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}
              Save all ({readyToSaveCount})
            </Button>
          </AllowOnlyView>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-2"
            onClick={() => listQuery.refetch()}
            disabled={listQuery.isFetching || bulkBusy}
          >
            {listQuery.isFetching ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refresh list
          </Button>
        </div>
      </div>

      {bulkProgress && (
        <p className="text-muted-foreground text-sm">
          {bulkProgress.kind === "load" ? "Loading autofill" : "Saving bonds"}{" "}
          <span className="font-mono font-medium text-foreground">
            {bulkProgress.current}/{bulkProgress.total}
          </span>{" "}
          (one ISIN at a time)
        </p>
      )}

      {listQuery.isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          Could not load bonds. Check your connection and try again.
        </div>
      )}

      {listQuery.isLoading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="size-8 animate-spin" />
        </div>
      ) : bonds.length === 0 ? (
        <p className="text-muted-foreground text-sm py-8 text-center">
          No bonds are currently marked as available for purchase. Enable “Allow for purchase” on a bond to see it
          here.
        </p>
      ) : (
        <div className="space-y-3">
          {bonds.map((b) => {
            const row = rows[b.isin];
            const model = row ?? {
              bond: b,
              formBase: bondDetailsResponseToFormData(b),
              open: false,
              autofill: null,
              draft: null,
              include: defaultIncludeMap(),
              error: null,
              outcome: "idle" as const,
            };
            const loading =
              (autofillMutation.isPending &&
                autofillMutation.variables?.isin === b.isin) ||
              bulkBusy;
            const saving =
              (saveMutation.isPending && saveMutation.variables?.isin === b.isin) ||
              bulkBusy;

            return (
              <Collapsible
                key={b.isin}
                open={model.open}
                onOpenChange={(o) => setOpen(b.isin, o)}
                className={cn(
                  "rounded-lg border transition-colors",
                  (model.outcome ?? "idle") === "success" &&
                  "border-emerald-500/50 bg-emerald-50 dark:border-emerald-600/40 dark:bg-emerald-950/35",
                  (model.outcome ?? "idle") === "error" &&
                  "border-red-500/50 bg-red-50 dark:border-red-600/40 dark:bg-red-950/35",
                  (model.outcome ?? "idle") === "rejected" &&
                  "border-amber-500/50 bg-amber-50 dark:border-amber-600/40 dark:bg-amber-950/35",
                  (model.outcome ?? "idle") === "idle" && "bg-card",
                )}
              >
                <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <CollapsibleTrigger className="flex flex-1 items-center gap-2 text-left">
                    <ChevronRight
                      className={cn(
                        "text-muted-foreground size-4 shrink-0 transition-transform",
                        model.open && "rotate-90",
                      )}
                    />
                    <div>
                      <div className="font-medium">{b.bondName}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-mono whitespace-nowrap">{b.isin}</span>
                        {model.bond.autofillSavedAt && (
                          <span className="text-muted-foreground text-xs font-mono whitespace-nowrap">
                            · Last updated&nbsp;
                            {new Date(model.bond.autofillSavedAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <div className="flex flex-wrap items-center gap-2 pl-7 sm:pl-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        Custom yield %
                      </span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="optional"
                        className="h-9 w-[92px] font-mono text-sm"
                        value={customYieldByIsin[b.isin] ?? ""}
                        onChange={(e) =>
                          setCustomYieldByIsin((prev) => ({
                            ...prev,
                            [b.isin]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            loadBondAutofill(b);
                          }
                        }}
                        disabled={loading}
                        aria-label={`Optional custom pricing yield percent for ${b.isin}; leave empty for default`}
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1"
                      disabled={loading}
                      onClick={() => loadBondAutofill(b)}
                    >
                      {loading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                      Load autofill
                    </Button>
                    <Button type="button" size="sm" variant="secondary" className="gap-1" asChild>
                      <Link href={`/dashboard/bonds/update/${encodeURIComponent(b.isin)}`}>Edit bond</Link>
                    </Button>
                  </div>
                </div>

                {model.error && (
                  <div className="mx-4 mb-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    {model.error}
                  </div>
                )}

                <CollapsibleContent>
                  <div className="border-t px-4 pb-4 pt-2 space-y-4">
                    {!model.autofill || !model.draft ? (
                      <p className="text-muted-foreground text-sm py-4">
                        Optionally enter <span className="font-medium text-foreground">Custom yield %</span>, then
                        click <span className="font-medium text-foreground">Load autofill</span> to use it; leave the
                        field empty for default pricing.
                      </p>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">Yield: {model.autofill.sources.yieldSource}</Badge>
                          <Badge variant={model.autofill.sources.usedReferenceMetadata ? "default" : "secondary"}>
                            Reference metadata {model.autofill.sources.usedReferenceMetadata ? "on" : "off"}
                          </Badge>
                          <Badge variant={model.autofill.sources.usedCouponSchedule ? "default" : "secondary"}>
                            Coupon schedule {model.autofill.sources.usedCouponSchedule ? "on" : "off"}
                          </Badge>
                          {typeof model.autofill.suggested.isUnderShutPeriod === "boolean" ? (
                            <div
                              className="flex flex-wrap items-center gap-1.5"
                              role="status"
                              aria-label={`Under shut period: ${model.autofill.suggested.isUnderShutPeriod ? "yes" : "no"}`}
                            >
                              <span className="text-muted-foreground text-xs whitespace-nowrap">
                                Under shut period
                              </span>
                              <Badge
                                variant="default"
                                className={cn(
                                  "h-6 px-2 text-xs font-medium",
                                  model.autofill.suggested.isUnderShutPeriod
                                    ? "bg-amber-600 text-white hover:bg-amber-600 dark:bg-amber-600"
                                    : "bg-emerald-600 text-white hover:bg-emerald-600 dark:bg-emerald-600",
                                )}
                              >
                                {model.autofill.suggested.isUnderShutPeriod ? "Yes" : "No"}
                              </Badge>
                            </div>
                          ) : null}
                        </div>
                        {model.autofill.sources.yieldSource !== "consolidated" ? (
                          <div
                            className="rounded-lg border border-amber-500/50 bg-amber-50/90 px-3 py-2.5 text-sm dark:border-amber-600/40 dark:bg-amber-950/40 dark:text-amber-50"
                            role="status"
                          >
                            <p className="font-medium text-amber-950 dark:text-amber-100">
                              Yield not from the consolidated priced list
                            </p>
                            <p className="mt-1 text-amber-900/90 dark:text-amber-100/85">
                              {model.autofill.sources.yieldSource === "override"
                                ? "Using your pricing yield override."
                                : "Using the bond / margin record."}{" "}
                              Review the highlighted rows before accepting.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {YIELD_SOURCE_AFFECTED_KEYS.map((k) => (
                                <Badge
                                  key={k}
                                  variant="outline"
                                  className="font-mono text-[11px] border-amber-600/40 bg-amber-100/80 text-amber-950 dark:bg-amber-900/50 dark:text-amber-50"
                                >
                                  {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-md border border-emerald-300/60 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-950 dark:border-emerald-700/50 dark:bg-emerald-950/30 dark:text-emerald-100">
                            <span className="font-medium">Consolidated priced list</span> — pricing uses the
                            consolidated yield path.
                          </div>
                        )}
                        {autofillWarnings(model.autofill).map((w) => (
                          <p key={w} className="text-amber-700 dark:text-amber-400 text-sm flex gap-2">
                            <AlertCircle className="size-4 shrink-0 mt-0.5" />
                            {w}
                          </p>
                        ))}
                        {model.draft.dueDate && (
                          <p className="text-muted-foreground text-sm">
                            Reference <span className="font-medium">due date</span> (informational, not saved on bond):{" "}
                            <span className="font-mono">{model.draft.dueDate}</span>
                          </p>
                        )}

                        {model.autofill.pricing ? (
                          <div className="rounded-md border border-primary/15 bg-muted/30 px-3 py-2.5 text-sm">
                            <p className="font-medium text-foreground">Calc summary</p>
                            <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
                              <div>
                                <dt className="text-muted-foreground text-xs">Settlement (T+1 IST)</dt>
                                <dd className="font-medium font-mono text-xs">
                                  {String(model.autofill.pricing.calc?.settle_dt ?? "—")}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs">Settlement amount</dt>
                                <dd className="font-medium">
                                  {formatInr(
                                    parseCalcAmount(
                                      model.autofill.pricing.calc?.settlement_amount as
                                        | string
                                        | undefined,
                                    ),
                                  )}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs">Accrued interest</dt>
                                <dd className="font-medium">
                                  {formatInr(
                                    parseCalcAmount(
                                      model.autofill.pricing.calc?.total_ai as string | undefined,
                                    ),
                                  )}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-muted-foreground text-xs">Accrued days</dt>
                                <dd className="font-medium">
                                  {model.autofill.pricing.calc?.accrued_days ?? "—"}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        ) : null}

                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-10">Use</TableHead>
                                <TableHead>Field</TableHead>
                                <TableHead>Current (saved)</TableHead>
                                <TableHead className="min-w-[220px]">New (editable)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {AUTOFILL_MERGE_KEYS.map((key) => {
                                const curVal = model.formBase[key as keyof BondFormData];
                                const draft = model.draft!;
                                const sug = draft[key as keyof DraftSuggestions];
                                const yieldSourceAffected =
                                  model.autofill!.sources.yieldSource !== "consolidated" &&
                                  YIELD_SOURCE_AFFECTED_KEYS.includes(key);
                                return (
                                  <TableRow
                                    key={key}
                                    className={cn(
                                      yieldSourceAffected &&
                                      "bg-amber-50/90 dark:bg-amber-950/25 border-l-4 border-l-amber-500/80",
                                    )}
                                  >
                                    <TableCell>
                                      <Checkbox
                                        checked={model.include[key]}
                                        onCheckedChange={(c) =>
                                          toggleInclude(b.isin, key, Boolean(c))
                                        }
                                        aria-label={`Apply ${key}`}
                                      />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs whitespace-nowrap">
                                      <span className="inline-flex items-center gap-2">
                                        {key === "categories" ? "bondCategories" : key}
                                        {yieldSourceAffected ? (
                                          <Badge
                                            variant="secondary"
                                            className="h-5 px-1.5 text-[10px] font-normal text-amber-950 bg-amber-200/80 dark:bg-amber-900/60 dark:text-amber-100"
                                          >
                                            yield path
                                          </Badge>
                                        ) : null}
                                      </span>
                                    </TableCell>
                                    <TableCell
                                      className={cn(
                                        "text-muted-foreground text-sm max-w-[180px] break-all",
                                        key === "allCouponDates" && "max-h-28 overflow-y-auto align-top",
                                      )}
                                    >
                                      {key === "categories" && Array.isArray(curVal)
                                        ? (curVal as string[]).join(", ") || "—"
                                        : (key === "couponRate" || key === "buyYield" || key === "yield") &&
                                          typeof curVal === "number" &&
                                          Number.isFinite(curVal)
                                        ? formatDecimalWithMinFractionDigits(curVal, 2)
                                        : key === "sellPrice" &&
                                          typeof curVal === "number" &&
                                          Number.isFinite(curVal)
                                        ? formatDecimalWithMinFractionDigits(curVal, 4)
                                        : formatDisplayValue(curVal)}
                                    </TableCell>
                                    <TableCell className="min-w-[220px] align-top">
                                      {key === "bondName" || key === "creditRating" ? (
                                        <Input
                                          className="h-9 text-sm"
                                          value={typeof sug === "string" ? sug : ""}
                                          onChange={(e) =>
                                            updateDraft(b.isin, {
                                              [key]: e.target.value,
                                            } as Partial<DraftSuggestions>)
                                          }
                                        />
                                      ) : key === "natureOfInstrument" ? (
                                        <Input
                                          className="h-9 font-mono text-sm"
                                          placeholder="SECURED | UNSECURED | UNKNOWN"
                                          value={typeof sug === "string" ? sug : ""}
                                          onChange={(e) =>
                                            updateDraft(b.isin, {
                                              natureOfInstrument: e.target.value as DraftSuggestions["natureOfInstrument"],
                                            })
                                          }
                                        />
                                      ) : key === "allCouponDates" ? (
                                        <Textarea
                                          rows={4}
                                          className="font-mono text-xs min-w-[220px] max-h-28 resize-none overflow-y-auto"
                                          placeholder="YYYY-MM-DD per line"
                                          value={
                                            Array.isArray(sug)
                                              ? sug.map(String).join("\n")
                                              : ""
                                          }
                                          onChange={(e) => {
                                            const ymds = e.target.value
                                              .split(/[\n,]+/)
                                              .map((s) => s.trim())
                                              .filter(Boolean);
                                            updateDraft(b.isin, {
                                              allCouponDates: ymds,
                                              allCouponDatesIst: ymds,
                                            });
                                          }}
                                        />
                                      ) : key === "recordDays" || key === "accruedInterestDays" ? (
                                        <Input
                                          type="number"
                                          className="h-9 font-mono text-sm"
                                          value={sug == null ? "" : String(sug)}
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            updateDraft(b.isin, {
                                              [key]:
                                                v === "" ? null : Math.round(parseFloat(v)),
                                            } as Partial<DraftSuggestions>);
                                          }}
                                        />
                                      ) : key === "couponRate" ||
                                        key === "buyYield" ||
                                        key === "yield" ? (
                                        <DecimalInput
                                          className="h-9 font-mono text-sm"
                                          minFractionDigits={2}
                                          maxFractionDigits={2}
                                          value={
                                            sug == null
                                              ? undefined
                                              : (() => {
                                                const n =
                                                  typeof sug === "number"
                                                    ? sug
                                                    : Number(sug);
                                                return Number.isFinite(n)
                                                  ? n
                                                  : undefined;
                                              })()
                                          }
                                          onChange={(n) =>
                                            updateDraft(b.isin, {
                                              [key]: n ?? null,
                                            } as Partial<DraftSuggestions>)
                                          }
                                        />
                                      ) : key === "faceValue" ? (
                                        <DecimalInput
                                          className="h-9 font-mono text-sm"
                                          value={
                                            sug == null
                                              ? undefined
                                              : (() => {
                                                const n =
                                                  typeof sug === "number"
                                                    ? sug
                                                    : Number(sug);
                                                return Number.isFinite(n)
                                                  ? n
                                                  : undefined;
                                              })()
                                          }
                                          onChange={(n) =>
                                            updateDraft(b.isin, {
                                              [key]: n ?? null,
                                            } as Partial<DraftSuggestions>)
                                          }
                                        />
                                      ) : key === "sellPrice" ? (
                                        <DecimalInput
                                          title="Clean price: at most 4 decimal places (calc rounding). Text field; blur applies."
                                          className="h-9 font-mono text-sm"
                                          minFractionDigits={4}
                                          maxFractionDigits={4}
                                          value={
                                            sug == null
                                              ? undefined
                                              : (() => {
                                                const n =
                                                  typeof sug === "number"
                                                    ? sug
                                                    : Number(sug);
                                                return Number.isFinite(n)
                                                  ? n
                                                  : undefined;
                                              })()
                                          }
                                          onChange={(n) =>
                                            updateDraft(b.isin, {
                                              sellPrice: n ?? null,
                                            })
                                          }
                                        />
                                      ) : key === "dayConvention" ||
                                        key === "interestPaymentFrequency" ||
                                        key === "interestPaymentMode" ? (
                                        <Input
                                          className="h-9 font-mono text-sm"
                                          value={typeof sug === "string" ? sug : ""}
                                          onChange={(e) =>
                                            updateDraft(b.isin, {
                                              [key]: e.target.value,
                                            } as Partial<DraftSuggestions>)
                                          }
                                        />
                                      ) : key === "bondType" ? (
                                        <Input
                                          className="h-9 font-mono text-sm"
                                          placeholder="GOVERNMENT | CORPORATE | TAX_FREE | PSU | OTHER"
                                          value={typeof sug === "string" ? sug : ""}
                                          onChange={(e) =>
                                            updateDraft(b.isin, {
                                              bondType: e.target.value as DraftSuggestions["bondType"],
                                            })
                                          }
                                        />
                                      ) : key === "seniority" ? (
                                        <Input
                                          className="h-9 font-mono text-sm"
                                          placeholder="SENIOR | TIER_2_SUBORDINATED | UNKNOWN"
                                          value={typeof sug === "string" ? sug : ""}
                                          onChange={(e) =>
                                            updateDraft(b.isin, {
                                              seniority: e.target.value as DraftSuggestions["seniority"],
                                            })
                                          }
                                        />
                                      ) : key === "redemptionType" ? (
                                        <Input
                                          className="h-9 font-mono text-sm"
                                          placeholder="e.g. BULLET, AMORTISING"
                                          value={typeof sug === "string" ? sug : ""}
                                          onChange={(e) =>
                                            updateDraft(b.isin, {
                                              redemptionType: e.target.value,
                                            })
                                          }
                                        />
                                      ) : key === "taxStatus" ? (
                                        <Input
                                          className="h-9 font-mono text-sm"
                                          placeholder="TAXABLE | TAX_FREE | TAX_SAVING | UNKNOWN"
                                          value={typeof sug === "string" ? sug : ""}
                                          onChange={(e) =>
                                            updateDraft(b.isin, {
                                              taxStatus: e.target.value as DraftSuggestions["taxStatus"],
                                            })
                                          }
                                        />
                                      ) : key === "isListed" ? (
                                        <Input
                                          className="h-9 font-mono text-sm"
                                          placeholder="YES | NO | UNKNOWN"
                                          value={typeof sug === "string" ? sug : ""}
                                          onChange={(e) =>
                                            updateDraft(b.isin, {
                                              isListed: e.target.value as DraftSuggestions["isListed"],
                                            })
                                          }
                                        />
                                      ) : key === "couponType" ? (
                                        <Input
                                          className="h-9 font-mono text-sm"
                                          placeholder="e.g. Fixed, Floating, Step-Up"
                                          value={typeof sug === "string" ? sug : ""}
                                          onChange={(e) =>
                                            updateDraft(b.isin, {
                                              couponType: e.target.value,
                                            })
                                          }
                                        />
                                      ) : key === "categories" ? (
                                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 py-1 max-w-[300px]">
                                          {BOND_LISTING_CATEGORY_OPTIONS.map((opt) => {
                                            const current = Array.isArray(sug) ? (sug as string[]) : [];
                                            const checked = current.includes(opt.value);
                                            return (
                                              <label
                                                key={opt.value}
                                                className="flex items-center gap-1.5 text-sm font-normal cursor-pointer whitespace-nowrap"
                                              >
                                                <Checkbox
                                                  checked={checked}
                                                  onCheckedChange={(v) => {
                                                    const on = v === true;
                                                    const next = on
                                                      ? [...current, opt.value]
                                                      : current.filter((c) => c !== opt.value);
                                                    updateDraft(b.isin, { categories: next });
                                                  }}
                                                />
                                                {opt.label}
                                              </label>
                                            );
                                          })}
                                        </div>
                                      ) : (
                                        <Input
                                          type="date"
                                          className="h-9 font-mono text-sm"
                                          value={
                                            sug != null &&
                                              typeof sug === "string" &&
                                              /^\d{4}-\d{2}-\d{2}$/.test(sug)
                                              ? sug
                                              : ""
                                          }
                                          onChange={(e) => {
                                            const v = e.target.value;
                                            updateDraft(b.isin, {
                                              [key]: v || null,
                                            } as Partial<DraftSuggestions>);
                                          }}
                                        />
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                          <Button
                            type="button"
                            variant="outline"
                            className="gap-1"
                            onClick={() => rejectRow(b.isin)}
                            disabled={saving}
                          >
                            <X className="size-4" />
                            Reject
                          </Button>
                          <AllowOnlyView permissions={["edit:bonds"]}>
                            <Button
                              type="button"
                              className="gap-1"
                              disabled={saving}
                              onClick={() => acceptRow(b.isin)}
                            >
                              {saving ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Check className="size-4" />
                              )}
                              Accept &amp; save
                            </Button>
                          </AllowOnlyView>
                        </div>
                      </>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      )}
    </div>
  );
}
