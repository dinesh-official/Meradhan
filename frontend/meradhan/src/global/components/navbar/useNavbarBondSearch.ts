"use client";

import { apiClientCaller } from "@/core/connection/apiClientCaller";
import apiGateway from "@root/apiGateway";
import type { BondDetailsResponse } from "@root/apiGateway";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "nextjs-toploader/app";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const MIN_QUERY_LENGTH = 4;
const DEBOUNCE_MS = 300;

const bondsApiClient = new apiGateway.bondsApi.BondsApi(apiClientCaller);

export type SearchSuggestion =
  | { type: "isin"; isin: string; bondName: string }
  | { type: "name"; bondName: string };

function deduplicateByName(bonds: BondDetailsResponse[]): SearchSuggestion[] {
  const seen = new Set<string>();
  const results: SearchSuggestion[] = [];
  for (const bond of bonds) {
    if (!seen.has(bond.bondName)) {
      seen.add(bond.bondName);
      results.push({ type: "name", bondName: bond.bondName });
    }
  }
  return results;
}

export function useNavbarBondSearch() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce: update debouncedQuery 300ms after inputValue stops changing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Open dropdown as soon as debounced query is long enough
  useEffect(() => {
    if (debouncedQuery.length >= MIN_QUERY_LENGTH) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [debouncedQuery]);

  const shouldFetch = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const { data, isLoading } = useQuery({
    queryKey: ["navbar-bond-search", debouncedQuery],
    queryFn: () =>
      bondsApiClient.getListedBonds({
        filters: { search: debouncedQuery },
        params: { page: 1, limit: 10, all: "true" },
      }),
    enabled: shouldFetch,
    staleTime: 30_000,
  });

  const bonds = data?.responseData?.data ?? [];

  // Show ISIN format if any returned bond's ISIN starts with the query — handles partial ISINs naturally.
  const suggestions: SearchSuggestion[] = useMemo(() => {
    const upperQuery = debouncedQuery.toUpperCase();
    const hasISINMatch = bonds.some((b) =>
      b.isin.toUpperCase().startsWith(upperQuery)
    );
    return hasISINMatch
      ? bonds.map((b) => ({
        type: "isin" as const,
        isin: b.isin,
        bondName: b.bondName,
      }))
      : deduplicateByName(bonds);
  }, [bonds, debouncedQuery]);

  const handleSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      if (suggestion.type === "isin") {
        router.push(`/bonds/detail/${suggestion.isin}`);
        setInputValue("");
      } else {
        // Use navSearch param so the all-bonds page search input stays empty.
        // Keep the navbar input populated so the user can see what they searched.
        router.push(`/bonds?navSearch=${encodeURIComponent(suggestion.bondName)}#bonds-list`);
      }
      setOpen(false);
    },
    [router]
  );

  const handleEnter = useCallback(() => {
    const q = inputValue.trim();
    if (q.length >= MIN_QUERY_LENGTH) {
      router.push(`/bonds?navSearch=${encodeURIComponent(q)}#bonds-list`);
      setOpen(false);
    }
  }, [inputValue, router]);

  const handleClose = useCallback(() => setOpen(false), []);

  // Close dropdown when clicking outside the container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    inputValue,
    setInputValue,
    open,
    setOpen,
    isLoading,
    suggestions,
    handleSelect,
    handleEnter,
    handleClose,
    containerRef,
    debouncedQuery,
  };
}
