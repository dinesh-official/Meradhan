"use client";

/**
 * Lists every NSE RFQ participant returned by the NSE `/participants/all`
 * endpoint. This is the simple `{ code, name }[]` shape from
 * `nse_RFQ.ts.getAllParticipants()` — a snapshot of who's onboarded on
 * the NSE side, distinct from CBRICS unregistered participants (the
 * existing `/dashboard/rfqs/nse/participants` page).
 *
 * Clicking a row opens an enrichment dialog where operators can attach
 * contact, KYC, bank and demat info against the participant `code`. That
 * data is CRM-private and never pushed back to NSE/CBRICS.
 *
 * Includes a client-side filter (code OR name) and a refresh button; the
 * NSE call has no pagination so we list everything in one `UniversalTable`.
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import apiGateway, { type NseRfqParticipantInfoSummary } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Landmark,
  Mail,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  StickyNote,
  Users,
  Wallet,
} from "lucide-react";
import * as React from "react";
import { RfqParticipantInfoDialog } from "./_components/RfqParticipantInfoDialog";

type RfqParticipant = { code: string; name: string };

/**
 * Merged row used by the table: NSE upstream `{ code, name }` plus, when
 * available, the CRM-private enrichment summary keyed by the same `code`.
 */
type RfqParticipantRow = RfqParticipant & {
  info: NseRfqParticipantInfoSummary | null;
};

