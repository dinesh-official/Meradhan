"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiClientCaller } from "@/core/connection/apiClientCaller";
import PageInfoBar from "@/global/elements/wrapper/PageInfoBar";
import { cn } from "@/lib/utils";
import apiGateway from "@root/apiGateway";
import type { BondDetailsResponse } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { BondDocumentsSection } from "../_components/BondDocumentsSection";

const bondsApi = new apiGateway.bondsApi.BondsApi(apiClientCaller);

function bondLabel(bond: Pick<BondDetailsResponse, "isin" | "bondName" | "instrumentName">) {
  const name = bond.bondName || bond.instrumentName || "Unnamed Bond";
  return `${bond.isin} — ${name}`;
}

export default function BondDocumentsManagementView() {
  const [bondPickerOpen, setBondPickerOpen] = useState(false);
  const [bondSearch, setBondSearch] = useState("");
  const [activeIsin, setActiveIsin] = useState("");
  const [bondName, setBondName] = useState<string | null>(null);

  const normalizedIsin = activeIsin.trim().toUpperCase();

  const bondSearchQuery = useQuery({
    queryKey: ["bond-documents-isin-search", bondSearch],
    queryFn: async () => {
      const response = await bondsApi.getListedBonds({
        filters: { search: bondSearch.trim() || undefined },
        params: {
          page: 1,
          limit: 25,
          all: "YES",
          category: "all",
        },
      });
      return response.responseData?.data ?? [];
    },
    enabled: bondPickerOpen,
    staleTime: 60_000,
  });

  const bondOptions = bondSearchQuery.data ?? [];

  const selectedBondLabel = useMemo(() => {
    if (!normalizedIsin) return "Search by ISIN or bond name…";
    const match = bondOptions.find((b) => b.isin === normalizedIsin);
    if (match) return bondLabel(match);
    return bondName ? `${normalizedIsin} — ${bondName}` : normalizedIsin;
  }, [normalizedIsin, bondName, bondOptions]);

  const selectBond = (bond: BondDetailsResponse) => {
    setActiveIsin(bond.isin);
    setBondName(bond.bondName || bond.instrumentName || null);
    setBondSearch(bond.isin);
    setBondPickerOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageInfoBar
        title="Bond Documents"
        description="Upload and manage documents for each bond ISIN (information memorandum, trust deed, ratings, etc.)."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            Select bond
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Bond</Label>
            <Popover open={bondPickerOpen} onOpenChange={setBondPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={bondPickerOpen}
                  className="w-full justify-between font-normal shadow-none"
                >
                  <span className="truncate text-left">{selectedBondLabel}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[min(100vw-2rem,480px)] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search by ISIN or bond name…"
                    value={bondSearch}
                    onValueChange={setBondSearch}
                  />
                  <CommandList>
                    {bondSearchQuery.isLoading ? (
                      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching bonds…
                      </div>
                    ) : null}
                    {!bondSearchQuery.isLoading && bondOptions.length === 0 ? (
                      <CommandEmpty>No bonds found.</CommandEmpty>
                    ) : null}
                    {!bondSearchQuery.isLoading && bondOptions.length > 0 ? (
                      <CommandGroup>
                        {bondOptions.map((bond) => (
                          <CommandItem
                            key={bond.id}
                            value={bond.isin}
                            onSelect={() => selectBond(bond)}
                            className="items-start py-3"
                          >
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="font-mono font-medium">{bond.isin}</span>
                              <span className="truncate text-xs text-muted-foreground">
                                {bond.bondName || bond.instrumentName || "Unnamed Bond"}
                              </span>
                            </div>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4 shrink-0",
                                normalizedIsin === bond.isin ? "opacity-100" : "opacity-0",
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : null}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          {normalizedIsin ? (
            <p className="text-sm text-muted-foreground">
              Managing documents for{" "}
              <span className="font-mono font-medium text-foreground">{normalizedIsin}</span>
              {bondName ? <span> — {bondName}</span> : null}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Search and select a bond to upload or view documents.
            </p>
          )}
        </CardContent>
      </Card>

      {normalizedIsin ? (
        <BondDocumentsSection isin={normalizedIsin} bondName={bondName} />
      ) : null}
    </div>
  );
}
