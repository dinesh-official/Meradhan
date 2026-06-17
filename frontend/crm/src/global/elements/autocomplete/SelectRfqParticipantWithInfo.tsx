"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import { cn } from "@/lib/utils";
import apiGateway, { type NseRfqParticipantInfoSummary } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Users } from "lucide-react";
import Link from "next/link";
import * as React from "react";

function participantLabel(p: NseRfqParticipantInfoSummary) {
  const name = p.nameOverride?.trim();
  return name ? `${p.code} — ${name}` : p.code;
}

interface SelectRfqParticipantWithInfoProps {
  value?: NseRfqParticipantInfoSummary | null;
  onSelect?: (participant: NseRfqParticipantInfoSummary | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Picker for CRM-enriched NSE RFQ participants (`/rfq-participants`).
 * Only lists participants that already have saved info in
 * `nse_rfq_participant_info` — same constraint as settle-order assign.
 */
export function SelectRfqParticipantWithInfo({
  value,
  onSelect,
  placeholder,
  disabled,
}: SelectRfqParticipantWithInfoProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const participantsApi = React.useMemo(
    () => new apiGateway.crm.rfq.participants.RfqParticipantsApi(apiClientCaller),
    [],
  );

  const summariesQuery = useQuery({
    queryKey: ["rfq-participant-info-summaries"],
    queryFn: async () => {
      const res = await participantsApi.listRfqParticipantInfoSummaries();
      return res.data.responseData?.summaries ?? [];
    },
    staleTime: 30_000,
  });

  const participants = summariesQuery.data ?? [];

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return participants;
    return participants.filter((p) => {
      const haystack: Array<string | null | undefined> = [
        p.code,
        p.nameOverride,
        p.contactPerson,
        p.panNo,
        p.leiCode,
        p.custodian,
        p.telephone,
        ...(p.emailList ?? []),
        ...(p.mobileList ?? []),
      ];
      return haystack.some(
        (v) => typeof v === "string" && v.toLowerCase().includes(q),
      );
    });
  }, [participants, search]);

  const handleSelect = (participant: NseRfqParticipantInfoSummary) => {
    onSelect?.(participant);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal shadow-none"
          disabled={disabled || summariesQuery.isLoading}
        >
          {summariesQuery.isLoading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading participants…
            </span>
          ) : value ? (
            <span className="truncate">{participantLabel(value)}</span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 shrink-0" />
              {placeholder || "Select RFQ participant with saved info…"}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[380px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search code, name, email, PAN…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {summariesQuery.isLoading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : null}

            {!summariesQuery.isLoading && participants.length === 0 ? (
              <CommandEmpty className="px-3 py-4 text-center text-sm">
                <p className="text-muted-foreground">
                  No enriched RFQ participants yet.
                </p>
                <Link
                  href="/dashboard/rfqs/nse/rfq-participants"
                  className="mt-2 inline-block text-primary underline underline-offset-2"
                  onClick={() => setOpen(false)}
                >
                  Add info on RFQ Participants
                </Link>
              </CommandEmpty>
            ) : null}

            {!summariesQuery.isLoading && participants.length > 0 && filtered.length === 0 ? (
              <CommandEmpty>No matches.</CommandEmpty>
            ) : null}

            {!summariesQuery.isLoading && filtered.length > 0 ? (
              <CommandGroup>
                {filtered
                  .slice()
                  .sort((a, b) =>
                    (a.nameOverride ?? a.code).localeCompare(b.nameOverride ?? b.code),
                  )
                  .map((participant) => (
                    <CommandItem
                      key={participant.code}
                      value={participant.code}
                      onSelect={() => handleSelect(participant)}
                      className="flex flex-col items-start gap-0.5 py-3"
                    >
                      <div className="flex w-full items-center gap-2">
                        <span className="font-mono text-sm">{participant.code}</span>
                        {participant.nameOverride?.trim() ? (
                          <span className="truncate text-sm text-muted-foreground">
                            {participant.nameOverride}
                          </span>
                        ) : null}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 shrink-0",
                            value?.code === participant.code ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </div>
                      {participant.contactPerson || participant.emailList?.[0] ? (
                        <span className="text-xs text-muted-foreground">
                          {[participant.contactPerson, participant.emailList?.[0]]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      ) : null}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function RfqParticipantInfoCard({
  participant,
}: {
  participant: NseRfqParticipantInfoSummary;
}) {
  const emails = participant.emailList?.filter(Boolean) ?? [];
  const mobiles = participant.mobileList?.filter(Boolean) ?? [];

  return (
    <div className="rounded-lg border border-border bg-slate-50 p-3 text-sm">
      <div className="grid gap-1.5">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Code</span>
          <span className="font-mono font-medium">{participant.code}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">Name</span>
          <span className="text-right font-medium">
            {participant.nameOverride?.trim() || participant.code}
          </span>
        </div>
        {participant.contactPerson ? (
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Contact</span>
            <span className="text-right">{participant.contactPerson}</span>
          </div>
        ) : null}
        {emails.length > 0 ? (
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Email</span>
            <span className="text-right">{emails.join(", ")}</span>
          </div>
        ) : null}
        {mobiles.length > 0 || participant.telephone ? (
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Phone</span>
            <span className="text-right">
              {[...mobiles, participant.telephone].filter(Boolean).join(", ")}
            </span>
          </div>
        ) : null}
        {participant.panNo ? (
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">PAN</span>
            <span className="font-mono text-right">{participant.panNo}</span>
          </div>
        ) : null}
        {(participant.bankAccountsCount > 0 || participant.dematAccountsCount > 0) ? (
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Banks · Demat</span>
            <span className="text-right">
              {participant.bankAccountsCount} · {participant.dematAccountsCount}
            </span>
          </div>
        ) : null}
        {participant.notes?.trim() ? (
          <div className="border-t border-border pt-2 text-xs text-muted-foreground">
            {participant.notes}
          </div>
        ) : null}
      </div>
    </div>
  );
}
