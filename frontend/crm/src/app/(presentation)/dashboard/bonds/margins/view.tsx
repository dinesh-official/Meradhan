"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import CardPagination from "@/global/elements/table/CardPagination";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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

type ListResponse = {
  data: MarginRow[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

async function fetchList(params: { search: string; page: number; limit: number }) {
  const res = await apiClientCaller.get<{ responseData: ListResponse }>(
    "/crm/bonds/margins",
    { params },
  );
  return res.data.responseData;
}

type Editable = Omit<MarginRow, "id" | "updatedAt">;

function blankRow(): Editable {
  return {
    sectorName: "",
    rating: "",
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
      const res = await apiClientCaller.post<{ responseData: MarginRow }>(
        "/crm/bonds/margins",
        data,
        { headers: { "Content-Type": "application/json" } },
      );
      return res.data.responseData;
    },
    onSuccess: () => {
      toast.success("Margin created");
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
        vars.data,
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

  const items = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span>Bond Margin Management</span>
          <span className="text-sm font-normal text-muted-foreground">
            {meta ? `${meta.total.toLocaleString("en-IN")} rows` : ""}
            {listQuery.isFetching ? " · Refreshing…" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by sector or rating"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full md:w-[420px]"
            />
            <Button variant="outline" onClick={() => setSearchInput("")} disabled={!searchInput}>
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setCreating((v) => !v);
                setCreateDraft(blankRow());
              }}
              variant={creating ? "outline" : "default"}
            >
              {creating ? "Close" : "Add Margin"}
            </Button>
          </div>
        </div>

        {creating && (
          <div className="rounded-md border p-3 bg-muted/10">
            <div className="flex flex-col gap-3">
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
                  <Input
                    value={createDraft.rating}
                    onChange={(e) => setCreateDraft((d) => ({ ...d, rating: e.target.value }))}
                  />
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

        <div className="w-full overflow-auto rounded-md border bg-background">
          <table className="min-w-[1400px] w-full text-sm">
            <thead className="bg-muted/40 sticky top-0 z-10">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium text-muted-foreground">Sector</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Rating</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">&lt; 1y</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">1–3y</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">3–5y</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">5–7y</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">7–10y</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">10–15y</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">&gt; 15y</th>
                <th className="px-3 py-2 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isLoading && (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={10}>
                    Loading margins…
                  </td>
                </tr>
              )}

              {!listQuery.isLoading && items.length === 0 && (
                <tr>
                  <td className="px-3 py-10" colSpan={10}>
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">No margin rows found</div>
                      <div className="text-sm text-muted-foreground">
                        {search ? "Try clearing search." : "Click “Add Margin” to create one."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {items.map((r) => {
                const isEditing = editId === r.id;
                return (
                  <tr
                    key={r.id}
                    className="border-t odd:bg-muted/10 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          value={editDraft.sectorName}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, sectorName: e.target.value }))
                          }
                          className="h-8 w-[220px]"
                        />
                      ) : (
                        <span className="font-medium">{r.sectorName}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          value={editDraft.rating}
                          onChange={(e) =>
                            setEditDraft((d) => ({ ...d, rating: e.target.value }))
                          }
                          className="h-8 w-[140px]"
                        />
                      ) : (
                        r.rating
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing
                        ? renderLabeledNumCell("< 1y", editDraft.underOneYear, (n) =>
                            setEditDraft((d) => ({ ...d, underOneYear: n })),
                          )
                        : r.underOneYear}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing
                        ? renderLabeledNumCell("1–3y", editDraft.oneToThreeYears, (n) =>
                            setEditDraft((d) => ({ ...d, oneToThreeYears: n })),
                          )
                        : r.oneToThreeYears}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing
                        ? renderLabeledNumCell("3–5y", editDraft.threeToFiveYears, (n) =>
                            setEditDraft((d) => ({ ...d, threeToFiveYears: n })),
                          )
                        : r.threeToFiveYears}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing
                        ? renderLabeledNumCell("5–7y", editDraft.fiveToSevenYears, (n) =>
                            setEditDraft((d) => ({ ...d, fiveToSevenYears: n })),
                          )
                        : r.fiveToSevenYears}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing
                        ? renderLabeledNumCell("7–10y", editDraft.sevenToTenYears, (n) =>
                            setEditDraft((d) => ({ ...d, sevenToTenYears: n })),
                          )
                        : r.sevenToTenYears}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing
                        ? renderLabeledNumCell("10–15y", editDraft.tenToFifteenYears, (n) =>
                            setEditDraft((d) => ({ ...d, tenToFifteenYears: n })),
                          )
                        : r.tenToFifteenYears}
                    </td>
                    <td className="px-3 py-2">
                      {isEditing
                        ? renderLabeledNumCell("> 15y", editDraft.moreThanFifteenYears, (n) =>
                            setEditDraft((d) => ({ ...d, moreThanFifteenYears: n })),
                          )
                        : r.moreThanFifteenYears}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
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
                            onClick={() => updateMutation.mutate({ id: r.id, data: editDraft })}
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

