"use client";

import { format, parse } from "date-fns";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

/** URL search params for /dashboard/orders (shareable filters + pagination). */
export const orderListUrlParsers = {
  q: parseAsString.withDefault(""),
  status: parseAsString.withDefault("ALL"),
  bondType: parseAsString.withDefault("ALL"),
  date: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export interface TOrderFilterListHook {
  state: {
    resetAll: () => void;
    paginationIndex: number;
    setPaginationIndex: Dispatch<SetStateAction<number>>;
    statusFilter: string;
    setStatusFilter: Dispatch<SetStateAction<string>>;
    bondTypeFilter: string;
    setBondTypeFilter: Dispatch<SetStateAction<string>>;
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
    date: Date | undefined;
    setDate: Dispatch<SetStateAction<Date | undefined>>;
    hasActiveFilters: boolean;
  };
}

function omitDefault(value: string, defaultValue: string) {
  return value === defaultValue ? null : value;
}

function parseDateParam(value: string): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = parse(trimmed, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function formatDateParam(date: Date | undefined): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  return format(date, "yyyy-MM-dd");
}

export const useOrderFilterListHook = (): TOrderFilterListHook => {
  const [params, setParams] = useQueryStates(orderListUrlParsers, {
    history: "push",
  });

  const setSearch = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      setParams((prev) => {
        const next = typeof value === "function" ? value(prev.q ?? "") : value;
        return {
          q: next.trim() ? next : null,
          page: 1,
        };
      });
    },
    [setParams],
  );

  const setStatusFilter = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      setParams((prev) => {
        const next =
          typeof value === "function" ? value(prev.status ?? "ALL") : value;
        return {
          status: omitDefault(next, "ALL"),
          page: 1,
        };
      });
    },
    [setParams],
  );

  const setBondTypeFilter = useCallback<Dispatch<SetStateAction<string>>>(
    (value) => {
      setParams((prev) => {
        const next =
          typeof value === "function" ? value(prev.bondType ?? "ALL") : value;
        return {
          bondType: omitDefault(next, "ALL"),
          page: 1,
        };
      });
    },
    [setParams],
  );

  const setDate = useCallback<Dispatch<SetStateAction<Date | undefined>>>(
    (value) => {
      setParams((prev) => {
        const current = parseDateParam(prev.date ?? "");
        const next = typeof value === "function" ? value(current) : value;
        return {
          date: formatDateParam(next),
          page: 1,
        };
      });
    },
    [setParams],
  );

  const setPaginationIndex = useCallback<Dispatch<SetStateAction<number>>>(
    (value) => {
      setParams((prev) => {
        const next =
          typeof value === "function" ? value(prev.page ?? 1) : value;
        const safePage = Math.max(1, next);
        return { page: safePage === 1 ? null : safePage };
      });
    },
    [setParams],
  );

  function resetAll() {
    setParams(null);
  }

  const date = useMemo(() => parseDateParam(params.date), [params.date]);

  const hasActiveFilters = useMemo(
    () =>
      params.q.trim() !== "" ||
      params.status !== "ALL" ||
      params.bondType !== "ALL" ||
      params.date.trim() !== "",
    [params.q, params.status, params.bondType, params.date],
  );

  return {
    state: {
      resetAll,
      hasActiveFilters,
      paginationIndex: params.page,
      setPaginationIndex,
      statusFilter: params.status,
      setStatusFilter,
      bondTypeFilter: params.bondType,
      setBondTypeFilter,
      search: params.q,
      setSearch,
      date,
      setDate,
    },
  };
};
