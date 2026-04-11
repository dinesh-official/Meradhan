"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CardPagination from "@/global/elements/table/CardPagination";
import { cn } from "@/lib/utils";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

/** Must match backend `bond_margin.constants` */
const BOND_MARGIN_WITHOUT_RATING = "__WITHOUT_RATING__";
const BOND_MARGIN_STANDARD_RATINGS = [
  "AAA",
  "AA+",
  "AA",
  "AA-",
  "A+",
  "A",
  "A-",
  "BBB+",
  "BBB",
  "BBB-",
] as const;

/** Select value when creating all standard rows + without-rating row */
const RATING_BATCH = "__BATCH__";

type MarginRow = {
  id: string;
  sectorName: string;
  rating: string;
  underOneYear: number;
  oneToThreeYears: number;
  threeToFiveYears: number;
  fiveToSevenYears: number;
  sevenToTenYears: number;
  tenToFifteenYears: number;
  moreThanFifteenYears: number;
  updatedAt: string;
};

type GroupedListResponse = {
  groups: { sectorName: string; rows: MarginRow[] }[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
};

type CreateResponse = { createdCount: number; rows: MarginRow[] };

function displayRatingLabel(rating: string): string {
  if (rating === BOND_MARGIN_WITHOUT_RATING) return "Without rating";
  return rating;
}

async function fetchList(params: { search: string; page: number; limit: number }) {
  const res = await apiClientCaller.get<{ responseData: GroupedListResponse }>(
    "/crm/bonds/margins",
    { params },
  );
  return res.data.responseData;
}

type Editable = Omit<MarginRow, "id" | "updatedAt">;

function blankRow(): Editable {
  return {
    sectorName: "",
    /** Default: create a single “without rating” row; pick batch option for all ratings. */
    rating: BOND_MARGIN_WITHOUT_RATING,
    underOneYear: 0,
    oneToThreeYears: 0,
    threeToFiveYears: 0,
    fiveToSevenYears: 0,
    sevenToTenYears: 0,
    tenToFifteenYears: 0,
    moreThanFifteenYears: 0,
  };
}

function parseNum(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function buildCreatePayload(draft: Editable): Record<string, unknown> {
  const base = {
    sectorName: draft.sectorName,
    underOneYear: draft.underOneYear,
    oneToThreeYears: draft.oneToThreeYears,
    threeToFiveYears: draft.threeToFiveYears,
    fiveToSevenYears: draft.fiveToSevenYears,
    sevenToTenYears: draft.sevenToTenYears,
    tenToFifteenYears: draft.tenToFifteenYears,
    moreThanFifteenYears: draft.moreThanFifteenYears,
  };
  const r = draft.rating.trim();
  if (!r) return base;
  return { ...base, rating: r };
}

export default function BondMarginManagementView() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<Editable>(() => blankRow());
  const [editId, setEditId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Editable>(() => blankRow());

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const queryKey = useMemo(() => ["bond-margins", { search, page, limit }], [
    search,
    page,
    limit,
  ]);

  const listQuery = useQuery({
    queryKey,
    queryFn: () => fetchList({ search, page, limit }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: Editable) => {
      const res = await apiClientCaller.post<{ responseData: CreateResponse }>(
        "/crm/bonds/margins",
        buildCreatePayload(data),
        { headers: { "Content-Type": "application/json" } },
      );
      return res.data.responseData;
    },
    onSuccess: (data) => {
      toast.success(
        data.createdCount > 1
          ? `Created ${data.createdCount} margin rows`
          : "Margin created",
      );
      setCreating(false);
      setCreateDraft(blankRow());
      listQuery.refetch();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to create margin");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (vars: { id: string; data: Editable }) => {
      const res = await apiClientCaller.patch<{ responseData: MarginRow }>(
        `/crm/bonds/margins/${encodeURIComponent(vars.id)}`,
        buildCreatePayload(vars.data),
        { headers: { "Content-Type": "application/json" } },
      );
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("Margin updated");
      setEditId(null);
      listQuery.refetch();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to update margin");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClientCaller.delete(`/crm/bonds/margins/${encodeURIComponent(id)}`);
      return true;
    },
    onSuccess: () => {
      toast.success("Margin deleted");
      listQuery.refetch();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete margin");
    },
  });

  const groups = listQuery.data?.groups ?? [];
  const meta = listQuery.data?.meta;
  const rowsOnPage = useMemo(
    () => groups.reduce((n, g) => n + g.rows.length, 0),
    [groups],
  );

  const startEdit = (row: MarginRow) => {
    setEditId(row.id);
    setEditDraft({
      sectorName: row.sectorName,
      rating: row.rating,
      underOneYear: row.underOneYear,
      oneToThreeYears: row.oneToThreeYears,
      threeToFiveYears: row.threeToFiveYears,
      fiveToSevenYears: row.fiveToSevenYears,
      sevenToTenYears: row.sevenToTenYears,
      tenToFifteenYears: row.tenToFifteenYears,
      moreThanFifteenYears: row.moreThanFifteenYears,
    });
  };

  const renderNumCell = (
    value: number,
    onChange: (n: number) => void,
    disabled?: boolean,
  ) => (
    <Input
      type="number"
      step="0.01"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(parseNum(e.target.value))}
      disabled={disabled}
      className="h-8 w-[120px]"
    />
  );

  const renderLabeledNumCell = (
    label: string,
    value: number,
    onChange: (n: number) => void,
    disabled?: boolean,
  ) => (
    <div className="flex flex-col gap-1">
      <div className="text-[11px] leading-none text-muted-foreground">{label}</div>
      <Input
        type="number"
        step="0.01"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseNum(e.target.value))}
        disabled={disabled}
        className="h-8 w-[120px]"
      />
    </div>
  );

  const ratingSelectValue = (draft: Editable, mode: "create" | "edit") => {
    if (mode === "create") {
      if (!draft.rating.trim()) return RATING_BATCH;
      return draft.rating;
    }
    return draft.rating;
  };

  const onRatingSelect = (value: string, setDraft: (fn: (d: Editable) => Editable) => void) => {
    if (value === RATING_BATCH) {
      setDraft((d) => ({ ...d, rating: "" }));
    } else {
      setDraft((d) => ({ ...d, rating: value }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>Bond Margin Management</span>
          <span className="text-sm font-normal text-muted-foreground">
            {meta ? `${meta.total.toLocaleString("en-IN")} sectors` : ""}
            {listQuery.isFetching ? " · Refreshing…" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search by sector or rating"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full md:max-w-[420px]"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 sm:self-auto"
              onClick={() => setSearchInput("")}
              disabled={!searchInput}
            >
              Clear
            </Button>
          </div>

          <Button
            type="button"
            onClick={() => {
              setCreating((v) => !v);
              setCreateDraft(blankRow());
            }}
            variant={creating ? "outline" : "default"}
            size="default"
            className={cn(
              "h-10 w-full gap-2 px-4 font-medium md:w-auto md:min-w-[160px]",
              creating
                ? "border-dashed"
                : "shadow-sm transition-[box-shadow,transform] hover:shadow-md active:scale-[0.98]",
            )}
            aria-expanded={creating}
            aria-controls="bond-margin-create-panel"
          >
            {creating ? (
              <>
                <X className="size-4 shrink-0 opacity-90" aria-hidden />
                Close form
              </>
            ) : (
              <>
                <Plus className="size-4 shrink-0" aria-hidden />
                Add margin
              </>
            )}
          </Button>
        </div>

        {creating && (
          <div
            id="bond-margin-create-panel"
            role="region"
            aria-label="New margin"
            className="rounded-lg border border-primary/20 bg-muted/20 p-4 shadow-sm ring-1 ring-primary/10"
          >
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 border-b border-border/60 pb-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Plus className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 space-y-0.5 pt-0.5">
                  <div className="text-sm font-semibold leading-none">New margin</div>
                  <p className="text-xs text-muted-foreground">
                    Sector, rating rule, and tenure slabs apply to the row(s) you create.
                  </p>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Sector</div>
                  <Input
                    value={createDraft.sectorName}
                    onChange={(e) =>
                      setCreateDraft((d) => ({ ...d, sectorName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Rating</div>
                  <Select
                    value={ratingSelectValue(createDraft, "create")}
                    onValueChange={(v) => onRatingSelect(v, setCreateDraft)}
                  >
                    <SelectTrigger className="w-full md:max-w-[320px]">
                      <SelectValue placeholder="Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={BOND_MARGIN_WITHOUT_RATING}>
                        Without rating (default)
                      </SelectItem>
                      <SelectItem value={RATING_BATCH}>
                        All ratings + without rating (batch)
                      </SelectItem>
                      {BOND_MARGIN_STANDARD_RATINGS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Default creates one “without rating” row. Choose batch to add every rating
                    plus without rating in one go.
                  </p>
                </div>
              </div>

              <div className="w-full overflow-auto">
                <div className="flex flex-wrap gap-2">
                  {renderLabeledNumCell("< 1y", createDraft.underOneYear, (n) =>
                    setCreateDraft((d) => ({ ...d, underOneYear: n })),
                  )}
                  {renderLabeledNumCell("1–3y", createDraft.oneToThreeYears, (n) =>
                    setCreateDraft((d) => ({ ...d, oneToThreeYears: n })),
                  )}
                  {renderLabeledNumCell("3–5y", createDraft.threeToFiveYears, (n) =>
                    setCreateDraft((d) => ({ ...d, threeToFiveYears: n })),
                  )}
                  {renderLabeledNumCell("5–7y", createDraft.fiveToSevenYears, (n) =>
                    setCreateDraft((d) => ({ ...d, fiveToSevenYears: n })),
                  )}
                  {renderLabeledNumCell("7–10y", createDraft.sevenToTenYears, (n) =>
                    setCreateDraft((d) => ({ ...d, sevenToTenYears: n })),
                  )}
                  {renderLabeledNumCell("10–15y", createDraft.tenToFifteenYears, (n) =>
                    setCreateDraft((d) => ({ ...d, tenToFifteenYears: n })),
                  )}
                  {renderLabeledNumCell("> 15y", createDraft.moreThanFifteenYears, (n) =>
                    setCreateDraft((d) => ({ ...d, moreThanFifteenYears: n })),
                  )}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Order: &lt;1y, 1–3y, 3–5y, 5–7y, 7–10y, 10–15y, &gt;15y
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => createMutation.mutate(createDraft)}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreating(false);
                    setCreateDraft(blankRow());
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full space-y-2 rounded-md border bg-background p-2">
          {listQuery.isLoading && (
            <div className="px-3 py-6 text-muted-foreground">Loading margins…</div>
          )}

          {!listQuery.isLoading && groups.length === 0 && (
            <div className="px-3 py-10">
              <div className="flex flex-col gap-1">
                <div className="font-medium">No sectors found</div>
                <div className="text-sm text-muted-foreground">
                      {search ? "Try clearing search." : "Use “Add margin” above to create one."}
                </div>
              </div>
            </div>
          )}

          {!listQuery.isLoading &&
            groups.map((g) => {
              const hasWithoutRating = g.rows.some(
                (r) => r.rating === BOND_MARGIN_WITHOUT_RATING,
              );
              return (
              <Collapsible key={g.sectorName} defaultOpen className="rounded-md border bg-muted/5">
                <CollapsibleTrigger className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 text-left hover:bg-muted/30 [&[data-state=open]>svg]:rotate-180">
                  <ChevronDown className="size-4 shrink-0 transition-transform" />
                  <span className="min-w-0 font-medium">{g.sectorName}</span>
                  {hasWithoutRating ? (
                    <Badge variant="secondary" className="shrink-0 text-[11px] font-normal">
                      Without rating
                    </Badge>
                  ) : null}
                  <span className="text-xs text-muted-foreground sm:ml-auto">
                    ({g.rows.length} rating{g.rows.length === 1 ? "" : "s"})
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="w-full overflow-auto border-t">
                    <table className="min-w-[1200px] w-full text-sm">
                      <thead className="bg-muted/40">
                        <tr className="text-left">
                          <th className="px-3 py-2 font-medium text-muted-foreground">
                            Rating
                          </th>
                          <th className="px-3 py-2 font-medium text-muted-foreground">
                            &lt; 1y
                          </th>
                          <th className="px-3 py-2 font-medium text-muted-foreground">1–3y</th>
                          <th className="px-3 py-2 font-medium text-muted-foreground">3–5y</th>
                          <th className="px-3 py-2 font-medium text-muted-foreground">5–7y</th>
                          <th className="px-3 py-2 font-medium text-muted-foreground">7–10y</th>
                          <th className="px-3 py-2 font-medium text-muted-foreground">10–15y</th>
                          <th className="px-3 py-2 font-medium text-muted-foreground">
                            &gt; 15y
                          </th>
                          <th className="px-3 py-2 font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.rows.map((r) => {
                          const isEditing = editId === r.id;
                          return (
                            <tr
                              key={r.id}
                              className="border-t odd:bg-muted/10 hover:bg-muted/30 transition-colors"
                            >
                              <td className="px-3 py-2 align-top">
                                {isEditing ? (
                                  <Select
                                    value={ratingSelectValue(editDraft, "edit")}
                                    onValueChange={(v) => onRatingSelect(v, setEditDraft)}
                                  >
                                    <SelectTrigger className="h-8 w-[200px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value={BOND_MARGIN_WITHOUT_RATING}>
                                        Without rating
                                      </SelectItem>
                                      {BOND_MARGIN_STANDARD_RATINGS.map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                          {opt}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  displayRatingLabel(r.rating)
                                )}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {isEditing
                                  ? renderLabeledNumCell("< 1y", editDraft.underOneYear, (n) =>
                                      setEditDraft((d) => ({ ...d, underOneYear: n })),
                                    )
                                  : r.underOneYear}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {isEditing
                                  ? renderLabeledNumCell("1–3y", editDraft.oneToThreeYears, (n) =>
                                      setEditDraft((d) => ({ ...d, oneToThreeYears: n })),
                                    )
                                  : r.oneToThreeYears}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {isEditing
                                  ? renderLabeledNumCell(
                                      "3–5y",
                                      editDraft.threeToFiveYears,
                                      (n) =>
                                        setEditDraft((d) => ({ ...d, threeToFiveYears: n })),
                                    )
                                  : r.threeToFiveYears}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {isEditing
                                  ? renderLabeledNumCell(
                                      "5–7y",
                                      editDraft.fiveToSevenYears,
                                      (n) =>
                                        setEditDraft((d) => ({ ...d, fiveToSevenYears: n })),
                                    )
                                  : r.fiveToSevenYears}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {isEditing
                                  ? renderLabeledNumCell(
                                      "7–10y",
                                      editDraft.sevenToTenYears,
                                      (n) =>
                                        setEditDraft((d) => ({ ...d, sevenToTenYears: n })),
                                    )
                                  : r.sevenToTenYears}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {isEditing
                                  ? renderLabeledNumCell(
                                      "10–15y",
                                      editDraft.tenToFifteenYears,
                                      (n) =>
                                        setEditDraft((d) => ({ ...d, tenToFifteenYears: n })),
                                    )
                                  : r.tenToFifteenYears}
                              </td>
                              <td className="px-3 py-2 align-top">
                                {isEditing
                                  ? renderLabeledNumCell(
                                      "> 15y",
                                      editDraft.moreThanFifteenYears,
                                      (n) =>
                                        setEditDraft((d) => ({
                                          ...d,
                                          moreThanFifteenYears: n,
                                        })),
                                    )
                                  : r.moreThanFifteenYears}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap align-top">
                                {!isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        if (confirm("Delete this margin row?")) {
                                          deleteMutation.mutate(r.id);
                                        }
                                      }}
                                      disabled={deleteMutation.isPending}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        updateMutation.mutate({ id: r.id, data: editDraft })
                                      }
                                      disabled={updateMutation.isPending}
                                    >
                                      {updateMutation.isPending ? "Saving..." : "Save"}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setEditId(null)}>
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              );
            })}
        </div>

        {meta && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPages} · {rowsOnPage.toLocaleString("en-IN")} rows on
              this page · {meta.total.toLocaleString("en-IN")} sectors total
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