export default function RfqParticipantsAllView() {
  const api = React.useMemo(
    () =>
      new apiGateway.crm.rfq.participants.RfqParticipantsApi(apiClientCaller),
    [],
  );

  const participantsQuery = useQuery({
    queryKey: ["NseRfqParticipants:all"],
    queryFn: async () => {
      const res = await api.getAllRfqParticipants();
      return res.data.responseData ?? [];
    },
    // The NSE upstream is reasonably slow to change; cache aggressively so
    // navigating in/out of the page doesn't refetch on every visit.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const savedInfoQuery = useQuery({
    queryKey: ["NseRfqParticipants:infoSummary"],
    queryFn: async () => {
      const res = await api.listRfqParticipantInfoSummaries();
      return res.data.responseData?.summaries ?? [];
    },
    staleTime: 30 * 1000,
  });

  // Indexed lookup keeps the row build O(rows + summaries) instead of O(n*m).
  const infoByCode = React.useMemo(
    () =>
      new Map(
        (savedInfoQuery.data ?? []).map((s) => [s.code, s] as const),
      ),
    [savedInfoQuery.data],
  );

  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<RfqParticipant | null>(null);

  const allRows = React.useMemo<RfqParticipantRow[]>(() => {
    const upstream = participantsQuery.data ?? [];
    return upstream.map((p) => ({
      code: p.code,
      name: p.name,
      info: infoByCode.get(p.code) ?? null,
    }));
  }, [participantsQuery.data, infoByCode]);

  // Filter spans every visible field so operators can search by code, NSE
  // name, CRM name override, contact person, email, mobile, telephone, PAN
  // or LEI in one box.
  const filteredRows = React.useMemo<RfqParticipantRow[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) => {
      const haystack: Array<string | null | undefined> = [
        r.code,
        r.name,
        r.info?.nameOverride,
        r.info?.contactPerson,
        r.info?.panNo,
        r.info?.leiCode,
        r.info?.custodian,
        r.info?.telephone,
        ...(r.info?.emailList ?? []),
        ...(r.info?.mobileList ?? []),
      ];
      return haystack.some(
        (v) => typeof v === "string" && v.toLowerCase().includes(q),
      );
    });
  }, [allRows, search]);

  const savedCount = infoByCode.size;

  return (
    <div className="mt-5">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                NSE participants
                {participantsQuery.isFetched ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {allRows.length}
                  </span>
                ) : null}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                Live snapshot from NSE’s <code>/participants/all</code>{" "}
                endpoint. Click any row to attach contact, KYC, bank and demat
                info to that code (saved locally — never sent to NSE).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void participantsQuery.refetch();
                  void savedInfoQuery.refetch();
                }}
                disabled={participantsQuery.isFetching}
              >
                <RefreshCw
                  className={
                    "h-4 w-4 " +
                    (participantsQuery.isFetching ? "animate-spin" : "")
                  }
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
            <div className="relative w-full sm:w-[min(100%,360px)]">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Filter by code or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <p className="text-sm text-muted-foreground pb-1">
              Showing{" "}
              <span className="font-medium text-foreground">
                {filteredRows.length}
              </span>{" "}
              of {allRows.length}
              {savedCount > 0 ? (
                <>
                  {" · "}
                  <span className="font-medium text-foreground">
                    {savedCount}
                  </span>{" "}
                  enriched
                </>
              ) : null}
            </p>
          </div>

          {participantsQuery.isError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle />
              <AlertTitle>Could not load NSE participants</AlertTitle>
              <AlertDescription>
                The NSE RFQ upstream did not respond. Try refreshing — if it
                keeps failing, the NSE login session may need to recycle.
              </AlertDescription>
            </Alert>
          ) : null}

          {/*
            Shared UniversalTable wires up tanstack pagination but never
            renders pagination controls, so any `initialPageSize` would silently
            clip the list. We have a few hundred rows tops; render everything
            inside a scrollable container instead.

            `key` forces a remount whenever the row count changes so the
            tanstack `initialPageSize` reflects the new dataset (it's an
            initial-state prop, not a controlled one).
          */}
          <div className="max-h-[70vh] overflow-auto">
            <TooltipProvider delayDuration={200}>
              <UniversalTable<RfqParticipantRow>
                key={`rfq-parti-${filteredRows.length}`}
                data={filteredRows}
                initialPageSize={Math.max(filteredRows.length, 1)}
                isLoading={participantsQuery.isLoading}
                getRowIdAction={(row) => row.code}
                onRowClickAction={(row) =>
                  setSelected({ code: row.code, name: row.name })
                }
                fields={[
                  {
                    key: "code",
                    label: "Code",
                    sortable: true,
                    cell(row) {
                      return (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {row.code}
                            </span>
                            {row.info ? (
                              <Badge
                                variant="secondary"
                                className="gap-1 text-[10px] uppercase tracking-wide"
                                data-table-row-click-ignore
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Saved
                              </Badge>
                            ) : null}
                          </div>
                          {row.info?.custodian ? (
                            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {row.info.custodian}
                            </span>
                          ) : null}
                        </div>
                      );
                    },
                  },
                  {
                    key: "name",
                    label: "Name",
                    sortable: true,
                    cell(row) {
                      const override = row.info?.nameOverride?.trim();
                      return (
                        <div className="flex flex-col">
                          <span className="text-sm">
                            {override && override.length > 0
                              ? override
                              : row.name}
                          </span>
                          {override && override !== row.name ? (
                            <span className="text-[11px] text-muted-foreground line-clamp-1">
                              NSE: {row.name}
                            </span>
                          ) : null}
                          {row.info?.contactPerson ? (
                            <span className="text-[11px] text-muted-foreground line-clamp-1">
                              Contact: {row.info.contactPerson}
                            </span>
                          ) : null}
                        </div>
                      );
                    },
                  },
                  {
                    key: "email",
                    label: "Email",
                    sortable: false,
                    cell(row) {
                      const list = row.info?.emailList ?? [];
                      if (list.length === 0) {
                        return (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        );
                      }
                      const [first, ...rest] = list;
                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 text-xs">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="max-w-[180px] truncate">
                                {first}
                              </span>
                              {rest.length > 0 ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  +{rest.length}
                                </Badge>
                              ) : null}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[260px] whitespace-pre-line"
                          >
                            {list.join("\n")}
                          </TooltipContent>
                        </Tooltip>
                      );
                    },
                  },
                  {
                    key: "mobile",
                    label: "Mobile",
                    sortable: false,
                    cell(row) {
                      const list = row.info?.mobileList ?? [];
                      const tel = row.info?.telephone;
                      if (list.length === 0 && !tel) {
                        return (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        );
                      }
                      const first = list[0] ?? tel ?? "";
                      const rest =
                        list.length > 0
                          ? list.slice(1)
                          : [];
                      const tooltip = [
                        ...list,
                        tel ? `Telephone: ${tel}` : null,
                      ]
                        .filter(Boolean)
                        .join("\n");
                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 text-xs">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="max-w-[140px] truncate font-mono">
                                {first}
                              </span>
                              {rest.length > 0 ? (
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  +{rest.length}
                                </Badge>
                              ) : null}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[260px] whitespace-pre-line"
                          >
                            {tooltip}
                          </TooltipContent>
                        </Tooltip>
                      );
                    },
                  },
                  {
                    key: "pan",
                    label: "PAN / LEI",
                    sortable: false,
                    cell(row) {
                      if (!row.info?.panNo && !row.info?.leiCode) {
                        return (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        );
                      }
                      return (
                        <div className="flex flex-col text-xs">
                          {row.info.panNo ? (
                            <span className="font-mono">
                              {row.info.panNo}
                            </span>
                          ) : null}
                          {row.info.leiCode ? (
                            <span className="font-mono text-[11px] text-muted-foreground">
                              LEI {row.info.leiCode}
                            </span>
                          ) : null}
                        </div>
                      );
                    },
                  },
                  {
                    key: "accounts",
                    label: "Banks / Demat",
                    sortable: false,
                    cell(row) {
                      const banks = row.info?.bankAccountsCount ?? 0;
                      const demats = row.info?.dematAccountsCount ?? 0;
                      if (banks === 0 && demats === 0) {
                        return (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        );
                      }
                      return (
                        <div className="flex items-center gap-2 text-xs">
                          <Badge
                            variant={banks > 0 ? "secondary" : "outline"}
                            className="gap-1"
                          >
                            <Landmark className="h-3 w-3" />
                            {banks}
                          </Badge>
                          <Badge
                            variant={demats > 0 ? "secondary" : "outline"}
                            className="gap-1"
                          >
                            <Wallet className="h-3 w-3" />
                            {demats}
                          </Badge>
                        </div>
                      );
                    },
                  },
                  {
                    key: "notes",
                    label: "Notes",
                    sortable: false,
                    cell(row) {
                      const notes = row.info?.notes?.trim();
                      if (!notes) {
                        return (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        );
                      }
                      return (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex items-center gap-1 text-xs max-w-[200px]">
                              <StickyNote className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="truncate">{notes}</span>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="max-w-[320px] whitespace-pre-wrap"
                          >
                            {notes}
                          </TooltipContent>
                        </Tooltip>
                      );
                    },
                  },
                  {
                    key: "actions",
                    label: "",
                    sortable: false,
                    cell(row) {
                      return (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected({
                                code: row.code,
                                name: row.name,
                              });
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            {row.info ? "Edit info" : "Add info"}
                          </Button>
                        </div>
                      );
                    },
                  },
                ]}
              />
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {selected ? (
        <RfqParticipantInfoDialog
          open
          onOpenChange={(o) => {
            if (!o) setSelected(null);
          }}
          code={selected.code}
          nseName={selected.name}
        />
      ) : null}
    </div>
  );
}
