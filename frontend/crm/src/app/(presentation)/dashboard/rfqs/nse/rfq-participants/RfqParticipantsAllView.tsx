"use client";

/**
 * Lists NSE RFQ participants from CBRICS `POST /participant/find` (type = Participant).
 * Each row is `{ code: loginId, name: firstName, ... }` from the CBRICS registry.
 * Clicking a row opens an enrichment dialog for CRM-private contact / KYC / bank / demat
 * data keyed by `code` — never pushed back to NSE/CBRICS.
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { UniversalTable } from "@/global/elements/table/UniversalTable";
import CardPagination from "@/global/elements/table/CardPagination";
import WorkflowStatusBadge from "@/global/elements/wrapper/badges/WrokflowStatusBadge";
import { CBRICS_PARTICIPANT_ENTITY_STATUS_OPTIONS } from "@/app/(presentation)/dashboard/rfqs/nse/_constants/cbricsApprovalStatus";
import apiGateway, { type NseRfqParticipantInfoSummary, type NseRfqParticipantListItem } from "@root/apiGateway";
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

type RfqParticipantRow = NseRfqParticipantListItem & {
  info: NseRfqParticipantInfoSummary | null;
};

const PAGE_SIZE = 25;

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
  const [actualStatusFilter, setActualStatusFilter] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<NseRfqParticipantListItem | null>(null);

  React.useEffect(() => {
    setPage(1);
  }, [search, actualStatusFilter]);

  const allRows = React.useMemo<RfqParticipantRow[]>(() => {
    const upstream = participantsQuery.data ?? [];
    return upstream.map((p) => ({
      ...p,
      info: infoByCode.get(p.code) ?? null,
    }));
  }, [participantsQuery.data, infoByCode]);

  // Filter spans every visible field so operators can search by code, NSE
  // name, CRM name override, contact person, email, mobile, telephone, PAN
  // or LEI in one box.
  const filteredRows = React.useMemo<RfqParticipantRow[]>(() => {
    const q = search.trim().toLowerCase();
    let rows = allRows;
    if (actualStatusFilter !== "ALL") {
      const code = Number(actualStatusFilter);
      rows = rows.filter((r) => r.actualStatus === code);
    }
    if (!q) return rows;
    return rows.filter((r) => {
      const haystack: Array<string | null | undefined> = [
        r.code,
        r.name,
        r.panNo,
        r.custodian,
        ...(r.actualStatus != null
          ? [
              CBRICS_PARTICIPANT_ENTITY_STATUS_OPTIONS.find(
                (o) => o.value === String(r.actualStatus),
              )?.label,
            ]
          : []),
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
  }, [allRows, search, actualStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedRows = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const rangeStart =
    filteredRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filteredRows.length);

  const openParticipant = React.useCallback(
    (row: RfqParticipantRow) => {
      setSelected({ code: row.code, name: row.name });
    },
    [],
  );

  const tableFields = React.useMemo(
    () =>
      [
        {
          key: "code",
          label: "Code",
          sortable: true,
          cell(row: RfqParticipantRow) {
            return (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{row.code}</span>
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
                {row.info?.custodian || row.custodian ? (
                  <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {row.info?.custodian ?? row.custodian}
                  </span>
                ) : null}
              </div>
            );
          },
        },
        {
          key: "actualStatus",
          label: "Actual status",
          sortable: true,
          cell(row: RfqParticipantRow) {
            if (row.actualStatus == null) {
              return (
                <span className="text-xs text-muted-foreground">—</span>
              );
            }
            return (
              <WorkflowStatusBadge
                statusCode={row.actualStatus}
                variant="entity"
              />
            );
          },
        },
        {
          key: "name",
          label: "Name",
          sortable: true,
          cell(row: RfqParticipantRow) {
            const override = row.info?.nameOverride?.trim();
            const displayName =
              override && override.length > 0 ? override : row.name;
            return (
              <div className="flex max-w-[200px] flex-col sm:max-w-[260px]">
                <span className="text-sm line-clamp-2" title={displayName}>
                  {displayName}
                </span>
                {override && override !== row.name ? (
                  <span
                    className="text-[11px] text-muted-foreground line-clamp-1"
                    title={row.name}
                  >
                    NSE: {row.name}
                  </span>
                ) : null}
                {row.info?.contactPerson ? (
                  <span
                    className="text-[11px] text-muted-foreground line-clamp-1"
                    title={row.info.contactPerson}
                  >
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
          cell(row: RfqParticipantRow) {
            const list = row.info?.emailList ?? [];
            if (list.length === 0) {
              return (
                <span className="text-xs text-muted-foreground">—</span>
              );
            }
            const [first, ...rest] = list;
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-xs">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <span className="max-w-[180px] truncate">{first}</span>
                    {rest.length > 0 ? (
                      <Badge variant="outline" className="text-[10px]">
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
          cell(row: RfqParticipantRow) {
            const list = row.info?.mobileList ?? [];
            const tel = row.info?.telephone;
            if (list.length === 0 && !tel) {
              return (
                <span className="text-xs text-muted-foreground">—</span>
              );
            }
            const first = list[0] ?? tel ?? "";
            const rest = list.length > 0 ? list.slice(1) : [];
            const tooltip = [...list, tel ? `Telephone: ${tel}` : null]
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
                      <Badge variant="outline" className="text-[10px]">
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
          cell(row: RfqParticipantRow) {
            const pan = row.info?.panNo ?? row.panNo;
            if (!pan && !row.info?.leiCode) {
              return (
                <span className="text-xs text-muted-foreground">—</span>
              );
            }
            return (
              <div className="flex flex-col text-xs">
                {pan ? <span className="font-mono">{pan}</span> : null}
                {row.info?.leiCode ? (
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
          cell(row: RfqParticipantRow) {
            const banks = row.info?.bankAccountsCount ?? 0;
            const demats = row.info?.dematAccountsCount ?? 0;
            if (banks === 0 && demats === 0) {
              return (
                <span className="text-xs text-muted-foreground">—</span>
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
          cell(row: RfqParticipantRow) {
            const notes = row.info?.notes?.trim();
            if (!notes) {
              return (
                <span className="text-xs text-muted-foreground">—</span>
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
          cell(row: RfqParticipantRow) {
            return (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openParticipant(row);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  {row.info ? "Edit info" : "Add info"}
                </Button>
              </div>
            );
          },
        },
      ] as const,
    [openParticipant],
  );

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
                Live list from CBRICS <code>/participant/find</code> (registered
                participants). Click any row to attach contact, KYC, bank and demat
                info to that login ID (saved locally — never sent to NSE).
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
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
              <Select
                value={actualStatusFilter}
                onValueChange={setActualStatusFilter}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-secondary border-none">
                  <SelectValue placeholder="Actual status" />
                </SelectTrigger>
                <SelectContent>
                  {CBRICS_PARTICIPANT_ENTITY_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground pb-1">
              {filteredRows.length === 0 ? (
                "No matches"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {rangeStart}–{rangeEnd}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-foreground">
                    {filteredRows.length}
                  </span>
                  {allRows.length !== filteredRows.length ? (
                    <>
                      {" "}
                      (filtered from {allRows.length})
                    </>
                  ) : null}
                </>
              )}
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
                CBRICS did not return participants. Try refreshing — if it keeps
                failing, the CBRICS login session may need to recycle.
              </AlertDescription>
            </Alert>
          ) : null}

          <TooltipProvider delayDuration={200}>
            <UniversalTable<RfqParticipantRow>
              data={paginatedRows}
              initialPageSize={PAGE_SIZE}
              isLoading={participantsQuery.isLoading}
              getRowIdAction={(row) => row.code}
              onRowClickAction={openParticipant}
              fields={[...tableFields]}
            />
          </TooltipProvider>
        </CardContent>

        {filteredRows.length > PAGE_SIZE ? (
          <CardPagination
            page={page}
            totalPages={totalPages}
            onClick={setPage}
          />
        ) : null}
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
